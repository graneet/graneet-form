import { useCallback, useEffect, useRef } from 'react';
import type { DependencyList } from 'react';

// oxlint-disable-next-line typescript/no-explicit-any
export function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList = [],
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // oxlint-disable-next-line typescript/no-unsafe-return react-hooks/exhaustive-deps typescript/no-unsafe-argument
  return useCallback(((...args) => callbackRef.current?.(...args)) as T, deps);
}
