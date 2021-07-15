import { useMemo } from 'react';

const IsMacPlaform = () =>
  'navigator' in window && typeof window.navigator.platform === 'string'
    ? window.navigator.platform.toUpperCase().indexOf('MAC') >= 0
    : false;

export default function useIsMacPlaform() {
  return useMemo(IsMacPlaform, []);
}
