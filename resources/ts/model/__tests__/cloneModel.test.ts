import { describe, expect, it, vi, afterEach } from 'vitest';

import { cloneModel, createInitialModel } from '../schema';

describe('cloneModel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('omite eventos antes de clonar el modelo y registra la sanitización', () => {
    const model = createInitialModel();
    const event = new Event('pointerdown');
    (model.nodes[0] as Record<string, unknown>).ultimaInteraccion = event;

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const cloned = cloneModel(model);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [, debugPayload] = debugSpy.mock.calls[0];
    expect(debugPayload).toMatchObject({
      total: 1,
    });
    expect(debugPayload.detalles[0]).toMatchObject({
      path: 'nodes > 0 > ultimaInteraccion',
      reason: 'event',
    });

    expect((model.nodes[0] as Record<string, unknown>).ultimaInteraccion).toBe(event);
    expect((cloned.nodes[0] as Record<string, unknown>).ultimaInteraccion).toBeUndefined();
  });

  it('elimina funciones no clonables en estructuras anidadas', () => {
    const model = createInitialModel();
    const marker = Symbol('funcion');
    (model.nodes[0] as Record<string, unknown>)[marker] = () => 'noop';

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const cloned = cloneModel(model);

    expect(debugSpy).toHaveBeenCalled();
    const [, debugPayload] = debugSpy.mock.calls.at(-1)!;
    expect(debugPayload.total).toBeGreaterThanOrEqual(1);

    const functionEntry = debugPayload.detalles.find(
      (entry: { path: string; reason: string }) => entry.reason === 'function',
    );
    expect(functionEntry).toBeDefined();
    expect(functionEntry.path).toContain('Symbol(funcion)');

    expect((cloned.nodes[0] as Record<string, unknown>)[marker]).toBeUndefined();
  });
});
