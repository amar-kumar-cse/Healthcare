const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { formatUser } = require('../utils/supabaseAdapter');

const readCookie = (cookieHeader, name) => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map((entry) => entry.trim());
    const match = cookies.find((entry) => entry.startsWith(`${name}=`));

    if (!match) return null;

    return decodeURIComponent(match.slice(name.length + 1));
};

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        token = readCookie(req.headers.cookie, 'medicompare_token');
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, avatar, role, phone, favorites, medical_reports, is_verified, created_at, updated_at')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = formatUser(user);
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Admin authorization middleware
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'hospital_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { protect, admin };
