import { NextRequest, NextResponse } from 'next/server'

const GITLAB_BASE = 'https://gitlab.com/api/v4'

interface PipelineResult {
  status: string | null
  webUrl: string | null
}

async function getEnvDeployment(token: string, projectId: string, environment: string): Promise<PipelineResult> {
  const res = await fetch(
    `${GITLAB_BASE}/projects/${projectId}/deployments?environment=${environment}&per_page=1&order_by=created_at&sort=desc`,
    { headers: { 'PRIVATE-TOKEN': token }, next: { revalidate: 60 } }
  )
  if (!res.ok) return { status: null, webUrl: null }

  const data = await res.json()
  const dep = data[0] ?? null
  if (!dep) return { status: null, webUrl: null }

  return {
    status: dep.deployable?.pipeline?.status ?? dep.status ?? null,
    webUrl: dep.deployable?.pipeline?.web_url ?? null,
  }
}

export async function GET(req: NextRequest) {
  const token = process.env.GITLAB_TOKEN
  const projectId = req.nextUrl.searchParams.get('projectId')

  if (!token) return NextResponse.json({ error: 'GitLab not configured' }, { status: 500 })
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const [dev, master, prod] = await Promise.all([
    getEnvDeployment(token, projectId, 'dev'),
    getEnvDeployment(token, projectId, 'intg'),
    getEnvDeployment(token, projectId, 'prod'),
  ])

  return NextResponse.json({ dev, master, prod })
}
