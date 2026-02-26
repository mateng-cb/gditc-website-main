import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

// 禁用 Next.js 默认的 body 解析，以便处理 multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const FORM_FIELDS = [
  'membershipCategory',
  'technicalCommittee',
  'orgNameChinese',
  'orgNameEnglish',
  'orgType',
  'industrySector',
  'country',
  'address',
  'foundedDate',
  'annualSales',
  'orgIntroduction',
  'applicantNameChinese',
  'applicantNameEnglish',
  'gender',
  'dateOfBirth',
  'nationality',
  'jobTitle',
  'phone',
  'email',
  'englishLevel',
] as const;

function parseForm(req: NextApiRequest): Promise<{ fields: Record<string, string>; file: formidable.File | null }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const parsedFields: Record<string, string> = {};
      for (const key of FORM_FIELDS) {
        const value = fields[key];
        parsedFields[key] = Array.isArray(value) ? value[0] ?? '' : (value ?? '');
      }

      const fileField = files.orgIntroductionFile;
      const file = Array.isArray(fileField) ? fileField[0] : fileField ?? null;

      resolve({ fields: parsedFields, file: file || null });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL?.replace(/\/$/, '') || 'https://wonderful-serenity-47deffe3a2.strapiapp.com/api';
  const strapiToken = process.env.STRAPI_API_TOKEN;

  if (!strapiToken) {
    console.error('[join-us/submit] STRAPI_API_TOKEN 未配置');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
  }

  try {
    const { fields, file } = await parseForm(req);

    // 构建 Strapi 创建请求的数据
    const createData: Record<string, string | number | null> = {};
    for (const key of FORM_FIELDS) {
      const value = fields[key];
      if (value !== undefined && value !== '') {
        createData[key] = value;
      }
    }

    // 1. 先创建会员申请记录
    const createResponse = await fetch(`${strapiUrl}/membership-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${strapiToken}`,
      },
      body: JSON.stringify({ data: createData }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      console.error('[join-us/submit] Strapi 创建失败:', createResponse.status, errorData);
      return res.status(createResponse.status).json({
        success: false,
        message: errorData.error?.message || 'Failed to submit application',
      });
    }

    const createResult = await createResponse.json();
    const createdData = createResult.data;
    const refId = createdData?.id ?? createdData?.documentId;

    // 2. 如果有文件，上传并关联到记录（refId 需用数据库行 id，Strapi 5 部分版本用 documentId）
    if (file && file.filepath && refId) {
      try {
        const fileBuffer = fs.readFileSync(file.filepath);
        const formData = new FormData();
        formData.append('files', new Blob([fileBuffer], { type: file.mimetype || 'application/pdf' }), file.originalFilename || 'upload.pdf');
        formData.append('ref', 'api::membership-application.membership-application');
        formData.append('refId', String(refId));
        formData.append('field', 'orgIntroductionFile');

        const uploadResponse = await fetch(`${strapiUrl}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${strapiToken}`,
          },
          body: formData as unknown as BodyInit,
        });

        // 清理临时文件
        fs.unlink(file.filepath, () => {});

        if (!uploadResponse.ok) {
          console.warn('[join-us/submit] 文件上传失败，但申请已创建:', await uploadResponse.text());
          // 不返回错误，申请已成功创建
        }
      } catch (uploadErr) {
        console.warn('[join-us/submit] 文件上传异常:', uploadErr);
        try {
          fs.unlinkSync(file.filepath);
        } catch {}
      }
    } else if (file?.filepath) {
      try {
        fs.unlinkSync(file.filepath);
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      documentId: createdData?.documentId,
    });
  } catch (error) {
    console.error('[join-us/submit] 提交失败:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Submission failed',
    });
  }
}
