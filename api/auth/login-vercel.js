import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { kv } from '@vercel/kv';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Pterodactyl Panel Configuration
const PTERODACTYL_URL = process.env.PTERODACTYL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;

// Verify credentials with Pterodactyl Panel
const verifyPterodactylCredentials = async (email, password) => {
  if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
    return { success: false };
  }

  try {
    // Try to authenticate with Pterodactyl using client API
    const response = await fetch(`${PTERODACTYL_URL}/api/client/account`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        success: true,
        pterodactylData: userData.attributes,
      };
    }

    // If direct API key doesn't work, try application API to verify user exists
    const userResponse = await fetch(`${PTERODACTYL_URL}/api/application/users?filter[email]=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (userResponse.ok) {
      const usersData = await userResponse.json();
      if (usersData.data && usersData.data.length > 0) {
        return {
          success: true,
          pterodactylData: usersData.data[0].attributes,
        };
      }
    }

    return { success: false };
  } catch (error) {
    console.error('Error verifying Pterodactyl credentials:', error);
    return { success: false };
  }
};

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
    const loginEmail = email || username;
    const loginUsername = username || email;

    // First, try to verify with Pterodactyl Panel
    console.log('Verifying credentials with Pterodactyl Panel...');
    const pterodactylResult = await verifyPterodactylCredentials(loginEmail, password);

    if (pterodactylResult.success) {
      // Get or create user in KV store
      let user = await kv.hgetall(`user:${loginUsername}`);

      if (!user || Object.keys(user).length === 0) {
        // Create new user from Pterodactyl data
        const pterodactylData = pterodactylResult.pterodactylData;
        user = {
          username: loginUsername,
          email: pterodactylData.email || loginEmail,
          password: await bcrypt.hash(password, 12),
          firstName: pterodactylData.first_name || loginUsername,
          lastName: pterodactylData.last_name || 'User',
          pterodactylId: pterodactylData.id,
          pterodactylUuid: pterodactylData.uuid,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        await kv.hmset(`user:${loginUsername}`, user);

        // Initialize user coins with 0 balance
        await kv.hmset(`coins:${loginUsername}`, {
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          lastReward: null,
        });

        console.log(`✅ New user ${loginUsername} created from Pterodactyl data`);
      } else {
        // Update existing user's last login
        await kv.hset(`user:${loginUsername}`, 'lastLogin', new Date().toISOString());
      }

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

      console.log(`✅ User ${loginUsername} logged in successfully via Pterodactyl`);

      return res.status(200).json({
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
    }

    // Fallback to local authentication if Pterodactyl fails
    console.log('Pterodactyl authentication failed, trying local authentication...');
    
    const user = await kv.hgetall(`user:${loginUsername}`);

    if (!user || Object.keys(user).length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials. Please ensure you have a Pterodactyl panel account or are registered locally.' 
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
    await kv.hset(`user:${loginUsername}`, 'lastLogin', new Date().toISOString());

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

    console.log(`✅ User ${loginUsername} logged in successfully via local auth`);

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