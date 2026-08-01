const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User.model');
const Hospital = require('../models/Hospital.model');

// @route   POST /api/upload/hospital-logo
// @desc    Upload hospital logo
// @access  Private/Admin
router.post('/hospital-logo', protect, admin, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const fileUrl = `/uploads/logos/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Hospital logo uploaded successfully',
            data: {
                filename: req.file.filename,
                path: fileUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// @route   POST /api/upload/hospital-image
// @desc    Upload hospital images
// @access  Private/Admin
router.post('/hospital-image', protect, admin, upload.single('hospitalImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const fileUrl = `/uploads/hospital-images/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Hospital image uploaded successfully',
            data: {
                filename: req.file.filename,
                path: fileUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const fileUrl = `/uploads/avatars/${req.file.filename}`;

        // Update user avatar in database
        await User.findByIdAndUpdate(req.user._id, { avatar: fileUrl });

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                filename: req.file.filename,
                path: fileUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// @route   POST /api/upload/medical-report
// @desc    Upload medical report
// @access  Private
router.post('/medical-report', protect, upload.single('medicalReport'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const fileUrl = `/uploads/medical-reports/${req.file.filename}`;

        // Add to user's medical reports array
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { medicalReports: fileUrl } }
        );

        res.json({
            success: true,
            message: 'Medical report uploaded successfully',
            data: {
                filename: req.file.filename,
                path: fileUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private/Admin
router.post('/multiple', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload files'
            });
        }

        const fileUrls = req.files.map(file => ({
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            size: file.size
        }));

        res.json({
            success: true,
            message: `${req.files.length} files uploaded successfully`,
            data: fileUrls
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

module.exports = router;
