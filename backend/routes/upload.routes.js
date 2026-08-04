const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User.model');
const Hospital = require('../models/Hospital.model');

const REPORT_PROFILES = [
    {
        procedure: 'MRI Lumbar Spine',
        category: 'Imaging',
        keywords: ['mri', 'magnetic resonance', 'lumbar spine', 'brain', 'head'],
        averageMarketPrice: 320,
        lowestAvailablePrice: 180,
        recommendedHospital: 'CyberMed General Hospital',
        confidenceBase: 96
    },
    {
        procedure: 'CT Scan',
        category: 'Imaging',
        keywords: ['ct', 'computed tomography', 'contrast', 'scan'],
        averageMarketPrice: 280,
        lowestAvailablePrice: 160,
        recommendedHospital: 'Quantum Health & Surgical',
        confidenceBase: 94
    },
    {
        procedure: 'X-Ray Chest',
        category: 'Imaging',
        keywords: ['x-ray', 'xray', 'chest radiograph', 'radiography'],
        averageMarketPrice: 120,
        lowestAvailablePrice: 60,
        recommendedHospital: 'BioHealth Diagnostics Center',
        confidenceBase: 92
    },
    {
        procedure: 'Blood Test Panel',
        category: 'Laboratory',
        keywords: ['blood test', 'cbc', 'haemoglobin', 'hemoglobin', 'lipid', 'lab'],
        averageMarketPrice: 80,
        lowestAvailablePrice: 35,
        recommendedHospital: 'FutureCare Preventive Clinic',
        confidenceBase: 90
    }
];

const buildInMemoryFileRecord = (file) => ({
    filename: `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    path: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    size: file.size,
    mimeType: file.mimetype
});

const analyzeReport = (file) => {
    const searchable = `${file.originalname} ${file.mimetype} ${file.buffer.toString('latin1')}`.toLowerCase();
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    let bestProfile = null;
    let bestScore = -1;
    let matchedSignals = [];

    for (const profile of REPORT_PROFILES) {
        const matches = profile.keywords.filter((keyword) => searchable.includes(keyword));
        const score = matches.length;

        if (score > bestScore) {
            bestProfile = profile;
            bestScore = score;
            matchedSignals = matches;
        }
    }

    if (!bestProfile || bestScore <= 0) {
        const fallbackIndex = parseInt(hash.slice(0, 2), 16) % REPORT_PROFILES.length;
        bestProfile = REPORT_PROFILES[fallbackIndex];
        matchedSignals = ['hash-fallback', file.mimetype, file.originalname.toLowerCase().split('.').pop() || 'unknown'];
    }

    const variation = parseInt(hash.slice(2, 8), 16);
    const marketShift = (variation % 5) * 10;
    const savingsShift = (variation % 4) * 5;
    const averageMarketPrice = bestProfile.averageMarketPrice + marketShift;
    const lowestAvailablePrice = Math.max(25, bestProfile.lowestAvailablePrice + Math.min(30, marketShift - savingsShift));
    const potentialSavings = Math.max(0, averageMarketPrice - lowestAvailablePrice);
    const confidence = Math.min(99.4, bestProfile.confidenceBase + (variation % 9) * 0.2);

    return {
        detectedProcedure: bestProfile.procedure,
        category: bestProfile.category,
        averageMarketPrice,
        lowestAvailablePrice,
        potentialSavings,
        recommendedHospital: bestProfile.recommendedHospital,
        confidence: `${confidence.toFixed(1)}%`,
        signals: matchedSignals.length > 0 ? matchedSignals : ['file-signals-unavailable'],
        fileFingerprint: hash.slice(0, 12)
    };
};

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
        const analysis = analyzeReport(req.file);

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
                mimeType: fileRecord.mimeType,
                analysis
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
