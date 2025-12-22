# Testing Guide - Authentication System

## Step 1: Check PostgreSQL Service

First, ensure PostgreSQL is running on your system.

### Windows:
```bash
# Check if PostgreSQL service is running
sc query postgresql-x64-14  # or your PostgreSQL version

# Start PostgreSQL service
net start postgresql-x64-14
```

### Check if PostgreSQL is listening:
```bash
netstat -an | findstr "5432"
```

## Step 2: Verify Database Connection

### Option A: Using psql command line
```bash
psql -U postgres -h localhost -p 5432
# Enter password: 2003

# Then create the database if it doesn't exist:
CREATE DATABASE novel_db;

# Exit with:
\q
```

### Option B: Using pgAdmin
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Create a new database named `novel_db`

## Step 3: Update .env File (if needed)

Make sure your `.env` file has the correct credentials:

```env
DATABASE_URL="postgresql://postgres:2003@localhost:5432/novel_db?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3000
```

Replace `postgres` and `2003` with your actual PostgreSQL username and password.

## Step 4: Run Migrations

Once the database is accessible:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name initial-setup

# Or just push the schema (for development)
npx prisma db push
```

## Step 5: Start the Server

```bash
npm run start:dev
```

You should see:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [RoutesResolver] AuthController {/auth}:
[Nest] LOG [RouterExplorer] Mapped {/auth/signup, POST} route
[Nest] LOG [RouterExplorer] Mapped {/auth/login, POST} route
[Nest] LOG [RouterExplorer] Mapped {/auth/forgot-password, POST} route
[Nest] LOG [RouterExplorer] Mapped {/auth/reset-password, POST} route
[Nest] LOG [NestApplication] Nest application successfully started
```

## Step 6: Test the API Endpoints

### Method 1: Using cURL

#### Test Signup:
```bash
curl -X POST http://localhost:3000/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"full_name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### Test Login:
```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### Test Forgot Password:
```bash
curl -X POST http://localhost:3000/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
```

#### Test Reset Password:
```bash
curl -X POST http://localhost:3000/auth/reset-password ^
  -H "Content-Type: application/json" ^
  -d "{\"token\":\"YOUR_RESET_TOKEN\",\"newPassword\":\"newpass123\"}"
```

### Method 2: Using PowerShell

#### Test Signup:
```powershell
$body = @{
    full_name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

#### Test Login:
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.access_token
Write-Host "Access Token: $token"
```

#### Test Protected Route:
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET -Headers $headers
```

### Method 3: Using the test-auth.http file

If you're using VS Code with REST Client extension:
1. Open `test-auth.http`
2. Click "Send Request" above each request
3. View responses in the panel

### Method 4: Using Postman

1. Import the following collection or create requests manually
2. Test each endpoint:

#### POST http://localhost:3000/auth/signup
Body (JSON):
```json
{
  "full_name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

#### POST http://localhost:3000/auth/login
Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Expected Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copy the `access_token` for protected route testing.

## Step 7: Test Protected Routes (JWT Guard)

Create a test protected endpoint to verify JWT authentication works:

### Add to app.controller.ts:
```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt.guard';

@Controller()
export class AppController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected(@Request() req) {
    return {
      message: 'This is a protected route',
      user: req.user,
    };
  }
}
```

### Test with cURL:
```bash
curl http://localhost:3000/protected ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Expected Results

### ✅ Successful Signup:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "USER",
    "created_at": "2025-12-12T..."
  }
}
```

### ✅ Successful Login:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDI5MjU0MzIsImV4cCI6MTcwMzAxMTgzMn0..."
}
```

### ✅ Successful Forgot Password:
```json
{
  "message": "Password reset token generated successfully",
  "reset_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

### ✅ Successful Reset Password:
```json
{
  "message": "Password reset successfully"
}
```

## Troubleshooting

### Error: ECONNREFUSED
- PostgreSQL service is not running
- Check if port 5432 is in use: `netstat -an | findstr "5432"`
- Start PostgreSQL service

### Error: password authentication failed
- Check your PostgreSQL username and password
- Update DATABASE_URL in `.env` file
- Try connecting with psql: `psql -U postgres -h localhost`

### Error: database "novel_db" does not exist
- Create the database: `CREATE DATABASE novel_db;`
- Or use Prisma: `npx prisma db push`

### Error: Prisma Client not generated
- Run: `npx prisma generate`

### Error: JWT token invalid
- Check if JWT_SECRET matches between signup and login
- Token expires after 1 day - generate a new one

## Quick Test Script

Run this PowerShell script to test all endpoints:

```powershell
# Test Signup
$signup = @{
    full_name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Testing Signup..." -ForegroundColor Yellow
try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $signup -ContentType "application/json"
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    $signupResponse | ConvertTo-Json
} catch {
    Write-Host "❌ Signup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Login
Start-Sleep -Seconds 1
$login = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "`nTesting Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $login -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.access_token)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
```

Save as `test-auth.ps1` and run: `.\test-auth.ps1`
