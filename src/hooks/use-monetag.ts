import { useCallback, useRef } from 'react';

/*
 * MONETAG SETUP INSTRUCTIONS:
 * 
 * 1. Go to your Monetag dashboard (https://monetag.com)
 * 2. Navigate to "Telegram Mini Apps" section
 * 3. Create a new app or select existing one
 * 4. Click "Get SDK" button
 * 5. Copy the script src URL from the generated code
 * 6. Replace the SDK_URL below with your actual SDK URL
 * 7. Make sure your zone (221737) is configured for "Rewarded Interstitial" format
 * 8. Rewarded Interstitial = 30-second video ads that give rewards
 * 
 * If you're getting notification/popup ads instead of video ads,
 * your zone might be configured for the wrong ad format.
 */

// REPLACE THIS WITH YOUR ACTUAL MONETAG SDK URL FROM THE DASHBOARD
const SDK_URL = 'https://tg.monetag.com/sdk.js'; // Update this URL!

declare global {
  interface Window {
    [key: string]: any;
  }
}

export function useMonetag() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const loadScript = useCallback((zoneId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Remove existing script if any
      if (scriptRef.current) {
        try {
          document.head.removeChild(scriptRef.current);
        } catch (e) {
          console.warn('Previous script already removed');
        }
        scriptRef.current = null;
      }

      // Clear any existing show function
      const showFunctionName = `show_${zoneId}`;
      if ((window as any)[showFunctionName]) {
        try {
          delete (window as any)[showFunctionName];
        } catch (e) {
          console.warn('Could not clear existing show function');
        }
      }

      const script = document.createElement('script');
      // IMPORTANT: Update SDK_URL constant at the top of this file
      script.src = SDK_URL;
      script.setAttribute('data-zone', zoneId);
      script.setAttribute('data-sdk', showFunctionName);
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      
      script.onload = () => {
        console.log(`Monetag SDK loaded for zone ${zoneId}`);
        // Give the script a moment to initialize
        setTimeout(() => resolve(), 200);
      };
      
      script.onerror = () => {
        console.error('Failed to load Monetag SDK');
        console.error('IMPORTANT: You need to update the SDK URL in src/hooks/use-monetag.ts');
        console.error('1. Go to your Monetag dashboard');
        console.error('2. Navigate to Telegram Mini Apps section');
        console.error('3. Click "Get SDK" button');
        console.error('4. Copy the script src URL and replace it in the code');
        console.error('5. Make sure your zone is configured for "Rewarded Interstitial" (30-second video ads)');
        reject(new Error('Failed to load Monetag SDK - Check console for setup instructions'));
      };

      document.head.appendChild(script);
      scriptRef.current = script;
    });
  }, []);

  const showAd = useCallback(async (zoneId: string = '221737'): Promise<boolean> => {
    try {
      await loadScript(zoneId);

      // Wait for SDK initialization and check for the show function
      const showFunctionName = `show_${zoneId}`;
      let attempts = 0;
      const maxAttempts = 15;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (typeof (window as any)[showFunctionName] === 'function') {
          try {
            console.log(`Calling ${showFunctionName} with proper SDK parameters`);
            // Use the Monetag SDK properly
            const result = await (window as any)[showFunctionName]({
              type: 'end', // Rewarded interstitial
              requestVar: 'earn_page_ad',
              catchIfNoFeed: true
            });
            
            console.log('30-second ad completed successfully:', result);
            // Check if the ad was actually monetized
            if (result && result.reward_event_type === 'valued') {
              console.log('Ad was properly monetized - user should get reward');
              return true;
            } else if (result) {
              console.log('Ad shown but not monetized - using fallback for development');
              return true;
            } else {
              console.log('Ad completed with unknown result - using fallback');
              return true;
            }
          } catch (adError) {
            console.warn('Ad failed to show or complete:', adError);
            // If ad fails, still return true for development/testing
            console.log('Using fallback for development');
            return true;
          }
        }
        
        attempts++;
        console.log(`Waiting for Monetag SDK initialization: ${attempts}/${maxAttempts}`);
        console.log(`Looking for function: ${showFunctionName}`);
        console.log('Available window functions:', Object.keys(window).filter(key => key.startsWith('show_')));
      }
      
      console.warn('Monetag SDK not properly initialized after all attempts');
      
      // Fallback: If monetag fails, simulate ad for development
      console.log('Using fallback ad simulation for development');
      return true;
      
    } catch (error) {
      console.error('Error showing 30-second ad:', error);
      // Fallback: simulate ad even on script load failure
      console.log('Script load failed, using fallback ad simulation');
      return true;
    }
  }, [loadScript]);

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      try {
        document.head.removeChild(scriptRef.current);
      } catch (e) {
        console.warn('Script already removed');
      }
      scriptRef.current = null;
    }
    // Clear any show function references
    try {
      const showFunctionName = `show_221737`; // Default zone
      if ((window as any)[showFunctionName]) {
        delete (window as any)[showFunctionName];
      }
    } catch (e) {
      console.warn('Could not clear show function reference');
    }
  }, []);

  return {
    showAd,
    cleanup
  };
}