import { useCallback, useRef } from 'react';

/*
 * MULTI-NETWORK AD INTEGRATION
 * 
 * Priority order:
 * 1. ExoClick Banner (Zone 5877264) - Primary
 * 2. Adsterra Ads - Backup
 * 3. 30-second timer - Final fallback
 */

// ExoClick banner configuration
const EXOCLICK_SCRIPT_URL = 'https://a.magsrv.com/ad-provider.js';
const EXOCLICK_ZONE_ID = '5877264';
const EXOCLICK_CLASS = 'eas6a97888e2';

// Adsterra configuration (from your setup docs)
const ADSTERRA_SCRIPT_URL = 'https://pl28953973.profitablecpmratenetwork.com/0e/59/06/0e5906127d5055100faa98776658bf50.js';

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
      console.log('🎬 Starting multi-network ad system...');
      
      // Try ExoClick first
      console.log('🎯 Trying ExoClick banner zone 5877264...');
      const exoClickWorked = await tryExoClickAd();
      
      if (exoClickWorked) {
        console.log('✅ ExoClick ad loaded successfully');
        return true;
      }
      
      // Try Adsterra as backup
      console.log('🔄 ExoClick empty, trying Adsterra backup...');
      const adsterraWorked = await tryAdsterraAd();
      
      if (adsterraWorked) {
        console.log('✅ Adsterra ad loaded successfully');
        return true;
      }
      
      // Final fallback - 30 second timer
      console.log('🔄 All ad networks empty, using 30-second timer fallback');
      showFallbackTimer();
      return true;

    } catch (error) {
      console.error('💥 Error in multi-network ad system:', error);
      showFallbackTimer();
      return true;
    }
  }, []);

  const tryExoClickAd = async (): Promise<boolean> => {
    try {
      await loadScript();
      
      // Create ad container
      const adContainer = createAdContainer('ExoClick Banner Advertisement', '#e74c3c');
      
      // Create ExoClick banner element
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

      const bannerContainer = adContainer.querySelector('#banner-container') as HTMLElement;
      if (bannerContainer) {
        bannerContainer.appendChild(adElement);
      }

      // Trigger ExoClick ad
      if (window.AdProvider) {
        window.AdProvider.push({"serve": {}});
        console.log('✅ ExoClick AdProvider.push() called');
        
        // Check if ad loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (adElement.innerHTML.trim() !== '') {
          console.log('✅ ExoClick banner ad content detected');
          startAdTimer(adContainer, 'ExoClick');
          return true;
        } else {
          console.log('⚠️ ExoClick banner ad is empty');
          document.body.removeChild(adContainer);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ ExoClick ad failed:', error);
      return false;
    }
  };

  const tryAdsterraAd = async (): Promise<boolean> => {
    try {
      console.log('📥 Loading Adsterra script...');
      
      // Create ad container
      const adContainer = createAdContainer('Adsterra Advertisement', '#ff6b35');
      
      // Load Adsterra script
      const script = document.createElement('script');
      script.src = ADSTERRA_SCRIPT_URL;
      script.async = true;
      
      const scriptLoaded = await new Promise((resolve) => {
        script.onload = () => {
          console.log('✅ Adsterra script loaded');
          resolve(true);
        };
        script.onerror = () => {
          console.log('❌ Adsterra script failed to load');
          resolve(false);
        };
        document.head.appendChild(script);
        
        // Timeout after 3 seconds
        setTimeout(() => resolve(false), 3000);
      });

      if (scriptLoaded) {
        console.log('✅ Adsterra ad system activated');
        startAdTimer(adContainer, 'Adsterra');
        return true;
      } else {
        document.body.removeChild(adContainer);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Adsterra ad failed:', error);
      return false;
    }
  };

  const createAdContainer = (title: string, color: string): HTMLElement => {
    const adContainer = document.createElement('div');
    adContainer.id = 'multi-network-ad-overlay';
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

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      color: white;
      text-align: center;
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
    `;

    wrapper.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 20px; color: ${color};">
        🎬 ${title}
      </div>
      <div style="font-size: 18px; margin-bottom: 30px;">
        Please interact with the ad if interested
      </div>
      <div id="banner-container" style="margin: 20px 0; padding: 20px; background: #2a2a2a; border-radius: 8px; min-height: 120px; display: flex; align-items: center; justify-content: center;">
        <div style="color: ${color}; margin-bottom: 15px;">Loading advertisement...</div>
      </div>
      <div style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
        Ad will close automatically after 30 seconds
      </div>
      <div id="timer-display" style="margin-top: 15px; font-size: 18px; color: ${color}; font-weight: bold;">
        Time remaining: <span id="countdown">30</span>s
      </div>
    `;

    adContainer.appendChild(wrapper);
    document.body.appendChild(adContainer);
    adContainerRef.current = adContainer;
    
    return adContainer;
  };

  const showFallbackTimer = () => {
    console.log('🔄 Starting fallback 30-second timer');
    const adContainer = createAdContainer('Advertisement Simulation', '#6c757d');
    
    const bannerContainer = adContainer.querySelector('#banner-container') as HTMLElement;
    if (bannerContainer) {
      bannerContainer.innerHTML = `
        <div style="color: #6c757d; padding: 40px; text-align: center;">
          <div style="font-size: 18px; margin-bottom: 10px;">🎬 Ad Simulation</div>
          <div style="font-size: 14px; opacity: 0.8;">Real ads will load once ExoClick zones are populated</div>
        </div>
      `;
    }
    
    startAdTimer(adContainer, 'Simulation');
  };

  const startAdTimer = (adContainer: HTMLElement, adNetwork: string) => {
    let timeLeft = 30;
    const countdownElement = adContainer.querySelector('#countdown');
    const timerDisplay = adContainer.querySelector('#timer-display') as HTMLElement;
    
    const timer = setInterval(() => {
      timeLeft--;
      if (countdownElement) {
        countdownElement.textContent = timeLeft.toString();
      }
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (timerDisplay) {
          timerDisplay.innerHTML = `✅ ${adNetwork} ad completed! Closing...`;
          timerDisplay.style.color = '#2ecc71';
        }
        
        setTimeout(() => {
          if (adContainerRef.current) {
            try {
              document.body.removeChild(adContainerRef.current);
              adContainerRef.current = null;
              console.log(`✅ ${adNetwork} ad closed after 30 seconds`);
            } catch (e) {
              console.warn('Ad container already removed');
            }
          }
        }, 2000);
      }
    }, 1000);
  };

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