import { z } from 'zod';
export const GRID_SIZE = 24;

export const unitsSchema = z.enum(['SI', 'US']);
export type SystemUnits = z.infer<typeof unitsSchema>;

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const baseNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: pointSchema,
  locked: z.boolean().default(false),
  groupId: z.string().nullable().default(null),
});

const tankDimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  shape: z.enum(['rectangular', 'cylindrical']).default('rectangular'),
  orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
  rotation: z.number().default(0),
});

export const tankNodeSchema = baseNodeSchema.extend({
  kind: z.literal('tank'),
  dimensions: tankDimensionsSchema,
  properties: z.object({
    baseElevation: z.number(),
    referenceElevation: z.number().default(0),
    fluidLevel: z.number().nonnegative(),
    volume: z.number().nonnegative().default(0),
    isSealed: z.boolean().default(false),
    gasPressure: z.number().nonnegative().default(101325),
    operatingTemperature: z.number().optional(),
  }),
});

export const pumpNodeSchema = baseNodeSchema.extend({
  kind: z.literal('pump'),
  properties: z.object({
    centerlineElevation: z.number(),
    referenceElevation: z.number().default(0),
    addedHead: z.number().nonnegative(),
    requiredNpsh: z.number().nonnegative(),
    efficiency: z.number().min(0).max(1),
    suctionNodeId: z.string(),
    dischargeNodeId: z.string(),
    rotation: z.number().default(0),
  }),
});

export const junctionNodeSchema = baseNodeSchema.extend({
  kind: z.literal('junction'),
  properties: z.object({
    elevation: z.number(),
    demand: z.number().nonnegative().default(0),
    referenceElevation: z.number().default(0),
  }),
});

export const valveNodeSchema = baseNodeSchema.extend({
  kind: z.literal('valve'),
  properties: z.object({
    elevation: z.number(),
    lossCoefficient: z.number().nonnegative(),
    status: z.enum(['open', 'throttled', 'closed']).default('open'),
    referenceElevation: z.number().default(0),
  }),
});

export const regulatorNodeSchema = baseNodeSchema.extend({
  kind: z.literal('regulator'),
  properties: z.object({
    elevation: z.number(),
    setpointPressure: z.number(),
    tolerance: z.number().nonnegative().default(0.05),
    referenceElevation: z.number().default(0),
  }),
});

export const meterNodeSchema = baseNodeSchema.extend({
  kind: z.literal('meter'),
  properties: z.object({
    elevation: z.number(),
    measuredQuantity: z.enum(['flow', 'pressure', 'velocity']).default('flow'),
    referenceElevation: z.number().default(0),
  }),
});

export const nodeSchema = z.discriminatedUnion('kind', [
  tankNodeSchema,
  pumpNodeSchema,
  junctionNodeSchema,
  valveNodeSchema,
  regulatorNodeSchema,
  meterNodeSchema,
]);

export type TankNode = z.infer<typeof tankNodeSchema>;
export type PumpNode = z.infer<typeof pumpNodeSchema>;
export type JunctionNode = z.infer<typeof junctionNodeSchema>;
export type ValveNode = z.infer<typeof valveNodeSchema>;
export type RegulatorNode = z.infer<typeof regulatorNodeSchema>;
export type MeterNode = z.infer<typeof meterNodeSchema>;
export type SystemNode = z.infer<typeof nodeSchema>;

export const pipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  from: z.string(),
  to: z.string(),
  diameter: z.number().positive(),
  length: z.number().positive(),
  roughness: z.number().nonnegative(),
  flowRate: z.number().nonnegative(),
  minorLossK: z.number().nonnegative(),
});

export type SystemPipe = z.infer<typeof pipeSchema>;

export const systemModelSchema = z.object({
  version: z.literal('1.0.0'),
  units: unitsSchema,
  ambientPressure: z.number().positive(),
  fluidId: z.string(),
  nodes: z.array(nodeSchema),
  pipes: z.array(pipeSchema),
});

