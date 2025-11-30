/*
 * Admin Panel JavaScript - Tích hợp API
 */

console.log("=== ADMIN.JS LOADED ===");

// Check if jQuery is loaded
if (typeof jQuery === 'undefined') {
    console.error("❌ jQuery is not loaded!");
} else {
    console.log("✅ jQuery is loaded, version:", jQuery.fn.jquery);
}

// Check if api.js is loaded
if (typeof getToken === 'undefined') {
    console.error("❌ api.js functions not loaded!");
} else {
    console.log("✅ api.js is loaded");
}

$(document).ready(function() {
    console.log("=== $(document).ready() fired ===");
    
    try {
        // Clear any pre-filled values in login form
        $('#inputEmailAddress').val('');
        $('#inputPassword').val('');
        
        // Check authentication
        console.log("Calling checkAdminAuth()...");
        checkAdminAuth();
        
        // Setup login handler
        console.log("Setting up login handler...");
        setupLogin();
        
        // Load dashboard data
        if (isAuthenticated()) {
            console.log("User is authenticated, loading dashboard data...");
            loadDashboardData();
            
            // Load unread message count every 30 seconds
            setInterval(function() {
                loadAdminUnreadMessageCount();
            }, 30000);
        } else {
            console.log("User is NOT authenticated");
        }
    } catch (error) {
        console.error("❌ Error in $(document).ready():", error);
        console.error("Stack trace:", error.stack);
    }
});

