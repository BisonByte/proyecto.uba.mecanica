import { useState } from 'react';
import ResizablePanel from './ResizablePanel';

interface PropertiesViewProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const PropertiesView = ({ title, subtitle, children }: PropertiesViewProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <ResizablePanel
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      position="bottom"
    >
      <div className="space-y-4">
        {/* Encabezado */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="rounded-lg bg-white/5 p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </ResizablePanel>
  );
};

export default PropertiesView;