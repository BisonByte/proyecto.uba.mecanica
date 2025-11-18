import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { systemModelSchema, type SystemModel } from '../model/schema';

export interface SavedDesign {
  id: string;
  name: string;
  savedAt: string;
  updatedAt: string;
  pinned?: boolean;
  payload: SystemModel;
}

export interface ModelIOPanelViewProps {
  model: SystemModel;
  onImportModel: (payload: unknown) => void;
}

const STORAGE_KEY = 'hydraulic-designer:saved-models';

const toSystemModel = (payload: unknown): SystemModel | null => {
  if (!payload) {
    return null;
  }
  const result = systemModelSchema.safeParse(payload);
  return result.success ? result.data : null;
};

const normalizeDesign = (raw: unknown): SavedDesign | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  let payloadCandidate = record.payload ?? record.model ?? raw;

  if (typeof payloadCandidate === 'string') {
    try {
      payloadCandidate = JSON.parse(payloadCandidate) as unknown;
    } catch {
      return null;
    }
  }

  const payload = toSystemModel(payloadCandidate);

  if (!payload) {
    return null;
  }

  const id = typeof record.id === 'string' && record.id.trim().length > 0 ? record.id : null;
  const name = typeof record.name === 'string' && record.name.trim().length > 0 ? record.name : null;
  const savedAt = typeof record.savedAt === 'string' && record.savedAt ? record.savedAt : null;

  if (!id || !name || !savedAt) {
    return null;
  }

  const updatedAt =
    typeof record.updatedAt === 'string' && record.updatedAt.length > 0 ? record.updatedAt : savedAt;

  return {
    id,
    name,
    savedAt,
    updatedAt,
    pinned: Boolean(record.pinned),
    payload,
  };
};

const loadStoredDesigns = (): SavedDesign[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeDesign(item))
      .filter((item): item is SavedDesign => item !== null);
  } catch (error) {
    console.error('No se pudo leer el almacenamiento local', error);
    return [];
  }
};

const persistDesigns = (designs: SavedDesign[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error('No se pudo persistir el almacenamiento local', error);
  }
};

