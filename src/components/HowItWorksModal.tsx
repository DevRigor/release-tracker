'use client'

interface Props {
  onClose: () => void
}

// Círculo de muestra, igual al de la tabla
function Circle({ bg, border, text, icon }: { bg: string; border: string; text: string; icon: string }) {
  return (
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${bg} ${border} ${text}`}>
      {icon}
    </div>
  )
}

function Connector() {
  return <div className="h-0.5 w-6 bg-emerald-400 shrink-0" />
}

export default function HowItWorksModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <h2 className="text-lg font-semibold text-slate-800">¿Cómo funciona?</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Intro */}
          <p className="text-sm text-slate-600 leading-relaxed">
            Cada componente sigue un recorrido hasta llegar a producción. El{' '}
            <strong className="text-slate-800">pipeline</strong> que ves en la tabla muestra, de un
            vistazo, en qué fase está el código de cada uno.
          </p>

          {/* Pipeline visual */}
          <div className="flex items-center justify-center gap-1 py-2">
            <div className="flex flex-col items-center gap-1">
              <Circle bg="bg-emerald-500" border="border-emerald-500" text="text-white" icon="✓" />
              <span className="text-[10px] font-medium text-slate-500">dev</span>
            </div>
            <Connector />
            <div className="flex flex-col items-center gap-1 mb-4">
              <Circle bg="bg-emerald-500" border="border-emerald-500" text="text-white" icon="✓" />
              <span className="text-[10px] font-medium text-slate-500">master</span>
            </div>
            <Connector />
            <div className="flex flex-col items-center gap-1">
              <Circle bg="bg-emerald-500" border="border-emerald-500" text="text-white" icon="✓" />
              <span className="text-[10px] font-medium text-slate-500">prod</span>
            </div>
          </div>

          {/* Las 3 fases */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Las fases</p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-sm font-semibold text-slate-700 w-16 shrink-0">dev</span>
                <span className="text-sm text-slate-600">
                  El código se prueba en el ambiente de desarrollo, desde las ramas de trabajo.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-sm font-semibold text-slate-700 w-16 shrink-0">master</span>
                <span className="text-sm text-slate-600">
                  El código ya está en master y se valida en integración (QA) antes de liberarlo.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-sm font-semibold text-slate-700 w-16 shrink-0">prod</span>
                <span className="text-sm text-slate-600">
                  Producción. Se libera corriendo el pipeline con la opción que indica que el deploy
                  va a prod.
                </span>
              </li>
            </ul>
          </div>

          {/* Cómo se sabe que algo está realmente en prod */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              💡 Un componente está <strong className="text-slate-800">realmente en prod</strong>{' '}
              cuando lo que hay en producción es la misma versión que está en master. Si master tiene
              cambios más nuevos que todavía no se liberaron, el círculo de prod lo avisa.
            </p>
          </div>

          {/* Estados del círculo de prod */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              El círculo de prod
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-3">
                <Circle bg="bg-emerald-500" border="border-emerald-500" text="text-white" icon="✓" />
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-800">En prod</strong> — la versión actual está liberada.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Circle bg="bg-white" border="border-amber-400" text="text-amber-500" icon="↑" />
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-800">Desactualizado</strong> — hay una versión anterior
                  en prod y master tiene cambios sin liberar.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Circle bg="bg-red-500" border="border-red-500" text="text-white" icon="✕" />
                <span className="text-sm text-slate-600">El último deploy a prod falló.</span>
              </li>
              <li className="flex items-center gap-3">
                <Circle bg="bg-blue-500" border="border-blue-500" text="text-white" icon="▶" />
                <span className="text-sm text-slate-600">El deploy a prod está en curso.</span>
              </li>
              <li className="flex items-center gap-3">
                <Circle bg="bg-white" border="border-slate-300" text="text-slate-400" icon="○" />
                <span className="text-sm text-slate-600">Todavía no fue a prod.</span>
              </li>
            </ul>
          </div>

          {/* Nota del ticket */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Cuando un componente está en prod, podés hacer click en su círculo para anotar el
              <strong className="text-slate-800"> ticket</strong> y un breve comentario de qué se
              desplegó. Si falta esa nota, aparece un puntito ámbar como recordatorio.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            style={{ background: 'var(--latam-navy)' }}
            className="w-full text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
