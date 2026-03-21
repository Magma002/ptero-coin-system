# Monetag Setup Instructions

## Current Issue
You're getting notification/popup ads instead of 30-second video ads because:
1. The SDK URL might be incorrect
2. Your zone (221737) might be configured for the wrong ad format

## Fix Steps

### Step 1: Get the Correct SDK URL
1. Go to your [Monetag Dashboard](https://monetag.com)
2. Navigate to **"Telegram Mini Apps"** section
3. Select your app or create a new one
4. Click **"Get SDK"** button
5. Copy the script `src` URL from the generated code
6. It should look like: `https://[some-domain]/sdk.js`

### Step 2: Update the Code
1. Open `src/hooks/use-monetag.ts`
2. Find the line: `const SDK_URL = 'https://tg.monetag.com/sdk.js';`
3. Replace it with your actual SDK URL from Step 1

### Step 3: Check Your Zone Configuration
1. In your Monetag dashboard, find zone **221737**
2. Make sure it's configured for **"Rewarded Interstitial"** format
3. Rewarded Interstitial = 30-second video ads that give rewards
4. If it's configured for notifications/popups, that's why you're seeing those instead

### Step 4: Test
1. Run `npm run build`
2. Test the earn page
3. Check browser console for detailed logs
4. Look for messages like "Calling show_221737 with proper SDK parameters"

## Expected Behavior
- User clicks "Watch 30s Ad & Earn 1 Coin"
- A 30-second video ad should appear (full screen)
- User must watch the full ad to get 1 coin
- If user leaves the page during ad, no reward is given

## Troubleshooting
- Check browser console for error messages
- The console will show which functions are available (look for `show_221737`)
- If SDK fails to load, fallback simulation will run (for development)
- Make sure your zone is for Telegram Mini Apps, not regular web ads

## Current Configuration
- Zone ID: 221737
- Expected function: `show_221737`
- Ad type: Rewarded Interstitial (30-second video)
- Reward: 1 coin per completed ad
- Cooldown: 2 minutes between ads