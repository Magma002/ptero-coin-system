// api/vast.js
// Place this file at: /api/vast.js in your Vercel project root
// Vercel will automatically deploy it as: https://your-site.vercel.app/api/vast
//
// This fetches the ExoClick VAST XML from the server (no CORS),
// then returns it to your browser with CORS headers allowed.

export default async function handler(req, res) {
  const VAST_URL = 'https://s.magsrv.com/v1/vast.php?idzone=5877274';

  try {
    const response = await fetch(VAST_URL, {
      headers: {
        // Forward a realistic User-Agent so ExoClick serves a real ad
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://ptero-coin-system.vercel.app/',
        'Accept': '*/*',
      },
    });

    const text = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'no-store'); // always fresh ad
    res.status(200).send(text);

  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: err.message });
  }
}