require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const app = express();
const PORT = process.env.PORT || 6001;

// 静态文件目录
const staticDir = path.join(__dirname, 'out');

// 检查out目录是否存在
if (!fs.existsSync(staticDir)) {
  console.error('❌ out目录不存在！请先运行 npm run build');
  process.exit(1);
}

// 检查index.html是否存在
const indexFile = path.join(staticDir, 'index.html');
if (!fs.existsSync(indexFile)) {
  console.error('❌ index.html文件不存在！请检查构建结果');
  process.exit(1);
}

console.log('✅ 静态文件目录检查通过');
console.log(`📁 服务目录: ${staticDir}`);

// 会员申请表单字段
const FORM_FIELDS = [
  'membershipCategory', 'technicalCommittee', 'orgNameChinese', 'orgNameEnglish',
  'orgType', 'industrySector', 'country', 'address', 'foundedDate', 'annualSales',
  'orgIntroduction', 'applicantNameChinese', 'applicantNameEnglish', 'gender',
  'dateOfBirth', 'nationality', 'jobTitle', 'phone', 'email', 'englishLevel'
];

// 会员申请表单提交 API（需在 app.get('*') 之前注册，支持带/不带尾部斜杠）
app.post(/^\/api\/join-us\/submit\/?$/, (req, res) => {
  const strapiUrl = (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://wonderful-serenity-47deffe3a2.strapiapp.com/api').replace(/\/$/, '');
  const strapiToken = process.env.STRAPI_API_TOKEN;

  if (!strapiToken) {
    console.error('[join-us/submit] STRAPI_API_TOKEN 未配置');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[join-us/submit] 解析表单失败:', err);
      return res.status(500).json({ success: false, message: 'Failed to parse form' });
    }

    const parsedFields = {};
    for (const key of FORM_FIELDS) {
      const value = fields[key];
      parsedFields[key] = Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
    }

    const fileField = files.orgIntroductionFile;
    const file = Array.isArray(fileField) ? fileField[0] : fileField || null;

    try {
      const createData = {};
      for (const key of FORM_FIELDS) {
        const value = parsedFields[key];
        if (value !== undefined && value !== '') createData[key] = value;
      }

      const createResponse = await fetch(`${strapiUrl}/membership-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${strapiToken}` },
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
      const documentId = createResult.data?.documentId;

      if (file && file.filepath && documentId) {
        try {
          const fileBuffer = fs.readFileSync(file.filepath);
          const formData = new FormData();
          formData.append('files', new Blob([fileBuffer], { type: file.mimetype || 'application/pdf' }), file.originalFilename || 'upload.pdf');
          formData.append('ref', 'api::membership-application.membership-application');
          formData.append('refId', documentId);
          formData.append('field', 'orgIntroductionFile');

          const uploadResponse = await fetch(`${strapiUrl}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${strapiToken}` },
            body: formData,
          });

          fs.unlink(file.filepath, () => {});
          if (!uploadResponse.ok) {
            console.warn('[join-us/submit] 文件上传失败，但申请已创建:', await uploadResponse.text());
          }
        } catch (uploadErr) {
          console.warn('[join-us/submit] 文件上传异常:', uploadErr);
          try { fs.unlinkSync(file.filepath); } catch (_) {}
        }
      } else if (file?.filepath) {
        try { fs.unlinkSync(file.filepath); } catch (_) {}
      }

      res.status(200).json({ success: true, message: 'Application submitted successfully', documentId });
    } catch (error) {
      console.error('[join-us/submit] 提交失败:', error);
      if (file?.filepath) try { fs.unlinkSync(file.filepath); } catch (_) {}
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Submission failed',
      });
    }
  });
});

// 设置静态文件服务
app.use(express.static(staticDir));

// 处理SPA路由 - 所有路由都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ 服务器启动失败:', err);
    process.exit(1);
  }
  console.log(`🚀 静态文件服务器启动成功！`);
  console.log(`🌐 本地访问: http://localhost:${PORT}`);
  console.log(`🌐 网络访问: http://192.168.3.106:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用！`);
  } else {
    console.error('❌ 服务器错误:', err);
  }
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});
