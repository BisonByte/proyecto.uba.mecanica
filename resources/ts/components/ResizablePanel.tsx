import { useState, useEffect, useCallback, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  position?: 'right' | 'bottom';
}

const ResizablePanel = ({ children, isExpanded, onToggle, position = 'right' }: ResizablePanelProps): JSX.Element => {
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: 380, height: 400 });
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      if (position === 'right') {
        const newWidth = Math.max(320, Math.min(800, window.innerWidth - e.clientX));
        setSize(prev => ({ ...prev, width: newWidth }));
      } else {
        const newHeight = Math.max(200, Math.min(800, window.innerHeight - e.clientY));
        setSize(prev => ({ ...prev, height: newHeight }));
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  const containerStyles = position === 'right'
    ? {
        width: isExpanded ? `${size.width}px` : '48px',
        height: '100%',
        transition: isDragging ? 'none' : 'width 0.3s ease-in-out'
      }
    : {
        width: '100%',
        height: isExpanded ? `${size.height}px` : '48px',
        transition: isDragging ? 'none' : 'height 0.3s ease-in-out'
      };

  return (
    <div
      className="relative flex flex-col bg-slate-900/95 shadow-xl"
      style={containerStyles}
    >
      {/* Botón de alternar y barra de arrastre */}
      {position === 'right' ? (
        <div
          className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex h-24 w-6 items-center justify-center rounded-l-xl bg-slate-800 text-white/70 hover:bg-slate-700 hover:text-white">
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ) : (
        <div
          className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex h-6 w-24 items-center justify-center rounded-t-xl bg-slate-800 text-white/70 hover:bg-slate-700 hover:text-white">
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : '-rotate-90'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Contenido del panel */}
      <div className={`h-full overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        {isExpanded && (
          <div className="h-full overflow-y-auto p-4">
            {children}
          </div>
        )}
      </div>

      {/* Barra de redimensionamiento */}
      {isExpanded && (
        <div
          className={`absolute ${
            position === 'right'
              ? '-left-1 top-0 h-full w-2 cursor-ew-resize'
              : 'bottom-0 left-0 h-2 w-full cursor-ns-resize'
          }`}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

export default ResizablePanel;