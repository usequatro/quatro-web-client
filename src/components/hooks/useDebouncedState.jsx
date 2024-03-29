import { useState, useEffect } from 'react';

/**
 * @param {mixed} value
 * @returns {mixed}
 */
export default function useDebouncedState(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]); // Only re-run if value changes

  return debouncedValue;
}
