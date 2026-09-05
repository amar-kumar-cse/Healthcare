const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const supabase = require('../config/supabase');
const { formatUser, formatHospital } = require('../utils/supabaseAdapter');
const { protect } = require('../middleware/authMiddleware');
const { isValidUUID } = require('../utils/validators');

const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
};

const buildSafeUser = (user) => ({
    _id: user.id || user._id,
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many attempts, try again later'
    }
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key-fallback', {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: 'user'
                }
            ])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        const safeUser = buildSafeUser(newUser);
        const token = generateToken(newUser.id);
        res.cookie('medicompare_token', token, cookieOptions);

        res.status(201).json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (findError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const safeUser = buildSafeUser(user);
        const token = generateToken(user.id);
        res.cookie('medicompare_token', token, cookieOptions);

        res.json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, avatar, role, phone, favorites, medical_reports, is_verified, created_at, updated_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const formatted = formatUser(user);

        // Populate favorites safely if valid UUIDs exist
        const validFavoriteIds = (formatted.favorites || []).filter(isValidUUID);
        if (validFavoriteIds.length > 0) {
            const { data: favHospitals } = await supabase
                .from('hospitals')
                .select('*, services(*)')
                .in('id', validFavoriteIds);

            formatted.favorites = (favHospitals || []).map(formatHospital);
        } else {
            formatted.favorites = [];
        }

        res.json({
            success: true,
            data: formatted
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.phone !== undefined) updates.phone = req.body.phone;
        if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

        if (req.body.email) {
            const normalizedEmail = req.body.email.toLowerCase().trim();
            if (normalizedEmail !== req.user.email) {
                const { data: existing } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', normalizedEmail)
                    .maybeSingle();

                if (existing) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already in use'
                    });
                }
                updates.email = normalizedEmail;
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password, salt);
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: buildSafeUser(updatedUser)
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
