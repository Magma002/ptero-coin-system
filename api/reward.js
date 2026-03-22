import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Cooldown time in milliseconds (2 minutes)
const REWARD_COOLDOWN = 2 * 60 * 1000;

// In-memory storage (shared with other endpoints)
let coins = {};

// Initialize with demo data
if (Object.keys(coins).length === 0) {
  coins['demo'] = {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastReward: null,
    transactions: [],
  };
  
  coins['testuser'] = {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastReward: null,
    transactions: [],
  };
}

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
      coins[username] = userCoins;
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
      description: 'Watched advertisement',
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

    // Save to in-memory storage
    coins[username] = userCoins;

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