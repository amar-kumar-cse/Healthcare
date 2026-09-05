const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI is not set. Skipping database connection for now.');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`⚠️ MongoDB connection failed: ${error.message}`);
    }
};

module.exports = connectDB;
