import { ChangeEvent } from 'react';
import { useModelStore } from '../state/store';
import type { JunctionNode, PumpNode, SystemNode, SystemPipe, TankNode } from '../model/schema';
import {
  HEAD_UNIT,
  LENGTH_UNIT,
  PRESSURE_UNIT,
  TEMPERATURE_UNIT,
  formatNumber,
  fromDisplayFlow,
  fromDisplayLength,
  fromDisplayVolume,
  fromDisplayPressure,
  fromDisplayTemperature,
  toDisplayFlow,
  toDisplayLength,
  toDisplayVolume,
  toDisplayPressure,
  toDisplayTemperature,
} from '../utils/units';

const numberOrNull = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const PropertiesPanel = (): JSX.Element => {
  const { model, results, selection, updateNode, updatePipe, removePipe, removeNode, setAmbientPressure } =
    useModelStore((state) => ({
      model: state.model,
      results: state.results,
      selection: state.selection,
      updateNode: state.updateNode,
      updatePipe: state.updatePipe,
      removePipe: state.removePipe,
      removeNode: state.removeNode,
      setAmbientPressure: state.setAmbientPressure,
    }));

  const selectedNode: SystemNode | undefined =
    selection?.type === 'node' ? model.nodes.find((node) => node.id === selection.id) : undefined;
  const selectedPipe: SystemPipe | undefined =
    selection?.type === 'pipe' ? model.pipes.find((pipe) => pipe.id === selection.id) : undefined;

  const pressureUnit = PRESSURE_UNIT[model.units];
  const lengthUnit = LENGTH_UNIT[model.units];
  const headUnit = HEAD_UNIT[model.units];
  const temperatureUnit = TEMPERATURE_UNIT[model.units];

  const handleAmbientPressureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = numberOrNull(event.target.value);
    if (value === null) return;
    setAmbientPressure(fromDisplayPressure(value, model.units));
  };

  const renderTankProperties = (node: TankNode) => {
    const elevation = toDisplayLength(node.properties.baseElevation, model.units);
    const referenceElevation = toDisplayLength(
      node.properties.referenceElevation ?? node.properties.baseElevation,
      model.units,
    );
    const fluidLevel = toDisplayLength(node.properties.fluidLevel, model.units);
    const temperature = node.properties.operatingTemperature ?? 20;
    const volume = node.properties.volume ?? 0;
    const volumeDisplay = toDisplayVolume(volume, model.units);
    const isSealed = node.properties.isSealed ?? false;
    const gasPressureDisplay = toDisplayPressure(
      node.properties.gasPressure ?? model.ambientPressure,
      model.units,
    );
    const rotation = node.dimensions.rotation ?? 0;

    return (
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">{node.name}</h3>
          <button
            type="button"
            onClick={() => removeNode(node.id)}
            className="text-xs font-medium text-rose-300 hover:text-rose-200"
          >
            Eliminar
          </button>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Nombre</span>
          <input
            type="text"
            value={node.name}
            onChange={(event) =>
              updateNode(node.id, (current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Cota base ({lengthUnit})</span>
          <input
            type="number"
            value={elevation}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  baseElevation: fromDisplayLength(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Referencia ({lengthUnit})</span>
          <input
            type="number"
            value={referenceElevation}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  referenceElevation: fromDisplayLength(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Nivel de fluido ({lengthUnit})</span>
          <input
            type="number"
            value={fluidLevel}
            min={0}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  fluidLevel: fromDisplayLength(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Volumen ({model.units === 'US' ? 'ft³' : 'm³'})</span>
          <input
            type="number"
            min={0}
            value={volumeDisplay}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  volume: fromDisplayVolume(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
          <span className="text-xs uppercase text-slate-400">Tanque cerrado</span>
          <button
            type="button"
            onClick={() =>
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  isSealed: !isSealed,
                  gasPressure: !isSealed
                    ? current.properties.gasPressure ?? model.ambientPressure
                    : model.ambientPressure,
                },
              }))
            }
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              isSealed
                ? 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                : 'border border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            {isSealed ? 'Sellado' : 'Abierto'}
          </button>
        </div>
        {isSealed && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Presión de gas ({pressureUnit})</span>
            <input
              type="number"
              min={0}
              value={gasPressureDisplay}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    gasPressure: fromDisplayPressure(value, model.units),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Temperatura operativa ({temperatureUnit})</span>
          <input
            type="number"
            value={toDisplayTemperature(temperature, model.units)}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  operatingTemperature: fromDisplayTemperature(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Geometría</span>
            <select
              value={node.dimensions.shape}
              onChange={(event) =>
                updateNode(node.id, (current) => ({
                  ...current,
                  dimensions: {
                    ...current.dimensions,
                    shape: event.target.value as typeof current.dimensions.shape,
                  },
                }))
              }
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="rectangular">Rectangular</option>
              <option value="cylindrical">Cilíndrico</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Orientación</span>
            <select
              value={node.dimensions.orientation}
              onChange={(event) =>
                updateNode(node.id, (current) => ({
                  ...current,
                  dimensions: {
                    ...current.dimensions,
                    orientation: event.target.value as typeof current.dimensions.orientation,
                  },
                }))
              }
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Rotación (°)</span>
          <input
            type="number"
            value={rotation}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                dimensions: {
                  ...current.dimensions,
                  rotation: Math.max(-180, Math.min(180, value)),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
      </div>
    );
  };

  const renderPumpProperties = (node: PumpNode) => {
    const suctionNodeOptions = model.nodes.filter((item) => item.id !== node.id);
    const dischargeNodeOptions = model.nodes.filter((item) => item.id !== node.id);
    const elevation = toDisplayLength(node.properties.centerlineElevation, model.units);
    const pumpHead = toDisplayLength(node.properties.addedHead, model.units);
    const requiredNpsh = toDisplayLength(node.properties.requiredNpsh, model.units);
    const referenceElevation = toDisplayLength(
      node.properties.referenceElevation ?? node.properties.centerlineElevation,
      model.units,
    );
    const rotation = node.properties.rotation ?? 0;

    return (
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold text-slate-100">{node.name}</h3>
        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Nombre</span>
            <input
              type="text"
              value={node.name}
              onChange={(event) =>
                updateNode(node.id, (current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Cota eje ({lengthUnit})</span>
            <input
              type="number"
              value={elevation}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    centerlineElevation: fromDisplayLength(value, model.units),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Referencia ({lengthUnit})</span>
            <input
              type="number"
              value={referenceElevation}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    referenceElevation: fromDisplayLength(value, model.units),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Altura agregada ({headUnit})</span>
            <input
              type="number"
              min={0}
              value={pumpHead}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    addedHead: fromDisplayLength(value, model.units),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">NPSH requerido ({headUnit})</span>
            <input
              type="number"
              min={0}
              value={requiredNpsh}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    requiredNpsh: fromDisplayLength(value, model.units),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Eficiencia</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={node.properties.efficiency}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    efficiency: Math.min(1, Math.max(0, value)),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Succión</span>
            <select
              value={node.properties.suctionNodeId}
              onChange={(event) =>
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    suctionNodeId: event.target.value,
                  },
                }))
              }
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              {suctionNodeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Descarga</span>
            <select
              value={node.properties.dischargeNodeId}
              onChange={(event) =>
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    dischargeNodeId: event.target.value,
                  },
                }))
              }
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              {dischargeNodeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Rotación (°)</span>
            <input
              type="number"
              value={rotation}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updateNode(node.id, (current) => ({
                  ...current,
                  properties: {
                    ...current.properties,
                    rotation: Math.max(-180, Math.min(180, value)),
                  },
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>
    );
  };

  const renderJunctionProperties = (node: JunctionNode) => {
    const elevation = toDisplayLength(node.properties.elevation, model.units);
    const referenceElevation = toDisplayLength(
      node.properties.referenceElevation ?? node.properties.elevation,
      model.units,
    );
    return (
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">{node.name}</h3>
          <button
            type="button"
            onClick={() => removeNode(node.id)}
            className="text-xs font-medium text-rose-300 hover:text-rose-100"
          >
            Eliminar
          </button>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Nombre</span>
          <input
            type="text"
            value={node.name}
            onChange={(event) =>
              updateNode(node.id, (current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Cota ({lengthUnit})</span>
          <input
            type="number"
            value={elevation}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  elevation: fromDisplayLength(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Referencia ({lengthUnit})</span>
          <input
            type="number"
            value={referenceElevation}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updateNode(node.id, (current) => ({
                ...current,
                properties: {
                  ...current.properties,
                  referenceElevation: fromDisplayLength(value, model.units),
                },
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
      </div>
    );
  };

  const renderPipeProperties = (pipe: SystemPipe) => {
    const diameter = toDisplayLength(pipe.diameter, model.units);
    const length = toDisplayLength(pipe.length, model.units);
    const roughness = toDisplayLength(pipe.roughness, model.units);
    const flowRate = toDisplayFlow(pipe.flowRate, model.units);

    return (
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">{pipe.name}</h3>
          <button
            type="button"
            onClick={() => removePipe(pipe.id)}
            className="text-xs font-medium text-rose-300 hover:text-rose-100"
          >
            Eliminar
          </button>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Nombre</span>
          <input
            type="text"
            value={pipe.name}
            onChange={(event) =>
              updatePipe(pipe.id, (current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Catálogo rápido</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase text-slate-400">Material</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  const material = e.target.value;
                  const roughnessByMaterial: Record<string, number> = {
                    acero: 0.000045,
                    ductil: 0.00026,
                    pead: 0.00001,
                    cobre: 0.0000015,
                  };
                  const r = roughnessByMaterial[material];
                  if (r) updatePipe(pipe.id, (cur) => ({ ...cur, roughness: r }));
                }}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Selecciona material…
                </option>
                <option value="acero">Acero al carbón</option>
                <option value="ductil">Hierro dúctil</option>
                <option value="pead">PEAD</option>
                <option value="cobre">Cobre</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase text-slate-400">Diámetro nominal</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  const id = e.target.value;
                  const dn: Record<string, number> = {
                    dn50: 0.0508,
                    dn80: 0.0762,
                    dn100: 0.1016,
                    dn150: 0.1524,
                    dn200: 0.2032,
                    d160mm: 0.16,
                    d200mm: 0.2,
                  };
                  const d = dn[id];
                  if (d) updatePipe(pipe.id, (cur) => ({ ...cur, diameter: d }));
                }}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Selecciona diámetro…
                </option>
                <option value="dn50">DN50 · 2" (0.0508 m)</option>
                <option value="dn80">DN80 · 3" (0.0762 m)</option>
                <option value="dn100">DN100 · 4" (0.1016 m)</option>
                <option value="dn150">DN150 · 6" (0.1524 m)</option>
                <option value="dn200">DN200 · 8" (0.2032 m)</option>
                <option value="d160mm">160 mm (0.16 m)</option>
                <option value="d200mm">200 mm (0.20 m)</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Valores aproximados; ajusta según catálogo del fabricante.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Diámetro ({lengthUnit})</span>
            <input
              type="number"
              min={0}
              value={diameter}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updatePipe(pipe.id, (current) => ({
                  ...current,
                  diameter: fromDisplayLength(value, model.units),
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Longitud ({lengthUnit})</span>
            <input
              type="number"
              min={0}
              value={length}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updatePipe(pipe.id, (current) => ({
                  ...current,
                  length: fromDisplayLength(value, model.units),
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Rugosidad ({lengthUnit})</span>
            <input
              type="number"
              min={0}
              value={roughness}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updatePipe(pipe.id, (current) => ({
                  ...current,
                  roughness: fromDisplayLength(value, model.units),
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-slate-400">Caudal ({model.units === 'SI' ? 'L/s' : 'gpm'})</span>
            <input
              type="number"
              min={0}
              value={flowRate}
              onChange={(event) => {
                const value = numberOrNull(event.target.value);
                if (value === null) return;
                updatePipe(pipe.id, (current) => ({
                  ...current,
                  flowRate: fromDisplayFlow(value, model.units),
                }));
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">K minor</span>
          <input
            type="number"
            min={0}
            step={0.05}
            value={pipe.minorLossK}
            onChange={(event) => {
              const value = numberOrNull(event.target.value);
              if (value === null) return;
              updatePipe(pipe.id, (current) => ({
                ...current,
                minorLossK: Math.max(0, value),
              }));
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Presets de material</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              onChange={(e) => {
                const id = e.target.value;
                const presets: Array<{ id: string; diameter: number; roughness: number }> = [
                  { id: 'steel-sch40-4in', diameter: 0.1016, roughness: 0.000045 },
                  { id: 'ductile-150-6in', diameter: 0.1524, roughness: 0.00026 },
                  { id: 'pead-sdr17-160', diameter: 0.16, roughness: 0.00001 },
                  { id: 'copper-2in', diameter: 0.0508, roughness: 0.0000015 },
                ];
                const preset = presets.find((p) => p.id === id);
                if (!preset) return;
                updatePipe(pipe.id, (current) => ({
                  ...current,
                  diameter: preset.diameter,
                  roughness: preset.roughness,
                }));
              }}
              defaultValue=""
              className="min-w-[220px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white/90"
            >
              <option value="" disabled>
                Seleccionar preset…
              </option>
              <option value="steel-sch40-4in">Acero al carbón Ø4" Sch40</option>
              <option value="ductile-150-6in">Hierro dúctil clase 150 Ø6"</option>
              <option value="pead-sdr17-160">PEAD SDR17 Ø160 mm</option>
              <option value="copper-2in">Cobre Ø2"</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Aplica diámetro y rugosidad desde catálogo (editable).
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4 border-b border-slate-800 p-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-100">Propiedades</h2>
        <p className="text-sm text-slate-400">
          Presión ambiente {formatNumber(toDisplayPressure(model.ambientPressure, model.units), 1)} {pressureUnit} ·
          Fluido {results.fluidName}
        </p>
        <label className="flex max-w-sm flex-col gap-1 text-sm">
          <span className="text-xs uppercase text-slate-400">Presión ambiente ({pressureUnit})</span>
          <input
            type="number"
            value={toDisplayPressure(model.ambientPressure, model.units)}
            onChange={handleAmbientPressureChange}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
      </header>
      <div className="space-y-4">
        {selectedNode && (
          <>
            {selectedNode.kind === 'tank' && renderTankProperties(selectedNode)}
            {selectedNode.kind === 'pump' && renderPumpProperties(selectedNode)}
            {selectedNode.kind === 'junction' && renderJunctionProperties(selectedNode)}
          </>
        )}
        {selectedPipe && renderPipeProperties(selectedPipe)}
        {!selectedNode && !selectedPipe && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-sm text-slate-400">
            Selecciona un elemento del esquema para editar sus atributos.
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesPanel;
