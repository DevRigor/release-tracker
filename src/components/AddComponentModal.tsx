'use client'

import { useState, useEffect } from 'react'
import { addComponent, componentExists } from '@/lib/db'
import { GitlabProject } from '@/lib/types'
import GitlabProjectSearch from './GitlabProjectSearch'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function AddComponentModal({ onClose, onSaved }: Props) {
  const [selectedProject, setSelectedProject] = useState<GitlabProject | null>(null)
  const [projects, setProjects] = useState<GitlabProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gitlab/projects')
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setLoadingProjects(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedProject) {
      setError('Selecciona un proyecto GitLab.')
      return
    }

    setLoading(true)
    try {
      const exists = await componentExists(selectedProject.name)
      if (exists) {
        setError(`"${selectedProject.name}" ya está registrado.`)
        setLoading(false)
        return
      }

      await addComponent({
        name: selectedProject.name,
        gitlabProjectId: selectedProject.id,
        gitlabProjectName: selectedProject.name,
        gitlabProjectPath: selectedProject.path,
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
          <h2 className="text-lg font-semibold text-slate-800">Añadir Componente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto GitLab</label>
            {loadingProjects ? (
              <div className="text-xs text-slate-400 py-2 animate-pulse">Cargando proyectos...</div>
            ) : (
              <GitlabProjectSearch
                projects={projects}
                value={selectedProject}
                onChange={setSelectedProject}
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

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
              disabled={loading || !selectedProject}
              style={{ background: 'var(--latam-red)' }}
            className="flex-1 text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {loading ? 'Guardando...' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
