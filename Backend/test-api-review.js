import fetch from 'node-fetch';

const testReviewAPI = async () => {
  try {
    console.log('=== Testing Review API Endpoint ===');

    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      console.error('Failed to get token');
      return;
    }

    // Now test creating a review with the same data format the frontend would send
    const reviewData = {
      reviewee_id: 9,
      rating: 5,
      feedback: 'This is a test review with sufficient length to meet minimum requirements.',
      skills_exchanged: ['JavaScript', 'React'],
      exchange_type: 'mutual_exchange',
      communication_rating: 5,
      knowledge_rating: 5,
      punctuality_rating: 5,
      would_recommend: true,
      is_public: true
    };

    console.log('Sending review data:', reviewData);

    const reviewResponse = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(reviewData)
    });

    const reviewResult = await reviewResponse.json();
    console.log('Review API response status:', reviewResponse.status);
    console.log('Review API response:', reviewResult);

    if (reviewResponse.ok) {
      console.log('✅ Review created successfully via API');
    } else {
      console.log('❌ Review creation failed via API');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

testReviewAPI();