export type SystemModel = z.infer<typeof systemModelSchema>;

export const createInitialModel = (): SystemModel => ({
  version: '1.0.0',
  units: 'SI',
  ambientPressure: 101325,
  fluidId: 'water',
  nodes: [
    {
      id: 'tank-1',
      kind: 'tank',
      name: 'Tanque de succión',
      position: { x: 160, y: 260 },
      dimensions: {
        width: 160,
        height: 220,
        shape: 'rectangular',
        orientation: 'vertical',
        rotation: 0,
      },
      properties: {
        baseElevation: 0,
        referenceElevation: 0,
        fluidLevel: 4,
        volume: 12,
        isSealed: false,
        gasPressure: 101325,
        operatingTemperature: 20,
      },
    },
    {
      id: 'pump-1',
      kind: 'pump',
      name: 'Bomba centrífuga',
      position: { x: 420, y: 320 },
      properties: {
        centerlineElevation: 0.5,
        referenceElevation: 0,
        addedHead: 20,
        requiredNpsh: 3,
        efficiency: 0.72,
        suctionNodeId: 'tank-1',
        dischargeNodeId: 'junction-1',
        rotation: 0,
      },
    },
    {
      id: 'junction-1',
      kind: 'junction',
      name: 'Descarga',
      position: { x: 720, y: 220 },
      properties: {
        elevation: 12,
        demand: 0.01,
        referenceElevation: 12,
      },
    },
  ],
  pipes: [
    {
      id: 'pipe-1',
      name: 'Succión',
      from: 'tank-1',
      to: 'pump-1',
      diameter: 0.1,
      length: 4,
      roughness: 0.000045,
      flowRate: 0.01,
      minorLossK: 1.5,
    },
    {
      id: 'pipe-2',
      name: 'Descarga',
      from: 'pump-1',
      to: 'junction-1',
      diameter: 0.08,
      length: 35,
      roughness: 0.000045,
      flowRate: 0.01,
      minorLossK: 2.1,
    },
  ],
});

export const parseSystemModel = (payload: unknown): SystemModel => {
  return systemModelSchema.parse(payload);
};

const isEventLike = (candidate: unknown): candidate is Event => {
  if (typeof Event === 'undefined') {
    return false;
  }
  return candidate instanceof Event;
};

const describeValueType = (value: unknown): string => {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'object') {
    return (value as { constructor?: { name?: string } }).constructor?.name ?? 'Object';
  }
  return typeof value;
};

type SanitizationReason = 'event' | 'function' | 'symbol';

type SanitizationLogEntry = {
  path: string;
  reason: SanitizationReason;
  valueType: string;
  details?: Record<string, unknown>;
};

const NON_CLONEABLE_SKIP = Symbol('non-cloneable-skip');

type SanitizedValue<T> = T | typeof NON_CLONEABLE_SKIP;

const formatPath = (segments: Array<string | number>): string => {
  if (segments.length === 0) {
    return '<root>';
  }
  return segments.map((segment) => segment.toString()).join(' > ');
};

const logSanitization = (
  logEntries: SanitizationLogEntry[],
  path: Array<string | number>,
  reason: SanitizationReason,
  value: unknown,
  details?: Record<string, unknown>,
) => {
  const enrichedDetails = details && Object.keys(details).length > 0 ? details : undefined;
  logEntries.push({
    path: formatPath(path),
    reason,
    valueType: describeValueType(value),
    details: enrichedDetails,
  });
};

