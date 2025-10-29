import { NextApiRequest, NextApiResponse } from 'next';
import { incrementalUpdater } from '../../lib/incremental-updater';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 验证请求来源（可选）
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.INCREMENTAL_UPDATE_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 强制触发增量更新
    await incrementalUpdater.forceUpdate();
    
    // 获取更新状态
    const status = incrementalUpdater.getUpdateStatus();
    
    res.status(200).json({
      success: true,
      message: 'Incremental update triggered successfully',
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] 增量更新失败:', error);
    res.status(500).json({
      success: false,
      message: 'Incremental update failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
