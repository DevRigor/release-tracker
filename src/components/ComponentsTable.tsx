'use client'

import { useState } from 'react'
import { Component, EnvStatus } from '@/lib/types'
import { updateComponent, deleteComponent } from '@/lib/db'
import PipelineStatus from './PipelineStatus'
import PipelineTooltip from './PipelineTooltip'
import ProdModal from './ProdModal'

interface Props {
  components: Component[]
  onRefresh: () => void
}

const nextStatus: Record<EnvStatus, EnvStatus> = {
  pending: 'in-progress',
  'in-progress': 'done',
  done: 'pending',
}

export default function ComponentsTable({ components, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [prodTarget, setProdTarget] = useState<Component | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = components.filter(c => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.branch.toLowerCase().includes(q) ||
      c.ticket.toLowerCase().includes(q)
    )
  })

  const cycleStatus = async (component: Component, field: 'devStatus' | 'masterStatus') => {
    await updateComponent(component.id, { [field]: nextStatus[component[field]] })
    onRefresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este componente?')) return
    setDeletingId(id)
    await deleteComponent(id)
    onRefresh()
    setDeletingId(null)
  }

  return (
    <div>
      {/* Buscador */}
      <div className="mb-5 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, rama o ticket..."
          className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Empty state */}
      {components.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No hay componentes todavía</h3>
          <p className="text-sm text-slate-400">Añade tu primer componente con el botón de arriba.</p>
        </div>
      )}

      {/* Tabla */}
      {components.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Componente</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Rama</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ticket</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    Pipeline
                    <PipelineTooltip />
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Último ticket prod</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Comentarios</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    Sin resultados para &quot;{search}&quot;
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.branch}</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                        {c.ticket}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <PipelineStatus
                          devStatus={c.devStatus}
                          masterStatus={c.masterStatus}
                          prodStatus={c.prodStatus}
                          onDevClick={() => cycleStatus(c, 'devStatus')}
                          onMasterClick={() => cycleStatus(c, 'masterStatus')}
                          onProdClick={() => c.prodStatus !== 'done' && setProdTarget(c)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.lastTicketProd ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                          {c.lastTicketProd}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">
                      {c.comments || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {prodTarget && (
        <ProdModal
          component={prodTarget}
          onClose={() => setProdTarget(null)}
          onSaved={() => { setProdTarget(null); onRefresh() }}
        />
      )}
    </div>
  )
}
