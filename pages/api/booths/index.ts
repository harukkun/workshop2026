import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllBooths, createBooth } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const booths = await getAllBooths();
    return res.status(200).json(booths);
  }

  if (req.method === 'POST') {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const booth = await createBooth(req.body);
    return res.status(201).json(booth);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
