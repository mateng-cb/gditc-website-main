import { NextResponse } from 'next/server'
import axios from 'axios'

export const runtime = 'nodejs'

function strapiApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_STRAPI_API_URL || ''
  const trimmed = raw.replace(/\/$/, '')
  if (trimmed.endsWith('/api')) return trimmed
  if (trimmed) return `${trimmed}/api`
  return 'http://localhost:1337/api'
}

/**
 * GET：确认 Next 已挂载本路由。
 * POST：转发至 Strapi POST /api/auth/forgot-password。
 * 若响应头含 x-gditc-strapi-status: 404，说明 Strapi 对该路径返回 404（权限或接口不可用），不是 Next 路由丢失。
 */
export async function GET() {
  console.log('[gditc/forgotpwd GET] handler ran')
  return NextResponse.json(
    {
      ok: true,
      step: 'app-route-handler-mounted',
      hint: '若能看到本 JSON，说明 Next 已匹配到本路由；请用 POST + JSON body { "email": "..." } 测忘记密码。',
      strapiTarget: `${strapiApiBase()}/auth/forgot-password`,
    },
    {
      headers: {
        'x-gditc-handler': 'GET-forgotpwd',
      },
    }
  )
}

export async function POST(request: Request) {
  const reqId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  console.log(`[gditc/forgotpwd POST] start reqId=${reqId}`)

  try {
    const body = await request.json().catch((err) => {
      console.warn(`[gditc/forgotpwd POST] reqId=${reqId} json parse fail`, err)
      return {}
    })
    const email = String((body as { email?: string }).email || '').trim()
    console.log(`[gditc/forgotpwd POST] reqId=${reqId} emailLen=${email.length}`)

    if (!email) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱', debug: { reqId, step: 'validate-email' } },
        { status: 400, headers: { 'x-gditc-handler': 'POST-validation' } }
      )
    }

    const url = `${strapiApiBase()}/auth/forgot-password`
    console.log(`[gditc/forgotpwd POST] reqId=${reqId} axios -> ${url}`)

    const { data, status } = await axios.post(
      url,
      { email },
      { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true }
    )

    const dataPreview =
      data && typeof data === 'object' ? JSON.stringify(data).slice(0, 400) : String(data)
    console.log(`[gditc/forgotpwd POST] reqId=${reqId} strapi status=${status}`, dataPreview)

    if (status >= 400) {
      const rawMsg =
        (data as { error?: { message?: string }; message?: string })?.error?.message
        || (data as { message?: string })?.message
        || '发送失败'

      if (status === 404) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Strapi 对忘记密码接口返回了 404（路由未命中）。请在 Strapi：Settings → Users & Permissions → Roles → Public → Users-permissions → Auth 勾选 Forgot password；并确认实例可访问 POST /api/auth/forgot-password。',
            detail: rawMsg,
            debug: { reqId, step: 'strapi-404', strapiUrl: url },
          },
          {
            status: 502,
            headers: {
              'x-gditc-handler': 'POST-strapi-404',
              'x-gditc-strapi-status': '404',
            },
          }
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: rawMsg,
          debug: { reqId, step: 'strapi-http-error', strapiStatus: status },
        },
        {
          status,
          headers: { 'x-gditc-handler': 'POST-strapi-error', 'x-gditc-strapi-status': String(status) },
        }
      )
    }

    return NextResponse.json(
      { success: true, message: '若邮箱已注册，将收到重置邮件' },
      { headers: { 'x-gditc-handler': 'POST-success' } }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '发送失败'
    console.error(`[gditc/forgotpwd POST] reqId=${reqId} catch`, e)
    return NextResponse.json(
      { success: false, message: msg, debug: { reqId, step: 'exception' } },
      { status: 500, headers: { 'x-gditc-handler': 'POST-exception' } }
    )
  }
}
