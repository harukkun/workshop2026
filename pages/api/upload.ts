import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
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

  const timestamp = Date.now();
  const filename = `booth-${timestamp}.${contentType === 'image/jpeg' ? 'jpg' : 'png'}`;

  const blob = await put(filename, body, { contentType, access: 'public' });
  res.status(200).json({ url: blob.url });
}
