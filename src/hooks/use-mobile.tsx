import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768; // Tailwind's md breakpoint
      setIsMobile(mobile);
    };

    // Initial check
    checkDevice();

    // Add event listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return isMobile;
}

// Additional hook for checking specific breakpoints
export function useBreakpoint(breakpoint: number) {
  const [isBreakpoint, setIsBreakpoint] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const matches = window.innerWidth < breakpoint;
      setIsBreakpoint(matches);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    return () => {
      window.removeEventListener('resize', checkBreakpoint);
    };
  }, [breakpoint]);

  return isBreakpoint;
}

// Predefined breakpoint hooks
export function useSm() { return useBreakpoint(640); } // sm: 640px
export function useMd() { return useBreakpoint(768); } // md: 768px
export function useLg() { return useBreakpoint(1024); } // lg: 1024px
export function useXl() { return useBreakpoint(1280); } // xl: 1280px