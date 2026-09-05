export const normalizeHospitals = (payload) => {
  const hospitals = Array.isArray(payload) ? payload : [];

  return hospitals.map((hospital, index) => {
    const services = Array.isArray(hospital?.services) ? hospital.services : [];
    const normalizedServices = services
      .filter((service) => service && typeof service === 'object')
      .map((service) => ({
        name: typeof service.name === 'string' && service.name.trim() ? service.name : 'Service',
        price: Number.isFinite(Number(service.price)) ? Number(service.price) : 0,
        originalPrice: Number.isFinite(Number(service.originalPrice)) ? Number(service.originalPrice) : 0,
        category: typeof service.category === 'string' && service.category.trim() ? service.category : 'General'
      }));

    return {
      _id: hospital?._id || `hospital-${index + 1}`,
      name: typeof hospital?.name === 'string' && hospital.name.trim() ? hospital.name : 'Unnamed Hospital',
      location: typeof hospital?.location === 'string' && hospital.location.trim() ? hospital.location : 'Unknown location',
      distance: typeof hospital?.distance === 'string' && hospital.distance.trim() ? hospital.distance : 'N/A',
      rating: Number.isFinite(Number(hospital?.rating)) ? Number(hospital.rating) : 0,
      verified: Boolean(hospital?.verified),
      phone: typeof hospital?.phone === 'string' ? hospital.phone : '',
      email: typeof hospital?.email === 'string' ? hospital.email : '',
      website: typeof hospital?.website === 'string' ? hospital.website : '',
      description: typeof hospital?.description === 'string' ? hospital.description : 'Comprehensive healthcare facility.',
      specializations: Array.isArray(hospital?.specializations) ? hospital.specializations.filter(Boolean) : [],
      services: normalizedServices
    };
  });
};
