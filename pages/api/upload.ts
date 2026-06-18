import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { isAuthorized } from '@/lib/auth';

export const config = {
  api: { bodyParser: false },
};

function readBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const contentType = req.headers['content-type'] || 'image/png';
  const body = await readBody(req);
  const base64 = body.toString('base64');

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    INSERT INTO images (content_type, data)
    VALUES (${contentType}, ${base64})
    RETURNING id
  `;

  const id = rows[0].id;
  res.status(200).json({ url: `/api/image/${id}` });
}
