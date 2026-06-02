'use client'

import { useEffect, useState, useCallback } from 'react'
import { getComponents } from '@/lib/db'
import { Component } from '@/lib/types'
import SummaryPanel from '@/components/SummaryPanel'
import ComponentsTable from '@/components/ComponentsTable'
import AddComponentModal from '@/components/AddComponentModal'
import HowItWorksModal from '@/components/HowItWorksModal'

export default function HomePage() {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getComponents()
    setComponents(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header style={{ background: 'var(--latam-navy)' }} className="text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Release Tracker</h1>
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--latam-red)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--latam-navy-light)', opacity: 0.7 }}>dev → master → prod</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <span>🧭</span> ¿Cómo funciona?
            </button>
            <button
              onClick={() => setShowAdd(true)}
              style={{ background: 'var(--latam-red)' }}
              className="hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-opacity flex items-center gap-2"
            >
              <span>+</span> Añadir Componente
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8" style={{ background: 'var(--latam-bg)' }}>

        {/* Summary Panel */}
        {!loading && <SummaryPanel components={components} />}

        {/* Table */}
        <div className="bg-white p-6" style={{ border: '1px solid var(--latam-navy-light)', borderRadius: '4px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--latam-navy)' }}>Componentes</h2>
            {!loading && (
              <span className="text-xs text-slate-400">
                {components.length} componente{components.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
              <span className="animate-spin">⏳</span> Cargando...
            </div>
          ) : (
            <ComponentsTable components={components} onRefresh={load} />
          )}
        </div>
      </main>

      {showAdd && (
        <AddComponentModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load() }}
        />
      )}

      {showHelp && <HowItWorksModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}
