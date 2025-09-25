import axios from 'axios';

const testMultipleUsers = async () => {
  try {
    console.log('🧪 Testing profile display with multiple users...\n');
    
    // Test with multiple users
    const testUsers = [
      { email: 'hareesh7737@gmail.com', password: 'TestPassword123!', name: 'Haresh' },
      { email: 'user@growtogather.com', password: 'user123', name: 'Test User' },
    ];
    
    for (const testUser of testUsers) {
      console.log(`=== Testing user: ${testUser.name} (${testUser.email}) ===`);
      
      try {
        // Step 1: Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        
        if (!loginResponse.data.success) {
          console.log(`❌ Login failed for ${testUser.email}:`, loginResponse.data.message);
          continue;
        }
        
        const token = loginResponse.data.data.token;
        const userFromLogin = loginResponse.data.data.user;
        
        console.log('✅ Login successful');
        
        // Step 2: Fetch profile
        const profileResponse = await axios.get(`http://localhost:5000/api/users/profile/${userFromLogin.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileResponse.data.success) {
          const profile = profileResponse.data.data;
          
          console.log('📋 Profile Data:');
          console.log(`Name: ${profile.full_name || profile.username || 'User'}`);
          console.log(`Profession: ${profile.profession ? profile.profession.charAt(0).toUpperCase() + profile.profession.slice(1) : 'Add profession'}`);
          console.log(`Institute: ${profile.institute || 'Add institute'}`);
          console.log(`Bio: ${profile.bio || 'No bio added yet'}`);
          console.log(`Location: ${profile.state ? `${profile.state}${profile.country ? `, ${profile.country}` : ''}` : 'Not specified'}`);
          console.log(`Timezone: ${profile.timezone || 'Not specified'}`);
          console.log(`Degree: ${profile.degree_level?.replace('_', ' ') || 'Not specified'}`);
          
          // Verify the data is different between users
          console.log(`\n🔍 Unique identifiers:`);
          console.log(`User ID: ${profile.id}`);
          console.log(`Email: ${profile.email}`);
          console.log(`Username: ${profile.username}`);
          
        } else {
          console.log('❌ Profile fetch failed:', profileResponse.data.message);
        }
        
      } catch (error) {
        console.error(`❌ Error testing ${testUser.email}:`);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    console.log('🎯 Expected Behavior:');
    console.log('- Each user should see their own name, not "User Name"');
    console.log('- Each user should see their own profession or "Add profession"');
    console.log('- Each user should see their own institute or "Add institute"');
    console.log('- No more hardcoded "student", "MUET", "High School", etc.');
    console.log('- Each user should have different data based on their profile');
    
  } catch (error) {
    console.error('❌ Test failed');
    console.error('Error:', error.message);
  }
};

testMultipleUsers().then(() => {
  console.log('\n🔍 Multi-user test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});