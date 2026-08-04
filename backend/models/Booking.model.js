const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    servicePrice: {
        type: Number,
        required: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    preferredDate: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);