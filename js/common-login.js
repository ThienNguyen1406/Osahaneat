/*
 * Common Login Script - Sử dụng cho tất cả các role
 * Redirect dựa trên role sau khi đăng nhập thành công
 */

console.log("=== COMMON LOGIN.JS LOADED ===");

// Helper function để decode JWT token
function decodeToken(token) {
    try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
        const decoded = JSON.parse(atob(paddedBase64));
        return decoded;
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
}

// Helper function để lấy role từ token
function getUserRoleFromToken(token) {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    const scope = decoded.scope || decoded.scopes || '';
    const scopes = scope.split(' ').filter(s => s.trim() !== '');
    
    // Tìm role trong scopes
    if (scopes.includes('ROLE_ADMIN') || scopes.includes('ADMIN')) {
        return 'ADMIN';
    } else if (scopes.includes('ROLE_DRIVER') || scopes.includes('DRIVER')) {
        return 'DRIVER';
    } else if (scopes.includes('ROLE_RESTAURANT_STAFF') || scopes.includes('RESTAURANT_STAFF')) {
        return 'RESTAURANT_STAFF';
    } else if (scopes.includes('ROLE_RESTAURANT_OWNER') || scopes.includes('RESTAURANT_OWNER')) {
        return 'RESTAURANT_OWNER';
    } else if (scopes.includes('ROLE_USER') || scopes.includes('USER')) {
        return 'USER';
    }
    
    return 'USER'; // Default
}

// Helper function để lấy redirect URL dựa trên role
function getRedirectUrlByRole(role) {
    const roleMap = {
        'ADMIN': '/admin/index.html',
        'DRIVER': '/shipper/index.html',
        'RESTAURANT_STAFF': '/restaurant-staff/index.html',
        'RESTAURANT_OWNER': '/restaurant-owner/index.html',
        'USER': '/theme-sidebar/index.html'
    };
    
    return roleMap[role] || '/theme-sidebar/index.html';
}

// Đợi tất cả scripts load xong
$(document).ready(function () {
    console.log("=== COMMON LOGIN PAGE LOADED ===");
    
    // Đợi ApiService load (có thể cần delay)
    function waitForApiService(callback, maxAttempts = 10) {
        let attempts = 0;
        const checkInterval = setInterval(function() {
            attempts++;
            if (typeof ApiService !== 'undefined' && typeof ApiService.login === 'function') {
                clearInterval(checkInterval);
                console.log("✅ ApiService loaded successfully");
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error("❌ ApiService failed to load after " + maxAttempts + " attempts");
                alert("Lỗi: API Service chưa được tải. Vui lòng reload trang.");
            } else {
                console.log("⏳ Waiting for ApiService... (" + attempts + "/" + maxAttempts + ")");
            }
        }, 200);
    }
    
    // Clear any pre-filled values
    $('#email').val('');
    $('#password').val('');
    
    // Setup login handler sau khi ApiService đã load
    waitForApiService(function() {
        // Login handler
        $("#btn-signin").click(function (e) {
            e.preventDefault();
            const username = $("#email").val().trim();
            const password = $("#password").val();

            if (!username || !password) {
                alert("Vui lòng nhập đầy đủ thông tin!");
                return;
            }

            console.log("Attempting login for:", username);

            ApiService.login(username, password)
            .done(function (response) {
                console.log("Login response:", response);
                
                // Check response format
                const hasToken = response && response.data && typeof response.data === 'string' && response.data.length > 10;
                const hasSuccess = response && (response.success === true || response.success === "true" || 
                                                response.isSuccess === true || response.isSuccess === "true");
                const hasStatusOk = response && (response.status === 200 || response.status === "200");

                if (hasToken && (hasSuccess || hasStatusOk)) {
                    const token = response.data;
                    console.log("Login successful! Token received (length: " + token.length + ")");
                    
                    // Save token
                    localStorage.setItem('token', token);
                    console.log("Token saved to localStorage");
                    
                    // Get user role from token
                    const userRole = getUserRoleFromToken(token);
                    console.log("User role detected:", userRole);
                    
                    // Get redirect URL based on role
                    const redirectUrl = getRedirectUrlByRole(userRole);
                    console.log("Redirecting to:", redirectUrl);
                    
                    // Show success message
                    alert('Đăng nhập thành công! Đang chuyển hướng...');
                    
                    // Redirect after short delay
                    setTimeout(function() {
                        window.location.href = redirectUrl;
                    }, 500);
                } else {
                    const errorMsg = response.desc || response.description || response.message || 'Đăng nhập thất bại!';
                    alert(errorMsg);
                    console.error("Login failed:", response);
                }
            })
            .fail(function(xhr) {
                console.error('Login error:', xhr);
                let errorMsg = 'Không thể kết nối đến server!';
                
                if (xhr.responseJSON) {
                    const errorResponse = xhr.responseJSON;
                    errorMsg = errorResponse.desc || errorResponse.message || errorMsg;
                }
                
                if (xhr.status === 400 || xhr.status === 401) {
                    alert('Sai tên đăng nhập hoặc mật khẩu!');
                } else {
                    alert(errorMsg);
                }
            });
        });
    });
});

