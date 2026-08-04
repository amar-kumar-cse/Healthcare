const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User.model');
const Hospital = require('../models/Hospital.model');

const buildInMemoryFileRecord = (file) => ({
    filename: `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    path: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    size: file.size,
    mimeType: file.mimetype
});

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

        const fileRecord = buildInMemoryFileRecord(req.file);

        res.json({
            success: true,
            message: 'Hospital logo uploaded successfully',
            data: {
                filename: fileRecord.filename,
                path: fileRecord.path,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType
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

        const fileRecord = buildInMemoryFileRecord(req.file);

        res.json({
            success: true,
            message: 'Hospital image uploaded successfully',
            data: {
                filename: fileRecord.filename,
                path: fileRecord.path,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType
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

        const fileRecord = buildInMemoryFileRecord(req.file);

        // Update user avatar in database with an in-memory data URL so files persist with MongoDB
        await User.findByIdAndUpdate(req.user._id, { avatar: fileRecord.path });

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                filename: fileRecord.filename,
                path: fileRecord.path,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType
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

        const fileRecord = buildInMemoryFileRecord(req.file);

        // Add to user's medical reports array as a durable data URL stored in MongoDB
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { medicalReports: fileRecord.path } }
        );

        res.json({
            success: true,
            message: 'Medical report uploaded successfully',
            data: {
                filename: fileRecord.filename,
                path: fileRecord.path,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType
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

        const fileUrls = req.files.map(file => buildInMemoryFileRecord(file));

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