const sanitizeForCloning = <T>(
  value: T,
  logEntries: SanitizationLogEntry[],
  path: Array<string | number>,
  seen: WeakMap<object, unknown>,
): SanitizedValue<T> => {
  if (typeof value === 'function') {
    logSanitization(logEntries, path, 'function', value, {
      name: (value as { name?: string }).name,
    });
    return NON_CLONEABLE_SKIP;
  }
  if (typeof value === 'symbol') {
    logSanitization(logEntries, path, 'symbol', value, {
      description: (value as symbol).description,
    });
    return NON_CLONEABLE_SKIP;
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (isEventLike(value)) {
    const eventDetails: Record<string, unknown> = {
      type: (value as Event).type,
      isTrusted: (value as Event).isTrusted,
    };
    if (typeof (value as Event).composedPath === 'function') {
      try {
        eventDetails.composedPathLength = (value as Event).composedPath().length;
      } catch (error) {
        eventDetails.composedPathError = (error as Error).message;
      }
    }
    logSanitization(logEntries, path, 'event', value, eventDetails);
    return NON_CLONEABLE_SKIP;
  }
  const objectValue = value as unknown as object;
  const cached = seen.get(objectValue);
  if (cached) {
    return cached as T;
  }
  if (Array.isArray(value)) {
    const clone: unknown[] = new Array(value.length);
    seen.set(objectValue, clone);
    value.forEach((entry, index) => {
      const sanitized = sanitizeForCloning(entry, logEntries, [...path, index], seen);
      if (sanitized !== NON_CLONEABLE_SKIP) {
        clone[index] = sanitized;
      }
    });
    return clone as T;
  }
  if (value instanceof Map) {
    const clone = new Map<unknown, unknown>();
    seen.set(objectValue, clone);
    for (const [key, entry] of value.entries()) {
      const sanitized = sanitizeForCloning(entry, logEntries, [...path, `Map(${String(key)})`], seen);
      if (sanitized !== NON_CLONEABLE_SKIP) {
        clone.set(key, sanitized);
      }
    }
    return clone as T;
  }
  if (value instanceof Set) {
    const clone = new Set<unknown>();
    seen.set(objectValue, clone);
    let index = 0;
    for (const entry of value.values()) {
      const sanitized = sanitizeForCloning(entry, logEntries, [...path, `Set(${index})`], seen);
      index += 1;
      if (sanitized !== NON_CLONEABLE_SKIP) {
        clone.add(sanitized);
      }
    }
    return clone as T;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype === Object.prototype || prototype === null) {
    const clone: Record<string | symbol, unknown> = {};
    seen.set(objectValue, clone);
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const sanitized = sanitizeForCloning(entry, logEntries, [...path, key], seen);
      if (sanitized !== NON_CLONEABLE_SKIP) {
        clone[key] = sanitized;
      }
    }
    for (const symbolKey of Object.getOwnPropertySymbols(value as object)) {
      const sanitized = sanitizeForCloning(
        (value as Record<string | symbol, unknown>)[symbolKey],
        logEntries,
        [...path, symbolKey.toString()],
        seen,
      );
      if (sanitized !== NON_CLONEABLE_SKIP) {
        clone[symbolKey] = sanitized;
      }
    }
    return clone as T;
  }
  seen.set(objectValue, value);
  return value;
};

const prepareForCloning = <T>(value: T) => {
  const logEntries: SanitizationLogEntry[] = [];
  const sanitized = sanitizeForCloning(value, logEntries, [], new WeakMap());
  return {
    sanitized: (sanitized === NON_CLONEABLE_SKIP ? undefined : sanitized) as T,
    logEntries,
  };
};

const jsonClone = <T>(value: T): T => {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue) => {
      if (typeof currentValue === 'function' || typeof currentValue === 'symbol') {
        return undefined;
      }
      if (isEventLike(currentValue)) {
        return undefined;
      }
      if (typeof PointerEvent !== 'undefined' && currentValue instanceof PointerEvent) {
        return undefined;
      }
      return currentValue;
    }),
  ) as T;
};

const cloneDeep = <T>(value: T): T => {
  const { sanitized, logEntries } = prepareForCloning(value);
  if (logEntries.length > 0) {
    console.debug('Valores no clonables omitidos antes de clonar el modelo.', {
      total: logEntries.length,
      detalles: logEntries,
    });
  }
  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(sanitized);
    } catch (error) {
      console.warn('No se pudo clonar usando structuredClone, se usará una copia segura.', error, {
        sanitizedPreview: sanitized,
        sanitizationLog: logEntries,
      });
    }
  }
  return jsonClone(sanitized);
};

