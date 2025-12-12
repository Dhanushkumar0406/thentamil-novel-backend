# Authentication System Test Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Authentication System Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Signup
Write-Host "`n[1/4] Testing Signup..." -ForegroundColor Yellow
$signup = @{
    full_name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $signup -ContentType "application/json"
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    Write-Host "User ID: $($signupResponse.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($signupResponse.user.email)" -ForegroundColor Gray
    Write-Host "Role: $($signupResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Signup failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   (User might already exist - continuing to login test)" -ForegroundColor Gray
    }
}

# Test 2: Login
Start-Sleep -Seconds 1
Write-Host "`n[2/4] Testing Login..." -ForegroundColor Yellow
$login = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $login -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.access_token
    Write-Host "Access Token (first 50 chars): $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 3: Forgot Password
Start-Sleep -Seconds 1
Write-Host "`n[3/4] Testing Forgot Password..." -ForegroundColor Yellow
$forgot = @{
    email = "test@example.com"
} | ConvertTo-Json

try {
    $forgotResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/forgot-password" -Method POST -Body $forgot -ContentType "application/json"
    Write-Host "✅ Forgot password successful!" -ForegroundColor Green
    $resetToken = $forgotResponse.reset_token
    Write-Host "Reset Token (first 30 chars): $($resetToken.Substring(0, [Math]::Min(30, $resetToken.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Forgot password failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Access Protected Route (if exists)
Start-Sleep -Seconds 1
Write-Host "`n[4/4] Testing Protected Route..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $protectedResponse = Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET -Headers $headers
    Write-Host "✅ Protected route access successful!" -ForegroundColor Green
    Write-Host "Response: $protectedResponse" -ForegroundColor Gray
} catch {
    Write-Host "❌ Protected route failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
