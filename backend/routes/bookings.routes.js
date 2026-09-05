const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { formatBooking } = require('../utils/supabaseAdapter');
const { isValidUUID } = require('../utils/validators');

// @route   POST /api/bookings
// @desc    Create a new booking appointment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            hospitalId,
            serviceName,
            servicePrice,
            patientName,
            preferredDate,
            notes = ''
        } = req.body;

        if (!hospitalId || !serviceName || !servicePrice || !patientName || !preferredDate) {
            return res.status(400).json({
                success: false,
                message: 'Hospital, service, patient name, and preferred date are required'
            });
        }

        if (!isValidUUID(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID format'
            });
        }

        // Verify hospital exists
        const { data: hospital, error: hospitalError } = await supabase
            .from('hospitals')
            .select('id, name')
            .eq('id', hospitalId)
            .maybeSingle();

        if (hospitalError || !hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Create booking in Supabase
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert([
                {
                    user_id: req.user.id,
                    hospital_id: hospital.id,
                    service_name: serviceName,
                    service_price: Number(servicePrice) || 0,
                    patient_name: patientName,
                    preferred_date: preferredDate,
                    notes,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (bookingError) {
            throw bookingError;
        }

        res.status(201).json({
            success: true,
            message: 'Booking request submitted successfully',
            data: formatBooking(booking, hospital)
        });
    } catch (error) {
        console.error('Booking creation error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Booking failed',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*, hospitals(id, name)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const formatted = (bookings || []).map((b) => formatBooking(b, b.hospitals));

        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error('Get user bookings error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

module.exports = router;