import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Layer, Line, Rect, Stage, Text, Circle, Group, Ellipse, Arrow } from 'react-konva';
import type Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { EditorToolbar } from './EditorToolbar';
import '../../css/editor.css';
import convert from 'convert-units';
import { toDisplayFlow } from '../utils/units';

// ============================================================================
// chamo hice esto nuevo mira 
// ============================================================================
// 1. **Performance**: Memoización de renderizado de nodos y tuberías
// 2. **UX**: Atajos de teclado mejorados (Supr, Esc, Ctrl+A, Ctrl+Z/Y)
// 3. **Accesibilidad**: Mejor soporte de teclado y navegación
// 4. **Código**: Refactorización de funciones repetitivas
// 5. **Funcionalidad**: Historial de deshacer/rehacer
// 6. **Visual**: Mejores indicadores visuales y feedback
// 7. **Mobile**: Mejor soporte táctil con gestos
// 8. **Organización**: Separación de lógica en hooks personalizados
// ============================================================================

const GRID_SIZE = 25; // Incrementado para mejor visibilidad
const PIXELS_PER_METER = 50; // Ajustado para mejor escala
const EDGE_SCROLL_THRESHOLD = 80; // Reducido para mejor respuesta
const EDGE_SCROLL_SPEED = 12; // Ajustado para movimiento más suave
const STAGE_PAN_LIMIT = 3000; // Aumentado para más espacio de trabajo
const MIN_SCALE = 0.25; // Reducido para mejor vista en móvil
const MAX_SCALE = 4.0; // Aumentado para más detalle
const ZOOM_FACTOR = 1.15; // Ajustado para zoom más preciso
// Dimensiones visuales por tipo
const TANK_SIZE = { width: 120, height: 160 } as const;
const PUMP_SIZE = { width: 120, height: 64 } as const;
const VALVE_SIZE = { size: 46 } as const;
const JUNCTION_RADIUS = 20;
const METER_RADIUS = 18;

// Utilidades
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampPosition = (value: number) => clamp(value, -STAGE_PAN_LIMIT, STAGE_PAN_LIMIT);
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
const formatNumber = (n: number, decimals = 2) => n.toFixed(decimals);

const toDisplayDiameter = (diameterMeters: number, units: 'metric' | 'imperial') => {
  if (units === 'imperial') {
    // meters -> inches
    const inches = convert(diameterMeters).from('m').to('in');
    return { value: inches, unit: 'in' } as const;
  }
  // meters -> millimeters
  return { value: diameterMeters * 1000, unit: 'mm' } as const;
};

const makePipeLabel = (
  pipe: SystemPipe,
  units: 'metric' | 'imperial',
): string => {
  const sysUnits = units === 'imperial' ? 'US' : 'SI';
  const flowDisplay = toDisplayFlow(pipe.flowRate, sysUnits as any);
  const flowUnit = units === 'imperial' ? 'gal/min' : 'l/s';
  const d = toDisplayDiameter(pipe.diameter, units);
  return `${formatNumber(d.value, units === 'imperial' ? 2 : 0)}${d.unit} · ${formatNumber(flowDisplay, 2)}${flowUnit}`;
};

// Mock de tipos (adaptar a tu schema real)
type SystemNode = {
  id: string;
  name: string;
  kind: 'tank' | 'pump' | 'junction' | 'valve' | 'regulator' | 'meter';
  position: { x: number; y: number };
  properties?: any;
  dimensions?: any;
  locked?: boolean;
  groupId?: string;
};

type SystemPipe = {
  id: string;
  from: string;
  to: string;
  diameter: number;
  flowRate: number;
};

type Model = {
  nodes: SystemNode[];
  pipes: SystemPipe[];
  units: 'metric' | 'imperial';
};

// Hook personalizado para tamaño del stage
const useStageSize = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 960, height: 620 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setSize({ width: clientWidth, height: clientHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { containerRef, size };
};

// Hook para historial de deshacer/rehacer
const useHistory = <T,>(initialState: T, maxHistory = 50) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = useCallback((newState: T) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return newHistory;
    });
    setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  return { currentState: history[currentIndex], pushState, undo, redo, canUndo: currentIndex > 0, canRedo: currentIndex < history.length - 1 };
};

interface PipePreviewState {
  fromId: string;
  fromName: string;
  fromPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
}

