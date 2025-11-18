import './polyfills';
import '../css/app.css';
import 'katex/dist/katex.min.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import ModelingPage from './pages/hydraulic-designer/ModelingPage';
import { HydraulicDesignerLayoutProvider } from './pages/hydraulic-designer/LayoutContext';
import useAlertToasts from './hooks/useAlertToasts';

const StandaloneModelingApp = (): JSX.Element => {
  useAlertToasts();

  return (
    <HydraulicDesignerLayoutProvider initialFullscreen>
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <ModelingPage />
        </div>
      </div>
    </HydraulicDesignerLayoutProvider>
  );
};

const container = document.getElementById('modeling-standalone-root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <StandaloneModelingApp />
      <Toaster position="top-right" richColors />
    </StrictMode>,
  );
} else {
  console.warn('Standalone modeling root not found.');
}
