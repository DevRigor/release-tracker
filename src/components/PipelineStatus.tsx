'use client'

import { useEffect, useState } from 'react'

interface StepStatus {
  status: string | null
  webUrl: string | null
  sha: string | null
  deployedAt: string | null
}

const EMPTY_STEP: StepStatus = { status: null, webUrl: null, sha: null, deployedAt: null }

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
  const [dev, setDev] = useState<StepStatus>(EMPTY_STEP)
  const [master, setMaster] = useState<StepStatus>(EMPTY_STEP)
  const [prod, setProd] = useState<StepStatus>(EMPTY_STEP)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/gitlab/statuses?projectId=${projectId}`)
      .then(r => r.json())
      .then(data => {
        setDev(data.dev ?? EMPTY_STEP)
        setMaster(data.master ?? EMPTY_STEP)
        setProd(data.prod ?? EMPTY_STEP)
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

  // "En prod" = el código de master/intg está realmente en prod (mismo SHA).
  // Un deploy a prod exitoso pero de una versión anterior (master adelante) NO es estar en prod.
  const prodDeploySuccess = prod.status === 'success'
  const prodFailed = prod.status === 'failed'
  const prodRunning = prod.status === 'running' || prod.status === 'pending'

  const sameSha = !!prod.sha && !!master.sha && prod.sha === master.sha
  // Si no hay deploy a intg para comparar, caemos a "el último deploy a prod fue exitoso".
  const prodReached = prodDeploySuccess && (master.sha ? sameSha : true)
  // Hay una versión vieja en prod, pero master tiene cambios sin liberar (en QA).
  const prodBehind = prodDeploySuccess && !!master.sha && !sameSha

  const prodDocumented = prodReached && !!lastTicketProd
  const prodInProd = prodReached || (!!lastTicketProd && !prodBehind)  // círculo verde
  const prodNeedsDoc = prodReached && !lastTicketProd                  // en prod pero falta el ticket
  // Clickable solo para documentar (en prod sin ticket) o registrar (nunca llegó a prod).
  const prodClickable = prodNeedsDoc || (!prodInProd && !prodBehind && !prodFailed && !prodRunning)

  const prodDeployedLabel = prod.deployedAt
    ? ` (del ${new Date(prod.deployedAt).toLocaleDateString('es-CL')})`
    : ''

  return (
    <div className="flex items-center">
      <GitlabCircle label="dev" step={dev} />
      <Connector active={dev.status === 'success'} />
      <GitlabCircle label="master" step={master} />
      <Connector active={prodInProd} />
      <div className="flex flex-col items-center gap-1 relative">
        <button
          onClick={prodClickable ? onProdClick : undefined}
          disabled={!prodClickable}
          title={
            prodDocumented
              ? `En prod: ${lastTicketProd}`
              : prodNeedsDoc
              ? '¡En prod! Click para documentar ticket y comentario'
              : prodBehind
              ? `Prod tiene una versión anterior${prodDeployedLabel}. Master tiene cambios sin liberar (en QA).`
              : prodFailed
              ? 'Deploy a prod falló'
              : prodRunning
              ? 'Deploy a prod en curso'
              : 'Registrar paso a producción'
          }
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
            ${prodInProd
              ? `bg-emerald-500 border-emerald-500 text-white ${prodNeedsDoc ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`
              : prodBehind
              ? 'bg-white border-amber-400 text-amber-500 cursor-default'
              : prodFailed
              ? 'bg-red-500 border-red-500 text-white'
              : prodRunning
              ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
              : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer'
            }
          `}
        >
          {prodInProd ? '✓'
            : prodBehind ? '↑'
            : prodFailed ? '✕'
            : prodRunning ? '▶'
            : '○'}
        </button>
        {/* Badge "en prod, falta documentar el ticket" */}
        {prodNeedsDoc && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" title="En prod — falta documentar el ticket" />
        )}
        <span className="text-[10px] font-medium text-slate-500 leading-none">prod</span>
      </div>
    </div>
  )
}
