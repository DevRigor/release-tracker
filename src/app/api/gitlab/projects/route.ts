import { NextResponse } from 'next/server'

async function fetchAllProjects(token: string, groupPath: string) {
  const encodedGroup = encodeURIComponent(groupPath)
  const baseUrl = `https://gitlab.com/api/v4/groups/${encodedGroup}/projects?per_page=100&order_by=name&sort=asc&include_subgroups=true&archived=false`

  let page = 1
  let all: { id: number; name: string; path_with_namespace: string }[] = []

  while (true) {
    const res = await fetch(`${baseUrl}&page=${page}`, {
      headers: { 'PRIVATE-TOKEN': token },
      next: { revalidate: 300 },
    })

    if (!res.ok) break

    const data = await res.json()
    if (!data.length) break

    all = [...all, ...data]

    const totalPages = Number(res.headers.get('x-total-pages') ?? '1')
    if (page >= totalPages) break
    page++
  }

  return all
}

export async function GET() {
  const token = process.env.GITLAB_TOKEN
  const groupPath = process.env.GITLAB_GROUP_PATH

  if (!token || !groupPath) {
    return NextResponse.json({ error: 'GitLab not configured' }, { status: 500 })
  }

  try {
    const data = await fetchAllProjects(token, groupPath)

    const projects = data.map(p => ({
      id: p.id,
      name: p.name,
      path: p.path_with_namespace,
    }))

    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'GitLab API error' }, { status: 500 })
  }
}
