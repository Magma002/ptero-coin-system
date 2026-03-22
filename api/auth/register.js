import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Pterodactyl Panel Configuration
const PTERODACTYL_URL = process.env.PTERODACTYL_URL || 'https://your-panel.com';
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || 'your-admin-api-key';

// Database file paths
const USERS_DB_PATH = path.join(process.cwd(), 'data', 'users.json');
const COINS_DB_PATH = path.join(process.cwd(), 'data', 'coins.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

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
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Create user in Pterodactyl Panel
const createPterodactylUser = async (userData) => {
  try {
    const response = await fetch(`${PTERODACTYL_URL}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        username: userData.username,
        first_name: userData.firstName || userData.username,
        last_name: userData.lastName || 'User',
        password: userData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pterodactyl API Error: ${errorData.errors?.[0]?.detail || response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      pterodactylId: result.attributes.id,
      pterodactylUuid: result.attributes.uuid,
    };
  } catch (error) {
    console.error('Error creating Pterodactyl user:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const users = readDB(USERS_DB_PATH);
    if (users[username] || Object.values(users).some(user => user.email === email)) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Pterodactyl Panel
    console.log('Creating user in Pterodactyl Panel...');
    const pterodactylResult = await createPterodactylUser({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    if (!pterodactylResult.success) {
      return res.status(500).json({ 
        error: `Failed to create Pterodactyl account: ${pterodactylResult.error}` 
      });
    }

    // Create user in local database
    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName: firstName || username,
      lastName: lastName || 'User',
      pterodactylId: pterodactylResult.pterodactylId,
      pterodactylUuid: pterodactylResult.pterodactylUuid,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users[username] = userData;
    
    if (!writeDB(USERS_DB_PATH, users)) {
      return res.status(500).json({ 
        error: 'Failed to save user data' 
      });
    }

    // Initialize user coins with 0 balance
    const coins = readDB(COINS_DB_PATH);
    coins[username] = {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastReward: null,
      transactions: [],
    };

    if (!writeDB(COINS_DB_PATH, coins)) {
      console.error('Failed to initialize user coins');
    }

    console.log(`✅ User ${username} registered successfully with Pterodactyl ID: ${pterodactylResult.pterodactylId}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        pterodactylId: userData.pterodactylId,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
}