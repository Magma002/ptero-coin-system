import fs from 'fs';
import path from 'path';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple admin key check (you should use a proper admin authentication)
    const { adminKey } = req.body;
    const expectedAdminKey = process.env.ADMIN_KEY || 'admin-reset-key-123';
    
    if (adminKey !== expectedAdminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all user coins
    const coins = readDB(COINS_DB_PATH);
    let resetCount = 0;

    // Reset all user balances to 0
    for (const username in coins) {
      if (coins[username].balance !== 0) {
        resetCount++;
      }
      
      coins[username] = {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastReward: null,
        transactions: [],
      };
    }

    // Save updated coins data
    if (!writeDB(COINS_DB_PATH, coins)) {
      return res.status(500).json({ error: 'Failed to reset coins' });
    }

    console.log(`✅ Reset coins for ${resetCount} users to 0`);

    res.status(200).json({
      success: true,
      message: `Successfully reset coins for ${resetCount} users`,
      resetCount,
    });

  } catch (error) {
    console.error('Reset coins error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}