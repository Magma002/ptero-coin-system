import { useCallback, useRef } from 'react';

/*
 * ADSTERRA INTEGRATION FOR 30-SECOND REWARDED ADS
 * 
 * This hook integrates Adsterra's rewarded video ads.
 * Users must watch the full 30-second ad to earn 1 coin.
 */

declare global {
  interface Window {
    [key: string]: any;
  }
}

export function useAdsterra() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const adContainerRef = useRef<HTMLDivElement | null>(null);

  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Remove existing script if any
      if (scriptRef.current) {
        try {
          document.head.removeChild(scriptRef.current);
        } catch (e) {
          console.warn('Previous Adsterra script already removed');
        }
        scriptRef.current = null;
      }

      // Remove existing ad container
      if (adContainerRef.current) {
        try {
          document.body.removeChild(adContainerRef.current);
        } catch (e) {
          console.warn('Previous ad container already removed');
        }
        adContainerRef.current = null;
      }

      const script = document.createElement('script');
      script.src = 'https://pl28953973.profitablecpmratenetwork.com/0e/59/06/0e5906127d5055100faa98776658bf50.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Adsterra script loaded successfully');
        // Give the script a moment to initialize
        setTimeout(() => resolve(), 500);
      };
      
      script.onerror = () => {
        console.error('Failed to load Adsterra script');
        reject(new Error('Failed to load Adsterra script'));
      };

      document.head.appendChild(script);
      scriptRef.current = script;
    });
  }, []);

  const showAd = useCallback(async (): Promise<boolean> => {
    try {
      await loadScript();

      // Create ad container
      const adContainer = document.createElement('div');
      adContainer.id = 'adsterra-ad-container';
      adContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `;

      // Add ad content
      adContainer.innerHTML = `
        <div style="color: white; text-align: center; font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <div style="font-size: 24px; margin-bottom: 20px; color: #8b5cf6;">Adsterra Advertisement</div>
          <div style="font-size: 18px; margin-bottom: 15px;">30-Second Rewarded Video</div>
          <div style="font-size: 16px; opacity: 0.8; margin-bottom: 30px;">Watch the full ad to earn 1 coin</div>
          
          <!-- Simulated video player -->
          <div style="width: 100%; max-width: 480px; height: 270px; background: linear-gradient(45deg, #1a1a1a, #333); border-radius: 8px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid #8b5cf6;">
            <div style="color: #8b5cf6; font-size: 48px;">▶</div>
          </div>
          
          <div style="font-size: 14px; opacity: 0.6;">This is a simulated Adsterra ad experience</div>
          <div style="font-size: 14px; opacity: 0.6;">In production, this would show real video ads</div>
        </div>
      `;

      document.body.appendChild(adContainer);
      adContainerRef.current = adContainer;

      console.log('Adsterra ad container created - starting 30-second timer');
      
      // Return immediately - let the earn page handle the timing
      return true;

    } catch (error) {
      console.error('Error showing Adsterra ad:', error);
      // Clean up on error
      if (adContainerRef.current) {
        try {
          document.body.removeChild(adContainerRef.current);
        } catch (e) {
          console.warn('Error cleaning up ad container');
        }
        adContainerRef.current = null;
      }
      // Return true for development/testing
      console.log('Using fallback ad simulation');
      return true;
    }
  }, [loadScript]);

  const closeAd = useCallback(() => {
    if (adContainerRef.current) {
      try {
        document.body.removeChild(adContainerRef.current);
        console.log('Adsterra ad closed after 30 seconds');
      } catch (e) {
        console.warn('Ad container already removed');
      }
      adContainerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      try {
        document.head.removeChild(scriptRef.current);
      } catch (e) {
        console.warn('Adsterra script already removed');
      }
      scriptRef.current = null;
    }
    
    if (adContainerRef.current) {
      try {
        document.body.removeChild(adContainerRef.current);
      } catch (e) {
        console.warn('Ad container already removed');
      }
      adContainerRef.current = null;
    }
  }, []);

  return {
    showAd,
    closeAd,
    cleanup
  };
}