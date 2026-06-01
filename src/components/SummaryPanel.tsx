'use client'

import { useEffect, useState } from 'react'
import { getReleases } from '@/lib/db'
import { Component, Release } from '@/lib/types'

interface Props {
  components: Component[]
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `Hace ${mins}m`
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${days}d`
}

interface MetricCardProps {
  label: string
  value: string | number
  sub: string
  accentColor?: string
}

function MetricCard({ label, value, sub, accentColor = '#E31837' }: MetricCardProps) {
  return (
    <div
      className="flex bg-white overflow-hidden"
      style={{ border: '1px solid var(--latam-navy-light)', borderRadius: '4px' }}
    >
      {/* Accent bar */}
      <div className="w-1 shrink-0" style={{ background: accentColor }} />
      <div className="flex flex-col px-4 py-3 gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--latam-navy)', opacity: 0.5 }}>
          {label}
        </p>
        <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--latam-navy)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--latam-navy)', opacity: 0.5 }}>{sub}</p>
      </div>
    </div>
  )
}

export default function SummaryPanel({ components }: Props) {
  const [lastRelease, setLastRelease] = useState<Release | null>(null)

  useEffect(() => {
    getReleases().then(releases => setLastRelease(releases[0] ?? null))
  }, [components])

  const total = components.length
  const documented = components.filter(c => !!c.lastTicketProd).length
  const undocumented = components.filter(c => !c.lastTicketProd).length
  const pct = total > 0 ? Math.round((documented / total) * 100) : 0

  return (
    <div className="bg-white mb-6 p-5" style={{ border: '1px solid var(--latam-navy-light)', borderRadius: '4px' }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Total componentes"
          value={total}
          sub="registrados"
          accentColor="var(--latam-navy)"
        />
        <MetricCard
          label="En prod"
          value={documented}
          sub="con ticket documentado"
          accentColor="#16a34a"
        />
        <MetricCard
          label="Sin documentar"
          value={undocumented}
          sub="sin ticket de prod"
          accentColor="var(--latam-red)"
        />
        <div
          className="flex bg-white overflow-hidden"
          style={{ border: '1px solid var(--latam-navy-light)', borderRadius: '4px' }}
        >
          <div className="w-1 shrink-0" style={{ background: 'var(--latam-navy)' }} />
          <div className="flex flex-col px-4 py-3 gap-0.5 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--latam-navy)', opacity: 0.5 }}>
              Última release
            </p>
            {lastRelease ? (
              <>
                <p className="text-sm font-bold truncate leading-tight" style={{ color: 'var(--latam-navy)' }}>
                  {lastRelease.componentName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs font-mono font-semibold px-1.5 py-0.5 text-white"
                    style={{ background: 'var(--latam-red)', borderRadius: '2px' }}
                  >
                    {lastRelease.ticket}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--latam-navy)', opacity: 0.4 }}>
                    {timeAgo(lastRelease.deployedAt)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--latam-navy)', opacity: 0.35 }}>Sin releases aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--latam-navy)', opacity: 0.5 }}>
              Documentados en prod
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--latam-navy)' }}>
              {documented}/{total} — {pct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--latam-navy-light)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'var(--latam-red)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
