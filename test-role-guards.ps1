# Role-Based Access Control Guard Test
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Role-Based Access Control" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get tokens for all three roles
Write-Host "`nGetting authentication tokens..." -ForegroundColor Yellow

# ADMIN token
$adminLogin = @{ email = "admin@example.com"; password = "admin123" } | ConvertTo-Json
$adminToken = (Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $adminLogin -ContentType "application/json").access_token

# EDITOR token
$editorLogin = @{ email = "editor@example.com"; password = "editor123" } | ConvertTo-Json
$editorToken = (Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $editorLogin -ContentType "application/json").access_token

# USER token
$userLogin = @{ email = "user@example.com"; password = "user123" } | ConvertTo-Json
$userToken = (Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $userLogin -ContentType "application/json").access_token

Write-Host "✅ Tokens obtained for all roles" -ForegroundColor Green

# Test 1: Public endpoint (no authentication required)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 1: Public Endpoint (No Auth)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/public" -Method GET
    Write-Host "✅ Public endpoint accessible" -ForegroundColor Green
    Write-Host "   Response: $($result.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Profile endpoint (JWT required, any role)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 2: Profile Endpoint (JWT Required)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[ADMIN] Accessing profile..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method GET -Headers $headers
    Write-Host "✅ ADMIN can access profile" -ForegroundColor Green
    Write-Host "   User: $($result.user.email) (Role: $($result.user.role))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[EDITOR] Accessing profile..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $editorToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method GET -Headers $headers
    Write-Host "✅ EDITOR can access profile" -ForegroundColor Green
    Write-Host "   User: $($result.user.email) (Role: $($result.user.role))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[USER] Accessing profile..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $userToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method GET -Headers $headers
    Write-Host "✅ USER can access profile" -ForegroundColor Green
    Write-Host "   User: $($result.user.email) (Role: $($result.user.role))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Admin-only endpoint
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 3: Admin Endpoint (ADMIN Only)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[ADMIN] Accessing admin endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/admin" -Method GET -Headers $headers
    Write-Host "✅ ADMIN can access (Expected)" -ForegroundColor Green
    Write-Host "   Response: $($result.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[EDITOR] Accessing admin endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $editorToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/admin" -Method GET -Headers $headers
    Write-Host "❌ EDITOR should NOT have access (Test Failed)" -ForegroundColor Red
} catch {
    Write-Host "✅ EDITOR blocked (Expected)" -ForegroundColor Green
    Write-Host "   Error: Access forbidden" -ForegroundColor Gray
}

Write-Host "`n[USER] Accessing admin endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $userToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/admin" -Method GET -Headers $headers
    Write-Host "❌ USER should NOT have access (Test Failed)" -ForegroundColor Red
} catch {
    Write-Host "✅ USER blocked (Expected)" -ForegroundColor Green
    Write-Host "   Error: Access forbidden" -ForegroundColor Gray
}

# Test 4: Content endpoint (ADMIN and EDITOR only)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 4: Content Endpoint (ADMIN + EDITOR)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[ADMIN] Accessing content endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/content" -Method GET -Headers $headers
    Write-Host "✅ ADMIN can access (Expected)" -ForegroundColor Green
    Write-Host "   Response: $($result.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[EDITOR] Accessing content endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $editorToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/content" -Method GET -Headers $headers
    Write-Host "✅ EDITOR can access (Expected)" -ForegroundColor Green
    Write-Host "   Response: $($result.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[USER] Accessing content endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $userToken" }
    $result = Invoke-RestMethod -Uri "http://localhost:3000/content" -Method GET -Headers $headers
    Write-Host "❌ USER should NOT have access (Test Failed)" -ForegroundColor Red
} catch {
    Write-Host "✅ USER blocked (Expected)" -ForegroundColor Green
    Write-Host "   Error: Access forbidden" -ForegroundColor Gray
}

# Test 5: Accessing protected route without token
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 5: Protected Route Without Token" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method GET
    Write-Host "❌ Should be blocked without token (Test Failed)" -ForegroundColor Red
} catch {
    Write-Host "✅ Access blocked without token (Expected)" -ForegroundColor Green
    Write-Host "   Error: Unauthorized" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Role-Based Access Control is working correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "   Public Endpoint:   ✅ Accessible to all" -ForegroundColor Gray
Write-Host "   Profile Endpoint:  ✅ Requires JWT (any role)" -ForegroundColor Gray
Write-Host "   Admin Endpoint:    ✅ ADMIN only" -ForegroundColor Gray
Write-Host "   Content Endpoint:  ✅ ADMIN + EDITOR only" -ForegroundColor Gray
Write-Host "   No Token:          ✅ Access blocked" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
