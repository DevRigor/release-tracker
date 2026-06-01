'use client'

import { useEffect, useState, useCallback } from 'react'
import { getComponents } from '@/lib/db'
import { Component } from '@/lib/types'
import SummaryCard from '@/components/SummaryCard'
import ComponentsTable from '@/components/ComponentsTable'
import AddComponentModal from '@/components/AddComponentModal'

export default function HomePage() {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getComponents()
    setComponents(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const total = components.length
  const inDev = components.filter(c => c.devStatus !== 'done' && c.masterStatus === 'pending').length
  const inMaster = components.filter(c => c.masterStatus !== 'done' && c.devStatus === 'done').length
  const readyForProd = components.filter(c => c.masterStatus === 'done' && c.prodStatus !== 'done').length
  const inProd = components.filter(c => c.prodStatus === 'done').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Release Tracker</h1>
              <p className="text-xs text-slate-400">dev → master → prod</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span>+</span> Añadir Componente
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <SummaryCard label="Total" count={total} color="slate" />
          <SummaryCard label="En Dev" count={inDev} color="amber" />
          <SummaryCard label="En Master (Intg)" count={inMaster} color="violet" />
          <SummaryCard label="Listos para Prod" count={readyForProd} color="indigo" />
          <SummaryCard label="En Prod" count={inProd} color="emerald" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Componentes</h2>
            {!loading && (
              <span className="text-xs text-slate-400">{components.length} componente{components.length !== 1 ? 's' : ''}</span>
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
    </div>
  )
}
