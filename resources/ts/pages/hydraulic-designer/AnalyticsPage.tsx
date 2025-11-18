import ExportPanel from '../../components/ExportPanel';
import FormulaPanel from '../../components/FormulaPanel';
import ModelIOPanel from '../../components/ModelIOPanel';
import PropertiesPanel from '../../components/PropertiesPanel';
import ValidationPanel from '../../components/ValidationPanel';
import { CANVAS_ID } from './constants';

const AnalyticsPage = (): JSX.Element => {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Analítica</p>
        <h2 className="text-2xl font-semibold text-white">Propiedades y resultados</h2>
        <p className="max-w-2xl text-sm text-white/60">
          Inspecciona las propiedades de cada componente, verifica las ecuaciones y exporta tu modelo con un solo clic.
        </p>
      </header>
      <div className="mt-6 space-y-3">
        <PropertiesPanel />
        <FormulaPanel />
        <ValidationPanel />
        <ExportPanel canvasElementId={CANVAS_ID} />
        <ModelIOPanel />
      </div>
    </section>
  );
};

export default AnalyticsPage;
