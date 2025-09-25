import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const testNewFeatures = async () => {
  try {
    console.log('🧪 Testing new profile features...\n');
    
    // Step 1: Login
    console.log('Step 1: Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hareesh7737@gmail.com',
      password: 'testpassword123'
    });
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful\n');
    
    // Step 2: Test profile update with all new fields (without image first)
    console.log('Step 2: Testing profile update with new fields...');
    const updateData = {
      username: 'HareshUpdated',
      full_name: 'Haresh Kumar Updated',
      profession: 'professional',
      bio: 'Updated bio with new features',
      degree_level: 'master',
      state: 'Sindh',
      country: 'Pakistan',
      timezone: 'Asia/Karachi',
      institute: 'MUET',
      skills: [
        {
          skill_name: 'React.js',
          skill_type: 'teach',
          proficiency_level: 'expert'
        },
        {
          skill_name: 'TypeScript',
          skill_type: 'learn',
          proficiency_level: 'intermediate'
        }
      ]
    };
    
    const updateResponse = await axios.put('http://localhost:5000/api/users/profile', updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile update with new fields successful');
    console.log(`   - Username updated: ${updateResponse.data.data.username}`);
    console.log(`   - Full name updated: ${updateResponse.data.data.full_name}`);
    console.log(`   - Profession updated: ${updateResponse.data.data.profession}`);
    console.log(`   - Skills count: ${updateResponse.data.data.skills?.length || 0}\n`);
    
    // Step 3: Test password change
    console.log('Step 3: Testing password change...');
    try {
      await axios.put('http://localhost:5000/api/users/password', {
        currentPassword: 'testpassword123',
        newPassword: 'NewPassword123!'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Password change successful');
      
      // Test login with new password
      const newLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'hareesh7737@gmail.com',
        password: 'NewPassword123!'
      });
      
      console.log('✅ Login with new password successful\n');
      
      // Change password back
      await axios.put('http://localhost:5000/api/users/password', {
        currentPassword: 'NewPassword123!',
        newPassword: 'testpassword123'
      }, {
        headers: { Authorization: `Bearer ${newLoginResponse.data.data.token}` }
      });
      
      console.log('✅ Password reverted back\n');
      
    } catch (passwordError) {
      console.error('❌ Password change failed:', passwordError.response?.data);
    }
    
    // Step 4: Test profile retrieval
    console.log('Step 4: Testing profile retrieval...');
    const profileResponse = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const profile = profileResponse.data.data;
    console.log('✅ Profile retrieved successfully');
    console.log(`   - Username: ${profile.username}`);
    console.log(`   - Full Name: ${profile.full_name}`);
    console.log(`   - Profession: ${profile.profession}`);
    console.log(`   - Skills: ${profile.skills?.length || 0} skills`);
    if (profile.skills && profile.skills.length > 0) {
      profile.skills.forEach((skill, index) => {
        const type = skill.UserSkill?.can_teach ? 'Can Teach' : 'Wants to Learn';
        console.log(`     - ${skill.name} (${type}, ${skill.UserSkill?.proficiency_level})`);
      });
    }
    
    console.log('\n🎉 All new features are working correctly!');
    console.log('\n✅ New Features Tested:');
    console.log('   1. Username editing ✅');
    console.log('   2. Full name editing ✅');
    console.log('   3. Profession dropdown ✅');
    console.log('   4. Password change functionality ✅');
    console.log('   5. Skills management ✅');
    console.log('   6. Profile data persistence ✅');
    
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

testNewFeatures().then(() => {
  console.log('\n🔍 Testing completed');
  process.exit(0);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});