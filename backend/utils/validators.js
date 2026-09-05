/**
 * Shared validation and sanitization helpers for Supabase operations
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (id) => {
    return typeof id === 'string' && UUID_REGEX.test(id.trim());
};

/**
 * Strips out characters that break PostgREST filter expressions (e.g. commas, parens)
 */
const sanitizeSearchQuery = (query) => {
    if (!query || typeof query !== 'string') return '';
    return query.replace(/[,()"'%]/g, ' ').trim();
};

/**
 * Whitelist hospital fields for safe SQL updates
 */
const ALLOWED_HOSPITAL_UPDATE_FIELDS = [
    'name',
    'location',
    'address',
    'rating',
    'distance',
    'verified',
    'logo',
    'images',
    'phone',
    'email',
    'website',
    'description',
    'amenities',
    'specializations'
];

const sanitizeHospitalUpdates = (body) => {
    const cleanUpdates = {};
    for (const key of ALLOWED_HOSPITAL_UPDATE_FIELDS) {
        if (body[key] !== undefined) {
            cleanUpdates[key] = body[key];
        }
    }
    return cleanUpdates;
};

module.exports = {
    isValidUUID,
    sanitizeSearchQuery,
    sanitizeHospitalUpdates
};
