import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useModelStore } from '../state/store';

const useAlertToasts = (): void => {
  const alerts = useModelStore((state) => state.alerts);
  const seenAlerts = useRef<Set<string>>(new Set());

  useEffect(() => {
    const previous = seenAlerts.current;
    const next = new Set<string>();

    alerts.forEach((alert) => {
      next.add(alert.id);
      if (!previous.has(alert.id) && (alert.severity === 'warning' || alert.severity === 'error')) {
        const handler = alert.severity === 'error' ? toast.error : toast.warning;
        handler(alert.title, {
          description: alert.detail,
          duration: 6000,
        });
      }
    });

    seenAlerts.current = next;
  }, [alerts]);
};

export default useAlertToasts;
