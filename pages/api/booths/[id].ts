import type { NextApiRequest, NextApiResponse } from 'next';
import { getBoothById, updateBooth, deleteBooth } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    const booth = await getBoothById(id);
    if (!booth) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(booth);
  }

  if (req.method === 'PUT') {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const booth = await updateBooth(id, req.body);
    if (!booth) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(booth);
  }

  if (req.method === 'DELETE') {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const deleted = await deleteBooth(id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
