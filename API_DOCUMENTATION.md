# API Documentation - Novel Backend

Base URL: `http://localhost:3000`

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [Role-Based Endpoints](#role-based-endpoints)
- [Response Examples](#response-examples)

---

## Authentication Endpoints

### 1. User Signup
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"  // Optional: "ADMIN", "EDITOR", or "USER" (default: USER)
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "USER",
    "created_at": "2025-12-12T10:30:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "statusCode": 400,
  "message": "User with this email already exists"
}
```

---

### 2. User Login
**POST** `/auth/login`

Authenticate and receive JWT access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDI5MjU0MzIsImV4cCI6MTcwMzAxMTgzMn0..."
}
```

**Error (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**JWT Payload:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "role": "USER",
  "iat": 1702925432,
  "exp": 1703011832
}
```

---

### 3. Forgot Password
**POST** `/auth/forgot-password`

Generate a password reset token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset token generated successfully",
  "reset_token": "cf36470911d65efa054a222cf72bf3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Note:** Token expires in 15 minutes.

**Error (404):**
```json
{
  "statusCode": 404,
  "message": "User with this email does not exist"
}
```

---

### 4. Reset Password
**POST** `/auth/reset-password`

Reset password using the token from forgot-password.

**Request Body:**
```json
{
  "token": "cf36470911d65efa054a222cf72bf3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid reset token"
}
```

OR

```json
{
  "statusCode": 400,
  "message": "Reset token has expired"
}
```

---

## Public Endpoints

### 5. Home
**GET** `/`

Public welcome endpoint.

**Response (200):**
```json
"Hello World!"
```

---

### 6. Public Info
**GET** `/public`

Public information endpoint.

**Response (200):**
```json
{
  "message": "This is a public endpoint",
  "access": "Everyone"
}
```

---

## Protected Endpoints

These endpoints require a valid JWT token in the Authorization header.

**Header Required:**
```
Authorization: Bearer <your_jwt_token>
```

### 7. User Profile
**GET** `/profile`

Get authenticated user's profile information.

**Required:** JWT Authentication

**Response (200):**
```json
{
  "message": "Your profile information",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "USER"
  }
}
```

**Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Role-Based Endpoints

These endpoints require both JWT authentication and specific user roles.

### 8. Admin Dashboard
**GET** `/admin`

Admin-only endpoint.

**Required:**
- JWT Authentication
- Role: `ADMIN`

**Response (200):**
```json
{
  "message": "Welcome to Admin Dashboard",
  "access": "ADMIN only"
}
```

**Error (403):**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this resource"
}
```

---

### 9. Content Management
**GET** `/content`

Content management endpoint for admins and editors.

**Required:**
- JWT Authentication
- Role: `ADMIN` or `EDITOR`

**Response (200):**
```json
{
  "message": "Content Management Area",
  "access": "ADMIN and EDITOR only"
}
```

**Error (403):**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this resource"
}
```

---

## Complete Endpoint List

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| GET | `/` | No | - | Home endpoint |
| GET | `/public` | No | - | Public information |
| POST | `/auth/signup` | No | - | Create new user |
| POST | `/auth/login` | No | - | User login |
| POST | `/auth/forgot-password` | No | - | Request password reset |
| POST | `/auth/reset-password` | No | - | Reset password with token |
| GET | `/profile` | Yes | All | Get user profile |
| GET | `/admin` | Yes | ADMIN | Admin dashboard |
| GET | `/content` | Yes | ADMIN, EDITOR | Content management |

---

## User Roles

The system supports three user roles:

1. **USER** (default)
   - Basic access to protected endpoints
   - Can access: `/profile`

2. **EDITOR**
   - Content management access
   - Can access: `/profile`, `/content`

3. **ADMIN**
   - Full system access
   - Can access: `/profile`, `/content`, `/admin`

---

## Usage Examples

### cURL Examples

#### Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

#### Access Protected Route
```bash
curl http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### PowerShell Examples

#### Signup
```powershell
$body = @{
    full_name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

#### Login
```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.access_token
```

#### Access Protected Route
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method GET -Headers $headers
```

### JavaScript/Fetch Examples

#### Signup
```javascript
const response = await fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    full_name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

#### Login
```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.access_token;
```

#### Access Protected Route
```javascript
const response = await fetch('http://localhost:3000/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data);
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, duplicate email, invalid token) |
| 401 | Unauthorized (invalid credentials, missing/invalid JWT) |
| 403 | Forbidden (insufficient role permissions) |
| 404 | Not Found (user doesn't exist) |
| 500 | Internal Server Error |

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Tokens expire after 24 hours
3. **Reset Tokens**: Password reset tokens expire after 15 minutes
4. **Role-Based Access Control**: Endpoints protected by user roles
5. **Input Validation**: All inputs validated using class-validator
6. **Secure Headers**: Authentication via Bearer token

---

## Testing

Test all endpoints using the provided test scripts:

```bash
# Test authentication
powershell -ExecutionPolicy Bypass -File test-auth.ps1

# Test role creation
powershell -ExecutionPolicy Bypass -File test-roles.ps1

# Test role-based access control
powershell -ExecutionPolicy Bypass -File test-role-guards.ps1
```

---

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens must be included in the `Authorization` header as `Bearer <token>`
- Email addresses must be unique
- Passwords must be at least 6 characters
- Default user role is `USER` if not specified during signup
- Reset tokens are single-use and expire after 15 minutes
