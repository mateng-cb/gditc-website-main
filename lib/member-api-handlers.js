/**
 * 会员中心 API 共享逻辑（供 pages/api 与 start-static-server 使用）
 * @typedef {{ status: number, body: object, cookies?: Array<{ name: string, value: string, options: object }> }} ApiResult
 */

const axios = require('axios');

function strapiApiBase() {
  const raw = process.env.NEXT_PUBLIC_STRAPI_API_URL || '';
  const trimmed = raw.replace(/\/$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  if (trimmed) return `${trimmed}/api`;
  return 'http://localhost:1337/api';
}

function strapiOrigin() {
  return strapiApiBase().replace(/\/api\/?$/, '');
}

function getBearerFromReq(req) {
  const auth = req.headers?.authorization;
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim();
  const cookie = req.headers?.cookie || '';
  const m = cookie.match(/(?:^|;\s*)member_jwt=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {{ identifier: string, password: string }} body
 * @returns {Promise<ApiResult>}
 */
async function login(req, body) {
  const identifier = (body.identifier || body.email || '').trim();
  const password = body.password || '';
  if (!identifier || !password) {
    return { status: 400, body: { success: false, message: '请输入邮箱和密码' } };
  }
  try {
    const { data } = await axios.post(
      `${strapiApiBase()}/auth/local`,
      { identifier, password },
      { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true }
    );
    if (!data?.jwt) {
      return {
        status: data?.error?.status || 401,
        body: { success: false, message: data?.error?.message || '登录失败' },
      };
    }
    const maxAgeMs = 60 * 60 * 24 * 7 * 1000;
    return {
      status: 200,
      body: { success: true, user: data.user },
      cookies: [
        {
          name: 'member_jwt',
          value: data.jwt,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: maxAgeMs,
            secure: process.env.NODE_ENV === 'production',
          },
        },
      ],
    };
  } catch (e) {
    const msg = e.response?.data?.error?.message || e.message || '登录失败';
    return { status: 500, body: { success: false, message: msg } };
  }
}

/** @returns {Promise<ApiResult>} */
async function logout() {
  return {
    status: 200,
    body: { success: true },
    cookies: [
      {
        name: 'member_jwt',
        value: '',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
          secure: process.env.NODE_ENV === 'production',
        },
      },
    ],
  };
}

/** @returns {Promise<ApiResult>} */
async function forgotPassword(body) {
  const email = (body.email || '').trim();
  if (!email) return { status: 400, body: { success: false, message: '请输入邮箱' } };
  try {
    const { data, status } = await axios.post(
      `${strapiApiBase()}/auth/forgot-password`,
      { email },
      { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true }
    );
    if (status >= 400) {
      return { status, body: { success: false, message: data?.error?.message || '发送失败' } };
    }
    return { status: 200, body: { success: true, message: '若邮箱已注册，将收到重置邮件' } };
  } catch (e) {
    return { status: 500, body: { success: false, message: e.message || '发送失败' } };
  }
}

/** @returns {Promise<ApiResult>} */
async function resetPassword(body) {
  const { code, password, passwordConfirmation } = body;
  if (!code || !password) {
    return { status: 400, body: { success: false, message: '缺少重置参数' } };
  }
  try {
    const { data, status } = await axios.post(
      `${strapiApiBase()}/auth/reset-password`,
      {
        code,
        password,
        passwordConfirmation: passwordConfirmation || password,
      },
      { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true }
    );
    if (status >= 400) {
      return { status, body: { success: false, message: data?.error?.message || '重置失败' } };
    }
    return { status: 200, body: { success: true, message: '密码已重置，请使用新密码登录' } };
  } catch (e) {
    return { status: 500, body: { success: false, message: e.message || '重置失败' } };
  }
}

/** @returns {Promise<ApiResult>} */
async function me(req) {
  const jwt = getBearerFromReq(req);
  // 未登录用 200 + success:false，避免全站 Layout 轮询时在控制台刷 401；需鉴权页仍以 !json.success 判断
  if (!jwt) return { status: 200, body: { success: false, loggedIn: false, message: '未登录' } };
  try {
    const { data, status } = await axios.get(`${strapiApiBase()}/member-profiles/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      validateStatus: () => true,
    });
    if (status >= 400) {
      return {
        status,
        body: { success: false, message: data?.error?.message || data?.message || '获取资料失败' },
      };
    }
    return { status: 200, body: { success: true, data: data.data } };
  } catch (e) {
    return { status: 500, body: { success: false, message: e.message || '获取资料失败' } };
  }
}

/** @returns {Promise<ApiResult>} */
async function updateContact(req, body) {
  const jwt = getBearerFromReq(req);
  if (!jwt) return { status: 401, body: { success: false, message: '未登录' } };
  try {
    const { data, status } = await axios.put(
      `${strapiApiBase()}/member-profiles/me/contact`,
      { contactName: body.contactName, contactPhone: body.contactPhone },
      { headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }, validateStatus: () => true }
    );
    if (status >= 400) {
      return {
        status,
        body: { success: false, message: data?.error?.message || data?.message || '更新失败' },
      };
    }
    return { status: 200, body: { success: true, data: data.data } };
  } catch (e) {
    return { status: 500, body: { success: false, message: e.message || '更新失败' } };
  }
}

/**
 * 受控下载：校验 JWT 与归属后，用服务端 Token 拉取文件流
 * query: kind=expert|ditc-cert, documentId=文档 documentId（ditc-cert=DITC 会员证书）
 */
async function download(req) {
  const jwt = getBearerFromReq(req);
  if (!jwt) return { status: 401, body: { success: false, message: '未登录' } };

  const token = process.env.STRAPI_API_TOKEN;
  if (!token) {
    return { status: 500, body: { success: false, message: '服务器未配置 STRAPI_API_TOKEN' } };
  }

  let kind = '';
  let documentId = '';
  if (req.query && typeof req.query === 'object') {
    kind = Array.isArray(req.query.kind) ? req.query.kind[0] : (req.query.kind || '').toString();
    documentId = Array.isArray(req.query.documentId)
      ? req.query.documentId[0]
      : (req.query.documentId || '').toString();
  }
  if ((!kind || !documentId) && req.url) {
    try {
      const u = new URL(req.url, 'http://localhost');
      kind = kind || u.searchParams.get('kind') || '';
      documentId = documentId || u.searchParams.get('documentId') || '';
    } catch {
      /* ignore */
    }
  }
  if (!kind || !documentId) {
    return { status: 400, body: { success: false, message: '缺少 kind 或 documentId' } };
  }

  try {
    const meRes = await axios.get(`${strapiApiBase()}/member-profiles/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      validateStatus: () => true,
    });
    if (meRes.status >= 400) {
      return { status: 401, body: { success: false, message: '无法验证身份' } };
    }
    const profile = meRes.data?.data;
    if (!profile) return { status: 404, body: { success: false, message: '无会员档案' } };

    let fileUrl = null;
    let filename = 'download';

    if (kind === 'expert') {
      const list = profile.experts || [];
      const row = list.find((e) => e.documentId === documentId);
      const f = row?.appointmentLetter;
      if (!f?.url) return { status: 404, body: { success: false, message: '未找到聘书文件' } };
      fileUrl = f.url.startsWith('http') ? f.url : `${strapiOrigin()}${f.url}`;
      filename = (f.name || row.fullName || 'appointment') + (f.ext || '');
    } else if (kind === 'ditc-cert' || kind === 'ditc-member-certificate') {
      const list = profile.ditcMemberCertificates || [];
      const row = list.find((c) => c.documentId === documentId);
      const f = row?.certificateFile;
      if (!f?.url) return { status: 404, body: { success: false, message: '未找到 DITC 会员证书文件' } };
      fileUrl = f.url.startsWith('http') ? f.url : `${strapiOrigin()}${f.url}`;
      const certLabel = row.certNo || row.cert_no || 'ditc-certificate';
      filename = (f.name || certLabel) + (f.ext || '');
    } else {
      return { status: 400, body: { success: false, message: 'kind 无效' } };
    }

    const fileRes = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'GDITC-member-download' },
      validateStatus: () => true,
    });
    if (fileRes.status >= 400) {
      return { status: 502, body: { success: false, message: '文件拉取失败' } };
    }
    return {
      status: 200,
      binary: true,
      buffer: Buffer.from(fileRes.data),
      contentType: fileRes.headers['content-type'] || 'application/octet-stream',
      filename,
    };
  } catch (e) {
    return { status: 500, body: { success: false, message: e.message || '下载失败' } };
  }
}

function applyCookies(res, cookies) {
  if (!cookies) return;
  const parts = cookies.map(({ name, value, options }) => {
    const o = options || {};
    let s = `${name}=${value}`;
    if (o.maxAge !== undefined) s += `; Max-Age=${Math.floor(o.maxAge / 1000)}`;
    if (o.path) s += `; Path=${o.path}`;
    if (o.httpOnly) s += '; HttpOnly';
    if (o.sameSite) s += `; SameSite=${o.sameSite}`;
    if (o.secure) s += '; Secure';
    return s;
  });
  if (typeof res.appendHeader === 'function') {
    parts.forEach((p) => res.appendHeader('Set-Cookie', p));
  } else {
    res.setHeader('Set-Cookie', parts);
  }
}

module.exports = {
  strapiApiBase,
  strapiOrigin,
  getBearerFromReq,
  login,
  logout,
  forgotPassword,
  resetPassword,
  me,
  updateContact,
  download,
  applyCookies,
};
