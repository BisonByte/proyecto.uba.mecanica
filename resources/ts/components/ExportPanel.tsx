import { useCallback, useState } from 'react';
import { exportDiagramPng, exportReportHtml, exportReportPdf, exportDiagramSvg } from '../utils/exporters';
import { useModelStore } from '../state/store';

interface ExportPanelProps {
  canvasElementId?: string;
}

const ExportPanel = ({ canvasElementId = 'system-editor-canvas' }: ExportPanelProps): JSX.Element => {
  const { model, results } = useModelStore((state) => ({
    model: state.model,
    results: state.results,
  }));
  const [isExporting, setIsExporting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('hd:report:logo') ?? '';
    } catch {
      return '';
    }
  });
  const persistLogo = (value: string) => {
    setLogoUrl(value);
    try {
      localStorage.setItem('hd:report:logo', value);
    } catch {}
  };

  const handlePng = useCallback(async () => {
    const container = document.getElementById(canvasElementId);
    if (!container) {
      return;
    }
    setIsExporting(true);
    try {
      await exportDiagramPng(container);
    } finally {
      setIsExporting(false);
    }
  }, [canvasElementId]);

  const handlePdf = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportReportPdf(model, results, { logoUrl });
    } finally {
      setIsExporting(false);
    }
  }, [logoUrl, model, results]);

  const handleHtml = useCallback(() => {
    exportReportHtml(model, results);
  }, [model, results]);

  const handleSvg = useCallback(() => {
    exportDiagramSvg(model);
  }, [model]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-slate-950/30" />
      <header className="relative flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-100">
            Exportar
          </span>
          <h2 className="mt-3 text-xl font-semibold text-slate-50">Genera entregables profesionales</h2>
          <p className="mt-1 text-sm text-slate-400">
            Obtén el diagrama o reportes listos para compartir con el equipo y clientes.
          </p>
        </div>
        <div className="hidden rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-200/80 sm:block">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 2a1 1 0 01.933.649l2.567 6.85 7.305.533a1 1 0 01.563 1.757l-5.577 4.76 1.664 7.08a1 1 0 01-1.478 1.077L12 20.91l-5.977 3.796a1 1 0 01-1.478-1.077l1.664-7.08-5.577-4.76a1 1 0 01.563-1.757l7.305-.533 2.567-6.85A1 1 0 0112 2z" />
          </svg>
        </div>
      </header>

      <div className="relative mt-6 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <label className="flex items-center gap-2 text-xs text-white/70">
            <span>Logo (URL público PNG/SVG)</span>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => persistLogo(e.target.value)}
              placeholder="https://…/logo.png"
              className="flex-1 rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 text-xs text-white/80 placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSvg}
          className="group flex w-full items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left text-sm font-medium text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20"
        >
          <div className="flex flex-col">
            <span>Exportar esquema (SVG)</span>
            <span className="text-xs font-normal text-cyan-100/70">Vector editable para CAD/Illustrator.</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-200/80 transition group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.293 3.293a1 1 0 011.414 0L18 7.586V16a2 2 0 01-2 2h-3v-2h3V8l-4-4H6a2 2 0 00-2 2v3H2V6a4 4 0 014-4h6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handlePng}
          disabled={isExporting}
          className="group flex w-full items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left text-sm font-medium text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex flex-col">
            <span>{isExporting ? 'Generando PNG…' : 'Exportar esquema (PNG)'}</span>
            <span className="text-xs font-normal text-cyan-100/70">Ideal para documentación interna.</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-200/80 transition group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 01-.087 1.32l-5 5a1 1 0 01-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-2.293-2.293a1 1 0 010-1.414z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handlePdf}
          className="group flex w-full items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left text-sm font-medium text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
        >
          <div className="flex flex-col">
            <span>Exportar reporte (PDF)</span>
            <span className="text-xs font-normal text-emerald-100/70">Incluye resumen técnico y métricas clave.</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-200/80 transition group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 2a2 2 0 00-2 2v12.5A1.5 1.5 0 003.5 18H14a2 2 0 002-2V7.414A2 2 0 0015.414 6L11 1.586A2 2 0 009.586 1H4zm6 1.5V7a1 1 0 001 1h3.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleHtml}
          className="group flex w-full items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-left text-sm font-medium text-indigo-100 transition hover:border-indigo-400/60 hover:bg-indigo-500/20"
        >
          <div className="flex flex-col">
            <span>Exportar reporte (HTML)</span>
            <span className="text-xs font-normal text-indigo-100/70">Optimizado para compartir vía web.</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200/80 transition group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a2 2 0 012-2h10a2 2 0 012 2v12a1 1 0 01-1.643.766L11 12.743l-5.357 4.023A1 1 0 014 16V4zm5.447 5.276a1 1 0 00-1.384 1.448L8.586 12l-1.523 1.276a1 1 0 001.384 1.448L10 13.414l1.553 1.31a1 1 0 101.384-1.448L11.414 12l1.523-1.276a1 1 0 10-1.384-1.448L10 10.586 8.447 9.276z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default ExportPanel;
