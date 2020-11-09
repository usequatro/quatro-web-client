import { useState, useEffect } from 'react';

/**
 * @param {mixed} value
 * @returns {mixed}
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]); // Only re-run if value changes

  return debouncedValue;
}
