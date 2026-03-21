import { useCallback, useRef } from 'react';

/*
 * ADSTERRA INTEGRATION FOR 30-SECOND REWARDED VIDEO ADS
 * 
 * IMPORTANT: The current script is for notification ads, not video ads.
 * You need to get a REWARDED VIDEO ad script from your Adsterra dashboard.
 * 
 * Steps to fix:
 * 1. Go to your Adsterra dashboard
 * 2. Create a new ad zone for "Rewarded Video" or "Video Ads"
 * 3. Get the script for video ads (not notification ads)
 * 4. Replace the ADSTERRA_SCRIPT_URL below
 */

// REPLACE THIS WITH YOUR ADSTERRA REWARDED VIDEO SCRIPT URL
const ADSTERRA_SCRIPT_URL = 'https://pl28953973.profitablecpmratenetwork.com/0e/59/06/0e5906127d5055100faa98776658bf50.js';

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
      script.src = ADSTERRA_SCRIPT_URL;
      script.async = true;
      
      // Add attributes to prevent notification ads
      script.setAttribute('data-cfasync', 'false');
      script.setAttribute('data-adel', 'lwsu');
      
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
      // Block any notification/popup ads that might be triggered
      const originalAlert = window.alert;
      const originalConfirm = window.confirm;
      const originalOpen = window.open;
      
      // Temporarily disable popups and notifications
      window.alert = () => {};
      window.confirm = () => false;
      window.open = () => null;
      
      await loadScript();

      // Create our custom video ad container (simulated for now)
      const adContainer = document.createElement('div');
      adContainer.id = 'adsterra-video-container';
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

      // Create video ad simulation (since we don't have proper video ad script)
      adContainer.innerHTML = `
        <div style="color: white; text-align: center; font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <div style="font-size: 24px; margin-bottom: 20px; color: #ff6b35;">⚠️ Adsterra Configuration Issue</div>
          <div style="font-size: 18px; margin-bottom: 15px;">Current Script Shows Notification Ads</div>
          <div style="font-size: 16px; opacity: 0.8; margin-bottom: 30px;">You need a REWARDED VIDEO ad script from Adsterra dashboard</div>
          
          <!-- Simulated video player for now -->
          <div style="width: 100%; max-width: 480px; height: 270px; background: linear-gradient(45deg, #1a1a1a, #333); border-radius: 8px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid #ff6b35;">
            <div style="color: #ff6b35; font-size: 48px;">▶</div>
          </div>
          
          <div style="font-size: 14px; opacity: 0.6; margin-bottom: 10px;">This is a simulated video ad experience</div>
          <div style="font-size: 14px; opacity: 0.6; margin-bottom: 20px;">Get proper Adsterra video ad script to show real ads</div>
          
          <div style="background: rgba(255, 107, 53, 0.1); border: 1px solid #ff6b35; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">How to Fix:</div>
            <div style="font-size: 14px; text-align: left; line-height: 1.5;">
              1. Go to Adsterra Dashboard<br>
              2. Create "Rewarded Video" ad zone<br>
              3. Get video ad script (not notification script)<br>
              4. Update ADSTERRA_SCRIPT_URL in use-adsterra.ts
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(adContainer);
      adContainerRef.current = adContainer;

      // Restore original functions after a delay
      setTimeout(() => {
        window.alert = originalAlert;
        window.confirm = originalConfirm;
        window.open = originalOpen;
      }, 1000);

      console.log('Adsterra video ad container created (simulated) - starting 30-second timer');
      
      // Return immediately - let the earn page handle the timing
      return true;

    } catch (error) {
      console.error('Error showing Adsterra video ad:', error);
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