import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// In-memory storage for Vercel (since file system is read-only)
let users = {};
let coins = {};

// Initialize with demo data
if (Object.keys(users).length === 0) {
  // Create demo users for testing
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
  
  // Initialize coins for demo users
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
    const { username, email, password } = req.body;

    // Validation - accept either username or email
    if ((!username && !email) || !password) {
      return res.status(400).json({ 
        error: 'Username/email and password are required' 
      });
    }

    // Use email if provided, otherwise use username as email
    const loginUsername = username || email;

    // Get user from in-memory storage
    const user = users[loginUsername];

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials. Use "demo" or "testuser" with password "password123" for testing.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users[loginUsername] = user;

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username,
        email: user.email,
        pterodactylId: user.pterodactylId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User ${loginUsername} logged in successfully`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        pterodactylId: user.pterodactylId,
        pterodactylUuid: user.pterodactylUuid,
        lastLogin: user.lastLogin,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
}