import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url, filename } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) {
      return res.status(response.status).end();
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const urlName = url.split('/').pop() || '';
    const ext = urlName.includes('.') ? urlName.slice(urlName.lastIndexOf('.')) : '.pdf';
    const downloadName = (typeof filename === 'string' ? (filename.includes('.') ? filename : filename + ext) : urlName) || 'certificate.pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('[certificate-download]', error);
    res.status(500).json({ message: 'Download failed' });
  }
}
