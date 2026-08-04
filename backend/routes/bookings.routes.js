const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking.model');
const Hospital = require('../models/Hospital.model');
const { protect } = require('../middleware/authMiddleware');

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

        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const booking = await Booking.create({
            user: req.user._id,
            hospital: hospital._id,
            serviceName,
            servicePrice,
            patientName,
            preferredDate,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Booking request submitted successfully',
            data: {
                _id: booking._id,
                status: booking.status,
                hospital: {
                    _id: hospital._id,
                    name: hospital.name
                },
                serviceName: booking.serviceName,
                servicePrice: booking.servicePrice,
                patientName: booking.patientName,
                preferredDate: booking.preferredDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Booking failed',
            error: error.message
        });
    }
});

module.exports = router;