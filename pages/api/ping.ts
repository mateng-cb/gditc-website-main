import type { NextApiRequest, NextApiResponse } from 'next'

/** 用于确认 pages/api 是否已挂载：浏览器打开 GET /api/ping 应返回 { "ok": true } */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true })
}
