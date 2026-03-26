import pool from './database.js';

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log('🚀 Running database migrations...');

    await client.query('BEGIN');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Organizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        name_uz VARCHAR(255),
        category VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255),
        phone VARCHAR(50),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'org_member')),
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        avatar_url TEXT,
        phone VARCHAR(50),
        district VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Problems table
    await client.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'solved', 'rejected')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT,
        image_url TEXT,
        image_public_id TEXT,
        ai_analysis JSONB,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        resolved_at TIMESTAMPTZ,
        resolution_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(problem_id, user_id)
      )
    `);

    // Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_official BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_problems_user_id ON problems(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_problems_org_id ON problems(organization_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_problems_location ON problems(latitude, longitude)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_problem_id ON votes(problem_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_comments_problem_id ON comments(problem_id)');

    await client.query('COMMIT');
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

migrate().catch(console.error);
