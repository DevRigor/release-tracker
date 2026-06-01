interface Props {
  label: string
  count: number
  color: 'slate' | 'amber' | 'violet' | 'indigo' | 'emerald'
}

const colorMap = {
  slate:   'bg-slate-50 border-slate-200 text-slate-700',
  amber:   'bg-amber-50 border-amber-200 text-amber-700',
  violet:  'bg-violet-50 border-violet-200 text-violet-700',
  indigo:  'bg-indigo-50 border-indigo-200 text-indigo-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

const countMap = {
  slate:   'text-slate-800',
  amber:   'text-amber-800',
  violet:  'text-violet-800',
  indigo:  'text-indigo-800',
  emerald: 'text-emerald-800',
}

export default function SummaryCard({ label, count, color }: Props) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${countMap[color]}`}>{count}</p>
    </div>
  )
}
