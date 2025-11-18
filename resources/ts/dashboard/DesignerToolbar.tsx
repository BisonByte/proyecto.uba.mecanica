interface DesignerToolbarProps {
  onAddTank: () => void;
  onAddPump: () => void;
  onAddJunction: () => void;
  pipeToolActive: boolean;
  onStartPipe: () => void;
  onCancelPipe: () => void;
}

const paletteItems = [
  {
    id: 'tank',
    title: 'Tanque',
    description: 'Reservorios abiertos o sellados con nivel de líquido.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M6 4a3 3 0 00-3 3v11a3 3 0 003 3h12a3 3 0 003-3V7a3 3 0 00-3-3H6zm0 2h12a1 1 0 011 1v2.382a5.5 5.5 0 01-7.513 5.144l-.974-.325a3.5 3.5 0 00-3.935 1.305A1 1 0 016 15.618V7a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    id: 'pump',
    title: 'Bomba',
    description: 'Impulsa caudal añadiendo carga en el sistema.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7zm3-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1H7z" />
        <path d="M9 12a3 3 0 016 0 3 3 0 11-6 0z" />
      </svg>
    ),
  },
  {
    id: 'junction',
    title: 'Junta',
    description: 'Puntos de conexión, demanda o elevación de referencia.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H7a1 1 0 110-2h4V5a1 1 0 011-1z" />
      </svg>
    ),
  },
];

export const DesignerToolbar = ({
  onAddTank,
  onAddPump,
  onAddJunction,
  pipeToolActive,
  onStartPipe,
  onCancelPipe,
}: DesignerToolbarProps): JSX.Element => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-950/20 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-100">
            Biblioteca de componentes
          </span>
          <h3 className="text-lg font-semibold text-white">Coloca nuevos elementos en el circuito</h3>
          <p className="text-sm text-white/60">
            Arrastra después de crear cada pieza para acomodarla en el canvas. Las tuberías se conectan eligiendo el origen y destino.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAddTank}
            className="group flex min-w-[160px] items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left text-sm font-medium text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-200 group-hover:bg-cyan-500/20">
              {paletteItems[0]?.icon}
            </span>
            <span>
              {paletteItems[0]?.title}
              <div className="text-xs font-normal text-cyan-100/70">Reservorios y tanques</div>
            </span>
          </button>
          <button
            type="button"
            onClick={onAddPump}
            className="group flex min-w-[160px] items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left text-sm font-medium text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200 group-hover:bg-emerald-500/20">
              {paletteItems[1]?.icon}
            </span>
            <span>
              {paletteItems[1]?.title}
              <div className="text-xs font-normal text-emerald-100/70">Bombas y equipos especiales</div>
            </span>
          </button>
          <button
            type="button"
            onClick={onAddJunction}
            className="group flex min-w-[160px] items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-left text-sm font-medium text-indigo-100 transition hover:border-indigo-400/60 hover:bg-indigo-500/20"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-200 group-hover:bg-indigo-500/20">
              {paletteItems[2]?.icon}
            </span>
            <span>
              {paletteItems[2]?.title}
              <div className="text-xs font-normal text-indigo-100/70">Nodos de conexión o demanda</div>
            </span>
          </button>
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white">Tuberías</span>
              {pipeToolActive && (
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-white/50">
              {pipeToolActive
                ? 'Toca un nodo de origen y arrastra hasta el destino. Usa Cancelar para salir.'
                : 'Crea conexiones arrastrando desde el nodo de origen hacia su destino.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onStartPipe}
                disabled={pipeToolActive}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  pipeToolActive
                    ? 'cursor-not-allowed border-cyan-500/50 bg-cyan-500/10 text-cyan-100/80'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-cyan-400/40 hover:text-cyan-100'
                }`}
              >
                Crear tubería
              </button>
              {pipeToolActive && (
                <button
                  type="button"
                  onClick={onCancelPipe}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-100 transition hover:border-rose-400/70 hover:bg-rose-500/20"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerToolbar;
