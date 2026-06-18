import type { NextApiRequest } from 'next';

export function isAuthorized(req: NextApiRequest): boolean {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return token === process.env.ADMIN_API_KEY;
}
