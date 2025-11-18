import type { ComponentType } from 'react';
import AnalyticsPage from './AnalyticsPage';
import LibraryPage from './LibraryPage';
import ModelingPage from './ModelingPage';
import SummaryPage from './SummaryPage';

export const CANVAS_ID = 'dashboard-hydraulic-canvas';
export const STAGE_ID = 'dashboard-hydraulic-stage';

type HydraulicDesignerRouteDefinition = {
  path: string;
  label: string;
  component: ComponentType;
};

export const HYDRAULIC_DESIGNER_ROUTES: HydraulicDesignerRouteDefinition[] = [
  { path: 'resumen', label: 'Resumen', component: SummaryPage },
  { path: 'modelado', label: 'Modelado', component: ModelingPage },
  { path: 'biblioteca', label: 'Biblioteca', component: LibraryPage },
  { path: 'analitica', label: 'Analítica', component: AnalyticsPage },
];
