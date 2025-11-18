import { create } from 'zustand';
import {
  type SystemModel,
  type SystemNode,
  type SystemPipe,
  createInitialModel,
  cloneModel,
  parseSystemModel,
  type SystemUnits,
  createTankNode,
  createPumpNode,
  createJunctionNode,
  createValveNode,
  createRegulatorNode,
  createMeterNode,
} from '../model/schema';
import { computeHydraulics, type HydraulicsResult, type ValidationAlert } from '../physics/engine';

export type Selection =
  | { type: 'node'; id: string }
  | { type: 'pipe'; id: string }
  | null;

export interface ModelStoreState {
  model: SystemModel;
  results: HydraulicsResult;
  alerts: ValidationAlert[];
  selection: Selection;
  // Historial de cambios para Undo/Redo
  history: SystemModel[];
  historyIndex: number;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  setSelection: (selection: Selection) => void;
  updateNode: (id: string, updater: (node: SystemNode) => SystemNode) => void;
  updatePipe: (id: string, updater: (pipe: SystemPipe) => SystemPipe) => void;
  addTank: (position?: { x: number; y: number }) => void;
  addPump: (position?: { x: number; y: number }) => void;
  addJunction: (position?: { x: number; y: number }) => void;
  addValve: (position?: { x: number; y: number }) => void;
  addRegulator: (position?: { x: number; y: number }) => void;
  addMeter: (position?: { x: number; y: number }) => void;
  addPipe: (from: string, to: string) => { success: boolean; error?: string };
  removeNode: (id: string) => void;
  removePipe: (id: string) => void;
  setFluid: (fluidId: string) => void;
  setUnits: (units: SystemUnits) => void;
  setAmbientPressure: (pressure: number) => void;
  reset: () => void;
  loadModel: (json: unknown) => void;
}

const buildState = (model: SystemModel) => {
  const { results, alerts } = computeHydraulics(model);
  return { model, results, alerts };
};

const basePositionFor = (model: SystemModel, position?: { x: number; y: number }) => {
  if (position) {
    return position;
  }

  const columns = 4;
  const index = model.nodes.length;
  const col = index % columns;
  const row = Math.floor(index / columns);

  return {
    x: 200 + col * 180,
    y: 200 + row * 150,
  };
};

const nextName = (model: SystemModel, kind: SystemNode['kind'], prefix: string) => {
  const counter = model.nodes.filter((node) => node.kind === kind).length + 1;
  return `${prefix} ${counter}`;
};

const generateId = (): string => {
  const { crypto } = globalThis;
  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `node-${timestamp}-${random}`;
};

