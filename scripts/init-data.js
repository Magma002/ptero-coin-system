import fs from 'fs';
import path from 'path';

// Create data directory and initialize JSON files
const initializeData = () => {
  const dataDir = path.join(process.cwd(), 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }

  // Initialize users.json if it doesn't exist
  const usersPath = path.join(dataDir, 'users.json');
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify({}, null, 2));
    console.log('✅ Initialized users.json');
  }

  // Initialize coins.json if it doesn't exist
  const coinsPath = path.join(dataDir, 'coins.json');
  if (!fs.existsSync(coinsPath)) {
    fs.writeFileSync(coinsPath, JSON.stringify({}, null, 2));
    console.log('✅ Initialized coins.json');
  }

  console.log('✅ Data initialization complete');
};

// Run initialization
initializeData();