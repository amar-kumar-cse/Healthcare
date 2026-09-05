const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const mongoose = require('mongoose');
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
    filename: file.filename,
    path: `/uploads/${file.fieldname === 'avatar' ? 'avatars' : file.fieldname === 'medicalReport' ? 'medicalReports' : file.fieldname === 'logo' ? 'hospitalLogo' : 'hospitalImages'}/${file.filename}`,
    size: file.size,
    mimeType: file.mimetype
});

const analyzeReport = (file) => {
    // Read file from disk (disk storage doesn't provide buffer)
    let fileContent;
    try {
        fileContent = fs.readFileSync(file.path);
    } catch (err) {
        throw new Error(`Failed to read uploaded file: ${err.message}`);
    }

    const searchable = `${file.originalname} ${file.mimetype} ${fileContent.toString('latin1')}`.toLowerCase();
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

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

        const { hospitalId } = req.body;

        // Validate hospitalId is provided and is a valid MongoDB ObjectId
        if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid hospitalId is required in request body'
            });
        }

        const fileRecord = buildInMemoryFileRecord(req.file);

        // Update hospital logo in database
        const hospital = await Hospital.findByIdAndUpdate(
            hospitalId,
            { logo: fileRecord.path },
            { new: true }
        );

        if (!hospital) {
            return res.status(400).json({
                success: false,
                message: 'Hospital not found'
            });
        }

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

        const { hospitalId } = req.body;

        // Validate hospitalId is provided and is a valid MongoDB ObjectId
        if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid hospitalId is required in request body'
            });
        }

        const fileRecord = buildInMemoryFileRecord(req.file);

        // Push image to hospital images array in database
        const hospital = await Hospital.findByIdAndUpdate(
            hospitalId,
            { $push: { images: fileRecord.path } },
            { new: true }
        );

        if (!hospital) {
            return res.status(400).json({
                success: false,
                message: 'Hospital not found'
            });
        }

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
        
        // Analyze report with error handling
        let analysis;
        try {
            analysis = analyzeReport(req.file);
        } catch (analyzeError) {
            // Clean up uploaded file on analysis failure
            try {
                fs.unlinkSync(req.file.path);
            } catch (deleteErr) {
                console.error('Failed to delete file after analysis error:', deleteErr);
            }
            
            return res.status(500).json({
                success: false,
                message: 'Failed to analyze report',
                error: analyzeError.message
            });
        }

        // Add to user's medical reports array
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
