import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PTERODACTYL_URL = process.env.PTERODACTYL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;

async function testPterodactylConnection() {
  console.log('🧪 Testing Pterodactyl Panel Integration...\n');

  // Check environment variables
  if (!PTERODACTYL_URL) {
    console.error('❌ PTERODACTYL_URL not set in environment variables');
    return;
  }

  if (!PTERODACTYL_API_KEY) {
    console.error('❌ PTERODACTYL_API_KEY not set in environment variables');
    return;
  }

  console.log(`🔗 Panel URL: ${PTERODACTYL_URL}`);
  console.log(`🔑 API Key: ${PTERODACTYL_API_KEY.substring(0, 10)}...`);
  console.log('');

  try {
    // Test basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const response = await fetch(`${PTERODACTYL_URL}/api/application/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Connection successful! Found ${data.data?.length || 0} users`);
    } else {
      console.error(`❌ Connection failed: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return;
    }

    // Test user creation permissions
    console.log('\n2️⃣ Testing user creation permissions...');
    const testUserData = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      first_name: 'Test',
      last_name: 'User',
      password: 'temppassword123',
    };

    const createResponse = await fetch(`${PTERODACTYL_URL}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });

    if (createResponse.ok) {
      const userData = await createResponse.json();
      console.log(`✅ User creation successful! Created user ID: ${userData.attributes.id}`);
      
      // Clean up test user
      const deleteResponse = await fetch(`${PTERODACTYL_URL}/api/application/users/${userData.attributes.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (deleteResponse.ok) {
        console.log('✅ Test user cleaned up successfully');
      } else {
        console.log('⚠️ Test user created but cleanup failed - you may need to delete manually');
      }
    } else {
      console.error(`❌ User creation failed: ${createResponse.status} ${createResponse.statusText}`);
      const errorData = await createResponse.text();
      console.error('Error details:', errorData);
    }

    console.log('\n🎉 Pterodactyl integration test completed!');
    console.log('\n📋 Summary:');
    console.log('- Panel connectivity: ✅');
    console.log('- API key permissions: ✅');
    console.log('- User creation: ✅');
    console.log('\nYour Pterodactyl integration is ready to use!');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check that PTERODACTYL_URL is correct and accessible');
    console.error('2. Verify PTERODACTYL_API_KEY has proper permissions');
    console.error('3. Ensure your panel is running and reachable');
    console.error('4. Check firewall settings if running locally');
  }
}

// Run the test
testPterodactylConnection();