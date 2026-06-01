'use client'

import { useEffect, useState } from 'react'

interface StepStatus {
  status: string | null
  webUrl: string | null
}

const statusStyle: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  success:  { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-white',     icon: '✓' },
  failed:   { bg: 'bg-red-500',     border: 'border-red-500',     text: 'text-white',     icon: '✕' },
  running:  { bg: 'bg-blue-500',    border: 'border-blue-500',    text: 'text-white',     icon: '▶' },
  pending:  { bg: 'bg-amber-400',   border: 'border-amber-400',   text: 'text-white',     icon: '⏳' },
  canceled: { bg: 'bg-slate-400',   border: 'border-slate-400',   text: 'text-white',     icon: '⊘' },
  skipped:  { bg: 'bg-slate-300',   border: 'border-slate-300',   text: 'text-slate-600', icon: '»' },
  none:     { bg: 'bg-white',       border: 'border-slate-300',   text: 'text-slate-400', icon: '○' },
}

function GitlabCircle({ label, step }: { label: string; step: StepStatus }) {
  const s = statusStyle[step.status ?? 'none'] ?? statusStyle['none']

  const circle = (
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
      ${s.bg} ${s.border} ${s.text}
      ${step.status === 'running' ? 'animate-pulse' : ''}
    `}>
      {s.icon}
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-1">
      {step.webUrl ? (
        <a href={step.webUrl} target="_blank" rel="noopener noreferrer" title={`Ver pipeline en GitLab`}>
          {circle}
        </a>
      ) : circle}
      <span className="text-[10px] font-medium text-slate-500 leading-none">{label}</span>
    </div>
  )
}

function ProdCircle({ inProd, onClick }: { inProd: boolean; onClick: () => void }) {
  const s = inProd ? statusStyle['success'] : statusStyle['none']

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={inProd}
        title={inProd ? 'Ya está en prod' : 'Registrar paso a producción'}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
          ${s.bg} ${s.border} ${s.text}
          ${!inProd ? 'hover:scale-110 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer' : 'cursor-default'}
        `}
      >
        {s.icon}
      </button>
      <span className="text-[10px] font-medium text-slate-500 leading-none">prod</span>
    </div>
  )
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="flex items-center mb-4">
      <div className={`h-0.5 w-6 transition-colors ${active ? 'bg-emerald-400' : 'bg-slate-200'}`} />
    </div>
  )
}

interface Props {
  projectId: number
  lastTicketProd?: string
  onProdClick: () => void
}

export default function PipelineStatus({ projectId, lastTicketProd, onProdClick }: Props) {
  const [dev, setDev] = useState<StepStatus>({ status: null, webUrl: null })
  const [master, setMaster] = useState<StepStatus>({ status: null, webUrl: null })
  const [prod, setProd] = useState<StepStatus>({ status: null, webUrl: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/gitlab/statuses?projectId=${projectId}`)
      .then(r => r.json())
      .then(data => {
        setDev(data.dev ?? { status: null, webUrl: null })
        setMaster(data.master ?? { status: null, webUrl: null })
        setProd(data.prod ?? { status: null, webUrl: null })
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        {['dev', 'master', 'prod'].map((l, i) => (
          <div key={l} className="flex items-center gap-1">
            {i > 0 && <div className="w-6 h-0.5 bg-slate-200" />}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 bg-slate-100 animate-pulse" />
              <span className="text-[10px] text-slate-400">{l}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <GitlabCircle label="dev" step={dev} />
      <Connector active={dev.status === 'success'} />
      <GitlabCircle label="master" step={master} />
      <Connector active={prod.status === 'success' || !!lastTicketProd} />
      <div className="flex flex-col items-center gap-1 relative">
        <button
          onClick={!lastTicketProd ? onProdClick : undefined}
          disabled={!!lastTicketProd}
          title={
            lastTicketProd
              ? `En prod: ${lastTicketProd}`
              : prod.status === 'success'
              ? '¡En prod! Click para documentar ticket y comentario'
              : 'Registrar paso a producción'
          }
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
            ${lastTicketProd
              ? 'bg-emerald-500 border-emerald-500 text-white cursor-default'
              : prod.status === 'success'
              ? 'bg-emerald-400 border-emerald-500 text-white animate-pulse hover:scale-110 cursor-pointer'
              : prod.status === 'failed'
              ? 'bg-red-500 border-red-500 text-white'
              : prod.status === 'running'
              ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
              : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer'
            }
          `}
        >
          {lastTicketProd ? '✓'
            : prod.status === 'success' ? '!'
            : prod.status === 'failed' ? '✕'
            : prod.status === 'running' ? '▶'
            : '○'}
        </button>
        {/* Badge "falta documentar" */}
        {prod.status === 'success' && !lastTicketProd && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" title="Falta documentar" />
        )}
        <span className="text-[10px] font-medium text-slate-500 leading-none">prod</span>
      </div>
    </div>
  )
}
