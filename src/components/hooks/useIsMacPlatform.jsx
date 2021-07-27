import { useMemo } from 'react';

export const isMacPlaform = () =>
  'navigator' in window && typeof window.navigator.platform === 'string'
    ? window.navigator.platform.toUpperCase().indexOf('MAC') >= 0
    : false;

export default function useIsMacPlaform() {
  return useMemo(isMacPlaform, []);
}
