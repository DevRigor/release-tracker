'use client'

import { EnvStatus } from '@/lib/types'

interface Step {
  label: string
  status: EnvStatus
  onClick: () => void
  disabled?: boolean
}

function StepCircle({ label, status, onClick, disabled }: Step) {
  const styles = {
    done:        'bg-emerald-500 border-emerald-500 text-white',
    'in-progress': 'bg-amber-400 border-amber-400 text-white',
    pending:     'bg-white border-slate-300 text-slate-400',
  }

  const icon = {
    done:          '✓',
    'in-progress': '⏳',
    pending:       '○',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        title={disabled ? undefined : `Cambiar estado de ${label}`}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
          ${styles[status]}
          ${disabled ? 'cursor-default' : 'hover:scale-110 cursor-pointer shadow-sm hover:shadow-md'}
        `}
      >
        {icon[status]}
      </button>
      <span className="text-[10px] font-medium text-slate-500 leading-none">{label}</span>
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
  devStatus: EnvStatus
  masterStatus: EnvStatus
  prodStatus: EnvStatus
  onDevClick: () => void
  onMasterClick: () => void
  onProdClick: () => void
}

export default function PipelineStatus({ devStatus, masterStatus, prodStatus, onDevClick, onMasterClick, onProdClick }: Props) {
  return (
    <div className="flex items-center gap-0">
      <StepCircle label="dev" status={devStatus} onClick={onDevClick} />
      <Connector active={devStatus === 'done'} />
      <StepCircle label="master" status={masterStatus} onClick={onMasterClick} />
      <Connector active={masterStatus === 'done'} />
      <StepCircle label="prod" status={prodStatus} onClick={onProdClick} disabled={prodStatus === 'done'} />
    </div>
  )
}
