import { useCallback, useRef } from 'react';

interface Monetag {
  invoke: (options?: any) => void;
}

declare global {
  interface Window {
    monetag?: Monetag;
  }
}

export function useMonetag() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const loadScript = useCallback((zoneId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Remove existing script if any
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }

      // Check if script is already loaded
      if (window.monetag) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://quge5.com/88/tag.min.js';
      script.setAttribute('data-zone', zoneId);
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      
      script.onload = () => {
        console.log('Monetag script loaded successfully for 30-second ad');
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load Monetag script');
        reject(new Error('Failed to load Monetag script'));
      };

      document.head.appendChild(script);
      scriptRef.current = script;
    });
  }, []);

  const showAd = useCallback(async (zoneId: string = '221737'): Promise<boolean> => {
    try {
      await loadScript(zoneId);
      
      // Wait a bit longer for the script to initialize for 30-second ads
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Trigger the ad
      if (window.monetag && typeof window.monetag.invoke === 'function') {
        window.monetag.invoke();
        console.log('30-second Monetag ad triggered');
        return true;
      } else {
        console.warn('Monetag not properly initialized');
        return false;
      }
    } catch (error) {
      console.error('Error showing Monetag ad:', error);
      return false;
    }
  }, [loadScript]);

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
  }, []);

  return {
    showAd,
    cleanup
  };
}