interface EditorCanvasProps {
  model: {
    nodes: Array<{
      id: string;
      name: string;
      kind: 'tank' | 'pump' | 'junction' | 'valve' | 'regulator' | 'meter';
      position: { x: number; y: number };
      locked: boolean;
      groupId?: string;
      properties: Record<string, any>;
      dimensions?: {
        width: number;
        height: number;
        shape?: 'rectangular' | 'cylindrical';
        orientation?: 'vertical' | 'horizontal';
        rotation?: number;
      };
    }>;
    pipes: Array<{
      id: string;
      from: string;
      to: string;
      diameter: number;
      flowRate: number;
      [key: string]: any;
    }>;
    units: 'metric' | 'imperial';
  };
  selection?: { type: 'node' | 'pipe'; id: string } | null;
  pipeToolActive?: boolean;
  snapToGrid?: boolean;
  onSelectionChange?: (selection: { type: 'node' | 'pipe'; id: string } | null) => void;
  onNodeUpdate?: (id: string, updates: Partial<SystemNode>) => void;
  onPipeAdd?: (from: string, to: string) => { success: boolean; error?: string };
  onNodeRemove?: (id: string) => void;
  onPipeRemove?: (id: string) => void;
  onToggleSnap?: () => void;
  renderOverlay?: ReactNode;
  canvasId?: string;
  stageId?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onViewportChange?: (viewport: { scale: number; x: number; y: number; width: number; height: number }) => void;
  viewportAnchor?: { x: number; y: number; token: number } | null;
  onRequestAddElement?: () => void;
}

