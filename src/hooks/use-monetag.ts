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
        console.log('Monetag script loaded for 30-second ad');
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

      // Wait for script initialization
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Trigger the 30-second ad only
      if (window.monetag && typeof window.monetag.invoke === 'function') {
        // Configure for 30-second ad with no additional notifications
        window.monetag.invoke({
          type: 'video', // Ensure it's a video ad
          duration: 30,  // 30 seconds
          skipable: false, // Cannot skip
          notifications: false // No additional notifications
        });
        console.log('30-second ad triggered - user must watch full duration');
        return true;
      } else {
        console.warn('Monetag not properly initialized');
        return false;
      }
    } catch (error) {
      console.error('Error showing 30-second ad:', error);
      return false;
    }
  }, [loadScript]);

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
    // Clear any monetag references
    if (window.monetag) {
      delete window.monetag;
    }
  }, []);

  return {
    showAd,
    cleanup
  };
}
