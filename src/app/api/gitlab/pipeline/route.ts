import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = process.env.GITLAB_TOKEN
  const projectId = req.nextUrl.searchParams.get('projectId')

  if (!token) {
    return NextResponse.json({ error: 'GitLab not configured' }, { status: 500 })
  }
  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 })
  }

  const url = `https://gitlab.com/api/v4/projects/${projectId}/pipelines?ref=master&per_page=1&order_by=id&sort=desc`

  const res = await fetch(url, {
    headers: { 'PRIVATE-TOKEN': token },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'GitLab API error' }, { status: res.status })
  }

  const data = await res.json()
  const latest = data[0] ?? null

  return NextResponse.json({
    status: latest?.status ?? null,
    webUrl: latest?.web_url ?? null,
    updatedAt: latest?.updated_at ?? null,
  })
}
