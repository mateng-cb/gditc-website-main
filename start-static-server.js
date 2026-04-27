const path = require('path');
const { exec } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env.local') }); // .env.local 覆盖 .env
const express = require('express');
const fs = require('fs');
const formidable = require('formidable').default || require('formidable').formidable || require('formidable');
const axios = require('axios');
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

// 证书查询 API（需在 app.get('*') 之前注册）
app.get(/^\/api\/certificate-query\/?$/, async (req, res) => {
  const strapiBaseUrl = (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');
  const strapiApiUrl = `${strapiBaseUrl}/api`;
  const { idNumber, certificateNumber } = req.query;

  if (!idNumber || !certificateNumber) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ success: false, message: '请同时提供身份证号和证书编号' });
  }

  try {
    const params = new URLSearchParams({
      idNumber: String(idNumber).trim(),
      certificateNumber: String(certificateNumber).trim(),
    });
    const response = await axios.get(`${strapiApiUrl}/certificate-query?${params}`, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    const result = response.data;

    if (response.status >= 400) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(response.status).json({
        success: false,
        message: result.error?.message || result.message || '查询失败',
      });
    }

    const data = result.data || [];
    const formattedData = data.map((item) => {
      let certificateUrl = item.certificateUrl;
      if (certificateUrl && !certificateUrl.startsWith('http')) {
        certificateUrl = `${strapiBaseUrl}${certificateUrl}`;
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

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error('[certificate-query] 查询失败:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      message: error?.message || '查询失败',
    });
  }
});

// 证书下载代理 API（绕过跨域，触发浏览器直接下载）
app.get(/^\/api\/certificate-download\/?$/, async (req, res) => {
  const { url, filename } = req.query;
  if (!url) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ message: 'Missing url parameter' });
  }
  try {
    const response = await axios.get(String(url), {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      validateStatus: () => true,
    });
    if (response.status >= 400) {
      return res.status(response.status).end();
    }
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const urlName = String(url).split('/').pop() || '';
    const ext = urlName.includes('.') ? urlName.slice(urlName.lastIndexOf('.')) : '.pdf';
    const downloadName = (typeof filename === 'string' ? (filename.includes('.') ? filename : filename + ext) : urlName) || 'certificate.pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    res.setHeader('Content-Length', response.data.length);
    res.send(response.data);
  } catch (error) {
    console.error('[certificate-download]', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ message: 'Download failed' });
  }
});

// Strapi Webhook 触发重建 API（内容发布/修改后实时更新前端）
// 需在 app.get('*') 之前注册
app.post(/^\/api\/rebuild-trigger\/?$/, (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.INCREMENTAL_UPDATE_TOKEN || process.env.REBUILD_TRIGGER_TOKEN;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // 立即返回 202，不阻塞 Strapi
  res.setHeader('Content-Type', 'application/json');
  res.status(202).json({ success: true, message: 'Rebuild triggered' });

  // 异步执行重建（后台运行，不阻塞）
  const projectDir = path.join(__dirname);
  console.log(`[rebuild-trigger] 收到 Webhook，开始后台重建... ${new Date().toISOString()}`);

  exec('npm run build', { cwd: projectDir }, (err, stdout, stderr) => {
    if (err) {
      console.error('[rebuild-trigger] 构建失败:', err.message);
      if (stderr) console.error('[rebuild-trigger] stderr:', stderr);
      return;
    }
    console.log('[rebuild-trigger] 构建完成，重启服务器...');
    exec('pm2 restart gditc-nextjs', { cwd: projectDir }, (restartErr) => {
      if (restartErr) {
        console.error('[rebuild-trigger] PM2 重启失败:', restartErr.message);
        return;
      }
      console.log('[rebuild-trigger] 重建完成', new Date().toISOString());
    });
  });
});

// 会员申请表单提交 API（需在 app.get('*') 之前注册，支持带/不带尾部斜杠）
app.post(/^\/api\/join-us\/submit\/?$/, (req, res) => {
  const strapiUrl = (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://top.gditc.org/api').replace(/\/$/, '');
  const strapiToken = process.env.STRAPI_API_TOKEN;

  if (!strapiToken) {
    console.error('[join-us/submit] STRAPI_API_TOKEN 未配置');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true }); // 10MB

  form.parse(req, async (err, fields, files) => {
    let file = null;
    try {
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
      file = Array.isArray(fileField) ? fileField[0] : fileField || null;

      const createData = {};
      for (const key of FORM_FIELDS) {
        const value = parsedFields[key];
        if (value !== undefined && value !== '') createData[key] = value;
      }

      const createResponse = await axios.post(
        `${strapiUrl}/membership-applications`,
        { data: createData },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${strapiToken}` },
          validateStatus: () => true,
        }
      );

      if (createResponse.status < 200 || createResponse.status >= 300) {
        const errorData = createResponse.data || {};
        console.error('[join-us/submit] Strapi 创建失败:', createResponse.status, errorData);
        return res.status(500).json({
          success: false,
          message: errorData.error?.message || 'Failed to submit application',
        });
      }

      const createdData = createResponse.data?.data;
      const refId = createdData?.id ?? createdData?.documentId;

      if (file && file.filepath && refId) {
        try {
          const FormData = require('form-data');
          const uploadForm = new FormData();
          uploadForm.append('files', fs.createReadStream(file.filepath), {
            filename: file.originalFilename || 'upload.pdf',
            contentType: file.mimetype || 'application/pdf',
          });
          uploadForm.append('ref', 'api::membership-application.membership-application');
          uploadForm.append('refId', String(refId));
          uploadForm.append('field', 'orgIntroductionFile');

          const uploadRes = await axios.post(`${strapiUrl}/upload`, uploadForm, {
            headers: { ...uploadForm.getHeaders(), Authorization: `Bearer ${strapiToken}` },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            validateStatus: () => true,
          });
          if (uploadRes.status >= 400) {
            console.warn('[join-us/submit] 文件上传返回错误:', uploadRes.status, uploadRes.data);
          }
        } catch (uploadErr) {
          const errDetail = uploadErr.response?.data || uploadErr.message;
          console.warn('[join-us/submit] 文件上传失败，但申请已创建. refId=', refId, 'error=', errDetail);
        } finally {
          try { fs.unlinkSync(file.filepath); } catch (_) {}
        }
      } else if (file?.filepath) {
        try { fs.unlinkSync(file.filepath); } catch (_) {}
      }

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ success: true, message: 'Application submitted successfully', documentId: createdData?.documentId });
    } catch (error) {
      console.error('[join-us/submit] 提交失败:', error);
      if (file?.filepath) try { fs.unlinkSync(file.filepath); } catch (_) {}
      res.setHeader('Content-Type', 'application/json');
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
