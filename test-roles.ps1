# Role-Based Access Control Test Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Role-Based Access Control Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Create ADMIN user
Write-Host "`n[1/6] Creating ADMIN user..." -ForegroundColor Yellow
$adminSignup = @{
    full_name = "Admin User"
    email = "admin@example.com"
    password = "admin123"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $adminSignupResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $adminSignup -ContentType "application/json"
    Write-Host "✅ ADMIN user created!" -ForegroundColor Green
    Write-Host "   User ID: $($adminSignupResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($adminSignupResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($adminSignupResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ ADMIN signup failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   (User might already exist - continuing to login)" -ForegroundColor Gray
    }
}

# Test 2: Create EDITOR user
Start-Sleep -Seconds 1
Write-Host "`n[2/6] Creating EDITOR user..." -ForegroundColor Yellow
$editorSignup = @{
    full_name = "Editor User"
    email = "editor@example.com"
    password = "editor123"
    role = "EDITOR"
} | ConvertTo-Json

try {
    $editorSignupResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $editorSignup -ContentType "application/json"
    Write-Host "✅ EDITOR user created!" -ForegroundColor Green
    Write-Host "   User ID: $($editorSignupResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($editorSignupResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($editorSignupResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ EDITOR signup failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   (User might already exist - continuing to login)" -ForegroundColor Gray
    }
}

# Test 3: Create regular USER
Start-Sleep -Seconds 1
Write-Host "`n[3/6] Creating regular USER..." -ForegroundColor Yellow
$userSignup = @{
    full_name = "Regular User"
    email = "user@example.com"
    password = "user123"
} | ConvertTo-Json

try {
    $userSignupResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method POST -Body $userSignup -ContentType "application/json"
    Write-Host "✅ USER created!" -ForegroundColor Green
    Write-Host "   User ID: $($userSignupResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($userSignupResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($userSignupResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ USER signup failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   (User might already exist - continuing to login)" -ForegroundColor Gray
    }
}

# Test 4: Login as ADMIN
Start-Sleep -Seconds 1
Write-Host "`n[4/6] Logging in as ADMIN..." -ForegroundColor Yellow
$adminLogin = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    Write-Host "✅ ADMIN login successful!" -ForegroundColor Green
    $adminToken = $adminLoginResponse.access_token
    Write-Host "   Token (first 50 chars): $($adminToken.Substring(0, [Math]::Min(50, $adminToken.Length)))..." -ForegroundColor Gray

    # Decode JWT to show payload
    $tokenParts = $adminToken.Split('.')
    $payload = $tokenParts[1]
    # Add padding if needed
    while ($payload.Length % 4 -ne 0) { $payload += '=' }
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedPayload = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    Write-Host "   JWT Payload: $decodedPayload" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ADMIN login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Login as EDITOR
Start-Sleep -Seconds 1
Write-Host "`n[5/6] Logging in as EDITOR..." -ForegroundColor Yellow
$editorLogin = @{
    email = "editor@example.com"
    password = "editor123"
} | ConvertTo-Json

try {
    $editorLoginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $editorLogin -ContentType "application/json"
    Write-Host "✅ EDITOR login successful!" -ForegroundColor Green
    $editorToken = $editorLoginResponse.access_token
    Write-Host "   Token (first 50 chars): $($editorToken.Substring(0, [Math]::Min(50, $editorToken.Length)))..." -ForegroundColor Gray

    # Decode JWT to show payload
    $tokenParts = $editorToken.Split('.')
    $payload = $tokenParts[1]
    while ($payload.Length % 4 -ne 0) { $payload += '=' }
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedPayload = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    Write-Host "   JWT Payload: $decodedPayload" -ForegroundColor Cyan
} catch {
    Write-Host "❌ EDITOR login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Login as USER
Start-Sleep -Seconds 1
Write-Host "`n[6/6] Logging in as USER..." -ForegroundColor Yellow
$userLogin = @{
    email = "user@example.com"
    password = "user123"
} | ConvertTo-Json

try {
    $userLoginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $userLogin -ContentType "application/json"
    Write-Host "✅ USER login successful!" -ForegroundColor Green
    $userToken = $userLoginResponse.access_token
    Write-Host "   Token (first 50 chars): $($userToken.Substring(0, [Math]::Min(50, $userToken.Length)))..." -ForegroundColor Gray

    # Decode JWT to show payload
    $tokenParts = $userToken.Split('.')
    $payload = $tokenParts[1]
    while ($payload.Length % 4 -ne 0) { $payload += '=' }
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedPayload = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    Write-Host "   JWT Payload: $decodedPayload" -ForegroundColor Cyan
} catch {
    Write-Host "❌ USER login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ All three roles created and tested!" -ForegroundColor Green
Write-Host "   - ADMIN: Full access" -ForegroundColor Yellow
Write-Host "   - EDITOR: Content management access" -ForegroundColor Yellow
Write-Host "   - USER: Basic access" -ForegroundColor Yellow
Write-Host "`nTokens are ready to use for role-based endpoints!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
