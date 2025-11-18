import { useMemo } from 'react';
import type { SystemModel } from '../model/schema';

export interface StageViewport {
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MiniMapOverlayProps {
  model: SystemModel;
  viewport?: StageViewport | null;
  onNavigate?: (target: { x: number; y: number }) => void;
  width?: number;
  height?: number;
}

const kindColors: Record<SystemModel['nodes'][number]['kind'], string> = {
  tank: '#22d3ee',
  pump: '#4ade80',
  junction: '#a855f7',
  valve: '#f59e0b',
  regulator: '#f472b6',
  meter: '#60a5fa',
};

const MiniMapOverlay = ({
  model,
  viewport,
  onNavigate,
  width = 320,
  height = 180,
}: MiniMapOverlayProps): JSX.Element | null => {
  const nodes = model.nodes;

  const { scale, offsetX, offsetY, viewRect } = useMemo(() => {
    if (nodes.length === 0) {
      return {
        scale: 1,
        offsetX: -width / 2,
        offsetY: -height / 2,
        viewRect: null,
      };
    }

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y);
    });

    const padding = 220;
    // Mantener un mundo más panorámico para horizontales
    const worldWidth = Math.max(1400, maxX - minX + padding * 2);
    const worldHeight = Math.max(720, maxY - minY + padding * 2);
    const computedScale = Math.min(width / worldWidth, height / worldHeight);
    const computedOffsetX = minX - padding;
    const computedOffsetY = minY - padding;

    let rect: { x: number; y: number; w: number; h: number } | null = null;

    if (viewport) {
      const worldLeft = (-viewport.x) / viewport.scale;
      const worldTop = (-viewport.y) / viewport.scale;
      const worldWidthViewport = viewport.width / viewport.scale;
      const worldHeightViewport = viewport.height / viewport.scale;

      rect = {
        x: (worldLeft - computedOffsetX) * computedScale,
        y: (worldTop - computedOffsetY) * computedScale,
        w: worldWidthViewport * computedScale,
        h: worldHeightViewport * computedScale,
      };
    }

    return {
      scale: computedScale,
      offsetX: computedOffsetX,
      offsetY: computedOffsetY,
      viewRect: rect,
    };
  }, [nodes, viewport, width, height]);

  const handleNavigate = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!onNavigate) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;

    const worldX = clickX / scale + offsetX;
    const worldY = clickY / scale + offsetY;
    onNavigate({ x: worldX, y: worldY });
  };

  return (
    <div className="pointer-events-auto rounded-3xl border border-white/10 bg-black/40 p-3 shadow-2xl shadow-black/40 backdrop-blur">
      <header className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/60">
        <span>Vista global</span>
        <span>{viewport ? `${(viewport.scale * 100).toFixed(0)}%` : '—'}</span>
      </header>
      <svg
        width={width}
        height={height}
        className="cursor-crosshair overflow-visible rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-black"
        onClick={handleNavigate}
      >
        <defs>
          <pattern id="mini-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0V16 M0 16H16" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#mini-grid)" />
        {nodes.map((node) => {
          const x = (node.position.x - offsetX) * scale;
          const y = (node.position.y - offsetY) * scale;
          const color = kindColors[node.kind];

          if (node.kind === 'tank') {
            return (
              <rect
                key={node.id}
                x={x - 10}
                y={y - 14}
                width={20}
                height={28}
                rx={6}
                ry={6}
                fill={`${color}33`}
                stroke={color}
                strokeWidth={1.5}
              />
            );
          }

          if (node.kind === 'pump') {
            return (
              <rect
                key={node.id}
                x={x - 9}
                y={y - 9}
                width={18}
                height={18}
                rx={5}
                ry={5}
                fill={`${color}33`}
                stroke={color}
                strokeWidth={1.5}
              />
            );
          }

          return (
            <circle
              key={node.id}
              cx={x}
              cy={y}
              r={7}
              fill={`${color}33`}
              stroke={color}
              strokeWidth={1.5}
            />
          );
        })}
        {viewRect && (
          <rect
            x={viewRect.x}
            y={viewRect.y}
            width={viewRect.w}
            height={viewRect.h}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(56,189,248,0.8)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            rx={6}
            ry={6}
          />
        )}
      </svg>
      <p className="mt-2 text-[10px] text-white/40">
        Haz clic para navegar; arrastra elementos en el lienzo principal mientras ves la referencia global.
      </p>
    </div>
  );
};

export default MiniMapOverlay;
