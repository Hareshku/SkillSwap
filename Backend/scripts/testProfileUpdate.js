import axios from 'axios';

const testProfileUpdate = async () => {
  try {
    console.log('Testing profile update with skills...');
    
    // You'll need to get a valid token first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hareesh7737@gmail.com',
      password: 'testpassword123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test profile update with skills
    const profileData = {
      bio: 'Test bio update',
      state: 'Sindh',
      country: 'Pakistan',
      timezone: 'Asia/Karachi',
      institute: 'MUET',
      degree_level: 'bachelor', // Valid enum value
      profession: 'student', // Valid enum value
      skills: [
        {
          skill_name: 'JavaScript',
          skill_type: 'teach',
          proficiency_level: 'intermediate'
        },
        {
          skill_name: 'Python',
          skill_type: 'learn',
          proficiency_level: 'beginner'
        }
      ]
    };
    
    console.log('Sending profile update request...');
    console.log('Profile data:', JSON.stringify(profileData, null, 2));
    
    const updateResponse = await axios.put('http://localhost:5000/api/users/profile', profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful!');
    console.log('Response:', updateResponse.data);
    
    // Test retrieving the profile to see if skills are saved
    console.log('\nTesting profile retrieval...');
    const profileResponse = await axios.get(`http://localhost:5000/api/users/profile/${loginResponse.data.data.user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully!');
    console.log('Profile with skills:', JSON.stringify(profileResponse.data.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error response:', error.response.data);
    } else {
      console.error('Network error:', error.message);
    }
  }
};

testProfileUpdate().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});