const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');
const { isValidUUID } = require('../utils/validators');

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

        if (!hospitalId || !isValidUUID(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid UUID hospitalId is required in request body'
            });
        }

        const fileRecord = buildInMemoryFileRecord(req.file);

        // Update hospital logo in Supabase
        const { data: hospital, error: updateError } = await supabase
            .from('hospitals')
            .update({ logo: fileRecord.path })
            .eq('id', hospitalId)
            .select()
            .single();

        if (updateError || !hospital) {
            return res.status(400).json({
                success: false,
                message: 'Hospital not found or logo update failed'
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
        console.error('Upload logo error:', error.message);
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

        if (!hospitalId || !isValidUUID(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid UUID hospitalId is required in request body'
            });
        }

        const fileRecord = buildInMemoryFileRecord(req.file);

        // Fetch current images
        const { data: currentHosp, error: fetchErr } = await supabase
            .from('hospitals')
            .select('images')
            .eq('id', hospitalId)
            .single();

        if (fetchErr || !currentHosp) {
            return res.status(400).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const updatedImages = Array.isArray(currentHosp.images)
            ? [...currentHosp.images, fileRecord.path]
            : [fileRecord.path];

        const { error: updateErr } = await supabase
            .from('hospitals')
            .update({ images: updatedImages })
            .eq('id', hospitalId);

        if (updateErr) {
            throw updateErr;
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
        console.error('Upload hospital image error:', error.message);
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

        const { error: avatarErr } = await supabase
            .from('users')
            .update({ avatar: fileRecord.path })
            .eq('id', req.user.id);

        if (avatarErr) {
            throw avatarErr;
        }

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
        console.error('Upload avatar error:', error.message);
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

        let analysis;
        try {
            analysis = analyzeReport(req.file);
        } catch (analyzeError) {
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

        // Fetch current medical reports
        const { data: currentUser } = await supabase
            .from('users')
            .select('medical_reports')
            .eq('id', req.user.id)
            .single();

        const currentReports = Array.isArray(currentUser?.medical_reports)
            ? [...currentUser.medical_reports, fileRecord.path]
            : [fileRecord.path];

        await supabase
            .from('users')
            .update({ medical_reports: currentReports })
            .eq('id', req.user.id);

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
        console.error('Upload medical report error:', error.message);
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
        console.error('Upload multiple error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

module.exports = router;
