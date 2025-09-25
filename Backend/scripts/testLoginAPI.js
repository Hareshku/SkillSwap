import axios from 'axios';

const testLoginAPI = async () => {
  try {
    const baseURL = 'http://localhost:5000'; // Adjust port if different
    
    console.log('Testing login API endpoint...');
    
    // Test data
    const testData = {
      email: 'hareesh7737@gmail.com',
      password: 'testpassword123'
    };
    
    console.log('Testing with:', { 
      email: testData.email, 
      password: '***hidden***' 
    });
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, testData);
      
      console.log('✅ Login successful!');
      console.log('Status:', response.status);
      console.log('Response:', {
        success: response.data.success,
        message: response.data.message,
        userData: {
          id: response.data.data?.user?.id,
          email: response.data.data?.user?.email,
          role: response.data.data?.user?.role
        },
        hasToken: !!response.data.data?.token
      });
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Login failed');
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running or connection refused');
        console.log('Make sure the backend server is running on port 5000');
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testLoginAPI().then(() => {
  console.log('\nAPI test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});