'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function PipelineTooltip() {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.top + window.scrollY - 8,
        left: rect.left + rect.width / 2 + window.scrollX,
      })
    }
    setVisible(true)
  }

  const tooltip = (
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      className="w-64 bg-slate-900 text-white rounded-xl shadow-2xl p-4 pointer-events-none"
    >
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />

      <p className="text-xs font-semibold text-slate-300 mb-3 text-center">¿Cómo usar el pipeline?</p>

      {/* Visual pipeline */}
      <div className="flex items-center justify-center gap-1 mb-4 relative">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-white">✓</div>
          <span className="text-[9px] text-slate-400">dev</span>
        </div>
        <div className="w-5 h-0.5 bg-emerald-500 mb-3" />
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-300 flex items-center justify-center text-xs font-bold text-white">⏳</div>
          <span className="text-[9px] text-slate-400">master</span>
        </div>
        <div className="w-5 h-0.5 bg-slate-600 mb-3" />
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-xs text-slate-400">○</div>
          <span className="text-[9px] text-slate-400">prod</span>
        </div>

        {/* Cursor animado */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '2%',
            animation: 'cursor-move 2.4s ease-in-out infinite',
          }}
        >
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L1 13.5L4.5 10.5L6.5 16L8.5 15.5L6.5 10L10.5 10L1 1Z" fill="white" stroke="#334155" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="space-y-2 border-t border-slate-700 pt-3">
        <div className="flex items-start gap-2">
          <span className="text-emerald-400 text-xs mt-0.5 shrink-0">✓</span>
          <p className="text-[11px] text-slate-300 leading-tight">
            <span className="text-white font-medium">Dev / Master</span>: click para ciclar el estado (pendiente → en progreso → listo)
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-amber-400 text-xs mt-0.5 shrink-0">🚀</span>
          <p className="text-[11px] text-slate-300 leading-tight">
            <span className="text-white font-medium">Prod</span>: click para registrar el paso a producción e ingresar el ticket.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-slate-400 text-xs mt-0.5 shrink-0">💡</span>
          <p className="text-[11px] text-slate-300 leading-tight">
            Las líneas entre pasos se <span className="text-emerald-400">vuelven verdes</span> conforme avanza el flujo.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 text-[10px] font-bold flex items-center justify-center cursor-help select-none ml-1 shrink-0"
      >
        i
      </span>
      {visible && typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  )
}
