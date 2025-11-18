import { useLayoutEffect, useRef } from 'react';

/**
 * Locks the document body's overflow while `enabled` is true and restores the previous value afterwards.
 */
const useBodyOverflowLock = (enabled: boolean) => {
  const previousOverflow = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const { body } = document;
    previousOverflow.current = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      if (typeof document === 'undefined') {
        return;
      }
      document.body.style.overflow = previousOverflow.current ?? '';
      previousOverflow.current = null;
    };
  }, [enabled]);
};

export default useBodyOverflowLock;
