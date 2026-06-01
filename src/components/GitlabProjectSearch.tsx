'use client'

import { useState, useRef, useEffect } from 'react'
import { GitlabProject } from '@/lib/types'

interface Props {
  projects: GitlabProject[]
  value: GitlabProject | null
  onChange: (project: GitlabProject | null) => void
}

const GROUP_PREFIX = 'latamairlines/oper/flight-operation-safety-and-security/aircraft-operations/'

function relativePath(fullPath: string) {
  const rel = fullPath.startsWith(GROUP_PREFIX) ? fullPath.slice(GROUP_PREFIX.length) : fullPath
  const parts = rel.split('/')
  // last part is the project name, rest is the subgroup path
  if (parts.length <= 1) return ''
  return parts.slice(0, -1).join(' / ')
}

export default function GitlabProjectSearch({ projects, value, onChange }: Props) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const filtered = q.length === 0
    ? []
    : projects.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q)
      )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = (p: GitlabProject) => {
    onChange(p)
    setQuery(p.name)
    setOpen(false)
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null) }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar proyecto GitLab..."
          className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Selected display */}
      {value && relativePath(value.path) && (
        <div className="flex items-center gap-1 mt-1.5">
          {relativePath(value.path).split(' / ').map((part, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: '#E8EBF2', color: '#1B2A4A' }}
              >
                {part}
              </span>
              {i < arr.length - 1 && (
                <span className="text-slate-300 text-xs">›</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && query.trim().length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl px-3 py-3 text-sm text-slate-400">
          Escribe para buscar entre {projects.length} proyectos...
        </div>
      )}

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {filtered.map(p => {
            const subPath = relativePath(p.path)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => select(p)}
                className="w-full flex flex-col px-3 py-2 hover:bg-red-50 transition-colors text-left border-b border-slate-100 last:border-0"
              >
                <span className="text-sm font-medium text-slate-800">{p.name}</span>
                {subPath && (
                  <span className="flex items-center gap-1 mt-0.5">
                    {subPath.split(' / ').map((part, i, arr) => (
                      <span key={i} className="flex items-center gap-1">
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: '#E8EBF2', color: '#1B2A4A' }}
                        >
                          {part}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="text-slate-300 text-xs">›</span>
                        )}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            )
          })}
          <div className="px-3 py-1.5 bg-slate-50 rounded-b-xl text-xs text-slate-400">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {open && query.trim().length > 0 && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl px-3 py-3 text-sm text-slate-400">
          Sin resultados para &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}
