import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import useAlertToasts from './hooks/useAlertToasts';
import { createHydraulicDesignerRouter } from 'hydraulic-designer/router';

const App = (): JSX.Element => {
  useAlertToasts();
  const router = useMemo(() => createHydraulicDesignerRouter(), []);

  return <RouterProvider router={router} />;
};

export default App;
