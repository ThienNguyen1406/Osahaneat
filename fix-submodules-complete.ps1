# Script hoàn chỉnh để xử lý submodules
Write-Host "=== XỬ LÝ SUBMODULES ===" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Deinitialize submodules
Write-Host "1. Deinitialize submodules..." -ForegroundColor Yellow
git submodule deinit -f food_delivery 2>&1 | Out-Null
git submodule deinit -f theme-sidebar 2>&1 | Out-Null
Write-Host "   ✅ Đã deinitialize" -ForegroundColor Green

# Bước 2: Xóa cached submodules
Write-Host "`n2. Xóa cached submodules..." -ForegroundColor Yellow
git rm --cached food_delivery 2>&1 | Out-Null
git rm --cached theme-sidebar 2>&1 | Out-Null
Write-Host "   ✅ Đã xóa cached" -ForegroundColor Green

# Bước 3: Xóa .gitmodules
Write-Host "`n3. Xóa .gitmodules..." -ForegroundColor Yellow
if (Test-Path .gitmodules) {
    Remove-Item .gitmodules -Force
    Write-Host "   ✅ Đã xóa .gitmodules" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Không có .gitmodules" -ForegroundColor Gray
}

# Bước 4: Xóa .git/modules
Write-Host "`n4. Xóa .git/modules..." -ForegroundColor Yellow
if (Test-Path .git\modules\food_delivery) {
    Remove-Item .git\modules\food_delivery -Recurse -Force
    Write-Host "   ✅ Đã xóa .git\modules\food_delivery" -ForegroundColor Green
}
if (Test-Path .git\modules\theme-sidebar) {
    Remove-Item .git\modules\theme-sidebar -Recurse -Force
    Write-Host "   ✅ Đã xóa .git\modules\theme-sidebar" -ForegroundColor Green
}
if (Test-Path .git\modules) {
    $remaining = Get-ChildItem .git\modules -ErrorAction SilentlyContinue
    if (-not $remaining) {
        Remove-Item .git\modules -Recurse -Force
        Write-Host "   ✅ Đã xóa .git\modules (rỗng)" -ForegroundColor Green
    }
}

# Bước 5: Xóa .git trong các thư mục con
Write-Host "`n5. Xóa .git trong các thư mục con..." -ForegroundColor Yellow
if (Test-Path food_delivery\.git) {
    $item = Get-Item food_delivery\.git -Force
    if ($item.PSIsContainer) {
        Remove-Item food_delivery\.git -Recurse -Force
        Write-Host "   ✅ Đã xóa food_delivery\.git (directory)" -ForegroundColor Green
    } else {
        Remove-Item food_delivery\.git -Force
        Write-Host "   ✅ Đã xóa food_delivery\.git (file)" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️ Không có food_delivery\.git" -ForegroundColor Gray
}

if (Test-Path theme-sidebar\.git) {
    $item = Get-Item theme-sidebar\.git -Force
    if ($item.PSIsContainer) {
        Remove-Item theme-sidebar\.git -Recurse -Force
        Write-Host "   ✅ Đã xóa theme-sidebar\.git (directory)" -ForegroundColor Green
    } else {
        Remove-Item theme-sidebar\.git -Force
        Write-Host "   ✅ Đã xóa theme-sidebar\.git (file)" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️ Không có theme-sidebar\.git" -ForegroundColor Gray
}

# Bước 6: Add lại các thư mục
Write-Host "`n6. Add lại các thư mục..." -ForegroundColor Yellow
git add food_delivery/ theme-sidebar/
git add .
Write-Host "   ✅ Đã add các file" -ForegroundColor Green

# Bước 7: Kiểm tra trạng thái
Write-Host "`n7. Kiểm tra trạng thái..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    $count = ($status | Measure-Object -Line).Lines
    Write-Host "   Tìm thấy $count file(s) để commit" -ForegroundColor Cyan
    $status | Select-Object -First 15 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    if ($count -gt 15) {
        Write-Host "   ... và $($count - 15) file(s) khác" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️ Không có file nào để commit" -ForegroundColor Yellow
}

# Bước 8: Commit
Write-Host "`n8. Đang commit..." -ForegroundColor Yellow
$commitMessage = "Update: Food Delivery System - Added rating feature for completed orders, fixed order display and cart synchronization"
$result = git commit -m $commitMessage 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Đã commit thành công!" -ForegroundColor Green
    Write-Host "`n📋 Commit mới nhất:" -ForegroundColor Cyan
    git log --oneline -1
} else {
    Write-Host "   ❌ Có lỗi khi commit!" -ForegroundColor Red
    Write-Host "   Output:" -ForegroundColor Yellow
    $result | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
}

Write-Host "`n✅ Hoàn tất!" -ForegroundColor Green
Write-Host "`nKiểm tra lại với: git status" -ForegroundColor Cyan

