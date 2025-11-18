import React from 'react';

interface EditorToolbarProps {
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleSnap?: () => void;
  snapEnabled: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleSnap,
  snapEnabled,
}) => {
  return (
    <>
      <div className="editor-toolbar">
        <button
          className="editor-button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
        <button
          className="editor-button"
          onClick={onToggleSnap}
          title={snapEnabled ? "Desactivar ajuste a cuadrícula" : "Activar ajuste a cuadrícula"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4m4 0h4m4 0h4M4 8h4m4 0h4m4 0h4M4 12h4m4 0h4m4 0h4M4 16h4m4 0h4m4 0h4M4 20h4m4 0h4m4 0h4" />
          </svg>
        </button>
      </div>
      
      <div className="zoom-controls">
        <button className="editor-button" onClick={onZoomIn} title="Acercar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button className="editor-button" onClick={onZoomOut} title="Alejar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button className="editor-button" onClick={onResetView} title="Restablecer vista">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </>
  );
};