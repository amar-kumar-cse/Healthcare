const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    description: String,
    category: String
});

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    distance: String,
    services: [ServiceSchema],
    verified: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String,
        default: ''
    },
    images: [String],
    phone: String,
    email: String,
    website: String,
    description: String,
    amenities: [String],
    specializations: [String]
}, {
    timestamps: true
});

// Index for search optimization
HospitalSchema.index({ name: 'text', location: 'text', specializations: 'text' });

module.exports = mongoose.model('Hospital', HospitalSchema);
