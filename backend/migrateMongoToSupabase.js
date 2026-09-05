/**
 * Migration Script: MongoDB to Supabase
 *
 * Reads existing Users, Hospitals, and Bookings from MongoDB (via MONGODB_URI)
 * and imports them into Supabase (via SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).
 *
 * Usage:
 *   node migrateMongoToSupabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const supabase = require('./config/supabase');

const User = require('./models/User.model');
const Hospital = require('./models/Hospital.model');
const Booking = require('./models/Booking.model');

async function migrate() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined in backend/.env');
        process.exit(1);
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in backend/.env');
        process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    try {
        // 1. Migrate Users
        console.log('\n--- Migrating Users ---');
        const users = await User.find({}).lean();
        console.log(`Found ${users.length} users in MongoDB.`);

        const userMap = new Map(); // Mongo _id -> Supabase id

        for (const user of users) {
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', user.email.toLowerCase().trim())
                .maybeSingle();

            if (existing) {
                userMap.set(String(user._id), existing.id);
                console.log(`User ${user.email} already exists in Supabase. Mapped.`);
                continue;
            }

            const { data: insertedUser, error } = await supabase
                .from('users')
                .insert([
                    {
                        name: user.name,
                        email: user.email.toLowerCase().trim(),
                        password: user.password,
                        avatar: user.avatar || '',
                        role: user.role || 'user',
                        phone: user.phone || '',
                        favorites: [],
                        medical_reports: user.medicalReports || [],
                        is_verified: Boolean(user.isVerified)
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error(`Failed to migrate user ${user.email}:`, error.message);
            } else {
                userMap.set(String(user._id), insertedUser.id);
                console.log(`✅ Migrated user: ${user.email}`);
            }
        }

        // 2. Migrate Hospitals & Services
        console.log('\n--- Migrating Hospitals & Services ---');
        const hospitals = await Hospital.find({}).lean();
        console.log(`Found ${hospitals.length} hospitals in MongoDB.`);

        const hospitalMap = new Map(); // Mongo _id -> Supabase id

        for (const h of hospitals) {
            const { data: insertedHosp, error: hospErr } = await supabase
                .from('hospitals')
                .insert([
                    {
                        name: h.name,
                        location: h.location,
                        address: h.address || {},
                        rating: h.rating || 0,
                        distance: h.distance || '',
                        verified: Boolean(h.verified),
                        logo: h.logo || '',
                        images: h.images || [],
                        phone: h.phone || '',
                        email: h.email || '',
                        website: h.website || '',
                        description: h.description || '',
                        amenities: h.amenities || [],
                        specializations: h.specializations || []
                    }
                ])
                .select()
                .single();

            if (hospErr) {
                console.error(`Failed to migrate hospital ${h.name}:`, hospErr.message);
                continue;
            }

            hospitalMap.set(String(h._id), insertedHosp.id);
            console.log(`✅ Migrated hospital: ${h.name}`);

            // Insert child services
            if (h.services && h.services.length > 0) {
                const serviceRows = h.services.map((s) => ({
                    hospital_id: insertedHosp.id,
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
                    console.error(`  Failed to migrate services for ${h.name}:`, srvErr.message);
                } else {
                    console.log(`  Included ${serviceRows.length} services.`);
                }
            }
        }

        // 3. Migrate Bookings
        console.log('\n--- Migrating Bookings ---');
        const bookings = await Booking.find({}).lean();
        console.log(`Found ${bookings.length} bookings in MongoDB.`);

        for (const b of bookings) {
            const supabaseUserId = userMap.get(String(b.user)) || null;
            const supabaseHospId = hospitalMap.get(String(b.hospital));

            if (!supabaseHospId) {
                console.warn(`Skipping booking ${b._id}: Associated hospital not found in Supabase.`);
                continue;
            }

            const { error: bErr } = await supabase
                .from('bookings')
                .insert([
                    {
                        user_id: supabaseUserId,
                        hospital_id: supabaseHospId,
                        service_name: b.serviceName,
                        service_price: b.servicePrice,
                        patient_name: b.patientName,
                        preferred_date: b.preferredDate,
                        notes: b.notes || '',
                        status: b.status || 'pending'
                    }
                ]);

            if (bErr) {
                console.error(`Failed to migrate booking ${b._id}:`, bErr.message);
            } else {
                console.log(`✅ Migrated booking for ${b.patientName}`);
            }
        }

        console.log('\n🎉 Data Migration Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration error:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
