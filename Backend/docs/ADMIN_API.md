# Admin Panel API Documentation

This document describes all the admin panel API endpoints for the GrowTogather application.

## Authentication

All admin endpoints require authentication with an admin role. Include the JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Base URL

```
http://localhost:3001/api/admin
```

## Endpoints

### Dashboard & Statistics

#### GET /dashboard/stats
Get admin dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10,
      "active": 8,
      "recent": 5
    },
    "posts": {
      "total": 15,
      "active": 12
    },
    "reports": {
      "total": 3,
      "pending": 1
    }
  }
}
```

#### GET /activity?days=30
Get admin activity summary for the specified number of days.

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "Last 30 days",
    "activity": {
      "usersApproved": 5,
      "usersBlocked": 2,
      "postsApproved": 8,
      "postsRemoved": 1,
      "reportsHandled": 3
    }
  }
}
```

### User Management

#### GET /users
Get all users with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (`active`, `inactive`)
- `role` (optional): Filter by role (`user`, `admin`)

#### PUT /users/:userId/approve
Approve a user for verification.

**Body:**
```json
{
  "notes": "User verified successfully"
}
```

#### PUT /users/:userId/reject
Reject a user's verification.

**Body:**
```json
{
  "reason": "Incomplete profile information"
}
```

#### PUT /users/:userId/status
Block or unblock a user.

**Body:**
```json
{
  "action": "block", // or "unblock"
  "reason": "Violation of community guidelines" // required for block
}
```

#### PUT /users/:userId/role
Change user role (promote/demote).

**Body:**
```json
{
  "newRole": "admin", // or "user"
  "reason": "Promoted to admin role"
}
```

#### PUT /users/bulk-block
Block multiple users at once.

**Body:**
```json
{
  "userIds": [1, 2, 3],
  "reason": "Spam accounts"
}
```

### Post Management

#### GET /posts
Get all posts with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by title or description
- `status` (optional): Filter by status (`active`, `inactive`, `removed`)

#### PUT /posts/:postId/approve
Approve a post.

**Body:**
```json
{
  "notes": "Post approved for publication"
}
```

#### PUT /posts/:postId/moderate
Moderate a post (approve or remove).

**Body:**
```json
{
  "action": "remove", // or "approve"
  "reason": "Inappropriate content" // required for remove
}
```

#### PUT /posts/bulk-approve
Approve multiple posts at once.

**Body:**
```json
{
  "postIds": [1, 2, 3],
  "notes": "Bulk approval of posts"
}
```

### Report Management

#### GET /reports
Get all reports with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (`pending`, `under_review`, `resolved`, `dismissed`)
- `reportType` (optional): Filter by type (`harassment`, `spam`, `inappropriate_content`, etc.)

#### PUT /reports/:reportId/handle
Handle a report (basic).

**Body:**
```json
{
  "action": "approve", // or "reject"
  "adminNotes": "Report reviewed and action taken"
}
```

#### PUT /reports/:reportId/handle-detailed
Handle a report with detailed actions.

**Body:**
```json
{
  "action": "approve",
  "adminNotes": "Detailed review completed",
  "actionTaken": "user_suspended", // no_action, warning_sent, content_removed, user_suspended, user_banned
  "actionDetails": "User suspended for 7 days",
  "priority": "high" // low, medium, high, urgent
}
```

### Pending Approvals

#### GET /pending-approvals
Get pending user and post approvals.

**Query Parameters:**
- `type` (optional): Filter type (`users`, `posts`, `all`)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingUsers": [...],
    "pendingPosts": [...],
    "pagination": {
      "users": { "total": 5, "page": 1, "pages": 1 },
      "posts": { "total": 3, "page": 1, "pages": 1 }
    }
  }
}
```

### Admin Management

#### POST /create-admin
Create a new admin user.

**Body:**
```json
{
  "full_name": "Admin Name",
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // validation errors if applicable
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Admin endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP
- 1000 requests per hour per admin user

## Security Notes

1. All admin operations are logged for audit purposes
2. Sensitive operations require additional confirmation
3. Admin tokens expire after 7 days
4. Failed admin login attempts are monitored
5. All admin actions include timestamps and admin ID for accountability
