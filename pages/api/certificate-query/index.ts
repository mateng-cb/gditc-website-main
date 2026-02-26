import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { idNumber, certificateNumber } = req.query;

  if (!idNumber || !certificateNumber) {
    return res.status(400).json({
      success: false,
      message: '请同时提供身份证号和证书编号',
    });
  }

  const strapiUrl = (process.env.NEXT_PUBLIC_STRAPI_API_URL || '').replace(/\/$/, '').replace(/\/api$/, '') || 'http://localhost:1337';
  const strapiApiUrl = `${strapiUrl}/api`;

  try {
    const params = new URLSearchParams({
      idNumber: String(idNumber).trim(),
      certificateNumber: String(certificateNumber).trim(),
    });
    const response = await fetch(`${strapiApiUrl}/certificate-query?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.error?.message || result.message || '查询失败',
      });
    }

    const data = result.data || [];
    const baseUrl = strapiUrl.replace(/\/api$/, '');

    const formattedData = data.map((item: Record<string, unknown>) => {
      let certificateUrl = item.certificateUrl as string | null;
      if (certificateUrl && !certificateUrl.startsWith('http')) {
        certificateUrl = `${baseUrl}${certificateUrl}`;
      }
      return {
        year: item.year,
        certificateNumber: item.certificateNumber,
        qualification: item.qualification,
        name: item.name,
        idNumber: item.idNumber,
        trainingStartDate: item.trainingStartDate,
        trainingEndDate: item.trainingEndDate,
        assessmentMethod: item.assessmentMethod || '-',
        issueDate: item.issueDate,
        certificateUrl: certificateUrl || undefined,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('[certificate-query] 查询失败:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '查询失败',
    });
  }
}
