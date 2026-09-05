require('dotenv').config();
const supabase = require('./config/supabase');

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
        if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
            console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY in .env');
            process.exit(1);
        }

        const hasForceFlag = process.argv.includes('--force');
        const hasSeedConfirm = process.env.SEED_CONFIRM === 'yes';

        if (!hasForceFlag && !hasSeedConfirm) {
            console.warn('⚠️  WARNING: This will clear and re-seed hospital data in Supabase!');
            console.warn('To proceed, run:');
            console.warn('  node seedDatabase.js --force');
            process.exit(0);
        }

        console.log('🔄 Connecting to Supabase...');

        // 1. Clear existing hospitals (services cascade delete)
        const { error: deleteError } = await supabase
            .from('hospitals')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

        if (deleteError) {
            console.warn('Note on clearing hospitals:', deleteError.message);
        } else {
            console.log('🗑️  Cleared existing hospital data in Supabase');
        }

        // 2. Insert sample hospitals and their services
        let seededCount = 0;
        for (const item of hospitals) {
            const { services, ...hospitalData } = item;

            const { data: createdHospital, error: hospErr } = await supabase
                .from('hospitals')
                .insert([hospitalData])
                .select()
                .single();

            if (hospErr) {
                console.error(`Failed to insert hospital ${item.name}:`, hospErr.message);
                continue;
            }

            if (services && services.length > 0) {
                const serviceRows = services.map((s) => ({
                    hospital_id: createdHospital.id,
                    name: s.name,
                    price: s.price,
                    original_price: s.originalPrice ?? s.price,
                    category: s.category || '',
                    description: s.description || ''
                }));

                const { error: srvErr } = await supabase
                    .from('services')
                    .insert(serviceRows);

                if (srvErr) {
                    console.error(`Failed to insert services for ${item.name}:`, srvErr.message);
                }
            }

            seededCount++;
            console.log(`✅ Added: ${item.name} (${services.length} services)`);
        }

        console.log(`\n🎉 Total hospitals seeded in Supabase: ${seededCount}/${hospitals.length}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
