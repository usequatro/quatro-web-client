import { useMemo } from 'react';

const isTouchEnabledScreen = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};

export default function useIsTouchEnabledScreen() {
  return useMemo(isTouchEnabledScreen, []);
}
