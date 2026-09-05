const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect, admin } = require('../middleware/authMiddleware');
const { formatHospital } = require('../utils/supabaseAdapter');
const { isValidUUID, sanitizeSearchQuery, sanitizeHospitalUpdates } = require('../utils/validators');

// @route   GET /api/hospitals
// @desc    Get all hospitals with optional search, location, category & rating filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, location, category, verified, minRating } = req.query;

        let query = supabase
            .from('hospitals')
            .select('*, services(*)');

        if (verified !== undefined) {
            query = query.eq('verified', verified === 'true');
        }

        if (minRating) {
            const parsedRating = parseFloat(minRating);
            if (!isNaN(parsedRating)) {
                query = query.gte('rating', parsedRating);
            }
        }

        if (location) {
            const cleanLocation = sanitizeSearchQuery(location);
            if (cleanLocation) {
                query = query.ilike('location', `%${cleanLocation}%`);
            }
        }

        const cleanSearch = sanitizeSearchQuery(search);
        if (cleanSearch) {
            query = query.or(`name.ilike.%${cleanSearch}%,location.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
        }

        query = query.order('rating', { ascending: false });

        const { data: rawHospitals, error } = await query;

        if (error) {
            throw error;
        }

        let formattedHospitals = (rawHospitals || []).map(formatHospital);

        // Filter by service category if requested
        if (category && category !== 'All') {
            formattedHospitals = formattedHospitals.filter((hospital) =>
                hospital.services.some(
                    (s) => s.category && s.category.toLowerCase() === category.toLowerCase()
                )
            );
        }

        // Also search within services and specializations in-memory
        if (cleanSearch) {
            const searchLower = cleanSearch.toLowerCase();
            const matchingIds = new Set(formattedHospitals.map((h) => h.id));

            (rawHospitals || []).forEach((h) => {
                const formatted = formatHospital(h);
                const hasMatchingService = formatted.services.some((s) =>
                    s.name.toLowerCase().includes(searchLower)
                );
                const hasMatchingSpec = (formatted.specializations || []).some((s) =>
                    s.toLowerCase().includes(searchLower)
                );

                if ((hasMatchingService || hasMatchingSpec) && !matchingIds.has(formatted.id)) {
                    formattedHospitals.push(formatted);
                    matchingIds.add(formatted.id);
                }
            });
        }

        res.json({
            success: true,
            count: formattedHospitals.length,
            data: formattedHospitals
        });
    } catch (error) {
        console.error('Fetch hospitals error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Guard against invalid UUID crashing PostgreSQL
        if (!isValidUUID(id)) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const { data: hospital, error } = await supabase
            .from('hospitals')
            .select('*, services(*)')
            .eq('id', id)
            .maybeSingle();

        if (error || !hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            data: formatHospital(hospital)
        });
    } catch (error) {
        console.error('Get single hospital error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   POST /api/hospitals
// @desc    Create new hospital
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            name,
            location,
            address,
            rating = 0,
            distance = '',
            verified = false,
            logo = '',
            images = [],
            phone = '',
            email = '',
            website = '',
            description = '',
            amenities = [],
            specializations = [],
            services = []
        } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: 'Hospital name and location are required'
            });
        }

        // 1. Insert hospital with sanitized fields
        const { data: hospital, error: hospitalError } = await supabase
            .from('hospitals')
            .insert([
                {
                    name,
                    location,
                    address: address || {},
                    rating: Number(rating) || 0,
                    distance: distance || '',
                    verified: Boolean(verified),
                    logo: logo || '',
                    images: Array.isArray(images) ? images : [],
                    phone: phone || '',
                    email: email || '',
                    website: website || '',
                    description: description || '',
                    amenities: Array.isArray(amenities) ? amenities : [],
                    specializations: Array.isArray(specializations) ? specializations : []
                }
            ])
            .select()
            .single();

        if (hospitalError) {
            throw hospitalError;
        }

        // 2. Insert child services if any
        if (Array.isArray(services) && services.length > 0) {
            const serviceRows = services.map((s) => ({
                hospital_id: hospital.id,
                name: s.name,
                price: Number(s.price) || 0,
                original_price: Number(s.originalPrice ?? s.price) || 0,
                category: s.category || '',
                description: s.description || ''
            }));

            const { error: servicesError } = await supabase
                .from('services')
                .insert(serviceRows);

            if (servicesError) {
                console.error('Error adding services:', servicesError.message);
            }
        }

        // Fetch back complete hospital with services
        const { data: fullHospital } = await supabase
            .from('hospitals')
            .select('*, services(*)')
            .eq('id', hospital.id)
            .single();

        res.status(201).json({
            success: true,
            data: formatHospital(fullHospital || hospital)
        });
    } catch (error) {
        console.error('Create hospital error:', error.message);
        res.status(400).json({
            success: false,
            message: 'Failed to create hospital',
            error: error.message
        });
    }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Sanitize update fields to avoid column not found errors
        const cleanFields = sanitizeHospitalUpdates(req.body);
        const { services } = req.body;

        const { data: updatedHospital, error: updateError } = await supabase
            .from('hospitals')
            .update(cleanFields)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (updateError || !updatedHospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found or update failed'
            });
        }

        // If new services list provided, replace child services
        if (Array.isArray(services)) {
            await supabase.from('services').delete().eq('hospital_id', id);

            if (services.length > 0) {
                const serviceRows = services.map((s) => ({
                    hospital_id: id,
                    name: s.name,
                    price: Number(s.price) || 0,
                    original_price: Number(s.originalPrice ?? s.price) || 0,
                    category: s.category || '',
                    description: s.description || ''
                }));
                await supabase.from('services').insert(serviceRows);
            }
        }

        const { data: fullHospital } = await supabase
            .from('hospitals')
            .select('*, services(*)')
            .eq('id', id)
            .single();

        res.json({
            success: true,
            data: formatHospital(fullHospital || updatedHospital)
        });
    } catch (error) {
        console.error('Update hospital error:', error.message);
        res.status(400).json({
            success: false,
            message: 'Failed to update hospital',
            error: error.message
        });
    }
});

// @route   DELETE /api/hospitals/:id
// @desc    Delete hospital
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const { data, error } = await supabase
            .from('hospitals')
            .delete()
            .eq('id', id)
            .select();

        if (error || !data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            message: 'Hospital removed'
        });
    } catch (error) {
        console.error('Delete hospital error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

module.exports = router;