export const useModelStore = create<ModelStoreState>((set, get) => {
  const initialModel = createInitialModel();
  const initial = buildState(initialModel);
  const MAX_HISTORY = 50;

  const pushHistory = (state: ModelStoreState, model: SystemModel) => {
    const base = state.history.slice(0, state.historyIndex + 1);
    const nextHistory = [...base, cloneModel(model)];
    const trimmed =
      nextHistory.length > MAX_HISTORY ? nextHistory.slice(nextHistory.length - MAX_HISTORY) : nextHistory;
    const nextIndex = Math.min(trimmed.length - 1, state.historyIndex + 1);
    return { history: trimmed, historyIndex: nextIndex } as const;
  };

  return {
    ...initial,
    selection: null,
    history: [cloneModel(initialModel)],
    historyIndex: 0,
    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },
    canRedo: () => {
      const { history, historyIndex } = get();
      return historyIndex < history.length - 1;
    },
    undo: () =>
      set((state) => {
        if (state.historyIndex <= 0) return state;
        const nextIndex = state.historyIndex - 1;
        const model = cloneModel(state.history[nextIndex]);
        return { selection: null, ...buildState(model), history: state.history, historyIndex: nextIndex };
      }),
    redo: () =>
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state;
        const nextIndex = state.historyIndex + 1;
        const model = cloneModel(state.history[nextIndex]);
        return { selection: null, ...buildState(model), history: state.history, historyIndex: nextIndex };
      }),
    setSelection: (selection) => set({ selection }),
    updateNode: (id, updater) => {
      set((state) => {
        const model = cloneModel(state.model);
        const index = model.nodes.findIndex((node) => node.id === id);
        if (index === -1) {
          return state;
        }
        model.nodes[index] = updater(model.nodes[index]);
        const { history, historyIndex } = pushHistory(state, model);
        return { ...buildState(model), history, historyIndex };
      });
    },
    updatePipe: (id, updater) => {
      set((state) => {
        const model = cloneModel(state.model);
        const index = model.pipes.findIndex((pipe) => pipe.id === id);
        if (index === -1) {
          return state;
        }
        model.pipes[index] = updater(model.pipes[index]);
        const { history, historyIndex } = pushHistory(state, model);
        return { ...buildState(model), history, historyIndex };
      });
    },
    addTank: (position) => {
      set((state) => {
        const model = cloneModel(state.model);
        const tankId = generateId();
        const name = nextName(model, 'tank', 'Tanque');
        const pos = basePositionFor(model, position);

        model.nodes.push(
          createTankNode({
            id: tankId,
            name,
            position: pos,
            properties: {
              baseElevation: 0,
              fluidLevel: 4,
              volume: 10,
            },
          }),
        );

        const commit = {
          selection: { type: 'node', id: tankId },
          ...buildState(model),
        } as const;
        const { history, historyIndex } = pushHistory(state, model);
        return { ...commit, history, historyIndex };
      });
    },
    addPump: (position) => {
      set((state) => {
        const model = cloneModel(state.model);
        const pumpId = generateId();
        const name = nextName(model, 'pump', 'Bomba');
        const pos = basePositionFor(model, position);
        const suctionCandidate = model.nodes.find((node) => node.kind === 'tank')?.id ?? '';
        const dischargeCandidate = model.nodes.find((node) => node.kind === 'junction')?.id ?? '';

        model.nodes.push(
          createPumpNode({
            id: pumpId,
            name,
            position: pos,
            properties: {
              suctionNodeId: suctionCandidate,
              dischargeNodeId: dischargeCandidate,
            },
          }),
        );

        const commit = {
          selection: { type: 'node', id: pumpId },
          ...buildState(model),
        } as const;
        const { history, historyIndex } = pushHistory(state, model);
        return { ...commit, history, historyIndex };
      });
    },
    addJunction: (position) => {
      set((state) => {
        const model = cloneModel(state.model);
        const junctionId = generateId();
        const name = nextName(model, 'junction', 'J');
        const pos = basePositionFor(model, position);
        model.nodes.push(
          createJunctionNode({
            id: junctionId,
            name,
            position: pos,
            properties: {
              elevation: 0,
              demand: 0,
              referenceElevation: 0,
            },
          }),
        );
        const commit = {
          selection: { type: 'node', id: junctionId },
          ...buildState(model),
        } as const;
        const { history, historyIndex } = pushHistory(state, model);
        return { ...commit, history, historyIndex };
      });
    },
    addValve: (position) => {
      set((state) => {
        const model = cloneModel(state.model);
        const id = generateId();
        const name = nextName(model, 'valve', 'Válvula');
        const pos = basePositionFor(model, position);
        model.nodes.push(
          createValveNode({
            id,
            name,
            position: pos,
            properties: { elevation: 0, lossCoefficient: 2.5, status: 'open', referenceElevation: 0 },
          }),
        );
        const commit = { selection: { type: 'node', id }, ...buildState(model) } as const;
        const { history, historyIndex } = pushHistory(state as unknown as ModelStoreState, model);
        return { ...commit, history, historyIndex } as unknown as ModelStoreState;
      });
    },
    addRegulator: (position) => {
      set((state) => {
        const model = cloneModel(state.model);
        const id = generateId();
        const name = nextName(model, 'regulator', 'Regulador');
        const pos = basePositionFor(model, position);
        model.nodes.push(
          createRegulatorNode({
            id,
            name,
            position: pos,
            properties: { elevation: 0, setpointPressure: 250000, tolerance: 0.05, referenceElevation: 0 },
          }),
        );
        const commit = { selection: { type: 'node', id }, ...buildState(model) } as const;
        const { history, historyIndex } = pushHistory(state as unknown as ModelStoreState, model);
        return { ...commit, history, historyIndex } as unknown as ModelStoreState;
      });
    },
    addMeter: (position) => {
      set((state) => {
        const model = cloneModel(state.model);
        const id = generateId();
        const name = nextName(model, 'meter', 'Medidor');
        const pos = basePositionFor(model, position);
        model.nodes.push(
          createMeterNode({ id, name, position: pos, properties: { elevation: 0, measuredQuantity: 'flow', referenceElevation: 0 } }),
        );
        const commit = { selection: { type: 'node', id }, ...buildState(model) } as const;
        const { history, historyIndex } = pushHistory(state as unknown as ModelStoreState, model);
        return { ...commit, history, historyIndex } as unknown as ModelStoreState;
      });
    },
    addPipe: (from, to) => {
      if (from === to) {
        return { success: false, error: 'El nodo de origen y destino no pueden ser el mismo.' };
      }

      const { model } = get();
      const fromExists = model.nodes.some((node) => node.id === from);
      const toExists = model.nodes.some((node) => node.id === to);

      if (!fromExists || !toExists) {
        return { success: false, error: 'Uno de los nodos seleccionados ya no existe en el modelo.' };
      }

      const alreadyConnected = model.pipes.some(
        (pipe) =>
          (pipe.from === from && pipe.to === to) || (pipe.from === to && pipe.to === from),
      );

      if (alreadyConnected) {
        return {
          success: false,
          error: 'Los nodos ya están conectados por una tubería existente.',
        };
      }

      let createdPipeId = '';

      set((state) => {
        const next = cloneModel(state.model);
        createdPipeId = generateId();
        next.pipes.push({
          id: createdPipeId,
          name: `Tubería ${next.pipes.length + 1}`,
          from,
          to,
          diameter: 0.08,
          length: 10,
          roughness: 0.000045,
          flowRate: 0.01,
          minorLossK: 1,
        });
        const commit = {
          selection: { type: 'pipe', id: createdPipeId },
          ...buildState(next),
        } as const;
        const { history, historyIndex } = pushHistory(state, next);
        return { ...commit, history, historyIndex };
      });

      return { success: true };
    },
    removeNode: (id) => {
      set((state) => {
        const next = cloneModel(state.model);
        const target = next.nodes.find((node) => node.id === id);
        if (target?.kind === 'pump') {
          return state;
        }
        next.nodes = next.nodes.filter((node) => node.id !== id);
        next.pipes = next.pipes.filter((pipe) => pipe.from !== id && pipe.to !== id);
        const commit = {
          selection: null,
          ...buildState(next),
        } as const;
        const { history, historyIndex } = pushHistory(state, next);
        return { ...commit, history, historyIndex };
      });
    },
    removePipe: (id) => {
      set((state) => {
        const next = cloneModel(state.model);
        next.pipes = next.pipes.filter((pipe) => pipe.id !== id);
        const commit = {
          selection: null,
          ...buildState(next),
        } as const;
        const { history, historyIndex } = pushHistory(state, next);
        return { ...commit, history, historyIndex };
      });
    },
    setFluid: (fluidId) => {
      set((state) => {
        const next = cloneModel(state.model);
        next.fluidId = fluidId;
        const { history, historyIndex } = pushHistory(state, next);
        return { ...buildState(next), history, historyIndex };
      });
    },
    setUnits: (units) => {
      set((state) => {
        const next = cloneModel(state.model);
        next.units = units;
        const { history, historyIndex } = pushHistory(state, next);
        return { ...buildState(next), history, historyIndex };
      });
    },
    setAmbientPressure: (pressure) => {
      set((state) => {
        const next = cloneModel(state.model);
        next.ambientPressure = pressure;
        const { history, historyIndex } = pushHistory(state, next);
        return { ...buildState(next), history, historyIndex };
      });
    },
    reset: () => {
      const initial = createInitialModel();
      return set({
        selection: null,
        ...buildState(initial),
        history: [cloneModel(initial)],
        historyIndex: 0,
      });
    },
    loadModel: (json) => {
      try {
        const parsed = parseSystemModel(json);
        set((state) => {
          const commit = { selection: null, ...buildState(parsed) } as const;
          const { history, historyIndex } = pushHistory(state, parsed);
          return { ...commit, history, historyIndex };
        });
      } catch (error) {
        console.error('Modelo inválido', error);
        throw error;
      }
    },
  };
});
