'use client'

import { useEffect, useState } from 'react'
import { GitlabPipelineStatus } from '@/lib/types'

const statusConfig: Record<
  NonNullable<GitlabPipelineStatus>,
  { label: string; className: string; icon: string }
> = {
  success:  { label: 'Passed',   icon: '✓', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  failed:   { label: 'Failed',   icon: '✕', className: 'bg-red-100 text-red-700 border border-red-200' },
  running:  { label: 'Running',  icon: '▶', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  pending:  { label: 'Pending',  icon: '⏳', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  canceled: { label: 'Canceled', icon: '⊘', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  skipped:  { label: 'Skipped',  icon: '»', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
}

interface Props {
  projectId: number
  webUrl?: string
}

export default function GitlabPipelineBadge({ projectId, webUrl }: Props) {
  const [status, setStatus] = useState<GitlabPipelineStatus>(null)
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(webUrl ?? null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/gitlab/pipeline?projectId=${projectId}`)
      .then(r => r.json())
      .then(data => {
        setStatus(data.status ?? null)
        setPipelineUrl(data.webUrl ?? null)
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return <span className="text-xs text-slate-400 animate-pulse">cargando...</span>
  }

  if (!status) {
    return <span className="text-xs text-slate-300">—</span>
  }

  const cfg = statusConfig[status]

  const badge = (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )

  if (pipelineUrl) {
    return (
      <a href={pipelineUrl} target="_blank" rel="noopener noreferrer" title="Ver pipeline en GitLab">
        {badge}
      </a>
    )
  }

  return badge
}
