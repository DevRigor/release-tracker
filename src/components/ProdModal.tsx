'use client'

import { useState } from 'react'
import { updateComponent, addRelease } from '@/lib/db'
import { Component } from '@/lib/types'

interface Props {
  component: Component
  onClose: () => void
  onSaved: () => void
}

export default function ProdModal({ component, onClose, onSaved }: Props) {
  const [ticket, setTicket] = useState('')
  const [comments, setComments] = useState(component.comments ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = ticket.trim().toUpperCase()
    if (!t) { setError('El ticket es requerido.'); return }
    if (!comments.trim()) { setError('El comentario es requerido.'); return }

    setLoading(true)
    try {
      await updateComponent(component.id, {
        lastTicketProd: t,
        comments: comments.trim(),
      })
      await addRelease({
        componentId: component.id,
        componentName: component.name,
        ticket: t,
        deployedAt: new Date(),
      })
      onSaved()
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h2 className="text-lg font-semibold text-slate-800">Paso a Producción</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        {/* Componente */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-5">
          <p className="text-xs text-emerald-600 font-medium">Componente en prod</p>
          <p className="text-sm font-semibold text-emerald-800">{component.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Ticket */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ticket de la tarea <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={ticket}
              onChange={e => setTicket(e.target.value)}
              placeholder="ej: AIRCOR-60"
              autoFocus
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ¿Qué se desplegó? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="ej: Nueva versión de Java, fix de bug en login, actualización de dependencias..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">Describe brevemente qué cambios entran a prod.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ background: 'var(--latam-navy)' }}
            className="flex-1 text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Guardando...' : '✓ Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
