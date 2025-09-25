import axios from 'axios';

const debugProfileIssue = async () => {
  try {
    console.log('🐛 Debugging profile display issue...\n');
    
    // Test with multiple users
    const testUsers = [
      { email: 'hareesh7737@gmail.com', password: 'TestPassword123!' },
      // Add more test users if available
    ];
    
    for (const testUser of testUsers) {
      console.log(`=== Testing user: ${testUser.email} ===`);
      
      try {
        // Step 1: Login
        console.log('Step 1: Login...');
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
        console.log('User from login response:', {
          id: userFromLogin.id,
          username: userFromLogin.username,
          email: userFromLogin.email,
          full_name: userFromLogin.full_name,
          profession: userFromLogin.profession,
          institute: userFromLogin.institute
        });
        
        // Step 2: Fetch profile using the user ID from login
        console.log('\nStep 2: Fetching profile...');
        const profileResponse = await axios.get(`http://localhost:5000/api/users/profile/${userFromLogin.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileResponse.data.success) {
          const profile = profileResponse.data.data;
          console.log('✅ Profile fetched successfully');
          console.log('Profile data:', {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            full_name: profile.full_name,
            profession: profile.profession,
            institute: profile.institute,
            bio: profile.bio,
            skills_count: profile.skills?.length || 0
          });
          
          // Check if profile matches login user
          if (profile.id === userFromLogin.id) {
            console.log('✅ Profile ID matches login user ID');
          } else {
            console.log('❌ Profile ID does NOT match login user ID');
            console.log(`Login user ID: ${userFromLogin.id}, Profile ID: ${profile.id}`);
          }
          
        } else {
          console.log('❌ Profile fetch failed:', profileResponse.data.message);
        }
        
        // Step 3: Test auth profile endpoint
        console.log('\nStep 3: Testing auth profile endpoint...');
        try {
          const authProfileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (authProfileResponse.data.success) {
            console.log('✅ Auth profile endpoint works');
            console.log('Auth profile:', {
              id: authProfileResponse.data.data.user.id,
              username: authProfileResponse.data.data.user.username,
              email: authProfileResponse.data.data.user.email,
              full_name: authProfileResponse.data.data.user.full_name
            });
          }
        } catch (authError) {
          console.log('❌ Auth profile endpoint failed:', authError.response?.data?.message);
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
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    // Step 4: List all users to see what's available
    console.log('=== All Users in Database ===');
    try {
      // Login as admin or any user to get a token
      const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'hareesh7737@gmail.com',
        password: 'TestPassword123!'
      });
      
      if (adminLogin.data.success) {
        const token = adminLogin.data.data.token;
        
        // This might not work if there's no endpoint, but let's check
        console.log('Trying to list all users...');
        // Note: This endpoint might not exist, that's okay
      }
    } catch (error) {
      console.log('Could not list users (endpoint might not exist)');
    }
    
  } catch (error) {
    console.error('❌ Debug script failed');
    console.error('Error:', error.message);
  }
};

debugProfileIssue().then(() => {
  console.log('🔍 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('Debug script error:', error);
  process.exit(1);
});