const useSavedDesigns = () => {
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(() => loadStoredDesigns());

  useEffect(() => {
    persistDesigns(savedDesigns);
  }, [savedDesigns]);

  return useMemo(() => ({ savedDesigns, setSavedDesigns }), [savedDesigns, setSavedDesigns]);
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}`;
};

const getDesignMetrics = (design: SavedDesign) => {
  const nodes = design.payload.nodes.length;
  const pumps = design.payload.nodes.filter((node) => node.kind === 'pump').length;
  const tanks = design.payload.nodes.filter((node) => node.kind === 'tank').length;
  const junctions = design.payload.nodes.filter((node) => node.kind === 'junction').length;
  const valves = design.payload.nodes.filter((node) => node.kind === 'valve').length;
  const regulators = design.payload.nodes.filter((node) => node.kind === 'regulator').length;
  const meters = design.payload.nodes.filter((node) => node.kind === 'meter').length;
  const pipes = design.payload.pipes.length;
  const totalLength = design.payload.pipes.reduce((sum, pipe) => sum + pipe.length, 0);

  return { nodes, pumps, tanks, junctions, valves, regulators, meters, pipes, totalLength };
};

const ModelIOPanelView = ({ model, onImportModel }: ModelIOPanelViewProps): JSX.Element => {
  const { savedDesigns, setSavedDesigns } = useSavedDesigns();
  const [rawJson, setRawJson] = useState('');
  const [designName, setDesignName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<'recent' | 'alpha'>('recent');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);

  const filteredDesigns = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return [...savedDesigns]
      .filter((design) => (normalizedTerm ? design.name.toLowerCase().includes(normalizedTerm) : true))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (sortMode === 'alpha') {
          return a.name.localeCompare(b.name, 'es');
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [savedDesigns, searchTerm, sortMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(model, null, 2));
      toast.success('Modelo copiado', {
        description: 'El JSON actual está listo para compartir o versionar.',
      });
    } catch (error) {
      console.error(error);
      toast.error('No se pudo copiar el modelo');
    }
  };

  const handleLoad = () => {
    try {
      if (!rawJson.trim()) {
        return;
      }
      const parsed = JSON.parse(rawJson);
      onImportModel(parsed);
      toast.success('Modelo cargado', {
        description: 'El diseñador se actualizó desde el JSON proporcionado.',
      });
    } catch (error) {
      console.error(error);
      toast.error('JSON inválido', {
        description: 'Revisa la estructura y vuelve a intentarlo.',
      });
    }
  };

  const handleSaveDesign = () => {
    if (!designName.trim()) {
      toast.error('Agrega un nombre para guardar el diseño');
      return;
    }

    const now = new Date().toISOString();
    const entry: SavedDesign = {
      id: createId(),
      name: designName.trim(),
      savedAt: now,
      updatedAt: now,
      pinned: false,
      payload: model,
    };

    setSavedDesigns((current) => {
      const filtered = current.filter((item) => item.name !== entry.name);
      const updated = [entry, ...filtered];
      toast.success('Diseño guardado', { description: `Se almacenó “${entry.name}” en este navegador.` });
      return updated;
    });
    setDesignName('');
  };

  const handleLoadDesign = (design: SavedDesign) => {
    try {
      onImportModel(design.payload);
      toast.success('Diseño cargado', { description: `Se restauró “${design.name}”.` });
      setActiveDesignId(design.id);
      const now = new Date().toISOString();
      setSavedDesigns((current) =>
        current.map((item) =>
          item.id === design.id
            ? {
                ...item,
                updatedAt: now,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el diseño');
    }
  };

  const handleDeleteDesign = (id: string) => {
    setSavedDesigns((current) => current.filter((item) => item.id !== id));
    toast.success('Diseño eliminado');
  };

  const handleDuplicateDesign = (design: SavedDesign) => {
    const now = new Date();
    const duplicate: SavedDesign = {
      ...design,
      id: createId(),
      name: `${design.name} (copia)`,
      savedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      pinned: false,
    };
    setSavedDesigns((current) => [duplicate, ...current]);
    toast.success('Diseño duplicado', { description: `Se creó “${duplicate.name}”.` });
  };

  const handleTogglePin = (id: string) => {
    setSavedDesigns((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              pinned: !item.pinned,
            }
          : item,
      ),
    );
  };

  const handleRenameSubmit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    setSavedDesigns((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              name: trimmed,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    toast.success('Diseño renombrado', { description: `Ahora se llama “${trimmed}”.` });
    setEditingId(null);
    setEditingName('');
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
      <div className="space-y-3">
        <header>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-200">
            Modelo JSON
          </span>
          <h2 className="mt-3 text-xl font-semibold text-slate-50">Fuente de verdad del proyecto</h2>
          <p className="mt-1 text-sm text-slate-400">
            Sincroniza tus cambios copiando o cargando el modelo estructurado validado por Zod.
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400/70 hover:bg-cyan-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4a3 3 0 013-3h6a3 3 0 013 3v7a3 3 0 01-3 3h-6a3 3 0 01-3-3V4z" />
              <path d="M3 7a3 3 0 013-3v7a5 5 0 005 5h4a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" />
            </svg>
            Copiar JSON actual
          </button>
          <button
            type="button"
            onClick={handleLoad}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/70 hover:bg-emerald-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a2 2 0 012-2h5.586a2 2 0 011.414.586l4.414 4.414A2 2 0 0117 7.414V17a2 2 0 01-2 2h-3.5a.5.5 0 010-1H15a1 1 0 001-1V7h-4a1 1 0 01-1-1V2H5a1 1 0 00-1 1v6.5a.5.5 0 01-1 0V3z" />
              <path d="M3.5 14.5a.5.5 0 01.5-.5h3V11a1 1 0 012 0v3h3a.5.5 0 01.354.854l-4 4a.5.5 0 01-.708 0l-4-4a.5.5 0 01-.146-.354z" />
            </svg>
            Cargar desde JSON
          </button>
        </div>
        <textarea
          value={rawJson}
          onChange={(event) => setRawJson(event.target.value)}
          placeholder="Pega aquí un modelo validado por Zod para importar el esquema"
          rows={6}
          className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm font-mono text-slate-200 shadow-inner shadow-slate-950/60 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      <div className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/30">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Diseños guardados</h3>
            <p className="text-xs text-slate-400">Construye una biblioteca personal con tus circuitos preferidos.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-52">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.64 5.64a7.5 7.5 0 0010.61 10.61z" />
              </svg>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar diseño"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">
              <span className="hidden sm:inline">Ordenar</span>
              <button
                type="button"
                className={`rounded-full px-2 py-1 transition ${
                  sortMode === 'recent' ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setSortMode('recent')}
              >
                Recientes
              </button>
              <button
                type="button"
                className={`rounded-full px-2 py-1 transition ${
                  sortMode === 'alpha' ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setSortMode('alpha')}
              >
                A-Z
              </button>
            </div>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-xs text-slate-300">
            Nombre del diseño
            <input
              type="text"
              value={designName}
              onChange={(event) => setDesignName(event.target.value)}
              placeholder="Ej. Circuito torre de enfriamiento"
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleSaveDesign}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 transition hover:border-cyan-400/70 hover:bg-cyan-500/20 sm:w-52"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
            </svg>
            Guardar
          </button>
        </div>

        {filteredDesigns.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-8 text-center text-sm text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v6.586l-.707-.707a1 1 0 10-1.414 1.414l2.828 2.829a1 1 0 001.414 0l2.828-2.83a1 1 0 00-1.414-1.414L11 10.586V4a2 2 0 00-2-2z" />
              <path d="M5 16a3 3 0 01-3-3V9a3 3 0 013-3h1a1 1 0 110 2H5a1 1 0 00-1 1v4a1 1 0 001 1h10a1 1 0 001-1v-4a1 1 0 00-1-1h-1a1 1 0 110-2h1a3 3 0 013 3v4a3 3 0 01-3 3H5z" />
            </svg>
            <div>
              <p className="font-medium text-slate-300">No hay diseños coincidentes</p>
              <p className="text-xs text-slate-500">Guarda un nuevo esquema o modifica tu búsqueda.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredDesigns.map((design) => {
              const metrics = getDesignMetrics(design);
              const isEditing = editingId === design.id;
              const isActive = activeDesignId === design.id;

              return (
                <article
                  key={design.id}
                  className={`relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-5 shadow-lg transition ${
                    isActive ? 'ring-2 ring-cyan-400/50' : 'hover:border-cyan-500/30 hover:shadow-cyan-600/10'
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_55%)]" />
                  {design.pinned && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.05 2.927a2.5 2.5 0 011.9 0l4.518 1.807a1 1 0 01.532 1.326l-1.59 3.701a1 1 0 00-.08.39v3.349l1.447 1.447A1 1 0 0114.586 16L12 13.414 9.414 16a1 1 0 01-1.707-.707v-3.349a1 1 0 00-.08-.39L6.037 6.06a1 1 0 01.533-1.326l4.518-1.807z" />
                      </svg>
                      Favorito
                    </span>
                  )}
                  <div className="relative flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      {isEditing ? (
                        <div className="flex-1">
                          <input
                            autoFocus
                            type="text"
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            onBlur={() => handleRenameSubmit(design.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                handleRenameSubmit(design.id);
                              }
                              if (event.key === 'Escape') {
                                setEditingId(null);
                                setEditingName('');
                              }
                            }}
                            className="w-full rounded-xl border border-cyan-500/40 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-100 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-lg font-semibold text-slate-100">{design.name}</h4>
                          <p className="text-xs text-slate-400">
                            Actualizado el {new Date(design.updatedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(design.id)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] transition ${
                            design.pinned
                              ? 'border-amber-400/40 bg-amber-500/10 text-amber-100 hover:border-amber-300/60'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-slate-300/40 hover:text-slate-100'
                          }`}
                        >
                          {design.pinned ? 'Fijado' : 'Fijar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(design.id);
                            setEditingName(design.name);
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
                        >
                          Renombrar
                        </button>
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-400 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Nodos</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.nodes}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Bombas</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.pumps}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Tanques</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.tanks}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Cruces</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.junctions}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Válvulas</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.valves}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Reguladores</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.regulators}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Medidores</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.meters}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Tuberías</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.pipes}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-[10px] text-slate-500">Longitud total</dt>
                        <dd className="mt-1 text-base font-semibold text-slate-100">{metrics.totalLength.toFixed(1)} m</dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadDesign(design)}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-500/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v3a1 1 0 102 0V5h12v3a1 1 0 102 0V5a2 2 0 00-2-2H4z" />
                          <path d="M5 9a1 1 0 00-1 1v5a2 2 0 002 2h8a2 2 0 002-2v-5a1 1 0 10-2 0v5H6v-5a1 1 0 00-1-1z" />
                          <path d="M7 10a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                        </svg>
                        Restaurar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateDesign(design)}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-100 transition hover:border-indigo-300/60 hover:bg-indigo-500/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 4a3 3 0 013-3h5a3 3 0 013 3v9a3 3 0 01-3 3h-5a3 3 0 01-3-3V4z" />
                          <path d="M3 7a3 3 0 013-3v9a5 5 0 005 5h3a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" />
                        </svg>
                        Duplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDesign(design.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-100 transition hover:border-rose-300/60 hover:bg-rose-500/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 7a1 1 0 011-1h8a1 1 0 110 2v7a3 3 0 01-3 3H8a3 3 0 01-3-3V7z" />
                          <path d="M9 2a1 1 0 00-1 1v1H6a1 1 0 000 2h8a1 1 0 100-2h-2V3a1 1 0 00-1-1H9z" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ModelIOPanelView;
