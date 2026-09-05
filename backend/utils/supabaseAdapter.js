/**
 * Adapter helpers to map Supabase relational rows (snake_case, UUID id)
 * to the format expected by the frontend (camelCase and _id compatibility).
 */

const formatHospital = (hospital) => {
    if (!hospital) return null;

    const services = Array.isArray(hospital.services)
        ? hospital.services.map((svc) => ({
            id: svc.id,
            _id: svc.id,
            name: svc.name,
            price: Number(svc.price),
            originalPrice: Number(svc.original_price ?? svc.price),
            category: svc.category || '',
            description: svc.description || ''
        }))
        : [];

    return {
        id: hospital.id,
        _id: hospital.id,
        name: hospital.name,
        location: hospital.location,
        address: hospital.address || {},
        rating: Number(hospital.rating || 0),
        distance: hospital.distance || '',
        verified: Boolean(hospital.verified),
        logo: hospital.logo || '',
        images: Array.isArray(hospital.images) ? hospital.images : [],
        phone: hospital.phone || '',
        email: hospital.email || '',
        website: hospital.website || '',
        description: hospital.description || '',
        amenities: Array.isArray(hospital.amenities) ? hospital.amenities : [],
        specializations: Array.isArray(hospital.specializations) ? hospital.specializations : [],
        services,
        createdAt: hospital.created_at,
        updatedAt: hospital.updated_at
    };
};

const formatUser = (user) => {
    if (!user) return null;

    return {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        role: user.role || 'user',
        phone: user.phone || '',
        favorites: Array.isArray(user.favorites) ? user.favorites.filter(Boolean) : [],
        medicalReports: Array.isArray(user.medical_reports) ? user.medical_reports.filter(Boolean) : [],
        isVerified: Boolean(user.is_verified),
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};

const formatBooking = (booking, hospitalData) => {
    if (!booking) return null;

    return {
        id: booking.id,
        _id: booking.id,
        status: booking.status,
        serviceName: booking.service_name,
        servicePrice: Number(booking.service_price),
        patientName: booking.patient_name,
        preferredDate: booking.preferred_date,
        notes: booking.notes || '',
        hospital: hospitalData ? {
            _id: hospitalData.id || hospitalData._id,
            name: hospitalData.name
        } : booking.hospital_id,
        userId: booking.user_id,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
    };
};

module.exports = {
    formatHospital,
    formatUser,
    formatBooking
};
