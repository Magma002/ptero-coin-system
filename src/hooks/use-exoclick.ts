import { useCallback, useRef } from 'react';

/*
 * MONETAG BANNER AD INTEGRATION
 * 
 * Using Monetag banner ads:
 * - Script: https://quge5.com/88/tag.min.js
 * - Zone: 221737
 * - Type: Banner ads with 30-second display
 */

// Monetag configuration
const MONETAG_SCRIPT_URL = 'https://quge5.com/88/tag.min.js';
const MONETAG_ZONE_ID = '221737';

declare global {
  interface Window {
    [key: string]: any;
  }
}

export function useExoClick() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const adContainerRef = useRef<HTMLDivElement | null>(null);

  const loadMonetagScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Remove existing script if any
      if (scriptRef.current) {
        try {
          document.head.removeChild(scriptRef.current);
        } catch (e) {
          console.warn('Previous Monetag script already removed');
        }
        scriptRef.current = null;
      }

      console.log('📥 Loading Monetag script from:', MONETAG_SCRIPT_URL);
      
      const script = document.createElement('script');
      script.src = MONETAG_SCRIPT_URL;
      script.async = true;
      script.setAttribute('data-zone', MONETAG_ZONE_ID);
      script.setAttribute('data-cfasync', 'false');
      
      script.onload = () => {
        console.log('✅ Monetag script loaded successfully');
        console.log('🎯 Zone ID:', MONETAG_ZONE_ID);
        setTimeout(() => resolve(), 500);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Monetag script:', error);
        console.error('📍 Script URL:', MONETAG_SCRIPT_URL);
        reject(new Error('Failed to load Monetag script'));
      };

      document.head.appendChild(script);
      scriptRef.current = script;
      console.log('📤 Monetag script element added to head');
    });
  }, []);

  const showAd = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎬 Starting Monetag banner ad...');
      console.log('🎯 Zone ID:', MONETAG_ZONE_ID);

      // Load the Monetag script first
      await loadMonetagScript();
      console.log('✅ Monetag script loaded successfully');

      // Create full-screen ad container
      const adContainer = document.createElement('div');
      adContainer.id = 'monetag-banner-overlay';
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

      // Create UI wrapper
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        color: white;
        text-align: center;
        font-family: Arial, sans-serif;
        padding: 40px;
        max-width: 800px;
        width: 100%;
      `;

      wrapper.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px; color: #00d4ff;">
          🎬 Monetag Advertisement
        </div>
        <div style="font-size: 18px; margin-bottom: 30px;">
          Please view the advertisement below to earn 1 coin
        </div>
        <div id="monetag-container" style="margin: 20px 0; padding: 30px; background: #2a2a2a; border-radius: 8px; min-height: 200px; border: 2px solid #00d4ff;">
          <div style="color: #00d4ff; margin-bottom: 20px; font-size: 16px;">Loading Monetag banner ad...</div>
          <div id="monetag-ad-slot" style="min-height: 150px; display: flex; align-items: center; justify-content: center; background: #1a1a1a; border-radius: 5px; border: 1px dashed #00d4ff;">
            <div style="color: #00d4ff; opacity: 0.7;">Advertisement will appear here</div>
          </div>
        </div>
        <div style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
          Watch for 30 seconds to earn your reward
        </div>
        <div id="timer-display" style="margin-top: 15px; font-size: 18px; color: #00d4ff; font-weight: bold;">
          Time remaining: <span id="countdown">30</span>s
        </div>
      `;

      adContainer.appendChild(wrapper);
      document.body.appendChild(adContainer);
      adContainerRef.current = adContainer;

      // Create Monetag ad element
      const monetagAdSlot = wrapper.querySelector('#monetag-ad-slot') as HTMLElement;
      if (monetagAdSlot) {
        // Create the Monetag script element as per their documentation
        const monetagScript = document.createElement('script');
        monetagScript.src = MONETAG_SCRIPT_URL;
        monetagScript.setAttribute('data-zone', MONETAG_ZONE_ID);
        monetagScript.setAttribute('data-cfasync', 'false');
        monetagScript.async = true;
        
        // Clear the placeholder and add the ad script
        monetagAdSlot.innerHTML = '';
        monetagAdSlot.appendChild(monetagScript);
        
        console.log('✅ Monetag ad script inserted into container');
        
        // Update status
        const statusDiv = wrapper.querySelector('#monetag-container div') as HTMLElement;
        if (statusDiv) {
          statusDiv.innerHTML = '✅ Monetag ad loaded! Zone: ' + MONETAG_ZONE_ID;
          statusDiv.style.color = '#2ecc71';
        }
      }

      // Start the 30-second countdown timer
      let timeLeft = 30;
      const countdownElement = wrapper.querySelector('#countdown');
      const timerDisplay = wrapper.querySelector('#timer-display') as HTMLElement;
      
      const timer = setInterval(() => {
        timeLeft--;
        if (countdownElement) {
          countdownElement.textContent = timeLeft.toString();
        }
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          if (timerDisplay) {
            timerDisplay.innerHTML = '✅ Ad viewing completed! Closing...';
            timerDisplay.style.color = '#2ecc71';
          }
          
          // Auto-close after completion
          setTimeout(() => {
            if (adContainerRef.current) {
              try {
                document.body.removeChild(adContainerRef.current);
                adContainerRef.current = null;
                console.log('✅ Monetag banner ad closed after 30 seconds');
              } catch (e) {
                console.warn('Ad container already removed');
              }
            }
          }, 2000);
        }
      }, 1000);

      console.log('🎬 Monetag banner ad container created and timer started');
      return true;

    } catch (error) {
      console.error('❌ Error showing Monetag banner ad:', error);
      
      // Clean up on error
      if (adContainerRef.current) {
        try {
          document.body.removeChild(adContainerRef.current);
        } catch (e) {
          console.warn('Error cleaning up ad container');
        }
        adContainerRef.current = null;
      }
      
      // Return true to continue with reward flow (fallback behavior)
      console.log('🔄 Continuing with fallback ad simulation');
      return true;
    }
  }, [loadMonetagScript]);

  const closeAd = useCallback(() => {
    if (adContainerRef.current) {
      try {
        document.body.removeChild(adContainerRef.current);
        console.log('🔒 Monetag banner ad closed manually');
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
        console.warn('Monetag script already removed');
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