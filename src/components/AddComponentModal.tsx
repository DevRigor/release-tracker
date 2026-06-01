'use client'

import { useState } from 'react'
import { addComponent, componentExists } from '@/lib/db'
import { Component } from '@/lib/types'

interface Props {
  onClose: () => void
  onSaved: () => void
}

const defaultForm = {
  name: '',
  branch: '',
  ticket: '',
  comments: '',
}

export default function AddComponentModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.branch.trim() || !form.ticket.trim()) {
      setError('Nombre, rama y ticket son requeridos.')
      return
    }

    setLoading(true)
    try {
      const exists = await componentExists(form.name.trim())
      if (exists) {
        setError(`Ya existe un componente con el nombre "${form.name.trim()}".`)
        setLoading(false)
        return
      }

      await addComponent({
        name: form.name.trim(),
        branch: form.branch.trim(),
        ticket: form.ticket.trim().toUpperCase(),
        devStatus: 'pending',
        masterStatus: 'pending',
        prodStatus: 'pending',
        comments: form.comments.trim() || undefined,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Nuevo Componente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del componente</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ej: Button Component"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rama Git</label>
            <input
              type="text"
              value={form.branch}
              onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
              placeholder="ej: feat/button-v2"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ticket</label>
            <input
              type="text"
              value={form.ticket}
              onChange={e => setForm(f => ({ ...f, ticket: e.target.value }))}
              placeholder="ej: AIRCOR-60"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios <span className="text-slate-400">(opcional)</span></label>
            <textarea
              value={form.comments}
              onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
              placeholder="ej: Esperando approval de QA"
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
