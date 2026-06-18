import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
    return;
  }

  const id = Number(req.query.id);
  if (!id) {
    res.status(400).end();
    return;
  }

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT content_type, data FROM images WHERE id = ${id}`;

  if (rows.length === 0) {
    res.status(404).end();
    return;
  }

  const { content_type, data } = rows[0];
  const buffer = Buffer.from(data as string, 'base64');

  res.setHeader('Content-Type', content_type as string);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(buffer);
}
