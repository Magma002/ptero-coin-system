import bcrypt from 'bcryptjs';

// In-memory storage for Vercel (shared with other endpoints)
let users = {};
let coins = {};

// Initialize with demo data
if (Object.keys(users).length === 0) {
  users['demo'] = {
    username: 'demo',
    email: 'demo@example.com',
    password: '$2b$12$0SzdPD5ggs5LZYTP7GEceOdKZ2PiWMeZA97DMFvP5iN0iGygABJuK', // password123
    firstName: 'Demo',
    lastName: 'User',
    pterodactylId: null,
    pterodactylUuid: null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  
  users['testuser'] = {
    username: 'testuser',
    email: 'test@example.com',
    password: '$2b$12$0SzdPD5ggs5LZYTP7GEceOdKZ2PiWMeZA97DMFvP5iN0iGygABJuK', // password123
    firstName: 'Test',
    lastName: 'User',
    pterodactylId: null,
    pterodactylUuid: null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  
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
    if (users[username] || Object.values(users).some(user => user.email === email)) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in in-memory storage
    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName: firstName || username,
      lastName: lastName || 'User',
      pterodactylId: null,
      pterodactylUuid: null,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users[username] = userData;

    // Initialize user coins with 0 balance
    coins[username] = {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastReward: null,
      transactions: [],
    };

    console.log(`✅ User ${username} registered successfully`);

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