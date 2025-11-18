import { useMemo } from 'react';
import { listFluids } from '../../lib/fluidCatalog';
import { useModelStore } from '../../state/store';
import {
  HEAD_UNIT,
  PRESSURE_UNIT,
  SPECIFIC_WEIGHT_UNIT,
  formatNumber,
  toDisplayLength,
  toDisplayPressure,
  toDisplaySpecificWeight,
} from '../../utils/units';

const SummaryPage = (): JSX.Element => {
  const fluids = useMemo(() => listFluids(), []);
  const { model, results, setFluid, setUnits } = useModelStore((state) => ({
    model: state.model,
    results: state.results,
    setFluid: state.setFluid,
    setUnits: state.setUnits,
  }));

  const headUnit = HEAD_UNIT[model.units];
  const pressureUnit = PRESSURE_UNIT[model.units];
  const specificWeightUnit = SPECIFIC_WEIGHT_UNIT[model.units];

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Diseñador hidráulico</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Modela el circuito en tiempo real</h1>
            <p className="max-w-2xl text-sm text-white/60">
              Arrastra tanques, ajusta alturas y evalúa presiones hidrostáticas con resultados instantáneos.
            </p>
          </div>
          <dl className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/50">TDH</dt>
              <dd className="text-lg font-semibold text-cyan-300">
                {formatNumber(toDisplayLength(results.totalDynamicHead, model.units), 2)} {headUnit}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/50">Balance energía</dt>
              <dd className={`text-lg font-semibold ${results.energyBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatNumber(toDisplayLength(results.energyBalance, model.units), 2)} {headUnit}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/50">γ</dt>
              <dd className="text-lg font-semibold text-white">
                {formatNumber(toDisplaySpecificWeight(results.specificWeight, model.units), 1)} {specificWeightUnit}
              </dd>
            </div>
          </dl>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-white/50">Fluido</span>
            <select
              value={model.fluidId}
              onChange={(event) => setFluid(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm focus:border-cyan-400 focus:outline-none"
            >
              {fluids.map((fluid) => (
                <option key={fluid.id} value={fluid.id}>
                  {fluid.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-white/50">Sistema</span>
            <select
              value={model.units}
              onChange={(event) => setUnits(event.target.value as typeof model.units)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm focus:border-cyan-400 focus:outline-none"
            >
              <option value="SI">SI (m, kPa)</option>
              <option value="US">US (ft, psi)</option>
            </select>
          </label>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            P<sub>suc</sub>: {formatNumber(toDisplayPressure(results.suctionPressure, model.units), 1)} {pressureUnit} · P<sub>desc</sub>:
            {` ${formatNumber(toDisplayPressure(results.dischargePressure, model.units), 1)} ${pressureUnit}`}
          </div>
        </div>
      </header>
    </section>
  );
};

export default SummaryPage;
