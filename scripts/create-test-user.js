import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

async function createTestUser() {
  console.log('🧪 Creating test user...');

  const username = 'testuser';
  const email = 'test@example.com';
  const password = 'password123';

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user data
  const userData = {
    username,
    email,
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    pterodactylId: null,
    pterodactylUuid: null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };

  // Save user
  const users = readDB(USERS_DB_PATH);
  users[username] = userData;
  
  if (!writeDB(USERS_DB_PATH, users)) {
    console.error('❌ Failed to save user data');
    return;
  }

  // Initialize user coins
  const coins = readDB(COINS_DB_PATH);
  coins[username] = {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastReward: null,
    transactions: [],
  };

  if (!writeDB(COINS_DB_PATH, coins)) {
    console.error('❌ Failed to initialize user coins');
    return;
  }

  console.log('✅ Test user created successfully!');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`Email: ${email}`);
  console.log('');
  console.log('You can now login with these credentials.');
}

createTestUser();