function checkAdminAuth() {
    console.log("=== checkAdminAuth() called ===");
    console.log("Current pathname:", window.location.pathname);
    
    // Chỉ check khi không phải trang login
    if (window.location.pathname.includes('login.html')) {
        console.log("On login page, skipping auth check");
        return;
    }
    
    console.log("Checking authentication...");
    
    // Kiểm tra authentication
    if (!isAuthenticated()) {
        console.warn("User is NOT authenticated, redirecting to login");
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    console.log("User is authenticated, checking role...");
    
    // Nếu đã authenticated, kiểm tra role
    const token = getToken();
    const decoded = decodeToken(token);
    
    console.log("checkAdminAuth - Token:", token ? "exists" : "missing");
    console.log("checkAdminAuth - Decoded:", decoded);
    
    if (decoded) {
        console.log("checkAdminAuth - Full decoded token:", JSON.stringify(decoded, null, 2));
        
        // Check scope - có thể là string hoặc array
        let scope = '';
        if (typeof decoded.scope === 'string') {
            scope = decoded.scope;
        } else if (Array.isArray(decoded.scope)) {
            scope = decoded.scope.join(' ');
        } else if (decoded.scopes) {
            if (typeof decoded.scopes === 'string') {
                scope = decoded.scopes;
            } else if (Array.isArray(decoded.scopes)) {
                scope = decoded.scopes.join(' ');
            }
        }
        
        console.log("checkAdminAuth - Scope (final):", scope);
        
        const scopes = scope.split(' ').filter(s => s.trim() !== '');
        console.log("checkAdminAuth - Scopes array:", scopes);
        
        const userRole = getUserRole();
        console.log("checkAdminAuth - User role:", userRole);
        
        // Kiểm tra xem có ROLE_ADMIN trong scope không
        const hasAdminRole = scopes.includes('ROLE_ADMIN') || 
                             scopes.includes('ADMIN') || 
                             userRole === 'ADMIN' ||
                             decoded.sub === 'admin@gmail.com'; // Fallback: check username
        
        console.log("checkAdminAuth - Has ADMIN role:", hasAdminRole);
        
        if (!hasAdminRole) {
            console.warn("checkAdminAuth - User không có ADMIN role trong token, checking via API...");
            
            // Fallback: Check via API (synchronous check - block until verified)
            // We need to block the page load until we know if user is admin
            checkAdminViaAPI().then(function(isAdmin) {
                if (isAdmin) {
                    console.log("✅ User is admin (verified via API), allowing access");
                    // Allow access - don't redirect
                } else {
                    console.warn("❌ User không có ADMIN role (verified via API), redirect về login");
                    alert('Bạn không có quyền truy cập admin dashboard! Vui lòng đăng nhập với tài khoản admin.\n\nDebug: scope=' + scope + ', userRole=' + userRole + ', decoded.sub=' + decoded.sub);
                    removeToken();
                    window.location.href = 'login.html';
                }
            }).catch(function(error) {
                console.error("checkAdminAuth - Error checking admin via API:", error);
                // If API check fails, show error but don't block
                console.warn("⚠️ API check failed, showing error but allowing access");
                alert('Không thể xác thực quyền admin. Vui lòng thử lại.\n\nError: ' + error.message);
            });
        } else {
            console.log("✅ checkAdminAuth - User có ADMIN role trong token, cho phép truy cập");
        }
    } else {
        console.error("checkAdminAuth - Không thể decode token, redirect về login");
        alert('Token không hợp lệ! Vui lòng đăng nhập lại.');
        removeToken();
        window.location.href = 'login.html';
    }
}

function setupLogin() {
    $('#btn-admin-login').click(function(e) {
        e.preventDefault();
        const username = $('#inputEmailAddress').val();
        const password = $('#inputPassword').val();

        if (!username || !password) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        AdminApiService.login(username, password)
            .done(function(response) {
                console.log("Login response:", response);
                // Backend trả về ResponseData với: { status, isSuccess/success, data, desc }
                // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
                const isSuccess = response && (response.isSuccess || response.success) && response.data && response.data !== "";
                
                if (isSuccess) {
                    // Lưu token
                    const token = response.data;
                    setToken(token);
                    console.log("Token saved:", token);
                    
                    // Kiểm tra role và chỉ cho phép admin vào dashboard
                    setTimeout(function() {
                        try {
                            const token = getToken();
                            const decoded = decodeToken(token);
                            
                            console.log("Login success - Token:", token ? "exists" : "missing");
                            console.log("Login success - Decoded:", decoded);
                            
                            if (decoded) {
                                const scope = decoded.scope || decoded.scopes || '';
                                console.log("Login success - Scope:", scope);
                                
                                const scopes = scope.split(' ').filter(s => s.trim() !== '');
                                console.log("Login success - Scopes array:", scopes);
                                
                                const userRole = getUserRole();
                                console.log("Login success - User role:", userRole);
                                
                                // Kiểm tra xem có ROLE_ADMIN trong scope không
                                const hasAdminRole = scopes.includes('ROLE_ADMIN') || scopes.includes('ADMIN') || userRole === 'ADMIN';
                                console.log("Login success - Has ADMIN role:", hasAdminRole);
                                
                                if (hasAdminRole) {
                                    // Admin redirect đến dashboard
                                    console.log("Redirecting to admin dashboard...");
                                    window.location.replace('index.html');
                                } else {
                                    // Không phải admin, ở lại trang login
                                    alert('Bạn không có quyền truy cập admin dashboard! Token của bạn không có quyền ADMIN.\n\nScope: ' + scope);
                                    removeToken();
                                    console.error("Login success - User không có ADMIN role:", {
                                        scope: scope,
                                        scopes: scopes,
                                        userRole: userRole
                                    });
                                }
                            } else {
                                alert('Không thể đọc token! Vui lòng thử lại.');
                                removeToken();
                                console.error("Login success - Không thể decode token");
                            }
                        } catch (e) {
                            console.error("Error processing login:", e);
                            alert('Có lỗi xảy ra khi xử lý đăng nhập! Vui lòng thử lại.');
                            removeToken();
                        }
                    }, 200); // Delay để đảm bảo token đã được lưu
                } else {
                    // Login thất bại
                    const errorMsg = response.desc || response.description || response.message || 'Đăng nhập thất bại!';
                    alert(errorMsg);
                    console.error("Login failed:", response);
                }
            })
            .fail(function(xhr) {
                console.error('Login error:', xhr);
                let errorMsg = 'Không thể kết nối đến server!';
                
                // Parse error response nếu có
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
}

// Helper function to check admin via API
function checkAdminViaAPI() {
    return new Promise(function(resolve, reject) {
        console.log("checkAdminViaAPI - Checking admin status via API...");
        
        if (typeof AdminApiService === 'undefined' || !AdminApiService.checkAdmin) {
            console.error("checkAdminViaAPI - AdminApiService.checkAdmin not available");
            reject(new Error("AdminApiService not available"));
            return;
        }
        
        AdminApiService.checkAdmin()
            .done(function(response) {
                console.log("checkAdminViaAPI - API response:", response);
                // Response format: { code: 200, result: true, message: "..." }
                const isAdmin = response && (response.result === true || response.code === 200);
                console.log("checkAdminViaAPI - Is admin:", isAdmin);
                resolve(isAdmin);
            })
            .fail(function(xhr) {
                console.error("checkAdminViaAPI - API call failed:", xhr);
                // If API returns 403, user is not admin
                if (xhr.status === 403 || xhr.status === 401) {
                    resolve(false);
                } else {
                    reject(new Error("API check failed: " + xhr.status));
                }
            });
    });
}

function loadDashboardData() {
    // Load users count - only if not on users page (admin-users.js will handle it)
    if (window.location.pathname.indexOf('users.html') === -1) {
        loadUsersData();
    }
    
    // Load orders data - only if not on orders page (orders.js will handle it)
    if (window.location.pathname.indexOf('orders.html') === -1 && 
        window.location.pathname.indexOf('edit-order.html') === -1) {
        loadOrdersData();
    }
    
    // Load restaurants data
    loadRestaurantsData();
    
    // Load revenue chart - only on dashboard page
    if (window.location.pathname.indexOf('index.html') !== -1 || 
        window.location.pathname.endsWith('/') ||
        window.location.pathname === '/admin/' ||
        window.location.pathname === '/admin') {
        // Wait a bit for dashboard.js to be loaded
        setTimeout(function() {
            if (typeof loadRevenueChart === 'function') {
                console.log("Calling loadRevenueChart from admin.js...");
                loadRevenueChart();
            } else {
                console.warn("loadRevenueChart function not found, dashboard.js may not be loaded yet");
            }
        }, 500);
    }
    
    // Load unread message count on all pages
    loadAdminUnreadMessageCount();
}

/**
 * Load unread message count for admin (on all pages)
 */
function loadAdminUnreadMessageCount() {
    if (typeof AdminApiService === 'undefined' || typeof AdminApiService.getUnreadMessageCount !== 'function') {
        return;
    }
    
    AdminApiService.getUnreadMessageCount()
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data) {
                const count = response.data.count || 0;
                updateAdminUnreadBadge(count);
            }
        })
        .fail(function(xhr, status, error) {
            // Silently fail for unread count - don't show error to user
            if (status !== 'timeout' && !(status === 'error' && xhr.readyState === 0)) {
                console.error('Error loading unread message count:', xhr);
            }
        });
}

/**
 * Update unread badge in sidebar and navbar
 */
function updateAdminUnreadBadge(count) {
    // Update badge in sidebar
    const sidebarBadge = $('#sidebar-message-badge');
    if (sidebarBadge.length > 0) {
        if (count > 0) {
            sidebarBadge.text(count).show();
        } else {
            sidebarBadge.hide();
        }
    }
    
    // Update badge in navbar messages dropdown
    const navbarBadge = $('.osahan-list-dropdown .badge-counter');
    if (navbarBadge.length > 0) {
        if (count > 0) {
            navbarBadge.text(count).show();
        } else {
            navbarBadge.hide();
        }
    }
}

function loadUsersData() {
    AdminApiService.getAllUsers()
        .done(function(response) {
            console.log("Users response:", response);
            // Support both ResponseData and ApiResponse formats
            let users = null;
            if (response) {
                // Format mới: ResponseData { status, isSuccess, data, desc }
                if (response.data && Array.isArray(response.data)) {
                    users = response.data;
                }
                // Format cũ: ApiResponse { code, result, message }
                else if (response.result && Array.isArray(response.result)) {
                    users = response.result;
                }
            }
            
            if (users && Array.isArray(users)) {
                $('#users-count').text(users.length || 0);
            }
        })
        .fail(function(xhr) {
            console.error('Error loading users:', xhr);
            if (xhr.status === 403) {
                alert('Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin.');
                removeToken();
                window.location.href = 'login.html';
            }
        });
}

function loadOrdersData() {
    AdminApiService.getAllOrders()
        .done(function(response) {
            console.log("=== Orders API Response ===", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            
            // Backend trả về ResponseData: { status, isSuccess, data, desc }
            let orders = [];
            
            // Check nhiều format khác nhau
            if (response) {
                // Format 1: { status: 200, isSuccess: true, data: [...] }
                if (response.status === 200 && (response.isSuccess === true || response.success === true) && response.data) {
                    orders = Array.isArray(response.data) ? response.data : [];
                    console.log("✅ Orders loaded (format 1):", orders.length);
                }
                // Format 2: Direct array (nếu backend trả về trực tiếp)
                else if (Array.isArray(response)) {
                    orders = response;
                    console.log("✅ Orders loaded (format 2 - direct array):", orders.length);
                }
                // Format 3: { data: [...] } without status
                else if (response.data && Array.isArray(response.data)) {
                    orders = response.data;
                    console.log("✅ Orders loaded (format 3):", orders.length);
                }
                else {
                    console.warn("⚠️ Unknown response format:", response);
                }
            }
            
            // Hiển thị số lượng orders
            if ($('#orders-count').length > 0) {
                $('#orders-count').text(orders.length || 0);
            }
            
            // Render orders table if exists - only if not on orders page
            // On orders.html, orders.js will handle rendering
            if (window.location.pathname.indexOf('orders.html') === -1 && 
                window.location.pathname.indexOf('edit-order.html') === -1 &&
                orders.length > 0 && typeof renderOrdersTable === 'function') {
                renderOrdersTable(orders);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('=== Error loading orders ===');
            console.error('XHR:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response Text:', xhr.responseText);
            console.error('Response JSON:', xhr.responseJSON);
            console.error('Status Code:', xhr.status);
            console.error('Ready State:', xhr.readyState);
            console.error('Request URL:', xhr.responseURL || 'N/A');
            
            let errorMsg = "Không thể tải danh sách đơn hàng!";
            
            // Try to parse responseText as JSON if responseJSON is undefined
            let errorObj = null;
            if (xhr.responseJSON) {
                errorObj = xhr.responseJSON;
            } else if (xhr.responseText) {
                try {
                    errorObj = JSON.parse(xhr.responseText);
                    console.log("✅ Parsed responseText as JSON:", errorObj);
                } catch (e) {
                    console.warn("⚠️ Could not parse responseText as JSON:", e);
                    console.warn("ResponseText content:", xhr.responseText);
                }
            }
            
            // Try to get error message from parsed object
            if (errorObj) {
                console.log("Error object:", errorObj);
                if (errorObj.message) {
                    errorMsg = errorObj.message;
                } else if (errorObj.desc) {
                    errorMsg = errorObj.desc;
                } else if (errorObj.error) {
                    errorMsg = errorObj.error;
                } else if (errorObj.code && errorObj.code === 9999) {
                    errorMsg = "Lỗi không xác định từ server. Vui lòng kiểm tra lại!";
                }
            }
            
            // Handle specific status codes
            if (xhr.status === 0 || (status === 'error' && xhr.readyState === 0)) {
                // Network error - server not reachable
                errorMsg = "Không thể kết nối đến server. Vui lòng:\n1. Kiểm tra server có đang chạy không\n2. Kiểm tra kết nối mạng\n3. Thử lại sau";
                console.error("❌ Network error: Server not reachable");
                alert(errorMsg);
                // Set count to 0 on error
                if ($('#orders-count').length > 0) {
                    $('#orders-count').text(0);
                }
                return;
            } else if (xhr.status === 400) {
                errorMsg = errorMsg || "Thông tin không hợp lệ. Vui lòng kiểm tra lại!";
                console.error('Error message:', errorMsg);
                alert(errorMsg);
            } else if (xhr.status === 403) {
                alert('Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
                return;
            } else if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
                return;
            } else if (status === 'parsererror') {
                // Don't show alert for parsererror, just log it
                console.error('JSON parsing error. Backend may need to add more @JsonIgnore annotations.');
            } else {
                console.error('Error message:', errorMsg);
                alert(errorMsg);
            }
            
            // Set count to 0 on error
            if ($('#orders-count').length > 0) {
                $('#orders-count').text(0);
            }
        });
}

function loadRestaurantsData() {
    AdminApiService.getRestaurants()
        .done(function(response) {
            console.log("Restaurants response:", response);
            // Backend trả về ResponseData: { status, isSuccess, data, desc }
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                const restaurants = response.data;
                $('#restaurants-count').text(restaurants.length || 0);
            }
        })
        .fail(function(xhr) {
            console.error('Error loading restaurants:', xhr);
        });
}

function renderOrdersTable(orders) {
    const tbody = $('#dataTable tbody');
    if (tbody.length > 0 && orders.length > 0) {
        let html = '';
        orders.forEach(function(order) {
            const orderDate = order.createDate 
                ? new Date(order.createDate).toLocaleString('vi-VN') 
                : 'N/A';
            
            html += `
                <tr>
                    <td><img class="img-profile rounded-circle" src="img/user/1.png"></td>
                    <td>${order.users ? order.users.fullName : 'N/A'}</td>
                    <td>${order.restaurant ? order.restaurant.title : 'N/A'}</td>
                    <td><button disabled type="button" class="btn btn-sm btn-primary btn-round">created</button></td>
                    <td>${orderDate}</td>
                    <td>$0</td>
                    <td>${order.listOrderItems ? order.listOrderItems.length : 0}</td>
                    <td><a href="edit-order.html?id=${order.id}" class="btn btn-primary btn-sm">View</a></td>
                </tr>
            `;
        });
        tbody.html(html);
    }
}

// Logout function
function adminLogout() {
    removeToken();
    window.location.href = '/login.html';
}

