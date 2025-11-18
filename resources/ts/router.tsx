import { Navigate, createBrowserRouter, createMemoryRouter } from 'react-router-dom';
import HydraulicDesignerLayout from 'hydraulic-designer/pages/HydraulicDesignerLayout';
import { HYDRAULIC_DESIGNER_ROUTES } from 'hydraulic-designer/pages/constants';

const resolveBaseName = (): string => {
  if (typeof window === 'undefined') {
    return '/';
  }

  const host =
    document.getElementById('system-editor-root') ?? document.getElementById('hydraulic-designer-root');
  const datasetBase = host?.getAttribute('data-router-base');
  if (datasetBase && datasetBase.startsWith('/')) {
    return datasetBase;
  }

  const knownBases = ['/hydraulic-designer-root', '/system-editor'];
  const currentPath = window.location.pathname;
  const detected = knownBases.find((base) => currentPath.startsWith(base));
  return detected ?? '/';
};

const buildRoutes = () => [
  {
    path: '/',
    element: <HydraulicDesignerLayout />,
    children: [
      { index: true, element: <Navigate to={HYDRAULIC_DESIGNER_ROUTES[0].path} replace /> },
      ...HYDRAULIC_DESIGNER_ROUTES.map(({ path, component: Component }) => ({
        path,
        element: <Component />,
      })),
      { path: '*', element: <Navigate to={HYDRAULIC_DESIGNER_ROUTES[0].path} replace /> },
    ],
  },
];

const isWidgetContext = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const widgetRoot = document.getElementById('hydraulic-designer-root');
  const systemRoot = document.getElementById('system-editor-root');
  return Boolean(widgetRoot && !systemRoot);
};

export const createHydraulicDesignerRouter = () => {
  const routes = buildRoutes();
  if (isWidgetContext()) {
    return createMemoryRouter(routes, { initialEntries: ['/'] });
  }
  return createBrowserRouter(routes, { basename: resolveBaseName() });
};
