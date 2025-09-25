import axios from 'axios';

const testPasswordChange = async () => {
  try {
    console.log('🔐 Testing password change functionality...\n');
    
    // Step 1: Login with current password
    console.log('Step 1: Login with current password...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hareesh7737@gmail.com',
      password: 'testpassword123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Initial login failed - checking if password was already changed');
      
      // Try with the new password
      const altLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'hareesh7737@gmail.com',
        password: 'NewTestPassword123!'
      });
      
      if (altLoginResponse.data.success) {
        console.log('✅ Login successful with new password');
        // Change back to original
        await testPasswordChangeFlow(altLoginResponse.data.data.token, 'NewTestPassword123!', 'testpassword123');
        return;
      } else {
        console.log('❌ Cannot login with either password');
        return;
      }
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful with original password\n');
    
    // Step 2: Test password change
    await testPasswordChangeFlow(token, 'testpassword123', 'NewTestPassword123!');
    
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

const testPasswordChangeFlow = async (token, currentPassword, newPassword) => {
  try {
    console.log('Step 2: Changing password...');
    const changeResponse = await axios.put('http://localhost:5000/api/users/password', {
      currentPassword: currentPassword,
      newPassword: newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (changeResponse.data.success) {
      console.log('✅ Password change API returned success');
    } else {
      console.log('❌ Password change API returned failure:', changeResponse.data.message);
      return;
    }
    
    // Step 3: Test login with new password
    console.log('\nStep 3: Testing login with new password...');
    const newLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hareesh7737@gmail.com',
      password: newPassword
    });
    
    if (newLoginResponse.data.success) {
      console.log('✅ Login successful with new password');
      console.log('✅ Password change functionality is working correctly!');
      
      // Step 4: Change password back to original
      console.log('\nStep 4: Changing password back to original...');
      const revertResponse = await axios.put('http://localhost:5000/api/users/password', {
        currentPassword: newPassword,
        newPassword: 'testpassword123'
      }, {
        headers: { Authorization: `Bearer ${newLoginResponse.data.data.token}` }
      });
      
      if (revertResponse.data.success) {
        console.log('✅ Password successfully reverted to original');
        
        // Verify original password works
        const finalLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: 'hareesh7737@gmail.com',
          password: 'testpassword123'
        });
        
        if (finalLoginResponse.data.success) {
          console.log('✅ Confirmed: Original password works after revert');
        } else {
          console.log('❌ Original password doesn\'t work after revert');
        }
      } else {
        console.log('❌ Failed to revert password:', revertResponse.data.message);
      }
      
    } else {
      console.log('❌ Login failed with new password:', newLoginResponse.data.message);
      console.log('❌ Password change is not working correctly!');
    }
    
    // Step 5: Test login with old password (should fail)
    console.log('\nStep 5: Testing login with old password (should fail)...');
    try {
      const oldPasswordResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'hareesh7737@gmail.com',
        password: currentPassword
      });
      
      if (oldPasswordResponse.data.success) {
        console.log('❌ Old password still works - password was not actually changed');
      } else {
        console.log('✅ Old password correctly rejected');
      }
    } catch (oldPasswordError) {
      console.log('✅ Old password correctly rejected');
    }
    
  } catch (error) {
    console.error('❌ Password change flow failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testPasswordChange().then(() => {
  console.log('\n🔍 Password change test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});