import pool from './database.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database...');
    await client.query('BEGIN');

    // Seed organizations
    const organizations = [
      {
        name: 'Communal Services Department',
        name_uz: 'Kommunal xizmatlar boshqarmasi',
        category: 'garbage',
        email: 'communal@city.uz',
        phone: '+998 71 123 45 67',
        description: 'Handles garbage collection, street cleaning and waste management',
      },
      {
        name: 'Road Infrastructure Agency',
        name_uz: 'Yo\'l infratuzilmasi agentligi',
        category: 'road',
        email: 'roads@city.uz',
        phone: '+998 71 234 56 78',
        description: 'Manages road repairs, potholes, sidewalks and road markings',
      },
      {
        name: 'Electric Power Distribution',
        name_uz: 'Elektr energiyasini taqsimlash',
        category: 'electricity',
        email: 'electricity@city.uz',
        phone: '+998 71 345 67 89',
        description: 'Handles electricity outages, broken streetlights and power lines',
      },
      {
        name: 'Water Supply Authority',
        name_uz: 'Suv ta\'minoti boshqarmasi',
        category: 'water',
        email: 'water@city.uz',
        phone: '+998 71 456 78 90',
        description: 'Manages water supply, sewage and pipeline issues',
      },
      {
        name: 'Green Spaces Department',
        name_uz: 'Yashil maydonlar boshqarmasi',
        category: 'parks',
        email: 'parks@city.uz',
        phone: '+998 71 567 89 01',
        description: 'Handles parks maintenance, tree trimming and landscaping',
      },
      {
        name: 'Public Order Service',
        name_uz: 'Jamoat tartibini saqlash xizmati',
        category: 'safety',
        email: 'safety@city.uz',
        phone: '+998 71 678 90 12',
        description: 'Handles public safety issues, vandalism and illegal activities',
      },
      {
        name: 'General City Services',
        name_uz: 'Umumiy shahar xizmatlari',
        category: 'other',
        email: 'general@city.uz',
        phone: '+998 71 100 00 00',
        description: 'General city problems that need routing to appropriate departments',
      },
    ];

    for (const org of organizations) {
      await client.query(
        `INSERT INTO organizations (name, name_uz, category, email, phone, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (category) DO UPDATE SET
           name = EXCLUDED.name,
           name_uz = EXCLUDED.name_uz,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           description = EXCLUDED.description`,
        [org.name, org.name_uz, org.category, org.email, org.phone, org.description]
      );
    }

    // Seed admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Admin User', 'admin@muammoxarita.uz', adminPassword, 'admin']
    );

    // Seed demo citizen
    const demoPassword = await bcrypt.hash('demo123', 12);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, district)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['Demo Citizen', 'demo@example.com', demoPassword, 'citizen', 'Yunusabad']
    );

    await client.query('COMMIT');
    console.log('✅ Seeding completed!');
    console.log('👤 Admin: admin@muammoxarita.uz / admin123');
    console.log('👤 Demo: demo@example.com / demo123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

seed().catch(console.error);
