import { useMemo } from 'react';
import { listFluids } from '../lib/fluidCatalog';
import { useModelStore } from '../state/store';

export interface TopbarProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const Topbar = ({ isFullscreen = false, onToggleFullscreen }: TopbarProps): JSX.Element => {
  const fluids = useMemo(() => listFluids(), []);
  const {
    model,
    setUnits,
    setFluid,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useModelStore((state) => ({
    model: state.model,
    setUnits: state.setUnits,
    setFluid: state.setFluid,
    undo: state.undo,
    redo: state.redo,
    canUndo: state.canUndo(),
    canRedo: state.canRedo(),
  }));

  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/80">Modelado</h2>
        <div className="ml-3 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 sm:flex">
          <span>Proyecto demo</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[12px] font-medium text-white/80 transition enabled:hover:border-cyan-400/40 enabled:hover:text-cyan-100 disabled:opacity-50"
            title="Deshacer"
          >
            ⟲
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[12px] font-medium text-white/80 transition enabled:hover:border-cyan-400/40 enabled:hover:text-cyan-100 disabled:opacity-50"
            title="Rehacer"
          >
            ⟳
          </button>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">Unidades</span>
          <select
            value={model.units}
            onChange={(e) => setUnits(e.target.value as typeof model.units)}
            className="rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 text-[12px] text-white/80 focus:border-cyan-400 focus:outline-none"
          >
            <option value="SI">SI (m, kPa)</option>
            <option value="US">US (ft, psi)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">Fluido</span>
          <select
            value={model.fluidId}
            onChange={(e) => setFluid(e.target.value)}
            className="min-w-[160px] rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 text-[12px] text-white/80 focus:border-cyan-400 focus:outline-none"
          >
            {fluids.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
              isFullscreen
                ? 'border-rose-400/40 bg-rose-500/10 text-rose-100 hover:border-rose-300/60 hover:bg-rose-500/20'
                : 'border-indigo-400/40 bg-indigo-500/10 text-indigo-100 hover:border-indigo-300/60 hover:bg-indigo-500/20'
            }`}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? 'Cerrar' : 'Pantalla completa'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;

