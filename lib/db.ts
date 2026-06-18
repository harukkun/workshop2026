import { neon } from '@neondatabase/serverless';
import { Booth } from '@/types/booth';

function getSQL() {
  return neon(process.env.DATABASE_URL!);
}

function rowToBooth(row: Record<string, unknown>): Booth {
  const booth: Booth = {
    id: row.id as number,
    name: row.name as string,
    subtitle: row.subtitle as string,
    image: row.image as string,
    method: row.method as string,
    winCondition: (row.win_condition as string) || '',
    conquestPoints: (row.conquest_points as string) || '',
    participants: row.participants as string,
  };
  if (row.coin_condition) booth.coinCondition = row.coin_condition as string;
  if (row.rules) booth.rules = row.rules as string;
  if (row.preparation) booth.preparation = row.preparation as string;
  if (row.post_check) booth.postCheck = row.post_check as string;
  return booth;
}

export async function getAllBooths(): Promise<Booth[]> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM booths ORDER BY id`;
  return rows.map(rowToBooth);
}

export async function getBoothById(id: number): Promise<Booth | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM booths WHERE id = ${id}`;
  return rows.length > 0 ? rowToBooth(rows[0]) : null;
}

export async function createBooth(booth: Omit<Booth, 'id'> & { id?: number }): Promise<Booth> {
  const sql = getSQL();
  const rows = booth.id
    ? await sql`
        INSERT INTO booths (id, name, subtitle, image, method, win_condition, conquest_points, participants, coin_condition, rules, preparation, post_check)
        VALUES (${booth.id}, ${booth.name}, ${booth.subtitle}, ${booth.image}, ${booth.method}, ${booth.winCondition}, ${booth.conquestPoints}, ${booth.participants}, ${booth.coinCondition ?? null}, ${booth.rules ?? null}, ${booth.preparation ?? null}, ${booth.postCheck ?? null})
        RETURNING *
      `
    : await sql`
        INSERT INTO booths (name, subtitle, image, method, win_condition, conquest_points, participants, coin_condition, rules, preparation, post_check)
        VALUES (${booth.name}, ${booth.subtitle}, ${booth.image}, ${booth.method}, ${booth.winCondition}, ${booth.conquestPoints}, ${booth.participants}, ${booth.coinCondition ?? null}, ${booth.rules ?? null}, ${booth.preparation ?? null}, ${booth.postCheck ?? null})
        RETURNING *
      `;
  return rowToBooth(rows[0]);
}

export async function updateBooth(id: number, booth: Partial<Booth>): Promise<Booth | null> {
  const sql = getSQL();
  const current = await getBoothById(id);
  if (!current) return null;

  const merged = { ...current, ...booth };
  const rows = await sql`
    UPDATE booths SET
      name = ${merged.name},
      subtitle = ${merged.subtitle},
      image = ${merged.image},
      method = ${merged.method},
      win_condition = ${merged.winCondition},
      conquest_points = ${merged.conquestPoints},
      participants = ${merged.participants},
      coin_condition = ${merged.coinCondition ?? null},
      rules = ${merged.rules ?? null},
      preparation = ${merged.preparation ?? null},
      post_check = ${merged.postCheck ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length > 0 ? rowToBooth(rows[0]) : null;
}

export async function deleteBooth(id: number): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`DELETE FROM booths WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
