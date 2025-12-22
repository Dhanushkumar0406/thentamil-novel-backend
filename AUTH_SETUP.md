# Authentication System - Setup Complete

## Overview
Complete NestJS + Prisma authentication system with JWT, role-based access control, and password reset functionality.

## Files Created/Modified

### Prisma Schema
- `prisma/schema.prisma` - Added Role enum (ADMIN, EDITOR, USER) and user fields (role, reset_token, reset_token_expiry)

### DTOs
- `src/auth/dto/signup.dto.ts` - Signup with optional role
- `src/auth/dto/login.dto.ts` - Login credentials
- `src/auth/dto/forgot-password.dto.ts` - Email for password reset
- `src/auth/dto/reset-password.dto.ts` - Token and new password

### JWT & Guards
- `src/auth/jwt.strategy.ts` - Passport JWT strategy
- `src/auth/jwt.guard.ts` - JWT authentication guard
- `src/auth/roles.decorator.ts` - @Roles() decorator
- `src/auth/roles.guard.ts` - Role-based authorization guard

### Services & Controllers
- `src/auth/auth.service.ts` - All authentication logic
- `src/auth/auth.controller.ts` - Auth endpoints
- `src/auth/auth.module.ts` - Module configuration

### Configuration
- `.env` - Environment variables

## API Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"  // Optional: ADMIN, EDITOR, or USER
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "USER",
    "created_at": "2025-12-12T05:45:55.000Z"
  }
}
```

### POST /auth/login
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/forgot-password
Generate password reset token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset token generated successfully",
  "reset_token": "a1b2c3d4e5f6..."
}
```

### POST /auth/reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

## Usage Examples

### Protecting Routes with JWT

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user; // { id, email, full_name, role }
  }
}
```

### Protecting Routes with Role-Based Access

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getDashboard() {
    return 'Admin dashboard data';
  }

  @Get('content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  getContent() {
    return 'Content for admins and editors';
  }
}
```

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/users/profile
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 1-day expiration
3. **Role-Based Access**: ADMIN, EDITOR, USER roles
4. **Password Reset**: 15-minute token expiry
5. **Input Validation**: class-validator decorators
6. **Timing Attack Prevention**: Consistent error messages for login

## Environment Variables

Update `.env` with your actual values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/novel_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

## Database Migration

Run migrations to apply schema changes:

```bash
# Create migration
npx prisma migrate dev --name add-auth-fields

# Apply to production
npx prisma migrate deploy
```

## Next Steps

1. **Update DATABASE_URL** in `.env` with your actual PostgreSQL connection
2. **Change JWT_SECRET** to a strong random key
3. **Run migrations**: `npx prisma migrate dev`
4. **Start the server**: `npm run start:dev`
5. **Test endpoints** using Postman or curl

## Testing

```bash
# Start development server
npm run start:dev

# Test signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Implementation Details

- **Password Hashing**: Uses bcrypt with 10 rounds
- **JWT Payload**: Contains user id, email, and role
- **Token Expiry**: Access tokens expire in 1 day
- **Reset Token**: 32-byte hex string, expires in 15 minutes
- **Validation**: Global ValidationPipe enabled
- **Error Handling**: Proper HTTP exceptions for all cases
