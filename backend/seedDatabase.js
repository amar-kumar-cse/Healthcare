require('dotenv').config();
const connectDB = require('./config/db');
const Hospital = require('./models/Hospital.model');

// Sample hospital data
const hospitals = [
    {
        name: "CyberMed General Hospital",
        location: "Neo-Tokyo District",
        address: {
            street: "123 Tech Boulevard",
            city: "Metro City",
            state: "MC",
            zipCode: "12345",
            coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        rating: 4.8,
        distance: "1.2 km",
        services: [
            { name: "MRI Scan", price: 150, originalPrice: 250, category: "Imaging" },
            { name: "General Checkup", price: 50, originalPrice: 80, category: "Consultation" },
            { name: "Blood Test", price: 25, originalPrice: 40, category: "Laboratory" }
        ],
        verified: true,
        phone: "+1-555-0101",
        email: "info@cybermed.com",
        website: "https://cybermed.com",
        description: "State-of-the-art medical facility with cutting-edge technology",
        amenities: ["24/7 Emergency", "Parking", "Pharmacy", "WiFi"],
        specializations: ["Cardiology", "Neurology", "Radiology"]
    },
    {
        name: "BioHealth Diagnostics",
        location: "Sector 7",
        address: {
            street: "456 Health Avenue",
            city: "Metro City",
            state: "MC",
            zipCode: "12346",
            coordinates: { lat: 40.7589, lng: -73.9851 }
        },
        rating: 4.5,
        distance: "3.5 km",
        services: [
            { name: "MRI Scan", price: 180, originalPrice: 300, category: "Imaging" },
            { name: "X-Ray", price: 40, originalPrice: 60, category: "Imaging" },
            { name: "CT Scan", price: 200, originalPrice: 350, category: "Imaging" }
        ],
        verified: true,
        phone: "+1-555-0102",
        email: "contact@biohealth.com",
        website: "https://biohealth.com",
        description: "Leading diagnostic center with expert radiologists",
        amenities: ["Online Reports", "Home Sample Collection", "Parking"],
        specializations: ["Diagnostic Imaging", "Pathology", "Laboratory Services"]
    },
    {
        name: "FutureCare Clinic",
        location: "Downtown Core",
        address: {
            street: "789 Wellness Street",
            city: "Metro City",
            state: "MC",
            zipCode: "12347",
            coordinates: { lat: 40.7489, lng: -73.9680 }
        },
        rating: 4.9,
        distance: "0.8 km",
        services: [
            { name: "General Checkup", price: 45, originalPrice: 100, category: "Consultation" },
            { name: "Blood Test", price: 20, originalPrice: 35, category: "Laboratory" },
            { name: "Vaccination", price: 30, originalPrice: 50, category: "Preventive Care" }
        ],
        verified: false,
        phone: "+1-555-0103",
        email: "hello@futurecare.com",
        website: "https://futurecare.com",
        description: "Modern clinic focused on preventive healthcare",
        amenities: ["Telemedicine", "Online Booking", "Health Packages"],
        specializations: ["Family Medicine", "Preventive Care", "Wellness Programs"]
    },
    {
        name: "Quantum Medical Center",
        location: "Tech Hub",
        address: {
            street: "321 Innovation Drive",
            city: "Metro City",
            state: "MC",
            zipCode: "12348",
            coordinates: { lat: 40.7614, lng: -73.9776 }
        },
        rating: 4.7,
        distance: "5.0 km",
        services: [
            { name: "CT Scan", price: 220, originalPrice: 400, category: "Imaging" },
            { name: "MRI Scan", price: 160, originalPrice: 280, category: "Imaging" },
            { name: "Ultrasound", price: 80, originalPrice: 120, category: "Imaging" }
        ],
        verified: true,
        phone: "+1-555-0104",
        email: "info@quantummedical.com",
        website: "https://quantummedical.com",
        description: "Advanced medical center with AI-assisted diagnostics",
        amenities: ["24/7 Emergency", "ICU", "Ambulance", "Cafeteria"],
        specializations: ["Emergency Medicine", "Critical Care", "Advanced Diagnostics"]
    }
];

const seedDatabase = async () => {
    try {
        // Check for --force flag or SEED_CONFIRM env var
        const hasForceFlag = process.argv.includes('--force');
        const hasSeedConfirm = process.env.SEED_CONFIRM === 'yes';

        if (!hasForceFlag && !hasSeedConfirm) {
            console.warn('⚠️  WARNING: This will DELETE all existing hospital data!');
            console.warn('To proceed, run with --force flag or SEED_CONFIRM=yes environment variable:');
            console.warn('  node seedDatabase.js --force');
            console.warn('  SEED_CONFIRM=yes node seedDatabase.js');
            process.exit(0);
        }

        await connectDB();

        // Clear existing hospitals
        await Hospital.deleteMany({});
        console.log('🗑️  Cleared existing hospital data');

        // Insert sample hospitals
        await Hospital.insertMany(hospitals);
        console.log('✅ Successfully seeded database with sample hospitals');

        console.log(`📊 Total hospitals added: ${hospitals.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
