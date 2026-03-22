# Coin Reward System with Pterodactyl Integration

A complete login/register system integrated with Pterodactyl panel authentication, featuring a coin reward system where users earn coins by watching advertisements.

## Features

- **Pterodactyl Panel Integration**: Users can login with their existing Pterodactyl panel credentials
- **Coin System**: All users start with 0 coins and earn exactly 1 coin per advertisement viewed
- **Ad Integration**: Monetag/ExoClick advertisement system with 30-second viewing requirement
- **Cooldown System**: 2-minute cooldown between ad views to prevent abuse
- **JSON Database**: Simple file-based storage for user data and coin balances
- **JWT Authentication**: Secure token-based authentication system

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Data Directory**
   ```bash
   npm run init-data
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Pterodactyl panel details
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Pterodactyl Panel Configuration
PTERODACTYL_URL=https://your-panel.com
PTERODACTYL_API_KEY=your-admin-api-key-here

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret-key-here

# Admin key for resetting coins (optional)
ADMIN_KEY=admin-reset-key-123
```

### Pterodactyl Setup

1. Get your Pterodactyl admin API key from: Admin Panel → API → Application API
2. Ensure the API key has `user:read` and `user:create` permissions
3. Update `PTERODACTYL_URL` with your panel's URL

## How It Works

### Authentication Flow

1. **Login**: Users enter username/email and password
2. **Pterodactyl Verification**: System attempts to authenticate with Pterodactyl panel
3. **Local Account Creation**: If successful, creates/updates local user record with 0 coins
4. **Fallback**: If Pterodactyl auth fails, falls back to local authentication
5. **JWT Token**: Returns secure JWT token for session management

### Coin System

- **Starting Balance**: All users begin with 0 coins
- **Earning**: Users earn exactly 1 coin per 30-second advertisement
- **Cooldown**: 2-minute wait time between ad views
- **Storage**: Coin data saved to `data/coins.json`
- **Transactions**: All coin activities are logged with timestamps

### Advertisement Integration

- **Provider**: Monetag/ExoClick banner advertisements
- **Duration**: 30-second minimum viewing time
- **Validation**: Users must stay on page for full duration
- **Reward**: 1 coin awarded after successful completion

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with Pterodactyl integration
- `POST /api/auth/register` - User registration with Pterodactyl account creation

### User Management
- `GET /api/user` - Get current user data and coin balance

### Rewards
- `POST /api/reward` - Claim reward after watching advertisement

### Admin
- `POST /api/admin/reset-coins` - Reset all user coins to 0 (requires admin key)

## File Structure

```
├── api/
│   ├── auth/
│   │   ├── login.js          # Pterodactyl-integrated login
│   │   └── register.js       # User registration with panel integration
│   ├── admin/
│   │   └── reset-coins.js    # Admin function to reset all coins
│   ├── user.js               # User data and coin balance
│   └── reward.js             # Coin reward system
├── data/
│   ├── users.json            # User accounts and Pterodactyl data
│   └── coins.json            # User coin balances and transactions
├── src/
│   ├── pages/
│   │   ├── login.tsx         # Login page with Pterodactyl integration
│   │   ├── register.tsx      # Registration page
│   │   └── earn.tsx          # Advertisement viewing and coin earning
│   └── hooks/
│       ├── use-auth.ts       # Authentication hooks
│       ├── use-rewards.ts    # Reward claiming hooks
│       └── use-user.ts       # User data hooks
└── scripts/
    └── init-data.js          # Initialize data directory and JSON files
```

## Admin Functions

### Reset All User Coins

```bash
# Using npm script
npm run reset-coins

# Or direct curl command
curl -X POST http://localhost:3000/api/admin/reset-coins \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-admin-key"}'
```

## Development

### Mock Data
The system includes fallback mock data for development when Pterodactyl panel is not available.

### Debug Mode
The earn page includes debug logging to help troubleshoot advertisement integration issues.

### Testing
1. Register a new account (creates Pterodactyl user if configured)
2. Login with Pterodactyl credentials
3. Visit earn page and watch advertisements
4. Verify coins are awarded and cooldown works

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- Admin endpoints require authentication
- Environment variables should be kept secure
- Consider rate limiting for production use

## Troubleshooting

### Common Issues

1. **"Failed to create Pterodactyl account"**
   - Check `PTERODACTYL_API_KEY` permissions
   - Verify `PTERODACTYL_URL` is accessible

2. **"Invalid credentials"**
   - User may not exist in Pterodactyl panel
   - Check panel connectivity

3. **Coins not saving**
   - Ensure `data/` directory has write permissions
   - Check disk space and JSON file integrity

### Debug Steps

1. Check browser console for detailed logs
2. Verify environment variables are set
3. Test Pterodactyl panel connectivity
4. Check `data/` directory permissions
5. Review server logs for API errors

## License

This project is private and proprietary.