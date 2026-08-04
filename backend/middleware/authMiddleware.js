const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

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
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error(error);
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
