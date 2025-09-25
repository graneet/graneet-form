import { type DependencyList, useCallback, useEffect, useRef } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined, deps: DependencyList = []) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  return useCallback(((...args) => callbackRef.current?.(...args)) as T, deps);
}
