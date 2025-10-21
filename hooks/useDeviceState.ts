import { useState, useEffect } from 'react';
import { MOBILE_BREAKPOINT } from '../constants';

export const useDeviceState = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const checkIsMobile = () => setIsMobileView(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return { isMobileView };
};
