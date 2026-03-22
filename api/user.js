import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Database file paths
const USERS_DB_PATH = path.join(process.cwd(), 'data', 'users.json');
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

    // Get user data
    const users = readDB(USERS_DB_PATH);
    const user = users[decoded.username];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user coins
    const coins = readDB(COINS_DB_PATH);
    const userCoins = coins[decoded.username] || {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastReward: null,
      transactions: [],
    };

    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        pterodactylId: user.pterodactylId,
        pterodactylUuid: user.pterodactylUuid,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      coins: {
        balance: userCoins.balance,
        totalEarned: userCoins.totalEarned,
        totalSpent: userCoins.totalSpent,
        lastReward: userCoins.lastReward,
      },
    });

  } catch (error) {
    console.error('User data error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}