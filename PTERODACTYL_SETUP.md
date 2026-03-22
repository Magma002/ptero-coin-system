# Pterodactyl Panel Integration Setup

This guide will help you set up the login/register system to work with your Pterodactyl panel.

## Prerequisites

- A running Pterodactyl panel
- Admin access to the panel
- Node.js application with the provided API endpoints

## Configuration Steps

### 1. Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Your Pterodactyl panel URL
PTERODACTYL_URL=https://your-panel.com

# Admin API key from your Pterodactyl panel
PTERODACTYL_API_KEY=your-admin-api-key-here

# JWT secret for authentication (generate a random string)
JWT_SECRET=your-jwt-secret-key-here

# Admin key for resetting coins (optional)
ADMIN_KEY=admin-reset-key-123
```

### 2. Get Pterodactyl Admin API Key

1. Log into your Pterodactyl panel as an admin
2. Go to Admin Panel → API → Application API
3. Create a new API key with the following permissions:
   - `user:read` - To verify user existence
   - `user:create` - To create new users during registration

### 3. How Authentication Works

#### Login Process:
1. User enters username/email and password
2. System tries to authenticate with Pterodactyl panel using the credentials
3. If successful, creates/updates local user record with 0 coins
4. If Pterodactyl auth fails, falls back to local authentication
5. Returns JWT token for session management

#### Registration Process:
1. User provides username, email, password, and optional first/last name
2. System creates user in Pterodactyl panel
3. Creates local user record with 0 coins balance
4. Returns success confirmation

### 4. Coin System

- All users start with 0 coins
- Coins are stored in `data/coins.json`
- Users earn 1 coin per advertisement viewed
- 2-minute cooldown between rewards

### 5. Admin Functions

#### Reset All User Coins to 0:
```bash
curl -X POST http://localhost:3000/api/admin/reset-coins \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-admin-key"}'
```

### 6. File Structure

```
data/
├── users.json     # User accounts and Pterodactyl data
└── coins.json     # User coin balances and transactions
```

### 7. Testing the Integration

1. Try logging in with existing Pterodactyl panel credentials
2. Register a new account (should create user in both systems)
3. Check that coins start at 0 for all users
4. Test ad viewing and coin earning

## Troubleshooting

### Common Issues:

1. **"Failed to create Pterodactyl account"**
   - Check your `PTERODACTYL_API_KEY` is correct
   - Ensure the API key has `user:create` permissions
   - Verify `PTERODACTYL_URL` is accessible

2. **"Invalid credentials"**
   - User might not exist in Pterodactyl panel
   - Password might be incorrect
   - Check Pterodactyl panel is accessible

3. **Coins not saving**
   - Ensure `data/` directory has write permissions
   - Check disk space
   - Verify JSON files are not corrupted

### Debug Mode:

Enable debug logging by checking the console output when users log in or register. The system will log:
- Pterodactyl authentication attempts
- User creation/updates
- Coin balance changes

## Security Notes

- Store environment variables securely
- Use strong JWT secrets
- Regularly rotate API keys
- Monitor admin endpoint usage
- Consider rate limiting for authentication endpoints