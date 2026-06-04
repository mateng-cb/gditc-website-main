/**
 * Strapi Webhook → 本 Worker 接收 POST → GitHub 改文件提交 → Cloudflare 连 Git 自动构建
 *
 * 部署：cd workers/strapi-github-trigger && wrangler deploy
 * 密钥：wrangler secret put STRAPI_WEBHOOK_SECRET
 *       wrangler secret put GITHUB_PAT  （仓库 Contents 写权限）
 */

const SYNC_FILE = '.strapi-sync/last-publish.txt';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const expected = env.STRAPI_WEBHOOK_SECRET;
    if (expected) {
      const auth = request.headers.get('Authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
      if (token !== expected) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const pat = env.GITHUB_PAT;
    if (!owner || !repo || !pat) {
      return new Response('Server misconfigured', { status: 500 });
    }

    try {
      const result = await commitRebuildMarker(owner, repo, pat);
      if (!result.ok) {
        return new Response(result.body || result.statusText, { status: result.status });
      }

      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Git commit pushed; Cloudflare will rebuild on push',
          commit: result.commit?.sha || null,
        }),
        { status: 202, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      return new Response(err?.message || 'Internal error', { status: 500 });
    }
  },
};

async function githubFetch(url, pat, init = {}) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'gditc-strapi-github-trigger',
      ...init.headers,
    },
  });
}

async function commitRebuildMarker(owner, repo, pat) {
  const content = `${new Date().toISOString()}\n`;
  const encoded = btoa(content);

  let sha;
  const getRes = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${SYNC_FILE}`,
    pat
  );
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  } else if (getRes.status !== 404) {
    const text = await getRes.text();
    return { ok: false, status: getRes.status, body: text };
  }

  const putRes = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${SYNC_FILE}`,
    pat,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'chore: rebuild after Strapi publish [strapi-sync]',
        content: encoded,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  const text = await putRes.text();
  if (!putRes.ok) {
    return { ok: false, status: putRes.status, body: text };
  }

  let commit = null;
  try {
    commit = JSON.parse(text).commit;
  } catch {
    /* ignore */
  }

  return { ok: true, commit };
}
