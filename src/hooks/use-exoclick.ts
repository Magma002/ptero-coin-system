import { useCallback, useRef } from 'react';

/*
 * EXOCLICK BANNER AD INTEGRATION
 * 
 * Using the working banner zone:
 * - Script: https://a.magsrv.com/ad-provider.js
 * - Zone ID: 5877264
 * - Class: eas6a97888e2
 * - Type: Banner (728x90)
 */

// ExoClick banner configuration
const EXOCLICK_SCRIPT_URL = 'https://a.magsrv.com/ad-provider.js';
const EXOCLICK_ZONE_ID = '5877264';
const EXOCLICK_CLASS = 'eas6a97888e2';

declare global {
  interface Window {
    AdProvider?: any[];
    [key: string]: any;
  }
}

export function useExoClick() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const adContainerRef = useRef<HTMLDivElement | null>(null);

  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Remove existing script if any
      if (scriptRef.current) {
        try {
          document.head.removeChild(scriptRef.current);
        } catch (e) {
          console.warn('Previous ExoClick script already removed');
        }
        scriptRef.current = null;
      }

      // Initialize AdProvider array if not exists
      if (!window.AdProvider) {
        window.AdProvider = [];
        console.log('🔧 Initialized AdProvider array');
      }

      console.log('📥 Loading ExoClick script from:', EXOCLICK_SCRIPT_URL);
      
      const script = document.createElement('script');
      script.src = EXOCLICK_SCRIPT_URL;
      script.async = true;
      script.type = 'application/javascript';
      script.setAttribute('data-cfasync', 'false');
      
      script.onload = () => {
        console.log('✅ ExoClick AdProvider script loaded successfully');
        console.log('🔍 AdProvider available:', !!window.AdProvider);
        console.log('🔍 AdProvider length:', window.AdProvider?.length || 0);
        setTimeout(() => resolve(), 500);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load ExoClick AdProvider script:', error);
        console.error('📍 Script URL:', EXOCLICK_SCRIPT_URL);
        reject(new Error('Failed to load ExoClick AdProvider script'));
      };

      document.head.appendChild(script);
      scriptRef.current = script;
      console.log('📤 ExoClick script element added to head');
    });
  }, []);

  const showAd = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎬 Starting ExoClick banner ad...');
      console.log('🎯 Zone ID:', EXOCLICK_ZONE_ID);
      console.log('🏷️ Ad Class:', EXOCLICK_CLASS);

      // Load the ExoClick script first
      await loadScript();
      console.log('✅ ExoClick script loaded successfully');

      // Create full-screen ad container
      const adContainer = document.createElement('div');
      adContainer.id = 'exoclick-banner-overlay';
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

      // Create the ExoClick banner ad element
      const adElement = document.createElement('ins');
      adElement.className = EXOCLICK_CLASS;
      adElement.setAttribute('data-zoneid', EXOCLICK_ZONE_ID);
      adElement.style.cssText = `
        display: block;
        width: 728px;
        height: 90px;
        margin: 20px auto;
        background: #1a1a1a;
        border: 2px solid #e74c3c;
        border-radius: 8px;
      `;

      // Create UI wrapper
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        color: white;
        text-align: center;
        font-family: Arial, sans-serif;
        padding: 40px;
        max-width: 800px;
      `;

      wrapper.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px; color: #e74c3c;">
          🎬 ExoClick Banner Advertisement
        </div>
        <div style="font-size: 18px; margin-bottom: 30px;">
          Please interact with the banner ad below if interested
        </div>
        <div id="banner-container" style="margin: 20px 0; padding: 20px; background: #2a2a2a; border-radius: 8px;">
          <div style="color: #e74c3c; margin-bottom: 15px;">Loading banner ad...</div>
        </div>
        <div style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
          Ad will close automatically after 30 seconds
        </div>
        <div id="timer-display" style="margin-top: 15px; font-size: 18px; color: #e74c3c; font-weight: bold;">
          Time remaining: <span id="countdown">30</span>s
        </div>
      `;

      adContainer.appendChild(wrapper);
      document.body.appendChild(adContainer);
      adContainerRef.current = adContainer;

      // Insert the ExoClick banner element
      const bannerContainer = wrapper.querySelector('#banner-container') as HTMLElement;
      if (bannerContainer) {
        bannerContainer.innerHTML = '';
        bannerContainer.appendChild(adElement);
      }

      // Initialize AdProvider if not exists and trigger the ad
      if (!window.AdProvider) {
        window.AdProvider = [];
      }

      // Trigger the ExoClick banner ad
      try {
        console.log('🎯 Triggering ExoClick banner ad with zone ID:', EXOCLICK_ZONE_ID);
        window.AdProvider.push({"serve": {}});
        console.log('✅ ExoClick banner ad triggered successfully');
        
        // Check if ad loaded after a short delay
        setTimeout(() => {
          if (adElement.innerHTML.trim() !== '') {
            console.log('✅ Banner ad content detected!');
            const statusDiv = bannerContainer.querySelector('div');
            if (statusDiv) {
              statusDiv.innerHTML = '✅ Banner ad loaded successfully!';
              statusDiv.style.color = '#2ecc71';
            }
          } else {
            console.log('⚠️ Banner ad still loading or empty');
          }
        }, 2000);
        
      } catch (adError) {
        console.warn('⚠️ Error triggering ExoClick banner ad:', adError);
        // Continue with timer anyway
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
                console.log('✅ ExoClick banner ad closed after 30 seconds');
              } catch (e) {
                console.warn('Ad container already removed');
              }
            }
          }, 2000);
        }
      }, 1000);

      console.log('🎬 ExoClick banner ad container created and timer started');
      return true;

    } catch (error) {
      console.error('❌ Error showing ExoClick banner ad:', error);
      
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
  }, [loadScript]);

  const closeAd = useCallback(() => {
    if (adContainerRef.current) {
      try {
        document.body.removeChild(adContainerRef.current);
        console.log('🔒 ExoClick banner ad closed manually');
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
        console.warn('ExoClick script already removed');
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