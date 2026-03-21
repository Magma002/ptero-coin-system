# Adsterra Setup for 30-Second Video Ads

## Current Issue
You're getting notification/popup ads instead of 30-second video ads because the current script is configured for **notification ads**, not **rewarded video ads**.

## The Problem
The script you provided:
```
https://pl28953973.profitablecpmratenetwork.com/0e/59/06/0e5906127d5055100faa98776658bf50.js
```
This is a **notification/popup ad script**, which is why you see the "AdZilla: HUGE monster is shaking crypto!" popup instead of a video ad.

## Solution: Get Rewarded Video Ad Script

### Step 1: Access Your Adsterra Dashboard
1. Go to [Adsterra Dashboard](https://adsterra.com)
2. Log into your publisher account

### Step 2: Create Video Ad Zone
1. Click **"Add New Zone"** or **"Create Zone"**
2. Select **"Rewarded Video"** or **"Video Ads"** format
3. **NOT** "Push Notifications" or "Popunder"
4. Configure for 30-second duration
5. Set reward trigger to "Video Completion"

### Step 3: Get Video Ad Script
1. After creating the video ad zone, you'll get a script like:
   ```html
   <script src="https://[domain]/[video-ad-script].js"></script>
   ```
2. This should be different from your current notification script
3. Copy the script URL (just the `src` part)

### Step 4: Update Your Code
1. Open `src/hooks/use-adsterra.ts`
2. Find this line:
   ```javascript
   const ADSTERRA_SCRIPT_URL = 'https://pl28953973.profitablecpmratenetwork.com/0e/59/06/0e5906127d5055100faa98776658bf50.js';
   ```
3. Replace it with your new video ad script URL:
   ```javascript
   const ADSTERRA_SCRIPT_URL = 'https://[your-video-ad-domain]/[your-video-script].js';
   ```

### Step 5: Test
1. Run `npm run build`
2. Test the earn page
3. You should now see a proper 30-second video ad instead of notifications

## Expected Behavior After Fix
- User clicks "Watch 30s Adsterra Ad & Earn 1 Coin"
- A full-screen 30-second video ad appears
- User must watch the complete video
- After 30 seconds, user gets 1 coin
- No notification popups should appear

## Ad Format Comparison

| Format | What You Get | What You Have Now |
|--------|-------------|-------------------|
| **Rewarded Video** ✅ | 30-second video ads that users watch for rewards | ❌ Not configured |
| **Push Notifications** ❌ | Popup notifications like "AdZilla: HUGE monster..." | ✅ Currently active |
| **Popunder** ❌ | Ads that open in new tabs/windows | ❌ Not what we want |

## Troubleshooting

### If you still see notification ads:
1. Make sure you created a **"Rewarded Video"** zone, not a notification zone
2. Check that the script URL is different from the notification script
3. Clear browser cache and try again

### If no ads show at all:
1. Check browser console for errors
2. Make sure the video ad script URL is correct
3. Verify your Adsterra account has video ad inventory

### If you can't find video ad options:
1. Contact Adsterra support
2. Ask specifically for "Rewarded Video" or "Video Ad" formats
3. Some accounts might need approval for video ads

## Current Status
- ✅ 30-second timer working
- ✅ Reward system (1 coin) working  
- ✅ Page visibility detection working
- ❌ **Need proper video ad script from Adsterra**
- ❌ Currently showing notification ads instead

Once you get the correct video ad script URL and update the code, everything should work perfectly!