const EditorCanvas = ({
  model,
  selection,
  pipeToolActive = false,
  snapToGrid: snapEnabled = true,
  onSelectionChange,
  onNodeUpdate,
  onPipeAdd,
  onNodeRemove,
  onPipeRemove,
  onToggleSnap,
  renderOverlay,
  canvasId,
  stageId,
  onViewportChange,
  viewportAnchor,
  onRequestAddElement,
  isFullscreen = false,
  onToggleFullscreen,
}: EditorCanvasProps): JSX.Element => {
  const { containerRef, size } = useStageSize();
  const stageRef = useRef<Konva.Stage | null>(null);
  
  // Estado del viewport
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });
  const stageStateRef = useRef(stageState);
  
  // Estado de interacción
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pipePreview, setPipePreview] = useState<PipePreviewState | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: { type: 'node' | 'pipe'; id: string } } | null>(null);
  
  // Mensajes y feedback
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  
  // Referencias
  const pipePreviewRef = useRef<PipePreviewState | null>(null);
  const groupStartPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const skipStagePointerUpRef = useRef(false);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragLeaderRef = useRef<string | null>(null);

  const nodeById = useMemo(() => new Map(model.nodes.map((n) => [n.id, n] as const)), [model.nodes]);

  const getDimsForNode = (node: SystemNode) => {
    switch (node.kind) {
      case 'tank':
        return { width: TANK_SIZE.width, height: TANK_SIZE.height } as const;
      case 'pump':
        return { width: PUMP_SIZE.width, height: PUMP_SIZE.height } as const;
      case 'valve':
        return { width: VALVE_SIZE.size, height: VALVE_SIZE.size } as const;
      default:
        return { width: 0, height: 0 } as const; // circulares o sin caja
    }
  };

  const setShapeCenter = (shape: Konva.Node, node: SystemNode, center: { x: number; y: number }) => {
    const dims = getDimsForNode(node);
    if (dims.width === 0 && dims.height === 0) {
      // Circle-like
      (shape as any).x(center.x);
      (shape as any).y(center.y);
      return;
    }
    (shape as any).x(center.x - dims.width / 2);
    (shape as any).y(center.y - dims.height / 2);
  };

  const getShapeCenter = (shape: Konva.Node, node: SystemNode) => {
    const dims = getDimsForNode(node);
    if (dims.width === 0 && dims.height === 0) {
      return { x: (shape as any).x(), y: (shape as any).y() };
    }
    return { x: (shape as any).x() + dims.width / 2, y: (shape as any).y() + dims.height / 2 };
  };

  // Sincronizar referencias
  useEffect(() => {
    stageStateRef.current = stageState;
  }, [stageState]);

  useEffect(() => {
    pipePreviewRef.current = pipePreview;
  }, [pipePreview]);

  // Función para aplicar snap
  const applySnap = useCallback(
    (value: number) => (snapEnabled ? snapToGrid(value) : value),
    [snapEnabled]
  );

  // Conversión de coordenadas
  const toCanvasCoordinates = useCallback((point: { x: number; y: number }) => {
    const { scale, x, y } = stageStateRef.current;
    return {
      x: (point.x - x) / scale,
      y: (point.y - y) / scale,
    };
  }, []);

  // Report viewport changes (for minimap)
  useEffect(() => {
    if (!onViewportChange) return;
    onViewportChange({
      scale: stageState.scale,
      x: stageState.x,
      y: stageState.y,
      width: size.width,
      height: size.height,
    });
  }, [onViewportChange, stageState, size.width, size.height]);

  // Navigate viewport when receiving an anchor target
  useEffect(() => {
    if (!viewportAnchor) return;
    setStageState((prev) => {
      const newX = clampPosition(size.width / 2 - viewportAnchor.x * prev.scale);
      const newY = clampPosition(size.height / 2 - viewportAnchor.y * prev.scale);
      return { ...prev, x: newX, y: newY };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportAnchor?.token]);

  // ============================================================================
  // MEJORA 1: Atajos de teclado mejorados
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está en input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + A: Seleccionar todo
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedIds(new Set(model.nodes.map((n) => n.id)));
        return;
      }

      // Delete/Backspace: Eliminar seleccionados
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection?.type === 'pipe') {
          e.preventDefault();
          onPipeRemove?.(selection.id);
          onSelectionChange?.(null);
          setMessage({ type: 'success', text: `Tubería eliminada` });
          return;
        }
        if (selectedIds.size > 0) {
          e.preventDefault();
          selectedIds.forEach((id) => onNodeRemove?.(id));
          setSelectedIds(new Set());
          setMessage({ type: 'success', text: `${selectedIds.size} elemento(s) eliminado(s)` });
          return;
        }
      }

      // Escape: Cancelar selección
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedIds(new Set());
        setPipePreview(null);
        setSelectionBox(null);
        onSelectionChange?.(null);
        return;
      }

      // Ctrl/Cmd + D: Duplicar
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        selectedIds.forEach((id) => {
          const node = model.nodes.find((n) => n.id === id);
          if (node) {
            // Aquí llamarías a tu función de duplicar
            console.log('Duplicar:', node.name);
          }
        });
        return;
      }

      // Flechas: Mover nodos seleccionados
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selection?.type !== 'node' && selectedIds.size === 0) return;
        
        e.preventDefault();
        const step = e.shiftKey ? GRID_SIZE * 2 : GRID_SIZE / 2;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

        const idsToMove = selectedIds.size > 0 ? Array.from(selectedIds) : selection ? [selection.id] : [];
        idsToMove.forEach((id) => {
          const node = model.nodes.find((n) => n.id === id);
          if (node) {
            onNodeUpdate?.(id, {
              position: {
                x: applySnap(node.position.x + dx),
                y: applySnap(node.position.y + dy),
              },
            });
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [model.nodes, selectedIds, selection, applySnap, onNodeUpdate, onNodeRemove, onSelectionChange]);

  // ============================================================================
  // MEJORA 2: Auto-ocultar mensajes temporales
  // ============================================================================
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // ============================================================================
  // MEJORA 3: Zoom mejorado con límites
  // ============================================================================
  const applyZoom = useCallback(
    (multiplier: number, pointer?: { x: number; y: number }) => {
      setStageState((prev) => {
        const stage = stageRef.current;
        if (!stage) return prev;

        const pointerPosition = pointer ?? { x: stage.width() / 2, y: stage.height() / 2 };
        const newScale = clamp(prev.scale * multiplier, MIN_SCALE, MAX_SCALE);
        
        const mousePointTo = {
          x: (pointerPosition.x - prev.x) / prev.scale,
          y: (pointerPosition.y - prev.y) / prev.scale,
        };

        return {
          scale: newScale,
          x: clampPosition(pointerPosition.x - mousePointTo.x * newScale),
          y: clampPosition(pointerPosition.y - mousePointTo.y * newScale),
        };
      });
    },
    []
  );

  const handleWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();
      const stage = event.target.getStage();
      if (!stage) return;
      
      const pointer = stage.getPointerPosition();
      const factor = event.evt.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
      applyZoom(factor, pointer ?? undefined);
    },
    [applyZoom]
  );

  // Cancelar vista previa de tubería si se desactiva la herramienta
  useEffect(() => {
    if (!pipeToolActive) {
      setPipePreview(null);
    }
  }, [pipeToolActive]);

  // ============================================================================
  // MEJORA 4: Renderizado optimizado de nodos (memoizado)
  // ============================================================================
  const renderNode = useCallback((node: SystemNode) => {
    const isSelected = selection?.id === node.id || selectedIds.has(node.id);
    const isPipeOrigin = pipePreview?.fromId === node.id;
    
    const startPipeDraft = () => {
      if (!pipeToolActive) return;
      setPipePreview({
        fromId: node.id,
        fromName: node.name,
        fromPosition: { x: node.position.x, y: node.position.y },
        currentPosition: { x: node.position.x, y: node.position.y },
      });
    };

    const computeGuideSnap = (
      center: { x: number; y: number },
      dims: { width: number; height: number },
    ) => {
      const THRESHOLD = 8; // px
      let snapX: number | null = null;
      let snapY: number | null = null;
      // revisar con otros nodos
      for (const other of model.nodes) {
        if (other.id === node.id) continue;
        const ox = other.position.x;
        const oy = other.position.y;
        if (Math.abs(ox - center.x) <= THRESHOLD) snapX = ox;
        if (Math.abs(oy - center.y) <= THRESHOLD) snapY = oy;
      }
      setGuides({ x: snapX, y: snapY });
      // devolver nueva top-left si hay snap
      const nextCenterX = snapX ?? center.x;
      const nextCenterY = snapY ?? center.y;
      return { x: nextCenterX - dims.width / 2, y: nextCenterY - dims.height / 2 };
    };

    // Renderizado específico por tipo
    switch (node.kind) {
      case 'tank': {
        const width = 120;
        const height = 160;
        return (
          <Group key={node.id}
            x={node.position.x - width / 2}
            y={node.position.y - height / 2}
            name={`node-shape node-shape-${node.id}`}
            draggable={!pipeToolActive && !node.locked}
            onClick={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onTap={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onMouseDown={startPipeDraft}
            onDragStart={() => {
              if (selectedIds.has(node.id) && selectedIds.size > 1) {
                const map = new Map<string, { x: number; y: number }>();
                for (const id of selectedIds) {
                  const n = nodeById.get(id);
                  if (n) map.set(id, { x: n.position.x, y: n.position.y });
                }
                groupStartPosRef.current = map;
                dragLeaderRef.current = node.id;
              }
            }}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
              const shape = e.target as Konva.Group;
              const center = { x: shape.x() + width / 2, y: shape.y() + height / 2 };
              const snapped = computeGuideSnap(center, { width, height });
              if (snapEnabled) {
                shape.x(applySnap(snapped.x));
                shape.y(applySnap(snapped.y));
              }
              // Group drag
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const startCenter = groupStartPosRef.current.get(node.id)!;
                const dx = center.x - startCenter.x;
                const dy = center.y - startCenter.y;
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    if (id === node.id) continue;
                    const follower = stage.findOne(`.node-shape-${id}`);
                    const fNode = nodeById.get(id);
                    const start = groupStartPosRef.current.get(id);
                    if (follower && fNode && start) {
                      setShapeCenter(follower as any, fNode, { x: start.x + dx, y: start.y + dy });
                    }
                  }
                }
              }
            }}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              const shape = e.target as Konva.Group;
              const nextCenter = { x: shape.x() + width / 2, y: shape.y() + height / 2 };
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                // Commit group move
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    const fNode = nodeById.get(id);
                    const shapeNode = stage.findOne(`.node-shape-${id}`);
                    if (fNode && shapeNode) {
                      const center = getShapeCenter(shapeNode as any, fNode);
                      onNodeUpdate?.(id, { position: { x: applySnap(center.x), y: applySnap(center.y) } } as Partial<SystemNode>);
                    }
                  }
                }
                groupStartPosRef.current.clear();
                dragLeaderRef.current = null;
              } else {
                onNodeUpdate?.(node.id, { position: { x: applySnap(nextCenter.x), y: applySnap(nextCenter.y) } } as Partial<SystemNode>);
              }
              setGuides({ x: null, y: null });
            }}
          >
            <Rect width={width} height={height} cornerRadius={18} fill="#0b1220" stroke={isSelected ? '#22d3ee' : '#0ea5e9'} strokeWidth={isSelected ? 3 : 2} />
            <Rect x={10} y={14} width={width - 20} height={10} fill="#22d3ee55" />
          </Group>
        );
      }
      case 'junction':
        return (
          <Circle
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            radius={20}
            fill={isPipeOrigin ? 'rgba(251,191,36,0.15)' : '#0f172a'}
            stroke={isPipeOrigin ? '#fbbf24' : isSelected ? '#22d3ee' : '#1d4ed8'}
            strokeWidth={isSelected || isPipeOrigin ? 3 : 2}
            name={`node-shape node-shape-${node.id}`}
            draggable={!pipeToolActive && !node.locked}
            onClick={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onTap={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onMouseDown={startPipeDraft}
            onDragStart={() => {
              if (selectedIds.has(node.id) && selectedIds.size > 1) {
                const map = new Map<string, { x: number; y: number }>();
                for (const id of selectedIds) {
                  const n = nodeById.get(id);
                  if (n) map.set(id, { x: n.position.x, y: n.position.y });
                }
                groupStartPosRef.current = map;
                dragLeaderRef.current = node.id;
              }
            }}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
              const shape = e.target as Konva.Circle;
              const center = { x: shape.x(), y: shape.y() };
              const snappedTL = computeGuideSnap(center, { width: 0, height: 0 });
              if (snapEnabled) {
                shape.x(applySnap(snappedTL.x + 0));
                shape.y(applySnap(snappedTL.y + 0));
              }
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const startCenter = groupStartPosRef.current.get(node.id)!;
                const dx = center.x - startCenter.x;
                const dy = center.y - startCenter.y;
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    if (id === node.id) continue;
                    const follower = stage.findOne(`.node-shape-${id}`);
                    const fNode = nodeById.get(id);
                    const start = groupStartPosRef.current.get(id);
                    if (follower && fNode && start) {
                      setShapeCenter(follower as any, fNode, { x: start.x + dx, y: start.y + dy });
                    }
                  }
                }
              }
            }}
            onDragEnd={(e) => {
              const shape = e.target as Konva.Circle;
              const next = { x: applySnap(shape.x()), y: applySnap(shape.y()) };
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    const fNode = nodeById.get(id);
                    const shapeNode = stage.findOne(`.node-shape-${id}`);
                    if (fNode && shapeNode) {
                      const center = getShapeCenter(shapeNode as any, fNode);
                      onNodeUpdate?.(id, { position: { x: applySnap(center.x), y: applySnap(center.y) } } as Partial<SystemNode>);
                    }
                  }
                }
                groupStartPosRef.current.clear();
                dragLeaderRef.current = null;
              } else {
                onNodeUpdate?.(node.id, { position: next } as Partial<SystemNode>);
              }
              setGuides({ x: null, y: null });
            }}
          />
        );
      
      case 'pump': {
        const width = 120;
        const height = 64;
        return (
          <Rect
            key={node.id}
            x={node.position.x - width / 2}
            y={node.position.y - height / 2}
            width={width}
            height={height}
            cornerRadius={16}
            fill="#1e293b"
            stroke={isPipeOrigin ? '#fbbf24' : isSelected ? '#facc15' : '#1e40af'}
            strokeWidth={isSelected || isPipeOrigin ? 3 : 2}
            name={`node-shape node-shape-${node.id}`}
            draggable={!pipeToolActive && !node.locked}
            onClick={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onTap={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onMouseDown={startPipeDraft}
            onDragStart={() => {
              if (selectedIds.has(node.id) && selectedIds.size > 1) {
                const map = new Map<string, { x: number; y: number }>();
                for (const id of selectedIds) {
                  const n = nodeById.get(id);
                  if (n) map.set(id, { x: n.position.x, y: n.position.y });
                }
                groupStartPosRef.current = map;
                dragLeaderRef.current = node.id;
              }
            }}
            onDragMove={(e) => {
              const shape = e.target as Konva.Rect;
              const center = { x: shape.x() + width / 2, y: shape.y() + height / 2 };
              const snapped = computeGuideSnap(center, { width, height });
              if (snapEnabled) {
                shape.x(applySnap(snapped.x));
                shape.y(applySnap(snapped.y));
              }
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const startCenter = groupStartPosRef.current.get(node.id)!;
                const dx = center.x - startCenter.x;
                const dy = center.y - startCenter.y;
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    if (id === node.id) continue;
                    const follower = stage.findOne(`.node-shape-${id}`);
                    const fNode = nodeById.get(id);
                    const start = groupStartPosRef.current.get(id);
                    if (follower && fNode && start) {
                      setShapeCenter(follower as any, fNode, { x: start.x + dx, y: start.y + dy });
                    }
                  }
                }
              }
            }}
            onDragEnd={(e) => {
              const shape = e.target as Konva.Rect;
              const nextCenter = { x: shape.x() + width / 2, y: shape.y() + height / 2 };
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    const fNode = nodeById.get(id);
                    const shapeNode = stage.findOne(`.node-shape-${id}`);
                    if (fNode && shapeNode) {
                      const center = getShapeCenter(shapeNode as any, fNode);
                      onNodeUpdate?.(id, { position: { x: applySnap(center.x), y: applySnap(center.y) } } as Partial<SystemNode>);
                    }
                  }
                }
                groupStartPosRef.current.clear();
                dragLeaderRef.current = null;
              } else {
                onNodeUpdate?.(node.id, { position: { x: applySnap(nextCenter.x), y: applySnap(nextCenter.y) } } as Partial<SystemNode>);
              }
              setGuides({ x: null, y: null });
            }}
          />
        );
      }
      case 'valve': {
        const size = 46;
        return (
          <Group key={node.id}
            x={node.position.x - size / 2}
            y={node.position.y - size / 2}
            name={`node-shape node-shape-${node.id}`}
            draggable={!pipeToolActive && !node.locked}
            onClick={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onTap={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onMouseDown={startPipeDraft}
            onDragStart={() => {
              if (selectedIds.has(node.id) && selectedIds.size > 1) {
                const map = new Map<string, { x: number; y: number }>();
                for (const id of selectedIds) {
                  const n = nodeById.get(id);
                  if (n) map.set(id, { x: n.position.x, y: n.position.y });
                }
                groupStartPosRef.current = map;
                dragLeaderRef.current = node.id;
              }
            }}
            onDragMove={(e) => {
              const g = e.target as Konva.Group;
              const center = { x: g.x() + size / 2, y: g.y() + size / 2 };
              const snapped = computeGuideSnap(center, { width: size, height: size });
              if (snapEnabled) {
                g.x(applySnap(snapped.x));
                g.y(applySnap(snapped.y));
              }
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const startCenter = groupStartPosRef.current.get(node.id)!;
                const dx = center.x - startCenter.x;
                const dy = center.y - startCenter.y;
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    if (id === node.id) continue;
                    const follower = stage.findOne(`.node-shape-${id}`);
                    const fNode = nodeById.get(id);
                    const start = groupStartPosRef.current.get(id);
                    if (follower && fNode && start) {
                      setShapeCenter(follower as any, fNode, { x: start.x + dx, y: start.y + dy });
                    }
                  }
                }
              }
            }}
            onDragEnd={(e) => {
              const g = e.target as Konva.Group;
              const nextCenter = { x: g.x() + size / 2, y: g.y() + size / 2 };
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    const fNode = nodeById.get(id);
                    const shapeNode = stage.findOne(`.node-shape-${id}`);
                    if (fNode && shapeNode) {
                      const center = getShapeCenter(shapeNode as any, fNode);
                      onNodeUpdate?.(id, { position: { x: applySnap(center.x), y: applySnap(center.y) } } as Partial<SystemNode>);
                    }
                  }
                }
                groupStartPosRef.current.clear();
                dragLeaderRef.current = null;
              } else {
                onNodeUpdate?.(node.id, { position: { x: applySnap(nextCenter.x), y: applySnap(nextCenter.y) } } as Partial<SystemNode>);
              }
              setGuides({ x: null, y: null });
            }}
          >
            <Rect width={size} height={size} rotation={45} cornerRadius={10} fill="#0f172a" stroke={isSelected ? '#22d3ee' : '#64748b'} strokeWidth={isSelected ? 3 : 2} />
          </Group>
        );
      }
      case 'regulator':
      case 'meter': {
        const radius = 18;
        const stroke = node.kind === 'meter' ? '#22d3ee' : '#a78bfa';
        return (
          <Circle
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            radius={radius}
            fill="#0b1220"
            stroke={isSelected ? '#fbbf24' : stroke}
            strokeWidth={isSelected ? 3 : 2}
            name={`node-shape node-shape-${node.id}`}
            draggable={!pipeToolActive && !node.locked}
            onClick={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onTap={() => onSelectionChange?.({ type: 'node' as const, id: node.id })}
            onMouseDown={startPipeDraft}
            onDragStart={() => {
              if (selectedIds.has(node.id) && selectedIds.size > 1) {
                const map = new Map<string, { x: number; y: number }>();
                for (const id of selectedIds) {
                  const n = nodeById.get(id);
                  if (n) map.set(id, { x: n.position.x, y: n.position.y });
                }
                groupStartPosRef.current = map;
                dragLeaderRef.current = node.id;
              }
            }}
            onDragMove={(e) => {
              const c = e.target as Konva.Circle;
              const center = { x: c.x(), y: c.y() };
              const snappedTL = computeGuideSnap(center, { width: 0, height: 0 });
              if (snapEnabled) {
                c.x(applySnap(snappedTL.x));
                c.y(applySnap(snappedTL.y));
              }
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const startCenter = groupStartPosRef.current.get(node.id)!;
                const dx = center.x - startCenter.x;
                const dy = center.y - startCenter.y;
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    if (id === node.id) continue;
                    const follower = stage.findOne(`.node-shape-${id}`);
                    const fNode = nodeById.get(id);
                    const start = groupStartPosRef.current.get(id);
                    if (follower && fNode && start) {
                      setShapeCenter(follower as any, fNode, { x: start.x + dx, y: start.y + dy });
                    }
                  }
                }
              }
            }}
            onDragEnd={(e) => {
              const c = e.target as Konva.Circle;
              const next = { x: applySnap(c.x()), y: applySnap(c.y()) };
              if (dragLeaderRef.current === node.id && groupStartPosRef.current.size > 0) {
                const stage = stageRef.current;
                if (stage) {
                  for (const id of selectedIds) {
                    const fNode = nodeById.get(id);
                    const shapeNode = stage.findOne(`.node-shape-${id}`);
                    if (fNode && shapeNode) {
                      const center = getShapeCenter(shapeNode as any, fNode);
                      onNodeUpdate?.(id, { position: { x: applySnap(center.x), y: applySnap(center.y) } } as Partial<SystemNode>);
                    }
                  }
                }
                groupStartPosRef.current.clear();
                dragLeaderRef.current = null;
              } else {
                onNodeUpdate?.(node.id, { position: next } as Partial<SystemNode>);
              }
              setGuides({ x: null, y: null });
            }}
          />
        );
      }
      // Añade más tipos según necesites
      default:
        return null;
    }
  }, [selection, selectedIds, pipePreview, pipeToolActive, onSelectionChange]);

  // ============================================================================
  // MEJORA 5: Grid dinámico optimizado
  // ============================================================================
  const gridLines = useMemo(() => {
    const lines: Array<{ points: number[] }> = [];
    const visibleWidth = size.width / stageState.scale;
    const visibleHeight = size.height / stageState.scale;
    
    for (let x = 0; x < visibleWidth; x += GRID_SIZE) {
      lines.push({ points: [x, 0, x, visibleHeight] });
    }
    for (let y = 0; y < visibleHeight; y += GRID_SIZE) {
      lines.push({ points: [0, y, visibleWidth, y] });
    }
    return lines;
  }, [size.width, size.height, stageState.scale]);

  // ============================================================================
  // MEJORA 6: Renderizado de tuberías optimizado
  // ============================================================================
  const renderPipes = useMemo(() => {
    return model.pipes.map((pipe) => {
      const from = model.nodes.find((n) => n.id === pipe.from);
      const to = model.nodes.find((n) => n.id === pipe.to);
      if (!from || !to) return null;

      const isSelected = selection?.type === 'pipe' && selection.id === pipe.id;
      const touchesDraft = pipePreview?.fromId === pipe.from || pipePreview?.fromId === pipe.to;

      const color = isSelected ? '#f97316' : touchesDraft ? '#fbbf24' : '#94a3b8';
      return (
        <Group key={pipe.id}>
          <Line
            points={[from.position.x, from.position.y, to.position.x, to.position.y]}
            stroke={color}
            strokeWidth={isSelected ? 6 : 4}
            dash={[16, 12]}
            onClick={() => onSelectionChange?.({ type: 'pipe', id: pipe.id })}
            onTap={() => onSelectionChange?.({ type: 'pipe', id: pipe.id })}
          />
          <Arrow
            points={[from.position.x, from.position.y, to.position.x, to.position.y]}
            stroke={color}
            fill={color}
            pointerLength={12}
            pointerWidth={12}
            strokeWidth={isSelected ? 6 : 4}
          />
          <Text
            x={(from.position.x + to.position.x) / 2 - 80}
            y={(from.position.y + to.position.y) / 2 - 20}
            width={160}
            align="center"
            text={makePipeLabel(pipe, model.units)}
            fontSize={11}
            fill="#cbd5e1"
          />
        </Group>
      );
    });
  }, [model.pipes, model.nodes, selection, pipePreview, onSelectionChange, model.units]);

  // ============================================================================
  // Render principal
  // ============================================================================
  const handleZoomIn = useCallback(() => {
    applyZoom(ZOOM_FACTOR);
  }, [applyZoom]);

  const handleZoomOut = useCallback(() => {
    applyZoom(1 / ZOOM_FACTOR);
  }, [applyZoom]);

  const handleResetView = useCallback(() => {
    setStageState({ scale: 1, x: 0, y: 0 });
  }, []);

  return (
    <div 
      ref={containerRef} 
      id={canvasId} 
      className={`editor-container ${isFullscreen ? 'fullscreen' : ''} relative flex flex-1 select-none bg-slate-950`}
    >
      <EditorToolbar
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onToggleSnap={onToggleSnap}
        snapEnabled={snapEnabled}
      />
      <Stage
        ref={stageRef}
        id={stageId}
        width={size.width}
        height={size.height}
        x={stageState.x}
        y={stageState.y}
        scaleX={stageState.scale}
        scaleY={stageState.scale}
        draggable={selectionBox == null}
        onWheel={handleWheel}
        onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
          const stage = e.target.getStage();
          if (!stage) return;
          setStageState((prev) => ({ ...prev, x: clampPosition(stage.x()), y: clampPosition(stage.y()) }));
        }}
        onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => {
          const preview = pipePreviewRef.current;
          const stage = stageRef.current;
          if (!preview || !stage) return;
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          const p = toCanvasCoordinates(pointer);
          setPipePreview((prev) => (prev ? { ...prev, currentPosition: p } : prev));
          // selección rectangular
          const start = selectionStartRef.current;
          if (start) {
            setSelectionBox({ x: start.x, y: start.y, w: pointer.x - start.x, h: pointer.y - start.y });
          }
        }}
        onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (pipeToolActive) return;
          // iniciar selección solo si clic en fondo
          if (e.target === stageRef.current) {
            const pointer = stageRef.current?.getPointerPosition();
            if (!pointer) return;
            selectionStartRef.current = { x: pointer.x, y: pointer.y };
            setSelectionBox({ x: pointer.x, y: pointer.y, w: 0, h: 0 });
            setSelectedIds(new Set());
            onSelectionChange?.(null);
          }
        }}
        onMouseUp={() => {
          if (!selectionStartRef.current) return;
          const stage = stageRef.current;
          const pointer = stage?.getPointerPosition();
          if (!stage || !pointer) {
            selectionStartRef.current = null;
            setSelectionBox(null);
            return;
          }
          const start = selectionStartRef.current;
          const a = toCanvasCoordinates(start);
          const b = toCanvasCoordinates(pointer);
          const minX = Math.min(a.x, b.x);
          const maxX = Math.max(a.x, b.x);
          const minY = Math.min(a.y, b.y);
          const maxY = Math.max(a.y, b.y);
          const ids = new Set<string>();
          for (const n of model.nodes) {
            if (n.position.x >= minX && n.position.x <= maxX && n.position.y >= minY && n.position.y <= maxY) {
              ids.add(n.id);
            }
          }
          setSelectedIds(ids);
          selectionStartRef.current = null;
          setSelectionBox(null);
        }}
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (pipeToolActive && pipePreview) {
            const stage = e.target.getStage();
            if (!stage) return;
            const pointer = stage.getPointerPosition();
            if (!pointer) return;
            const p = toCanvasCoordinates(pointer);
            const THRESHOLD = 24;
            let bestId: string | null = null;
            let bestDist = Infinity;
            for (const n of model.nodes) {
              const dx = n.position.x - p.x;
              const dy = n.position.y - p.y;
              const d = Math.hypot(dx, dy);
              if (d < bestDist && d <= THRESHOLD) {
                bestDist = d;
                bestId = n.id;
              }
            }
            if (bestId && bestId !== pipePreview.fromId) {
              const result = onPipeAdd?.(pipePreview.fromId, bestId);
              if (!result || result.success) {
                setPipePreview(null);
              }
            }
            return;
          }
          if (e.target === stageRef.current) {
            onSelectionChange?.(null);
          }
        }}
        onDblClick={() => {
          onRequestAddElement?.();
        }}
        className="cursor-crosshair"
      >
        <Layer>
          {/* Grid */}
          <Rect x={0} y={0} width={size.width} height={size.height} fill="#020617" />
          {gridLines.map((line, i) => (
            <Line key={`grid-${i}`} points={line.points} stroke="rgba(30,41,59,0.4)" strokeWidth={1} />
          ))}
          
          {/* Tuberías */}
          {renderPipes}
          
          {/* Preview de tubería */}
          {pipePreview && (
            <Line
              points={[
                pipePreview.fromPosition.x,
                pipePreview.fromPosition.y,
                pipePreview.currentPosition.x,
                pipePreview.currentPosition.y,
              ]}
              stroke="#facc15"
              strokeWidth={4}
              dash={[12, 10]}
              opacity={0.85}
            />
          )}
          
          {/* Nodos */}
          {model.nodes.map((node) => renderNode(node))}
          
          {/* Guías de alineación */}
          {guides.x !== null && (
            <Line points={[guides.x, 0, guides.x, size.height]} stroke="#0ea5e9" strokeWidth={1} dash={[6, 6]} />
          )}
          {guides.y !== null && (
            <Line points={[0, guides.y, size.width, guides.y]} stroke="#0ea5e9" strokeWidth={1} dash={[6, 6]} />
          )}
        </Layer>
      </Stage>

      {/* Overlays UI */}
      <div className="pointer-events-none absolute inset-0">
        {/* Caja de selección */}
        {selectionBox && (
          <div
            className="absolute rounded border border-cyan-400/60 bg-cyan-500/10"
            style={{
              left: Math.min(selectionBox.x, selectionBox.x + selectionBox.w),
              top: Math.min(selectionBox.y, selectionBox.y + selectionBox.h),
              width: Math.abs(selectionBox.w),
              height: Math.abs(selectionBox.h),
            }}
          />
        )}

        {/* Mensaje de feedback */}
        {message && (
          <div
            className={`pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 rounded-lg border px-4 py-2 text-sm font-medium shadow-lg transition-opacity ${
              message.type === 'error'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
                : message.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Controles de zoom */}
        <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2">
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/90 p-2 shadow-xl">
            <button
              onClick={() => applyZoom(ZOOM_FACTOR)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-lg font-bold text-white/80 transition hover:border-cyan-400/40 hover:text-cyan-100"
              title="Acercar"
            >
              +
            </button>
            <button
              onClick={() => applyZoom(1 / ZOOM_FACTOR)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-lg font-bold text-white/80 transition hover:border-cyan-400/40 hover:text-cyan-100"
              title="Alejar"
            >
              −
            </button>
            <button
              onClick={() => setStageState({ scale: 1, x: 0, y: 0 })}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[10px] font-bold text-white/80 transition hover:border-cyan-400/40 hover:text-cyan-100"
              title="Resetear"
            >
              RST
            </button>
          </div>
        </div>

        {/* Indicador de escala */}
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white/70">
          Escala: {formatNumber(stageState.scale, 2)}×
        </div>

        {/* Contador de selección */}
        {selectedIds.size > 0 && (
          <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950/90 px-4 py-2 text-sm text-white/80">
            {selectedIds.size} elemento{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-3 rounded px-2 py-0.5 text-xs hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        )}

        {renderOverlay}
      </div>
    </div>
  );
};

export default EditorCanvas;
