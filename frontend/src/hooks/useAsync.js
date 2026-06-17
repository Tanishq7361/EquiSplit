import { useState, useCallback } from 'react';

/**
 * Generic hook for async operations.
 * Tracks loading, error, and data state.
 */
export function useAsync() {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const execute = useCallback(async (asyncFn) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
      return { data: result, error: null };
    } catch (err) {
      setState({ data: null, loading: false, error: err.message });
      return { data: null, error: err.message };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
