import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Database file paths
const COINS_DB_PATH = path.join(process.cwd(), 'data', 'coins.json');

// Cooldown time in milliseconds (2 minutes)
const REWARD_COOLDOWN = 2 * 60 * 1000;

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

// Write JSON database
const writeDB = (filePath, data) => {
  try {
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
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
  if (req.method !== 'POST') {
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
    const now = Date.now();

    // Get user coins data
    const coins = readDB(COINS_DB_PATH);
    let userCoins = coins[username];

    // Initialize user coins if not exists
    if (!userCoins) {
      userCoins = {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastReward: null,
        transactions: [],
      };
    }

    // Check cooldown
    if (userCoins.lastReward) {
      const timeSinceLastReward = now - new Date(userCoins.lastReward).getTime();
      if (timeSinceLastReward < REWARD_COOLDOWN) {
        const remainingCooldown = Math.ceil((REWARD_COOLDOWN - timeSinceLastReward) / 1000);
        return res.status(429).json({
          error: 'Reward cooldown active',
          message: `Please wait ${Math.floor(remainingCooldown / 60)}:${(remainingCooldown % 60).toString().padStart(2, '0')} before claiming another reward`,
          cooldownRemaining: remainingCooldown,
        });
      }
    }

    // Award 1 coin for watching ad
    const rewardAmount = 1;
    const transaction = {
      id: Date.now().toString(),
      type: 'earn',
      amount: rewardAmount,
      description: 'Watched Monetag advertisement',
      timestamp: new Date().toISOString(),
    };

    // Update user coins
    userCoins.balance += rewardAmount;
    userCoins.totalEarned += rewardAmount;
    userCoins.lastReward = new Date().toISOString();
    userCoins.transactions.unshift(transaction); // Add to beginning

    // Keep only last 50 transactions
    if (userCoins.transactions.length > 50) {
      userCoins.transactions = userCoins.transactions.slice(0, 50);
    }

    // Save to database
    coins[username] = userCoins;
    if (!writeDB(COINS_DB_PATH, coins)) {
      return res.status(500).json({ error: 'Failed to save reward' });
    }

    console.log(`✅ User ${username} earned ${rewardAmount} coin(s). New balance: ${userCoins.balance}`);

    res.status(200).json({
      success: true,
      amount: rewardAmount,
      newBalance: userCoins.balance,
      transaction,
    });

  } catch (error) {
    console.error('Reward error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}