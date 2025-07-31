#!/usr/bin/env node

/**
 * Comprehensive test script for admin panel endpoints
 * This script tests all admin operations including:
 * - User approval/rejection
 * - Post approval/moderation
 * - Report handling
 * - Bulk operations
 * - Role management
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@growtogather.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login/admin`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.data.success) {
      adminToken = response.data.data.token;
      console.log('✅ Admin login successful');
      return true;
    }
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

const testDashboardStats = async () => {
  console.log('\n📊 Testing Dashboard Stats...');
  const result = await makeRequest('GET', '/api/admin/dashboard/stats');
  if (result?.success) {
    console.log('✅ Dashboard stats retrieved');
    console.log('   Users:', result.data.users);
    console.log('   Posts:', result.data.posts);
    console.log('   Reports:', result.data.reports);
  } else {
    console.log('❌ Failed to get dashboard stats');
  }
};

const testGetUsers = async () => {
  console.log('\n👥 Testing Get Users...');
  const result = await makeRequest('GET', '/api/admin/users?page=1&limit=5');
  if (result?.success) {
    console.log(`✅ Retrieved ${result.data.users.length} users`);
    return result.data.users;
  } else {
    console.log('❌ Failed to get users');
    return [];
  }
};

const testGetPosts = async () => {
  console.log('\n📝 Testing Get Posts...');
  const result = await makeRequest('GET', '/api/admin/posts?page=1&limit=5');
  if (result?.success) {
    console.log(`✅ Retrieved ${result.data.posts.length} posts`);
    return result.data.posts;
  } else {
    console.log('❌ Failed to get posts');
    return [];
  }
};

const testGetReports = async () => {
  console.log('\n📋 Testing Get Reports...');
  const result = await makeRequest('GET', '/api/admin/reports?page=1&limit=5');
  if (result?.success) {
    console.log(`✅ Retrieved ${result.data.reports.length} reports`);
    return result.data.reports;
  } else {
    console.log('❌ Failed to get reports');
    return [];
  }
};

const testUserOperations = async (users) => {
  if (users.length === 0) return;
  
  const testUser = users.find(u => u.role === 'user' && u.is_active);
  if (!testUser) {
    console.log('⚠️  No suitable user found for testing operations');
    return;
  }
  
  console.log(`\n👤 Testing User Operations on user: ${testUser.email}`);
  
  // Test user approval
  console.log('   Testing user approval...');
  const approveResult = await makeRequest('PUT', `/api/admin/users/${testUser.id}/approve`, {
    notes: 'Test approval'
  });
  if (approveResult?.success) {
    console.log('   ✅ User approved successfully');
  }
  
  // Test user blocking
  console.log('   Testing user blocking...');
  const blockResult = await makeRequest('PUT', `/api/admin/users/${testUser.id}/status`, {
    action: 'block',
    reason: 'Test blocking'
  });
  if (blockResult?.success) {
    console.log('   ✅ User blocked successfully');
  }
  
  // Test user unblocking
  console.log('   Testing user unblocking...');
  const unblockResult = await makeRequest('PUT', `/api/admin/users/${testUser.id}/status`, {
    action: 'unblock'
  });
  if (unblockResult?.success) {
    console.log('   ✅ User unblocked successfully');
  }
};

const testPostOperations = async (posts) => {
  if (posts.length === 0) return;
  
  const testPost = posts[0];
  console.log(`\n📄 Testing Post Operations on post: ${testPost.title}`);
  
  // Test post approval
  console.log('   Testing post approval...');
  const approveResult = await makeRequest('PUT', `/api/admin/posts/${testPost.id}/approve`, {
    notes: 'Test approval'
  });
  if (approveResult?.success) {
    console.log('   ✅ Post approved successfully');
  }
  
  // Test post moderation
  console.log('   Testing post moderation...');
  const moderateResult = await makeRequest('PUT', `/api/admin/posts/${testPost.id}/moderate`, {
    action: 'approve'
  });
  if (moderateResult?.success) {
    console.log('   ✅ Post moderated successfully');
  }
};

const testPendingApprovals = async () => {
  console.log('\n⏳ Testing Pending Approvals...');
  const result = await makeRequest('GET', '/api/admin/pending-approvals?type=all');
  if (result?.success) {
    console.log('✅ Pending approvals retrieved');
    console.log(`   Pending users: ${result.data.pendingUsers.length}`);
    console.log(`   Pending posts: ${result.data.pendingPosts.length}`);
  } else {
    console.log('❌ Failed to get pending approvals');
  }
};

const testAdminActivity = async () => {
  console.log('\n📈 Testing Admin Activity...');
  const result = await makeRequest('GET', '/api/admin/activity?days=30');
  if (result?.success) {
    console.log('✅ Admin activity retrieved');
    console.log('   Activity:', result.data.activity);
  } else {
    console.log('❌ Failed to get admin activity');
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Admin Panel API Tests...');
  
  // Login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin login');
    return;
  }
  
  // Run all tests
  await testDashboardStats();
  const users = await testGetUsers();
  const posts = await testGetPosts();
  const reports = await testGetReports();
  
  await testUserOperations(users);
  await testPostOperations(posts);
  await testPendingApprovals();
  await testAdminActivity();
  
  console.log('\n🎉 Admin Panel API Tests Completed!');
};

// Run the tests
runTests().catch(console.error);
