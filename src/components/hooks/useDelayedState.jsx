import { useState, useEffect, useRef } from 'react';

/**
 * @param {mixed} value
 * @returns {mixed}
 */
export default function useDelayedState(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState();

  const timeouts = useRef([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    timeouts.current.push(timeout);
  }, [value, delay]); // Only re-run if value changes

  useEffect(
    () => () => {
      timeouts.current.forEach((timeout) => clearTimeout(timeout));
    },
    [],
  );

  return debouncedValue;
}
