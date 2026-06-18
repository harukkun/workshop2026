import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
config({ path: '.env.local' });

interface BoothJSON {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  method: string;
  winCondition: string;
  conquestPoints: string;
  participants: string;
  coinCondition?: string;
  rules?: string;
  preparation?: string;
  postCheck?: string;
}

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const data: BoothJSON[] = JSON.parse(
    readFileSync(join(__dirname, '..', 'data', 'booths.json'), 'utf-8')
  );

  for (const b of data) {
    await sql`
      INSERT INTO booths (id, name, subtitle, image, method, win_condition, conquest_points, participants, coin_condition, rules, preparation, post_check)
      VALUES (${b.id}, ${b.name}, ${b.subtitle}, ${b.image}, ${b.method}, ${b.winCondition}, ${b.conquestPoints}, ${b.participants}, ${b.coinCondition ?? null}, ${b.rules ?? null}, ${b.preparation ?? null}, ${b.postCheck ?? null})
      ON CONFLICT (id) DO NOTHING
    `;
    console.log(`  부스 ${b.id}: ${b.name}`);
  }

  // id 시퀀스를 최대값 이후로 설정
  await sql`SELECT setval('booths_id_seq', (SELECT MAX(id) FROM booths))`;

  console.log('✅ 시딩 완료');
}

seed().catch(console.error);
