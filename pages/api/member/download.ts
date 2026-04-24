import type { NextApiRequest, NextApiResponse } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const memberApi = require('../../../lib/member-api-handlers');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const result = await memberApi.download(req);
  if (result.binary && result.buffer) {
    res.setHeader('Content-Type', result.contentType || 'application/octet-stream');
    const name = (result.filename || 'file').replace(/[^\w.\-\u4e00-\u9fa5]+/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
    return res.status(result.status).send(result.buffer);
  }
  return res.status(result.status).json(result.body);
}
