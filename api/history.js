import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Database file paths
const COINS_DB_PATH = path.join(process.cwd(), 'data', 'coins.json');

// Read JSON database
const readDB = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {};
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const username = decoded.username;

    // Get user coins data
    const coins = readDB(COINS_DB_PATH);
    const userCoins = coins[username];

    if (!userCoins) {
      return res.status(200).json({
        transactions: [],
      });
    }

    res.status(200).json({
      transactions: userCoins.transactions || [],
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}