export const cloneModel = (model: SystemModel): SystemModel =>
  cloneDeep(model);

const defaultTankDimensions = {
  width: 160,
  height: 220,
  shape: 'rectangular' as const,
  orientation: 'vertical' as const,
  rotation: 0,
};

const defaultTankProperties = {
  baseElevation: 0,
  referenceElevation: 0,
  fluidLevel: 4,
  volume: 10,
  isSealed: false,
  gasPressure: 101325,
  operatingTemperature: 20,
};

const defaultPumpProperties = {
  centerlineElevation: 0.5,
  referenceElevation: 0,
  addedHead: 18,
  requiredNpsh: 3,
  efficiency: 0.72,
  suctionNodeId: '',
  dischargeNodeId: '',
  rotation: 0,
};

const defaultJunctionProperties = {
  elevation: 0,
  demand: 0,
  referenceElevation: 0,
};

const defaultValveProperties = {
  elevation: 0,
  lossCoefficient: 2.5,
  status: 'open' as const,
  referenceElevation: 0,
};

const defaultRegulatorProperties = {
  elevation: 0,
  setpointPressure: 250000,
  tolerance: 0.05,
  referenceElevation: 0,
};

const defaultMeterProperties = {
  elevation: 0,
  measuredQuantity: 'flow' as const,
  referenceElevation: 0,
};

export const createTankNode = (options: {
  id: string;
  name: string;
  position: { x: number; y: number };
  dimensions?: Partial<TankNode['dimensions']>;
  properties?: Partial<TankNode['properties']>;
}): TankNode => ({
  id: options.id,
  kind: 'tank',
  name: options.name,
  position: options.position,
  dimensions: {
    ...defaultTankDimensions,
    ...(options.dimensions ?? {}),
  },
  properties: {
    ...defaultTankProperties,
    ...(options.properties ?? {}),
  },
});

export const createPumpNode = (options: {
  id: string;
  name: string;
  position: { x: number; y: number };
  properties?: Partial<PumpNode['properties']>;
}): PumpNode => ({
  id: options.id,
  kind: 'pump',
  name: options.name,
  position: options.position,
  properties: {
    ...defaultPumpProperties,
    ...(options.properties ?? {}),
  },
});

export const createJunctionNode = (options: {
  id: string;
  name: string;
  position: { x: number; y: number };
  properties?: Partial<JunctionNode['properties']>;
}): JunctionNode => ({
  id: options.id,
  kind: 'junction',
  name: options.name,
  position: options.position,
  properties: {
    ...defaultJunctionProperties,
    ...(options.properties ?? {}),
  },
});

export const createValveNode = (options: {
  id: string;
  name: string;
  position: { x: number; y: number };
  properties?: Partial<ValveNode['properties']>;
}): ValveNode => ({
  id: options.id,
  kind: 'valve',
  name: options.name,
  position: options.position,
  properties: {
    ...defaultValveProperties,
    ...(options.properties ?? {}),
  },
});

export const createRegulatorNode = (options: {
  id: string;
  name: string;
  position: { x: number; y: number };
  properties?: Partial<RegulatorNode['properties']>;
}): RegulatorNode => ({
  id: options.id,
  kind: 'regulator',
  name: options.name,
  position: options.position,
  properties: {
    ...defaultRegulatorProperties,
    ...(options.properties ?? {}),
  },
});

export const createMeterNode = (options: {
  id: string;
  name: string;
  position: { x: number; y: number };
  properties?: Partial<MeterNode['properties']>;
}): MeterNode => ({
  id: options.id,
  kind: 'meter',
  name: options.name,
  position: options.position,
  properties: {
    ...defaultMeterProperties,
    ...(options.properties ?? {}),
  },
});
