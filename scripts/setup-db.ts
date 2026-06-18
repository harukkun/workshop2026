import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function setup() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS booths (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      image TEXT NOT NULL,
      method TEXT NOT NULL,
      win_condition TEXT,
      conquest_points TEXT,
      participants TEXT NOT NULL,
      coin_condition TEXT,
      rules TEXT,
      preparation TEXT,
      post_check TEXT
    )
  `;

  console.log('✅ booths 테이블 생성 완료');
}

setup().catch(console.error);
