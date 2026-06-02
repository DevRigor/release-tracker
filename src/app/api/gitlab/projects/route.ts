import { NextResponse } from 'next/server'

interface RawProject {
  id: number
  name: string
  path_with_namespace: string
}

async function fetchGroupProjects(token: string, groupPath: string) {
  const encodedGroup = encodeURIComponent(groupPath)
  const baseUrl = `https://gitlab.com/api/v4/groups/${encodedGroup}/projects?per_page=100&order_by=name&sort=asc&include_subgroups=true&archived=false`

  let page = 1
  let all: RawProject[] = []

  while (true) {
    const res = await fetch(`${baseUrl}&page=${page}`, {
      headers: { 'PRIVATE-TOKEN': token },
      next: { revalidate: 300 },
    })

    // Un subgrupo inexistente o vacío (ej: bcpcco aún sin repos) no debe romper el resto
    if (!res.ok) break

    const data: RawProject[] = await res.json()
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

  // Subgrupos a incluir (relativos al grupo base). Si no se define, se lista el grupo completo.
  const subgroups = (process.env.GITLAB_SUBGROUPS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  try {
    const groupPaths = subgroups.length > 0
      ? subgroups.map(sub => `${groupPath}/${sub}`)
      : [groupPath]

    const results = await Promise.all(
      groupPaths.map(path => fetchGroupProjects(token, path))
    )

    // Merge + dedupe por id (los subgrupos son hermanos, pero por las dudas)
    const byId = new Map<number, RawProject>()
    for (const project of results.flat()) {
      byId.set(project.id, project)
    }

    const projects = [...byId.values()]
      .map(p => ({ id: p.id, name: p.name, path: p.path_with_namespace }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'GitLab API error' }, { status: 500 })
  }
}
