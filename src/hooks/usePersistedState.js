import { useEffect, useMemo, useState } from "react";

function getDefaultState(initialState) {
  return typeof initialState === "function" ? initialState() : initialState;
}

export function usePersistedState(storageKey, initialState, sanitizeState) {
  const defaultState = useMemo(() => getDefaultState(initialState), [initialState]);

  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return defaultState;
    }

    try {
      const rawState = window.localStorage.getItem(storageKey);
      if (!rawState) {
        return defaultState;
      }

      const parsedState = JSON.parse(rawState);
      return sanitizeState ? sanitizeState(parsedState, defaultState) : parsedState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const saveTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // ignore storage quota or availability errors
      }
    }, 200);

    return () => window.clearTimeout(saveTimer);
  }, [storageKey, state]);

  return [state, setState];
}
