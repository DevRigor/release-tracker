import { EnvStatus } from '@/lib/types'

const config: Record<EnvStatus, { label: string; className: string }> = {
  done:        { label: '✓ Done',        className: 'bg-emerald-600 text-white' },
  'in-progress':{ label: '⏳ En progreso', className: 'bg-amber-400 text-amber-900' },
  pending:     { label: '◌ Pendiente',   className: 'bg-slate-200 text-slate-600' },
}

export default function StatusBadge({ status }: { status: EnvStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
