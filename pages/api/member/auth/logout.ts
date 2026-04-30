import type { NextApiRequest, NextApiResponse } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const memberApi = require('../../../../lib/member-api-handlers');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const result = await memberApi.logout();
  if (result.cookies) memberApi.applyCookies(res, result.cookies);
  return res.status(result.status).json(result.body);
}
