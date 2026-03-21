import { useCallback, useRef } from 'react';

/*
 * EXOCLICK VAST VIDEO AD INTEGRATION
 * 
 * Using the new Outstream Video zone:
 * - Zone ID: 5877274
 * - VAST URL: https://s.magsrv.com/v1/vast.php?idzone=5877274
 * - Type: Outstream Video (VAST)
 */

// ExoClick VAST video configuration
const EXOCLICK_ZONE_ID = '5877274';
const VAST_URL = `https://s.magsrv.com/v1/vast.php?idzone=${EXOCLICK_ZONE_ID}`;

declare global {
  interface Window {
    [key: string]: any;
  }
}

export function useExoClick() {
  const adContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const showAd = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎬 Starting ExoClick VAST video ad...');
      console.log('🎯 Zone ID:', EXOCLICK_ZONE_ID);
      console.log('📍 VAST URL:', VAST_URL);

      // Create full-screen video ad container
      const adContainer = document.createElement('div');
      adContainer.id = 'exoclick-vast-container';
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

      // Create video element for VAST ad
      const videoElement = document.createElement('video');
      videoElement.style.cssText = `
        width: 90%;
        max-width: 800px;
        height: auto;
        max-height: 70vh;
        border-radius: 8px;
        background: #000;
      `;
      videoElement.controls = false;
      videoElement.autoplay = true;
      videoElement.muted = false;
      videoElement.playsInline = true;

      // Create UI wrapper
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        color: white;
        text-align: center;
        font-family: Arial, sans-serif;
        padding: 20px;
        width: 100%;
        max-width: 900px;
      `;

      wrapper.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px; color: #e74c3c;">
          🎬 ExoClick Video Advertisement
        </div>
        <div style="font-size: 16px; margin-bottom: 20px; opacity: 0.9;">
          Watch the full video to earn 1 coin
        </div>
        <div id="video-container" style="margin: 20px 0; position: relative;">
          <!-- Video will be inserted here -->
        </div>
        <div id="timer-display" style="margin-top: 20px; font-size: 18px; color: #e74c3c; font-weight: bold;">
          Loading video... <span id="countdown">30</span>s remaining
        </div>
        <div style="margin-top: 15px; font-size: 14px; opacity: 0.7;">
          Stay on this page for the full duration to earn your reward
        </div>
      `;

      adContainer.appendChild(wrapper);
      document.body.appendChild(adContainer);
      adContainerRef.current = adContainer;

      // Insert video element
      const videoContainer = wrapper.querySelector('#video-container') as HTMLElement;
      if (videoContainer) {
        videoContainer.appendChild(videoElement);
      }
      videoRef.current = videoElement;

      // Fetch VAST XML and parse it
      console.log('📥 Fetching VAST XML...');
      try {
        const vastResponse = await fetch(VAST_URL);
        const vastXML = await vastResponse.text();
        console.log('✅ VAST XML received:', vastXML.substring(0, 200) + '...');

        // Parse VAST XML to extract video URL
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(vastXML, 'text/xml');
        
        // Look for MediaFile elements in VAST
        const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
        let videoUrl = '';
        
        if (mediaFiles.length > 0) {
          // Get the first MP4 video URL
          for (let i = 0; i < mediaFiles.length; i++) {
            const mediaFile = mediaFiles[i];
            const type = mediaFile.getAttribute('type');
            if (type && type.includes('mp4')) {
              videoUrl = mediaFile.textContent?.trim() || '';
              break;
            }
          }
          
          // If no MP4 found, use the first available
          if (!videoUrl && mediaFiles[0]) {
            videoUrl = mediaFiles[0].textContent?.trim() || '';
          }
        }

        if (videoUrl) {
          console.log('🎥 Video URL found:', videoUrl);
          videoElement.src = videoUrl;
          
          // Set up video event handlers
          videoElement.onloadstart = () => {
            console.log('📺 Video loading started');
            const timerDisplay = wrapper.querySelector('#timer-display') as HTMLElement;
            if (timerDisplay) {
              timerDisplay.innerHTML = 'Video loading... Please wait';
            }
          };

          videoElement.oncanplay = () => {
            console.log('✅ Video ready to play');
            videoElement.play().catch(e => console.warn('Autoplay failed:', e));
          };

          videoElement.onplay = () => {
            console.log('▶️ Video started playing');
            startTimer(wrapper);
          };

          videoElement.onended = () => {
            console.log('🏁 Video ended');
            completeAd(wrapper);
          };

          videoElement.onerror = (e) => {
            console.error('❌ Video error:', e);
            fallbackTimer(wrapper);
          };

        } else {
          console.warn('⚠️ No video URL found in VAST, using fallback timer');
          fallbackTimer(wrapper);
        }

      } catch (vastError) {
        console.error('❌ VAST fetch error:', vastError);
        console.log('🔄 Using fallback 30-second timer');
        fallbackTimer(wrapper);
      }

      return true;

    } catch (error) {
      console.error('💥 Error showing ExoClick VAST ad:', error);
      
      // Clean up on error
      if (adContainerRef.current) {
        try {
          document.body.removeChild(adContainerRef.current);
        } catch (e) {
          console.warn('Error cleaning up ad container');
        }
        adContainerRef.current = null;
      }
      
      return true; // Continue with reward flow
    }
  }, []);

  // Timer functions
  const startTimer = (wrapper: Element) => {
    let timeLeft = 30;
    const countdownElement = wrapper.querySelector('#countdown');
    const timerDisplay = wrapper.querySelector('#timer-display') as HTMLElement;
    
    if (timerDisplay) {
      timerDisplay.innerHTML = `Video playing... <span id="countdown">${timeLeft}</span>s remaining`;
    }
    
    const timer = setInterval(() => {
      timeLeft--;
      const currentCountdown = wrapper.querySelector('#countdown');
      if (currentCountdown) {
        currentCountdown.textContent = timeLeft.toString();
      }
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        completeAd(wrapper);
      }
    }, 1000);
  };

  const fallbackTimer = (wrapper: Element) => {
    console.log('🔄 Starting fallback 30-second timer');
    let timeLeft = 30;
    const timerDisplay = wrapper.querySelector('#timer-display') as HTMLElement;
    
    if (timerDisplay) {
      timerDisplay.innerHTML = `Ad simulation... <span id="countdown">${timeLeft}</span>s remaining`;
    }
    
    const timer = setInterval(() => {
      timeLeft--;
      const currentCountdown = wrapper.querySelector('#countdown');
      if (currentCountdown) {
        currentCountdown.textContent = timeLeft.toString();
      }
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        completeAd(wrapper);
      }
    }, 1000);
  };

  const completeAd = (wrapper: Element) => {
    const timerDisplay = wrapper.querySelector('#timer-display') as HTMLElement;
    if (timerDisplay) {
      timerDisplay.innerHTML = '✅ Ad completed! Closing...';
      timerDisplay.style.color = '#2ecc71';
    }
    
    setTimeout(() => {
      if (adContainerRef.current) {
        try {
          document.body.removeChild(adContainerRef.current);
          adContainerRef.current = null;
          console.log('✅ ExoClick VAST ad closed after completion');
        } catch (e) {
          console.warn('Ad container already removed');
        }
      }
    }, 2000);
  };

  const closeAd = useCallback(() => {
    if (adContainerRef.current) {
      try {
        document.body.removeChild(adContainerRef.current);
        console.log('🔒 ExoClick VAST ad closed manually');
      } catch (e) {
        console.warn('Ad container already removed');
      }
      adContainerRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (adContainerRef.current) {
      try {
        document.body.removeChild(adContainerRef.current);
      } catch (e) {
        console.warn('Ad container already removed');
      }
      adContainerRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current = null;
    }
  }, []);

  return {
    showAd,
    closeAd,
    cleanup
  };
}