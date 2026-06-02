'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

const STATUS = {
  success:  { bg: '#22c55e', border: '#22c55e', color: 'white', icon: '✓' },
  failed:   { bg: '#ef4444', border: '#ef4444', color: 'white', icon: '✕' },
  running:  { bg: '#3b82f6', border: '#3b82f6', color: 'white', icon: '▶' },
  pending:  { bg: '#fbbf24', border: '#fbbf24', color: 'white', icon: '⏳' },
  canceled: { bg: '#94a3b8', border: '#94a3b8', color: 'white', icon: '⊘' },
  none:     { bg: 'white',   border: '#cbd5e1', color: '#94a3b8', icon: '○' },
}

// Círculo idéntico al de la tabla
function Circle({ status, label }: { status: keyof typeof STATUS; label: string }) {
  const s = STATUS[status]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: s.bg, border: `2px solid ${s.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, color: s.color,
      }}>
        {s.icon}
      </div>
      <span style={{ fontSize: '9px', color: '#E8EBF2', opacity: 0.5 }}>{label}</span>
    </div>
  )
}

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
    <div>
    <style>{`
      @keyframes cursor-steps {
        0%   { left: 29%; opacity: 0; }
        6%   { left: 29%; opacity: 1; }
        28%  { left: 29%; opacity: 1; }
        38%  { left: 50%; opacity: 1; }
        60%  { left: 50%; opacity: 1; }
        70%  { left: 71%; opacity: 1; }
        90%  { left: 71%; opacity: 1; }
        96%  { left: 71%; opacity: 0; }
        100% { left: 29%; opacity: 0; }
      }
      .pipeline-cursor {
        position: absolute;
        bottom: -4px;
        left: 29%;
        animation: cursor-steps 2.4s ease-in-out infinite;
      }
    `}</style>
    <div style={{
      position: 'absolute',
      top: pos.top, left: pos.left,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999,
      width: '260px',
      background: '#1B2A4A',
      border: '1px solid #2d4170',
      borderRadius: '4px',
      padding: '14px',
      pointerEvents: 'none',
      boxShadow: '0px 4px 12px rgba(27,42,74,0.3)',
    }}>
      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '6px', borderStyle: 'solid', borderColor: '#1B2A4A transparent transparent transparent' }} />

      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8EBF2', opacity: 0.5, marginBottom: '12px', textAlign: 'center' }}>
        Pipeline GitLab
      </p>

      {/* Pipeline visual — los círculos son idénticos a la tabla */}
      {/* Ancho del contenedor: 260 - 28px padding = 232px */}
      {/* Flex centered: items = 28+20+28+20+28 = 124px, offset = (232-124)/2 = 54px */}
      {/* Dev center = 54+14 = 68px → 68/232 = 29% */}
      {/* Master center = 54+28+20+14 = 116px → 50% */}
      {/* Prod center = 54+28+20+28+20+14 = 164px → 164/232 = 71% */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
        <Circle status="success" label="dev" />
        <div style={{ width: '20px', height: '2px', background: '#22c55e', marginBottom: '14px' }} />
        <Circle status="failed" label="master" />
        <div style={{ width: '20px', height: '2px', background: '#2d4170', marginBottom: '14px' }} />
        <Circle status="none" label="prod" />

        <div className="pipeline-cursor">
          <svg width="13" height="17" viewBox="0 0 14 18" fill="none">
            <path d="M1 1L1 13.5L4.5 10.5L6.5 16L8.5 15.5L6.5 10L10.5 10L1 1Z" fill="white" stroke="#E31837" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Estados — directo desde GitLab API */}
      <div style={{ borderTop: '1px solid #2d4170', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <p style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#E8EBF2', opacity: 0.4, marginBottom: '4px' }}>
          Estados (GitLab CI/CD)
        </p>
        {(Object.entries(STATUS) as [keyof typeof STATUS, typeof STATUS[keyof typeof STATUS]][]).map(([key, s]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, background: s.bg, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: s.color }}>
              {s.icon}
            </div>
            <span style={{ fontSize: '11px', color: '#E8EBF2', opacity: 0.7 }}>
              {key === 'success' ? 'Pipeline exitoso' :
               key === 'failed'  ? 'Pipeline fallido' :
               key === 'running' ? 'Corriendo ahora' :
               key === 'pending' ? 'En cola' :
               key === 'canceled'? 'Cancelado' :
                                   'Sin pipeline'}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, background: 'white', border: '1.5px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#f59e0b' }}>
            ↑
          </div>
          <span style={{ fontSize: '11px', color: '#E8EBF2', opacity: 0.7 }}>
            Prod desactualizado (master sin liberar)
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#E8EBF2', opacity: 0.7, lineHeight: 1.4, borderTop: '1px solid #2d4170', paddingTop: '8px', marginTop: '2px' }}>
          <strong style={{ color: 'white' }}>Prod</strong> ✓ = el código de master está en prod (mismo commit). El punto ámbar avisa que falta documentar el ticket; click para registrarlo.
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
        style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'help', userSelect: 'none', marginLeft: '4px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)' }}
      >
        i
      </span>
      {visible && typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  )
}
