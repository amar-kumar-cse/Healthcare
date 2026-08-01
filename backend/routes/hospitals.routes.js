const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital.model');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/hospitals
// @desc    Get all hospitals with optional search, location, category & rating filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, location, category, verified, minRating } = req.query;
        let query = {};

        // Flex search across name, location, and service names
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { 'services.name': { $regex: search, $options: 'i' } },
                { specializations: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by category
        if (category && category !== 'All') {
            query['services.category'] = category;
        }

        // Filter by verified status
        if (verified !== undefined) {
            query.verified = verified === 'true';
        }

        // Filter by minimum rating
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        const hospitals = await Hospital.find(query).sort({ rating: -1 });

        res.json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });
    } catch (error) {
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
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            data: hospital
        });
    } catch (error) {
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
        const hospital = await Hospital.create(req.body);

        res.status(201).json({
            success: true,
            data: hospital
        });
    } catch (error) {
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
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            data: hospital
        });
    } catch (error) {
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
        const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if (!hospital) {
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
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

module.exports = router;
