import axios from 'axios';

const testNewUser = async () => {
  try {
    console.log('🧪 Testing new user profile display...\n');
    
    // Step 1: Login with the test user
    console.log('Step 1: Login with test user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@growtogather.com',
      password: 'user123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
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
    
    // Step 2: Fetch profile
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
        bio: profile.bio || 'No bio',
        state: profile.state || 'No state',
        country: profile.country || 'No country'
      });
      
      console.log('\n📋 Summary:');
      console.log('The issue is likely that:');
      if (!profile.full_name) {
        console.log('- full_name is empty/null, so frontend shows "User Name" fallback');
      }
      if (!profile.profession) {
        console.log('- profession is empty/null, so frontend shows "student" fallback');  
      }
      if (!profile.institute) {
        console.log('- institute is empty/null, so frontend shows "MUET" fallback');
      }
      
      // Check if the issue is fallback values being shown
      console.log('\n🎯 Expected Frontend Display:');
      console.log('Name:', profile.full_name || 'User Name (fallback)');
      console.log('Profession:', profile.profession || 'student (fallback)');
      console.log('Institute:', profile.institute || 'MUET (fallback)');
      
    } else {
      console.log('❌ Profile fetch failed:', profileResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testNewUser().then(() => {
  console.log('\n🔍 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});