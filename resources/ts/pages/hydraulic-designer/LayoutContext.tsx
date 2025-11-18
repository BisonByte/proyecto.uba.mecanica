import React, { useMemo, useState, type ReactNode } from 'react';
import useBodyOverflowLock from './useBodyOverflowLock';

type SetState<T> = (value: T | ((prev: T) => T)) => void;

export interface HydraulicDesignerLayoutContext {
  isFullscreen: boolean;
  setIsFullscreen: SetState<boolean>;
}

const LayoutContext = React.createContext<HydraulicDesignerLayoutContext | null>(null);

export const useHydraulicDesignerLayout = (): HydraulicDesignerLayoutContext => {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useHydraulicDesignerLayout must be used within a HydraulicDesignerLayoutProvider');
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
  initialFullscreen?: boolean;
}

export const HydraulicDesignerLayoutProvider = ({ children, initialFullscreen = false }: ProviderProps): JSX.Element => {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

  useBodyOverflowLock(isFullscreen);

  const value = useMemo(() => ({ isFullscreen, setIsFullscreen }), [isFullscreen]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
