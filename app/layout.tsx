/** App Router 根布局（站点页面仍在 pages/；此处仅满足 Next 对 app/ 的要求） */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
