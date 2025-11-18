import { useMemo, useState } from 'react';
import { useModelStore } from '../state/store';

type LibraryItem = {
  id: string;
  type: 'tank' | 'pump' | 'junction';
  name: string;
  description: string;
};

const CATALOG: LibraryItem[] = [
  { id: 'tank', type: 'tank', name: 'Tanque', description: 'Reservorios y tanques' },
  { id: 'pump', type: 'pump', name: 'Bomba', description: 'Centrífuga genérica' },
  { id: 'junction', type: 'junction', name: 'Unión', description: 'Nodo de demanda' },
  { id: 'valve', type: 'valve', name: 'Válvula', description: 'Pérdidas locales' },
  { id: 'regulator', type: 'regulator', name: 'Regulador', description: 'Control de presión' },
  { id: 'meter', type: 'meter', name: 'Medidor', description: 'Instrumentación' },
];

const DRAG_MIME = 'application/x-hd-component';

const FAVORITES_KEY = 'hd:library:favorites';

type Tab = 'equipos' | 'materiales';

const MATERIAL_FAMILIES = [
  {
    id: 'steel-sch40',
    name: 'Acero al carbón Sch40',
    roughness: 0.000045,
    dns: [
      { id: 'dn50', label: 'DN50 · 2"', d: 0.0508 },
      { id: 'dn80', label: 'DN80 · 3"', d: 0.0762 },
      { id: 'dn100', label: 'DN100 · 4"', d: 0.1016 },
      { id: 'dn150', label: 'DN150 · 6"', d: 0.1524 },
      { id: 'dn200', label: 'DN200 · 8"', d: 0.2032 },
    ],
  },
  {
    id: 'ductile-150',
    name: 'Hierro dúctil Clase 150',
    roughness: 0.00026,
    dns: [
      { id: 'dn100', label: 'DN100 · 4"', d: 0.1016 },
      { id: 'dn150', label: 'DN150 · 6"', d: 0.1524 },
      { id: 'dn200', label: 'DN200 · 8"', d: 0.2032 },
      { id: 'dn250', label: 'DN250 · 10"', d: 0.254 },
    ],
  },
  {
    id: 'pead-sdr17',
    name: 'PEAD SDR 17 (mm)',
    roughness: 0.00001,
    dns: [
      { id: 'd160', label: '160 mm', d: 0.16 },
      { id: 'd200', label: '200 mm', d: 0.2 },
      { id: 'd225', label: '225 mm', d: 0.225 },
    ],
  },
];

export interface LibraryPanelProps {
  pipeToolActive?: boolean;
  onStartPipe?: () => void;
  onCancelPipe?: () => void;
}

const LibraryPanel = ({ pipeToolActive = false, onStartPipe, onCancelPipe }: LibraryPanelProps): JSX.Element => {
  const { addTank, addPump, addJunction } = useModelStore((s) => ({
    addTank: s.addTank,
    addPump: s.addPump,
    addJunction: s.addJunction,
  }));
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('equipos');
  const [familyId, setFamilyId] = useState<string>('steel-sch40');
  const [dnId, setDnId] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const items = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = CATALOG.filter((i) => i.name.toLowerCase().includes(term));
    // Ordena favoritos primero
    return filtered.sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)));
  }, [query, favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClick = (type: LibraryItem['type']) => {
    if (type === 'tank') addTank();
    else if (type === 'pump') addPump();
    else addJunction();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
              tab === 'equipos' ? 'border border-cyan-400/40 text-cyan-100' : 'border border-white/10 text-white/60'
            }`}
            onClick={() => setTab('equipos')}
          >
            Equipos
          </button>
          <button
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
              tab === 'materiales' ? 'border border-cyan-400/40 text-cyan-100' : 'border border-white/10 text-white/60'
            }`}
            onClick={() => setTab('materiales')}
          >
            Materiales
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar…"
          className="w-40 rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 text-xs text-white/80 placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
        />
      </header>

      {/* Controles de tubería compactos */}
      {(onStartPipe || onCancelPipe) && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
          <span className="font-semibold text-white">Tuberías</span>
          {pipeToolActive ? (
            <>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                Activo
              </span>
              <button
                type="button"
                onClick={onCancelPipe}
                className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-100 hover:border-rose-400/70"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartPipe}
              className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-100 hover:border-cyan-300/60"
            >
              Crear tubería
            </button>
          )}
        </div>
      )}

      {tab === 'equipos' ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_MIME, item.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => handleClick(item.type)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/80 transition hover:border-cyan-400/40 hover:text-cyan-100"
                title="Arrastra al lienzo o haz clic para añadir"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-[11px] text-white/60">{item.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={`rounded-md border px-2 py-1 text-[11px] ${
                      favorites.includes(item.id)
                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-amber-400/40 hover:text-amber-200'
                    }`}
                    title="Marcar como favorito"
                  >
                    ★
                  </button>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Arrastrar</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/70">Aplica presets de material y DN a la tubería seleccionada.</p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-white/50">Familia</span>
            <select
              value={familyId}
              onChange={(e) => {
                setFamilyId(e.target.value);
                setDnId('');
              }}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            >
              {MATERIAL_FAMILIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase text-white/50">Diámetro nominal</span>
            <select
              value={dnId}
              onChange={(e) => setDnId(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            >
              <option value="" disabled>
                Seleccionar DN…
              </option>
              {MATERIAL_FAMILIES.find((f) => f.id === familyId)?.dns.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              const fam = MATERIAL_FAMILIES.find((f) => f.id === familyId);
              const dn = fam?.dns.find((d) => d.id === dnId);
              if (!fam || !dn) return;
              // aplica a la tubería seleccionada
              useModelStore.setState((state) => {
                if (state.selection?.type !== 'pipe') return state;
                const id = state.selection.id;
                state.updatePipe(id, (cur) => ({ ...cur, diameter: dn.d, roughness: fam.roughness }));
                return state;
              });
            }}
            className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:border-cyan-300/60"
          >
            Aplicar al seleccionado
          </button>
          <p className="text-[11px] text-white/60">Selecciona una tubería en el canvas para activar esta acción.</p>
        </div>
      )}
    </section>
  );
};

export default LibraryPanel;
