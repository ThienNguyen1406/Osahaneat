/*
 * Orders Page - Load orders from API
 * Version: 2.0 - Full API integration
 */

console.log("=== ORDERS.JS LOADED - VERSION 2.1 ===");
console.log("API_BASE_URL available:", typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'NOT DEFINED');
console.log("ApiService available:", typeof ApiService !== 'undefined' ? 'YES' : 'NO');

// API_BASE_URL is defined in api.js

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Helper function to format date for order card
function formatOrderDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${dateStr} ${timeStr}`;
    } catch (e) {
        return dateString;
    }
}

// Helper function to get order status badge
function getOrderStatusBadge(status) {
    if (!status) {
        return '<span class="badge badge-warning"><i class="mdi mdi-clock-outline"></i> Chờ xác nhận</span>';
    }
    
    const statusLower = status.toLowerCase();
    
    // Map backend statuses to user-friendly badges
    if (statusLower === 'created' || statusLower === 'new') {
        return '<span class="badge badge-warning"><i class="mdi mdi-clock-outline"></i> Chờ xác nhận</span>';
    } else if (statusLower === 'processing' || statusLower.includes('preparing')) {
        return '<span class="badge badge-info"><i class="mdi mdi-chef-hat"></i> Đang chế biến</span>';
    } else if (statusLower === 'ready' || statusLower === 'prepared') {
        return '<span class="badge badge-primary"><i class="mdi mdi-check-circle"></i> Sẵn sàng</span>';
    } else if (statusLower === 'completed' || statusLower.includes('delivered')) {
        return '<span class="badge badge-success"><i class="mdi mdi-check-circle"></i> Hoàn thành</span>';
    } else if (statusLower.includes('cancel')) {
        return '<span class="badge badge-danger"><i class="mdi mdi-close-circle"></i> Đã hủy</span>';
    } else if (statusLower.includes('way') || statusLower.includes('delivering')) {
        return '<span class="badge badge-light"><i class="mdi mdi-map-clock"></i> Đang giao hàng</span>';
    }
    
    // Default
    return '<span class="badge badge-primary"><i class="mdi mdi-clock-outline"></i> ' + status + '</span>';
}

// Helper function to get order status progress
function getOrderStatusProgress(status) {
    if (!status) {
        return {
            confirmed: 0,
            preparing: 0,
            onTheWay: 0
        };
    }
    
    const statusLower = status.toLowerCase();
    
    // Map backend statuses to progress
    if (statusLower === 'created' || statusLower === 'new') {
        // Order created, waiting for staff confirmation
        return {
            confirmed: 50,  // Partially confirmed (order created)
            preparing: 0,
            onTheWay: 0
        };
    } else if (statusLower === 'processing') {
        // Staff confirmed, preparing order
        return {
            confirmed: 100,  // Fully confirmed
            preparing: 50,  // Preparing in progress
            onTheWay: 0
        };
    } else if (statusLower === 'ready' || statusLower === 'prepared') {
        // Order ready for pickup/delivery
        return {
            confirmed: 100,
            preparing: 100,  // Preparation complete
            onTheWay: 0
        };
    } else if (statusLower === 'completed' || statusLower.includes('delivered')) {
        // Order completed
        return {
            confirmed: 100,
            preparing: 100,
            onTheWay: 100
        };
    } else if (statusLower.includes('cancel')) {
        // Order cancelled
        return {
            confirmed: 0,
            preparing: 0,
            onTheWay: 0
        };
    } else if (statusLower.includes('way') || statusLower.includes('delivering')) {
        // On the way
        return {
            confirmed: 100,
            preparing: 100,
            onTheWay: 50
        };
    }
    
    // Default
    return {
        confirmed: 0,
        preparing: 0,
        onTheWay: 0
    };
}

let ordersRefreshInterval = null;

$(document).ready(function() {
    console.log("=== $(document).ready() fired in orders.js ===");
    
    // Check if redirected from checkout (order created)
    const urlParams = new URLSearchParams(window.location.search);
    const orderCreated = urlParams.get('orderCreated');
    if (orderCreated) {
        console.log("✅ Order created, reloading orders...");
        // Clear URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        // Force reload orders after a short delay
        setTimeout(function() {
            loadOrdersData();
        }, 500);
    }
    
    // Check dependencies
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        setTimeout(function() {
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService still not loaded after 500ms!");
                return;
            }
            loadOrdersData();
            startAutoRefresh();
        }, 500);
        return;
    }
    
    loadOrdersData();
    
    // Start auto-refresh to update order status
    startAutoRefresh();
});

function startAutoRefresh() {
    console.log("=== startAutoRefresh() called ===");
    
    // Clear existing interval if any
    if (ordersRefreshInterval) {
        clearInterval(ordersRefreshInterval);
    }
    
    // Refresh orders every 5 seconds to get updated status (faster for real-time updates)
    // But only if we're not already loading and server is reachable
    ordersRefreshInterval = setInterval(function() {
        // Skip refresh if we're already loading or if there was a recent network error
        if (isLoadingOrders) {
            console.log("⏸️ Skipping auto-refresh: already loading");
            return;
        }
        
        // Check if we had a recent network error (readyState: 0)
        // If so, skip refresh to avoid spam
        if (getUserIdFromAPICalled && getUserIdFromAPIResult === null) {
            console.log("⏸️ Skipping auto-refresh: recent network error");
            return;
        }
        
        // Only refresh if page is visible (to save resources)
        if (document.hidden) {
            console.log("⏸️ Skipping auto-refresh: page is hidden");
            return;
        }
        
        console.log("Auto-refreshing orders...");
        loadOrdersData();
    }, 5000); // 5 seconds (faster for real-time status updates)
    
    console.log("✅ Auto-refresh started (every 10 seconds)");
}

// Stop auto-refresh when page is hidden (to save resources)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (ordersRefreshInterval) {
            clearInterval(ordersRefreshInterval);
            ordersRefreshInterval = null;
            console.log("⏸️ Auto-refresh paused (page hidden)");
        }
    } else {
        if (!ordersRefreshInterval) {
            startAutoRefresh();
            console.log("▶️ Auto-refresh resumed (page visible)");
        }
    }
});

// Track if we're already loading to prevent spam
let isLoadingOrders = false;

function loadOrdersData() {
    console.log("=== loadOrdersData() called ===");
    
    // Prevent multiple simultaneous calls
    if (isLoadingOrders) {
        console.log("⚠️ Already loading orders, skipping...");
        return;
    }
    
    isLoadingOrders = true;
    
    // Lấy userId từ token hoặc localStorage
    const userId = getUserIdFromToken();
    console.log("User ID from token:", userId);
    console.log("User ID type:", typeof userId);
    console.log("User ID value:", userId);
    
    if (userId && userId > 0) {
        console.log("✅ Valid userId found, loading orders for user:", userId);
        loadOrdersByUser(userId);
        isLoadingOrders = false;
    } else {
        // Fallback: try to get userId from API
        console.warn("⚠️ No valid userId found from token, trying to get from API...");
        getUserIdFromAPI(function(apiUserId) {
            isLoadingOrders = false;
            if (apiUserId && apiUserId > 0) {
                console.log("✅ Got userId from API:", apiUserId);
                loadOrdersByUser(apiUserId);
            } else {
                console.warn("⚠️ No valid userId from API either, trying to load all orders...");
                // Only try loadAllOrders if server is reachable
                // Check if previous API call failed due to network error
                if (getUserIdFromAPICalled === false) {
                    loadAllOrders();
                } else {
                    console.error("❌ Server not reachable, cannot load orders");
                    showErrorMessage("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại!");
                    showNoOrdersMessage();
                }
            }
        });
    }
}

// Track API call state to avoid spam
let getUserIdFromAPICalled = false;
let getUserIdFromAPIResult = null;

/**
 * Get user ID from API (async fallback)
 */
function getUserIdFromAPI(callback) {
    // Return cached result if available
    if (getUserIdFromAPIResult !== null) {
        console.log("✅ Using cached userId from API:", getUserIdFromAPIResult);
        callback(getUserIdFromAPIResult);
        return;
    }
    
    // Prevent multiple simultaneous calls
    if (getUserIdFromAPICalled) {
        console.log("⚠️ getUserIdFromAPI already in progress, waiting...");
        // Wait a bit and try again
        setTimeout(function() {
            if (getUserIdFromAPIResult !== null) {
                callback(getUserIdFromAPIResult);
            } else {
                callback(null);
            }
        }, 1000);
        return;
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyInfo !== 'function') {
        console.error("❌ ApiService.getMyInfo is not available!");
        callback(null);
        return;
    }
    
    getUserIdFromAPICalled = true;
    console.log("Calling ApiService.getMyInfo() to get user ID...");
    
    ApiService.getMyInfo()
        .done(function(response) {
            getUserIdFromAPICalled = false;
            console.log("=== Get My Info API Response ===");
            console.log("Full response:", response);
            
            // Check response format - could be ApiResponse or ResponseData
            let userData = null;
            if (response && response.result) {
                // ApiResponse format: { code, result, message }
                userData = response.result;
            } else if (response && response.data) {
                // ResponseData format: { status, isSuccess, data, desc }
                userData = response.data;
            } else if (response && response.id) {
                // Direct UserDTO
                userData = response;
            }
            
            if (userData && userData.id) {
                const userId = parseInt(userData.id, 10);
                if (!isNaN(userId) && userId > 0) {
                    localStorage.setItem('userId', userId.toString());
                    getUserIdFromAPIResult = userId; // Cache result
                    console.log("✅ User ID from API:", userId);
                    callback(userId);
                } else {
                    console.error("❌ Invalid user ID from API:", userData.id);
                    callback(null);
                }
            } else {
                console.error("❌ User ID not found in API response");
                callback(null);
            }
        })
        .fail(function(xhr, status, error) {
            getUserIdFromAPICalled = false;
            console.error("=== Get My Info API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("ReadyState:", xhr.readyState);
            
            // If network error, don't retry immediately
            if (status === 'error' && xhr.readyState === 0) {
                console.error("❌ Network error: Cannot connect to server");
                console.error("Server might be down or URL is incorrect");
            }
            
            callback(null);
        });
}

function getUserIdFromToken() {
    try {
        console.log("=== getUserIdFromToken() called ===");
        
        const token = getToken();
        if (!token) {
            console.warn("❌ No token found");
            return null;
        }
        
        console.log("✅ Token found, length:", token.length);
        
        // Decode token to get user info
        const decoded = decodeToken(token);
        if (!decoded) {
            console.warn("❌ Cannot decode token");
            return null;
        }
        
        console.log("✅ Token decoded successfully");
        console.log("Decoded token keys:", Object.keys(decoded));
        console.log("Decoded token:", decoded);
        
        // Try to get userId from localStorage first
        const userIdFromStorage = localStorage.getItem('userId');
        console.log("userId from localStorage:", userIdFromStorage);
        
        if (userIdFromStorage) {
            const userId = parseInt(userIdFromStorage, 10);
            console.log("Parsed userId from localStorage:", userId, "type:", typeof userId, "isNaN:", isNaN(userId));
            if (!isNaN(userId) && userId > 0) {
                console.log("✅ Got userId from localStorage:", userId);
                return userId;
            } else {
                console.warn("⚠️ Invalid userId from localStorage:", userIdFromStorage, "->", userId);
                // Clear invalid userId from localStorage
                localStorage.removeItem('userId');
            }
        }
        
        // Try to get from token (sub, id, or userId)
        // Note: sub might be email, so check if it's a number first
        if (decoded.sub) {
            // Check if sub is a number (not email)
            const subValue = decoded.sub;
            const isEmail = typeof subValue === 'string' && subValue.includes('@');
            
            if (!isEmail) {
                const userId = parseInt(subValue, 10);
                console.log("Parsed userId from token.sub:", userId, "type:", typeof userId, "isNaN:", isNaN(userId));
                if (!isNaN(userId) && userId > 0) {
                    console.log("✅ Got userId from token.sub:", userId);
                    // Save to localStorage for future use
                    localStorage.setItem('userId', userId.toString());
                    return userId;
                } else {
                    console.warn("⚠️ Invalid userId from token.sub:", decoded.sub, "->", userId);
                }
            } else {
                console.warn("⚠️ token.sub is an email, not userId:", decoded.sub);
            }
        }
        
        if (decoded.id) {
            const userId = parseInt(decoded.id, 10);
            console.log("Parsed userId from token.id:", userId, "type:", typeof userId, "isNaN:", isNaN(userId));
            if (!isNaN(userId) && userId > 0) {
                console.log("✅ Got userId from token.id:", userId);
                localStorage.setItem('userId', userId.toString());
                return userId;
            } else {
                console.warn("⚠️ Invalid userId from token.id:", decoded.id, "->", userId);
            }
        }
        
        if (decoded.userId) {
            const userId = parseInt(decoded.userId, 10);
            console.log("Parsed userId from token.userId:", userId, "type:", typeof userId, "isNaN:", isNaN(userId));
            if (!isNaN(userId) && userId > 0) {
                console.log("✅ Got userId from token.userId:", userId);
                localStorage.setItem('userId', userId.toString());
                return userId;
            } else {
                console.warn("⚠️ Invalid userId from token.userId:", decoded.userId, "->", userId);
            }
        }
        
        // Try other possible fields (but skip 'sub' as it might be email)
        const possibleFields = ['user_id', 'id', 'userId'];
        for (const field of possibleFields) {
            if (decoded[field]) {
                const fieldValue = decoded[field];
                // Skip if it's an email
                const isEmail = typeof fieldValue === 'string' && fieldValue.includes('@');
                if (isEmail) {
                    console.warn(`⚠️ Field "${field}" is an email, skipping:`, fieldValue);
                    continue;
                }
                
                const userId = parseInt(fieldValue, 10);
                console.log(`Trying field "${field}":`, fieldValue, "->", userId);
                if (!isNaN(userId) && userId > 0) {
                    console.log(`✅ Got userId from token.${field}:`, userId);
                    localStorage.setItem('userId', userId.toString());
                    return userId;
                }
            }
        }
        
        console.warn("❌ No valid userId found in token or localStorage");
        console.warn("Decoded token content:", JSON.stringify(decoded, null, 2));
        return null;
    } catch (e) {
        console.error("❌ Error getting userId from token:", e);
        console.error("Error stack:", e.stack);
        return null;
    }
}

function loadOrdersByUser(userId) {
    console.log("=== loadOrdersByUser() called ===");
    console.log("User ID:", userId);
    console.log("User ID type:", typeof userId);
    
    // Check if userId is an email (should not happen, but just in case)
    if (typeof userId === 'string' && userId.includes('@')) {
        console.error("❌ userId is an email, not a number:", userId);
        console.error("This should not happen! Token might contain email in sub field.");
        showErrorMessage("Lỗi: User ID không hợp lệ. Vui lòng đăng nhập lại!");
        // Try to get userId from API instead
        getUserIdFromAPI(function(apiUserId) {
            if (apiUserId && apiUserId > 0) {
                console.log("✅ Got userId from API fallback:", apiUserId);
                loadOrdersByUser(apiUserId);
            } else {
                showErrorMessage("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
            }
        });
        return;
    }
    
    // Validate userId
    if (!userId || userId <= 0) {
        console.error("❌ Invalid userId:", userId);
        showErrorMessage("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
        return;
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getOrdersByUser !== 'function') {
        console.error("❌ ApiService.getOrdersByUser is not available!");
        return;
    }
    
    console.log("Calling ApiService.getOrdersByUser() with userId:", userId);
    console.log("UserId type:", typeof userId);
    console.log("UserId is number?", !isNaN(userId));
    console.log("UserId > 0?", userId > 0);
    
    // Ensure userId is a number
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId) || numericUserId <= 0) {
        console.error("❌ Invalid numeric userId:", numericUserId);
        showErrorMessage("User ID không hợp lệ. Vui lòng đăng nhập lại!");
        return;
    }
    
    console.log("✅ Using numeric userId:", numericUserId);
    
    // Reset loading flag on completion
    const resetLoading = function() {
        isLoadingOrders = false;
    };
    
    ApiService.getOrdersByUser(numericUserId)
        .done(function(response) {
            resetLoading();
            console.log("=== Orders API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data;
            
            console.log("Orders check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData) {
                const orders = Array.isArray(response.data) ? response.data : [];
                console.log("✅ Orders data is valid, rendering " + orders.length + " orders...");
                renderOrders(orders);
            } else {
                console.warn("⚠️ Orders response format invalid:", response);
                if (response && response.status === 501) {
                    // API not implemented, try to load all orders
                    console.log("API not implemented (501), trying to load all orders...");
                    loadAllOrders();
                } else {
                    showNoOrdersMessage();
                }
            }
        })
        .fail(function(xhr, status, error) {
            resetLoading();
            console.error("=== Error loading orders ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Response Text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            console.error("Status Code:", xhr.status);
            console.error("Ready State:", xhr.readyState);
            console.error("Request URL:", xhr.responseURL || "N/A");
            
            let errorMessage = "Không thể tải danh sách đơn hàng!";
            
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
                    errorMessage = errorObj.message;
                } else if (errorObj.desc) {
                    errorMessage = errorObj.desc;
                } else if (errorObj.error) {
                    errorMessage = errorObj.error;
                } else if (errorObj.code && errorObj.code === 9999) {
                    errorMessage = "Lỗi không xác định từ server. Vui lòng kiểm tra lại thông tin đăng nhập!";
                }
            }
            
            // Handle specific status codes
            if (xhr.status === 0 || (status === 'error' && xhr.readyState === 0)) {
                // Network error - server not reachable
                const apiBaseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:82';
                const attemptedUrl = xhr.responseURL || `${apiBaseUrl}/order/user/${numericUserId}`;
                errorMessage = `❌ KHÔNG THỂ KẾT NỐI ĐẾN SERVER!\n\n` +
                    `URL đã thử: ${attemptedUrl}\n\n` +
                    `📋 HƯỚNG DẪN KHẮC PHỤC:\n\n` +
                    `1. Kiểm tra server có đang chạy:\n` +
                    `   - Mở browser và truy cập: http://localhost:82/restaurant\n` +
                    `   - Nếu không truy cập được → Server chưa chạy\n\n` +
                    `2. Khởi động Spring Boot server:\n` +
                    `   Cách 1: Chạy file start_server.bat trong thư mục food_delivery\n` +
                    `   Cách 2: Mở terminal và chạy:\n` +
                    `     cd food_delivery\n` +
                    `     mvn spring-boot:run\n\n` +
                    `3. Kiểm tra MySQL database có đang chạy không\n\n` +
                    `4. Sau khi server chạy, refresh trang này\n\n` +
                    `💡 Tip: Chạy check_server.bat để kiểm tra trạng thái server`;
                console.error("❌ Network error: Server not reachable");
                console.error("Attempted URL:", attemptedUrl);
                console.error("API_BASE_URL:", apiBaseUrl);
                console.error("XHR Details:", {
                    readyState: xhr.readyState,
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseURL: xhr.responseURL
                });
                showErrorMessage(errorMessage);
                showNoOrdersMessage();
                // Don't retry automatically for network errors to avoid spam
                return;
            } else if (xhr.status === 400) {
                errorMessage = errorMessage || "Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại!";
                showErrorMessage(errorMessage);
            } else if (xhr.status === 401) {
                errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
                showErrorMessage(errorMessage);
                setTimeout(function() {
                    window.location.href = 'signin.html';
                }, 2000);
                return; // Don't show empty state, redirecting
            } else if (xhr.status === 403) {
                errorMessage = "Bạn không có quyền truy cập!";
                showErrorMessage(errorMessage);
            } else if (xhr.status === 404 || xhr.status === 501) {
                console.log("API not implemented or not found, trying to load all orders...");
                loadAllOrders();
                return; // Don't show error message, let loadAllOrders handle it
            } else if (xhr.status === 500) {
                errorMessage = errorMessage || "Lỗi server. Vui lòng thử lại sau!";
                showErrorMessage(errorMessage);
            } else {
                showErrorMessage(errorMessage);
            }
            
            // Show empty state
            showNoOrdersMessage();
        });
}

function loadAllOrders() {
    console.log("=== loadAllOrders() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getOrders !== 'function') {
        console.error("❌ ApiService.getOrders is not available!");
        showNoOrdersMessage();
        return;
    }
    
    console.log("Calling ApiService.getOrders()...");
    
    ApiService.getOrders()
        .done(function(response) {
            console.log("=== All Orders API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data;
            
            if (isSuccess && hasData) {
                const orders = Array.isArray(response.data) ? response.data : [];
                console.log("✅ All orders data is valid, rendering " + orders.length + " orders...");
                renderOrders(orders);
            } else {
                console.warn("⚠️ All orders response format invalid:", response);
                showNoOrdersMessage();
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== All Orders API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            showNoOrdersMessage();
        });
}

function renderOrders(orders) {
    console.log("=== renderOrders() called ===");
    console.log("Orders count:", orders.length);
    
    if (!orders || orders.length === 0) {
        console.warn("⚠️ No orders to render");
        showNoOrdersMessage();
        return;
    }
    
    // Separate upcoming and previous orders
    // Upcoming: orders created today or with status "processing", "preparing", "on the way"
    // Previous: completed orders or older orders
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcomingOrders = [];
    const previousOrders = [];
    
    orders.forEach(function(order) {
        const orderDate = order.createDate ? new Date(order.createDate) : null;
        const orderStatus = order.status || '';
        const statusLower = orderStatus.toLowerCase();
        
        // Check if order is upcoming (created, processing, ready, on the way, or created today)
        // Upcoming: not completed, not cancelled, and either active status or created today
        const isUpcoming = statusLower === 'created' || 
                          statusLower === 'new' ||
                          statusLower === 'processing' || 
                          statusLower.includes('preparing') || 
                          statusLower === 'ready' ||
                          statusLower === 'prepared' ||
                          statusLower.includes('way') || 
                          statusLower.includes('delivering') ||
                          (orderDate && orderDate >= today);
        
        // Exclude completed and cancelled from upcoming
        const isCompleted = statusLower.includes('completed') || statusLower.includes('delivered');
        const isCancelled = statusLower.includes('cancel');
        
        if (isUpcoming && !isCompleted && !isCancelled) {
            upcomingOrders.push(order);
        } else {
            previousOrders.push(order);
        }
    });
    
    console.log("Upcoming orders count:", upcomingOrders.length);
    console.log("Previous orders count:", previousOrders.length);
    
    // Render upcoming orders
    renderUpcomingOrders(upcomingOrders);
    
    // Render previous orders
    renderPreviousOrders(previousOrders);
}

function renderUpcomingOrders(orders) {
    console.log("=== renderUpcomingOrders() called ===");
    console.log("Upcoming orders count:", orders.length);
    
    // Find "Đơn hàng sắp tới" section by text content
    let upcomingSection = null;
    $('.d-flex.align-items-center.justify-content-between').each(function() {
        const h5 = $(this).find('h5');
        if (h5.length > 0) {
            const h5Text = h5.text().trim();
            console.log("Checking h5 text:", h5Text);
            // Check for Vietnamese text "Đơn hàng sắp tới"
            if (h5Text.includes('Đơn hàng sắp tới') || 
                h5Text.includes('sắp tới') || 
                h5Text.includes('Upcoming orders') || 
                h5Text.includes('Upcoming')) {
                upcomingSection = $(this);
                console.log("✅ Found upcoming orders section");
                return false; // Break loop
            }
        }
    });
    
    // Find row container after upcoming section - must be the NEXT sibling .row
    let upcomingRow = null;
    if (upcomingSection && upcomingSection.length > 0) {
        // Look for the next .row element after the section header
        let nextElement = upcomingSection.next();
        while (nextElement.length > 0) {
            if (nextElement.hasClass('row')) {
                upcomingRow = nextElement;
                console.log("✅ Found upcoming orders row container");
                break;
            }
            nextElement = nextElement.next();
        }
    }
    
    // Fallback: Find first row in container-fluid
    if (!upcomingRow || upcomingRow.length === 0) {
        upcomingRow = $('.container-fluid .row').first();
        console.log("Using first row for upcoming orders (fallback)");
    }
    
    if (!upcomingRow || upcomingRow.length === 0) {
        console.error("❌ Could not find upcoming orders container");
        if (orders.length > 0) {
            // Create container if needed
            if (upcomingSection && upcomingSection.length > 0) {
                upcomingRow = $('<div class="row"></div>');
                upcomingSection.after(upcomingRow);
            }
        }
    }
    
    if (!upcomingRow || upcomingRow.length === 0) {
        console.error("❌ Could not create upcoming orders container");
        return;
    }
    
    if (orders.length === 0) {
        upcomingRow.html('<div class="col-12"><p class="text-center text-muted">Không có đơn hàng sắp tới.</p></div>');
        return;
    }
    
    let html = '';
    orders.forEach(function(order) {
        console.log("=== Rendering order ===", order);
        console.log("Order ID:", order.id);
        console.log("Order status:", order.status);
        console.log("Order restaurantTitle:", order.restaurantTitle);
        console.log("Order items:", order.items);
        console.log("Order listOrderItems:", order.listOrderItems);
        console.log("Order orderItems:", order.orderItems);
        
        // Get restaurant name - check multiple possible paths
        const restaurantName = order.restaurantTitle || 
                              (order.restaurant ? (order.restaurant.title || order.restaurant.name || 'Nhà hàng') : '') ||
                              order.restaurantName || 
                              (order.restaurantId ? `Nhà hàng #${order.restaurantId}` : 'Nhà hàng');
        
        console.log("Restaurant name resolved:", restaurantName);
        
        const orderDate = formatOrderDate(order.createDate);
        const statusBadge = getOrderStatusBadge(order.status);
        const progress = getOrderStatusProgress(order.status);
        const orderStatus = (order.status || '').toLowerCase();
        console.log("Order status (lowercase):", orderStatus);
        
        // Allow cancel if status is null, empty, 'created', 'new', or contains 'chờ' (waiting)
        const canCancel = !orderStatus || 
                         orderStatus === 'created' || 
                         orderStatus === 'new' || 
                         orderStatus.includes('chờ') ||
                         orderStatus.includes('waiting') ||
                         orderStatus.includes('pending');
        
        console.log("Can cancel:", canCancel);
        
        // Get order items - check multiple possible paths
        const orderItems = order.items || order.listOrderItems || order.orderItems || [];
        console.log("Order items found:", orderItems.length, orderItems);
        
        let itemsHtml = '';
        if (orderItems && orderItems.length > 0) {
            itemsHtml = '<div class="border-top pt-2 mt-2">';
            itemsHtml += '<p class="small text-muted mb-2"><strong>Danh sách món:</strong></p>';
            orderItems.forEach(function(item, index) {
                console.log("Processing item:", index, item);
                // OrderItemDTO has: foodTitle, foodPrice, quantity
                const foodName = item.foodTitle || 
                                item.foodName ||
                                (item.food ? (item.food.title || item.food.name || 'Món ăn') : '') ||
                                (item.foodDTO ? (item.foodDTO.title || item.foodDTO.name || 'Món ăn') : '') ||
                                'Món ăn';
                const quantity = item.quantity || 1;
                // OrderItemDTO uses foodPrice, not price
                const price = item.foodPrice || item.price || (item.food ? item.food.price : 0) || (item.foodDTO ? item.foodDTO.price : 0) || 0;
                const itemTotal = quantity * price;
                console.log("Item:", foodName, "Quantity:", quantity, "Price:", price, "Total:", itemTotal);
                itemsHtml += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <span class="text-dark font-weight-bold">${quantity}x</span>
                            <span class="text-dark ml-2">${escapeHtml(foodName)}</span>
                        </div>
                        <span class="text-primary font-weight-bold">${formatPrice(itemTotal)}</span>
                    </div>
                `;
            });
            itemsHtml += '</div>';
        } else {
            itemsHtml = '<div class="border-top pt-2 mt-2"><p class="text-muted small mb-0">Chưa có món ăn</p></div>';
        }
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="bg-white shadow-sm rounded overflow-hidden" style="border: 1px solid #e0e0e0;">
                    <!-- Restaurant Header -->
                    <div class="bg-light p-3 border-bottom">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="font-weight-bold text-dark mb-0">
                                    <i class="mdi mdi-store mr-2 text-primary"></i>${escapeHtml(restaurantName)}
                                </h6>
                            </div>
                            <div class="ml-auto">${statusBadge}</div>
                        </div>
                    </div>
                    
                    <!-- Order Content -->
                    <div class="p-3">
                        <!-- Estimated Time -->
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-light rounded p-2 mr-3">
                                <i class="mdi mdi-clock-outline text-primary"></i>
                            </div>
                            <div class="flex-grow-1">
                                <p class="mb-0 small text-muted">Thời gian dự kiến</p>
                                <p class="font-weight-bold mb-0 text-dark h6">35 phút</p>
                            </div>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="row mx-0 mb-3">
                            <div class="col-2 p-0">
                                <div class="progress osahan-progress" style="height: 6px;">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: ${progress.confirmed}%" aria-valuenow="${progress.confirmed}" aria-valuemin="0" aria-valuemax="100" data-toggle="tooltip" data-placement="top" title="Đơn hàng đã xác nhận"></div>
                                </div>
                            </div>
                            <div class="col-4 px-1">
                                <div class="progress osahan-progress" style="height: 6px;">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: ${progress.preparing}%" aria-valuenow="${progress.preparing}" aria-valuemin="0" aria-valuemax="100" data-toggle="tooltip" data-placement="top" title="Đơn hàng đang chuẩn bị"></div>
                                </div>
                            </div>
                            <div class="col-6 p-0">
                                <div class="progress osahan-progress" style="height: 6px;">
                                    <div class="progress-bar" role="progressbar" style="width: ${progress.onTheWay}%" aria-valuenow="${progress.onTheWay}" aria-valuemin="0" aria-valuemax="100" data-toggle="tooltip" data-placement="top" title="Đang trên đường"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Order Date -->
                        <div class="mb-3">
                            <p class="small text-muted mb-0">
                                <i class="mdi mdi-calendar-clock mr-1"></i>${orderDate}
                            </p>
                        </div>
                        
                        <!-- Order Items -->
                        ${itemsHtml}
                        
                        <!-- Total Price -->
                        ${order.totalPrice ? `
                            <div class="border-top pt-2 mt-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="font-weight-bold text-dark">Tổng tiền:</span>
                                    <span class="font-weight-bold text-danger h5 mb-0">${formatPrice(order.totalPrice)}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="p-3 bg-light border-top">
                        <div class="row mx-0">
                            ${canCancel ? `
                                <div class="col-6 px-1">
                                    <button class="btn btn-danger btn-sm btn-block" onclick="cancelOrder(${order.id})" title="Hủy đơn hàng">
                                        <i class="mdi mdi-close-circle mr-1"></i>Hủy đơn
                                    </button>
                                </div>
                                <div class="col-6 px-1">
                                    <a class="btn btn-primary btn-sm btn-block text-white" onclick="openTrackModal(${order.id}, '${JSON.stringify(order).replace(/'/g, "\\'")}'); return false;" data-toggle="modal" data-target="#trackModal">
                                        <i class="mdi mdi-map-marker-path mr-1"></i>Theo dõi
                                    </a>
                                </div>
                            ` : `
                                <div class="col-12 px-0">
                                    <a class="btn btn-primary btn-sm btn-block text-white" onclick="openTrackModal(${order.id}, '${JSON.stringify(order).replace(/'/g, "\\'")}'); return false;" data-toggle="modal" data-target="#trackModal">
                                        <i class="mdi mdi-map-marker-path mr-1"></i>Theo dõi
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    console.log("Upcoming orders HTML generated, length:", html.length);
    
    upcomingRow.html(html);
    console.log("✅ Upcoming orders rendered successfully, count:", orders.length);
    
    // Re-initialize tooltips
    if ($.fn.tooltip) {
        $('[data-toggle="tooltip"]').tooltip();
    }
}

// Cancel order function
function cancelOrder(orderId) {
    console.log("=== cancelOrder() called ===");
    console.log("Order ID:", orderId);
    
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        return;
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.cancelOrder !== 'function') {
        console.error("❌ ApiService.cancelOrder is not available!");
        alert('Không thể hủy đơn hàng. Vui lòng thử lại sau!');
        return;
    }
    
    ApiService.cancelOrder(orderId)
        .done(function(response) {
            console.log("=== Cancel Order Response ===", response);
            if (response && (response.isSuccess || response.success || response.status === 200)) {
                alert('Hủy đơn hàng thành công!');
                // Reload orders
                loadOrdersData();
            } else {
                alert(response?.desc || 'Hủy đơn hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Cancel Order Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            
            let errorMsg = 'Hủy đơn hàng thất bại!';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            } else if (xhr.status === 400) {
                errorMsg = 'Không thể hủy đơn hàng này. Đơn hàng đã được xác nhận hoặc đang được xử lý.';
            } else if (xhr.status === 404) {
                errorMsg = 'Không tìm thấy đơn hàng!';
            }
            
            alert(errorMsg);
        });
}

function renderPreviousOrders(orders) {
    console.log("=== renderPreviousOrders() called ===");
    console.log("Previous orders count:", orders.length);
    
    // Find container by ID first (most reliable)
    let previousRow = $('#previous-orders-container');
    
    // Fallback: Find by class or structure
    if (!previousRow || previousRow.length === 0) {
        previousRow = $('.previous-orders-section .row');
    }
    
    // Fallback: Find by text content
    if (!previousRow || previousRow.length === 0) {
        $('.d-flex.align-items-center.justify-content-between').each(function() {
            const h5 = $(this).find('h5');
            if (h5.length > 0) {
                const h5Text = h5.text().trim();
                if (h5Text.includes('Đơn hàng trước đó') || h5Text.includes('trước đó')) {
                    let nextElement = $(this).next();
                    while (nextElement.length > 0) {
                        if (nextElement.hasClass('row')) {
                            previousRow = nextElement;
                            break;
                        }
                        nextElement = nextElement.next();
                    }
                    return false;
                }
            }
        });
    }
    
    // Final fallback
    if (!previousRow || previousRow.length === 0) {
        const allRows = $('.container-fluid .row');
        if (allRows.length > 1) {
            previousRow = allRows.eq(1);
        }
    }
    
    if (!previousRow || previousRow.length === 0) {
        console.error("❌ Could not find previous orders container");
        return;
    }
    
    // Clear container first
    previousRow.empty();
    
    if (orders.length === 0) {
        previousRow.html('<div class="col-12"><p class="text-center text-muted py-4">Không có đơn hàng trước đó.</p></div>');
        return;
    }
    
    let html = '';
    orders.forEach(function(order) {
        // Get restaurant name - check multiple possible paths
        const restaurantName = order.restaurantTitle || 
                              (order.restaurant ? (order.restaurant.title || order.restaurant.name || 'Nhà hàng') : '') ||
                              order.restaurantName || 
                              'Nhà hàng';
        
        // Get restaurant ID - check multiple possible paths
        const restaurantId = order.restaurantId || 
                            (order.restaurant ? order.restaurant.id : null) ||
                            (order.restaurant ? order.restaurant.id : null) ||
                            0;
        
        const orderDate = formatOrderDate(order.createDate);
        const statusBadge = getOrderStatusBadge(order.status);
        
        // Check if order is completed (can be rated)
        const orderStatus = (order.status || '').toLowerCase();
        const isCompleted = orderStatus.includes('completed') || orderStatus.includes('delivered');
        
        // Get order items - check multiple possible paths
        const itemsSource = order.items || order.listOrderItems || order.orderItems || [];
        let itemsArray = [];
        
        if (Array.isArray(itemsSource)) {
            itemsArray = itemsSource;
        } else if (itemsSource.size !== undefined) {
            itemsArray = Array.from(itemsSource);
        } else if (typeof itemsSource === 'object') {
            itemsArray = Object.values(itemsSource);
        }
        
        let itemsHtml = '';
        if (itemsArray.length > 0) {
            // Group items by foodId to show quantity
            const itemsMap = {};
            itemsArray.forEach(function(item) {
                const foodId = item.foodId || (item.food ? item.food.id : null);
                const foodName = item.foodTitle || 
                                (item.food ? (item.food.title || item.food.name || 'Món ăn') : '') ||
                                item.foodName || 
                                'Món ăn';
                const price = item.price || item.foodPrice || 0;
                
                if (foodId) {
                    if (!itemsMap[foodId]) {
                        itemsMap[foodId] = {
                            foodTitle: foodName,
                            quantity: 0,
                            price: price
                        };
                    }
                    itemsMap[foodId].quantity += (item.quantity || 1);
                }
            });
            
            // Render grouped items
            itemsHtml = '<div class="border-top pt-2 mt-2">';
            itemsHtml += '<p class="small text-muted mb-2"><strong>Danh sách món:</strong></p>';
            const groupedItems = Object.values(itemsMap);
            groupedItems.forEach(function(item) {
                const itemTotal = item.quantity * item.price;
                itemsHtml += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <span class="text-dark font-weight-bold">${item.quantity}x</span>
                            <span class="text-dark ml-2">${escapeHtml(item.foodTitle)}</span>
                        </div>
                        <span class="text-primary font-weight-bold">${formatPrice(itemTotal)}</span>
                    </div>
                `;
            });
            itemsHtml += '</div>';
        } else {
            itemsHtml = '<div class="border-top pt-2 mt-2"><p class="text-muted small mb-0">Chưa có món ăn</p></div>';
        }
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="bg-white shadow-sm rounded overflow-hidden" style="border: 1px solid #e0e0e0;">
                    <!-- Restaurant Header -->
                    <div class="bg-light p-3 border-bottom">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="font-weight-bold text-dark mb-0">
                                    <i class="mdi mdi-store mr-2 text-primary"></i>${escapeHtml(restaurantName)}
                                </h6>
                            </div>
                            <div class="ml-auto">${statusBadge}</div>
                        </div>
                    </div>
                    
                    <!-- Order Content -->
                    <div class="p-3">
                        <!-- Order Date -->
                        <div class="mb-3">
                            <p class="small text-muted mb-0">
                                <i class="mdi mdi-calendar-clock mr-1"></i>${orderDate}
                            </p>
                        </div>
                        
                        <!-- Order Items -->
                        ${itemsHtml}
                        
                        <!-- Total Price -->
                        ${order.totalPrice ? `
                            <div class="border-top pt-2 mt-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="font-weight-bold text-dark">Tổng tiền:</span>
                                    <span class="font-weight-bold text-danger h6 mb-0">${formatPrice(order.totalPrice)}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="p-3 bg-light border-top">
                        <div class="row mx-0">
                            <div class="col-6 px-1">
                                <a href="#" class="btn btn-primary btn-sm btn-block text-white" onclick="loadOrderDetail(${order.id}); return false;" data-toggle="modal" data-target="#detailsModal">
                                    <i class="mdi mdi-eye mr-1"></i>Chi tiết
                                </a>
                            </div>
                            <div class="col-6 px-1">
                                <a href="settings.html" class="btn btn-outline-primary btn-sm btn-block">
                                    <i class="mdi mdi-help-circle mr-1"></i>Hỗ trợ
                                </a>
                            </div>
                        </div>
                        ${isCompleted ? `
                        <div class="row mx-0 mt-2">
                            <div class="col-12 px-1">
                                <button class="btn btn-warning btn-sm btn-block text-white" onclick="openRatingModal(${order.id}, ${restaurantId || 0}, '${escapeHtml(restaurantName)}'); return false;" data-toggle="modal" data-target="#ratingModal">
                                    <i class="mdi mdi-star mr-1"></i>Đánh giá
                                </button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    console.log("Previous orders HTML generated, length:", html.length);
    
    previousRow.html(html);
    console.log("✅ Previous orders rendered successfully, count:", orders.length);
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    console.error("❌ Error:", message);
    // Try to show alert or update UI
    if (typeof alert !== 'undefined') {
        alert(message);
    } else {
        console.error("Alert not available, error message:", message);
    }
}

/**
 * Load order detail from API and display in modal
 */
function loadOrderDetail(orderId) {
    console.log("=== loadOrderDetail() called ===");
    console.log("Order ID:", orderId);
    
    const modalBody = $('#orderDetailModalBody');
    modalBody.html('<div class="text-center py-4"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải chi tiết đơn hàng...</div>');
    
    // Show modal first
    $('#detailsModal').modal('show');
    
    // Load order detail from API
    ApiService.getOrderById(orderId)
        .done(function(response) {
            console.log("=== Order Detail Response ===", response);
            
            let order = null;
            if (response && response.data) {
                order = response.data;
            } else if (response && response.status === 200 && (response.success || response.isSuccess)) {
                order = response.data;
            } else if (response && response.id) {
                order = response;
            }
            
            if (!order) {
                modalBody.html('<div class="alert alert-danger">Không tìm thấy đơn hàng!</div>');
                return;
            }
            
            renderOrderDetail(order);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading order detail:", error);
            console.error("XHR:", xhr);
            
            let errorMsg = "Không thể tải chi tiết đơn hàng!";
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            
            modalBody.html(`<div class="alert alert-danger">${errorMsg}</div>`);
        });
}

/**
 * Render order detail in modal
 */
function renderOrderDetail(order) {
    console.log("=== renderOrderDetail() called ===");
    console.log("Order:", order);
    
    const modalBody = $('#orderDetailModalBody');
    
    // Get order data from OrderDTO format
    const orderDate = order.createDate 
        ? formatOrderDate(order.createDate) 
        : 'N/A';
    
    const userName = order.userFullName || order.userName || 'N/A';
    const userEmail = order.userEmail || 'N/A';
    const userPhone = order.users ? (order.users.phone || 'N/A') : 'N/A';
    
    const restaurantName = order.restaurantTitle || (order.restaurant ? order.restaurant.title : null) || 'Nhà hàng';
    const restaurantAddress = order.restaurant ? (order.restaurant.address || 'N/A') : 'N/A';
    
    // Get delivery address (from localStorage, order, or user)
    let deliveryAddress = order.deliveryAddress || (order.users ? (order.users.address || null) : null);
    
    // Check if address was updated via localStorage
    const orderAddressKey = `order_${order.id}_address`;
    const savedAddress = localStorage.getItem(orderAddressKey);
    if (savedAddress) {
        try {
            const addressData = JSON.parse(savedAddress);
            deliveryAddress = addressData.address;
        } catch (e) {
            console.warn("Error parsing saved address:", e);
        }
    }
    
    // Fallback to default message
    if (!deliveryAddress || deliveryAddress === 'N/A') {
        deliveryAddress = 'Chưa cập nhật địa chỉ';
    }
    
    // Get total price
    let totalPrice = 0;
    if (order.totalPrice != null && order.totalPrice !== undefined) {
        totalPrice = parseFloat(order.totalPrice) || 0;
    }
    
    // Render order items
    let itemsHtml = '';
    let itemsArray = [];
    
    // OrderDTO sử dụng 'items' thay vì 'listOrderItems'
    const itemsSource = order.items || order.listOrderItems;
    
    if (itemsSource) {
        if (Array.isArray(itemsSource)) {
            itemsArray = itemsSource;
        } else if (itemsSource.size !== undefined) {
            itemsArray = Array.from(itemsSource);
        } else if (typeof itemsSource === 'object') {
            itemsArray = Object.values(itemsSource);
        }
    }
    
    console.log("Order items array:", itemsArray);
    
    // Group items by foodId to calculate quantity
    if (itemsArray.length > 0) {
        const itemsMap = {};
        itemsArray.forEach(function(item) {
            const foodId = item.foodId || (item.food ? item.food.id : null);
            if (foodId) {
                if (!itemsMap[foodId]) {
                    itemsMap[foodId] = {
                        foodTitle: item.foodTitle || (item.food ? item.food.title : 'Món ăn'),
                        foodPrice: item.foodPrice ? parseFloat(item.foodPrice) : (item.food ? parseFloat(item.food.price) : 0),
                        quantity: 0
                    };
                }
                itemsMap[foodId].quantity += 1;
            }
        });
        
        // Render grouped items
        const groupedItems = Object.values(itemsMap);
        groupedItems.forEach(function(item) {
            const itemTotal = item.foodPrice * item.quantity;
            itemsHtml += `
                <div class="d-flex align-items-center">
                    <p class="bg-light rounded px-2 mr-3">${item.quantity}</p>
                    <p class="text-dark">${item.foodTitle}</p>
                    <p class="ml-auto">${formatVND(item.foodPrice * item.quantity)}</p>
                </div>
            `;
        });
        
        // Recalculate total from grouped items if needed
        if (totalPrice === 0) {
            groupedItems.forEach(function(item) {
                totalPrice += item.foodPrice * item.quantity;
            });
        }
    } else {
        itemsHtml = '<p class="text-muted">Không có món ăn nào</p>';
    }
    
    // Get payment method
    const paymentMethod = order.paymentMethod || 'COD';
    const paymentMethodText = paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                             paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 
                             paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 
                             paymentMethod;
    
    // Calculate delivery fee (if not in order, use default or calculate)
    const deliveryFee = order.deliveryFee || 0;
    const subtotal = totalPrice - deliveryFee;
    
    const html = `
        <div class="d-flex align-items-center mb-3" style="cursor: pointer;" onclick="openAddressSelectionModal(${order.id}, '${deliveryAddress.replace(/'/g, "\\'")}');" data-toggle="modal" data-target="#myaddressModal">
            <div class="">
                <p class="mb-1 text-danger">Giao đến</p>
                <p class="mb-0 font-weight-bold text-dark">${deliveryAddress || 'Chưa cập nhật địa chỉ'}</p>
            </div>
            <div class="ml-auto">
                <p class="mb-0"><i class="mdi mdi-chevron-right"></i></p>
            </div>
        </div>
        <div class="details-page border-top pt-3">
            <h6 class="mb-3">${restaurantName}</h6>
            ${itemsHtml}
            <div class="d-flex align-items-center py-2 border-top">
                <p class="text-dark m-0">Tạm tính</p>
                <p class="ml-auto text-danger m-0">${formatVND(subtotal)}</p>
            </div>
            <div class="d-flex align-items-center py-2 border-top">
                <p class="text-dark m-0">Phí giao hàng</p>
                <p class="ml-auto text-danger m-0">${formatVND(deliveryFee)}</p>
            </div>
            <div class="d-flex align-items-center py-3 border-top">
                <p class="text-dark h6 m-0">Tổng cộng</p>
                <p class="ml-auto text-danger h6 m-0">${formatVND(totalPrice)}</p>
            </div>
            <div class="d-flex align-items-center mb-3 bg-light rounded p-3">
                <p class="text-dark m-0">${paymentMethodText}</p>
                ${paymentMethod === 'CREDIT_CARD' ? `
                    <p class="ml-auto d-flex align-items-center mb-0">
                        <i class="fab fa-cc-mastercard mr-2 mb-0"></i>
                        <span class="dots-circle mr-2"><i class="mdi mdi-circle"></i> <i class="mdi mdi-circle"></i> <i class="mdi mdi-circle"></i> <i class="mdi mdi-circle"></i></span>
                        <span>${order.transactionId ? order.transactionId.slice(-4) : '****'}</span>
                    </p>
                ` : ''}
            </div>
            <div class="d-flex align-items-center mb-2">
                <p class="text-dark mb-0"><small><i class="mdi mdi-calendar mr-1"></i>${orderDate}</small></p>
                <p class="ml-auto mb-0"><small class="badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : order.status === 'processing' ? 'warning' : 'info'}">${getOrderStatusText(order.status)}</small></p>
            </div>
        </div>
    `;
    
    modalBody.html(html);
}

/**
 * Format VND currency
 */
function formatVND(price) {
    if (price == null || price === undefined) return '0 ₫';
    return parseFloat(price).toLocaleString('vi-VN') + ' ₫';
}

/**
 * Get order status text in Vietnamese
 */
// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Helper function to format price
function formatPrice(price) {
    if (price == null || price === undefined) {
        return '0 ₫';
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
        return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(priceNum);
}

function getOrderStatusText(status) {
    if (!status) return 'Chờ xác nhận';
    
    const statusLower = status.toLowerCase();
    const statusMap = {
        'created': 'Chờ xác nhận',
        'new': 'Chờ xác nhận',
        'processing': 'Đang chế biến',
        'preparing': 'Đang chuẩn bị',
        'ready': 'Sẵn sàng',
        'prepared': 'Sẵn sàng',
        'completed': 'Hoàn thành',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy',
        'on the way': 'Đang giao hàng',
        'delivering': 'Đang giao hàng'
    };
    return statusMap[statusLower] || status;
}

/**
 * Open track modal with order data
 */
function openTrackModal(orderId, orderDataJson) {
    console.log("=== openTrackModal() called ===");
    console.log("Order ID:", orderId);
    console.log("Order data JSON:", orderDataJson);
    
    try {
        // Parse order data
        let orderData;
        if (typeof orderDataJson === 'string') {
            // Try to parse as JSON string
            try {
                orderData = JSON.parse(orderDataJson);
            } catch (e) {
                // If parsing fails, try to get order from API
                console.warn("Could not parse order data, fetching from API...");
                if (typeof ApiService !== 'undefined' && ApiService.getOrderById) {
                    ApiService.getOrderById(orderId)
                        .done(function(response) {
                            const order = response.data || response;
                            window.currentOrderForTracking = order;
                            $('#trackModal').modal('show');
                        })
                        .fail(function() {
                            window.currentOrderForTracking = { id: orderId };
                            $('#trackModal').modal('show');
                        });
                    return;
                } else {
                    orderData = { id: orderId };
                }
            }
        } else {
            orderData = orderDataJson;
        }
        
        // Store order data for vietmap.js
        window.currentOrderForTracking = orderData;
        
        console.log("Order data stored for tracking:", orderData);
        
        // Show modal (will trigger vietmap initialization)
        $('#trackModal').modal('show');
    } catch (e) {
        console.error("Error in openTrackModal:", e);
        // Show modal anyway with default location
        window.currentOrderForTracking = { id: orderId };
        $('#trackModal').modal('show');
    }
}

/**
 * Open address selection modal for order
 */
function openAddressSelectionModal(orderId, currentAddress) {
    console.log("=== openAddressSelectionModal() called ===");
    console.log("Order ID:", orderId);
    console.log("Current address:", currentAddress);
    
    // Store order ID and current address for later use
    window.currentOrderForAddressUpdate = {
        orderId: orderId,
        currentAddress: currentAddress
    };
    
    // Load addresses and show modal
    if (typeof loadAddressesUniversal === 'function') {
        loadAddressesUniversal();
    } else if (typeof ApiService !== 'undefined' && ApiService.getMyAddresses) {
        // Fallback: load addresses directly
        ApiService.getMyAddresses()
            .done(function(response) {
                let addresses = [];
                if (response && response.data && Array.isArray(response.data)) {
                    addresses = response.data;
                } else if (Array.isArray(response)) {
                    addresses = response;
                }
                renderAddressSelectionForOrder(addresses, orderId, currentAddress);
            })
            .fail(function() {
                console.error("Failed to load addresses");
            });
    }
    
    // Show modal
    $('#myaddressModal').modal('show');
}

/**
 * Render address selection for order update
 */
function renderAddressSelectionForOrder(addresses, orderId, currentAddress) {
    console.log("=== renderAddressSelectionForOrder() called ===");
    console.log("Addresses:", addresses);
    
    const modalBody = $('#myaddressModal .modal-body');
    if (!modalBody.length) {
        console.error("Address modal body not found");
        return;
    }
    
    if (!addresses || addresses.length === 0) {
        modalBody.html(`
            <div class="text-center py-4">
                <i class="mdi mdi-map-marker-off text-muted" style="font-size: 48px;"></i>
                <p class="text-muted mt-3">Bạn chưa có địa chỉ nào đã lưu.</p>
                <a href="settings.html" class="btn btn-primary">Thêm địa chỉ mới</a>
            </div>
        `);
        return;
    }
    
    // Group addresses by type
    const homeAddresses = addresses.filter(addr => addr.type === 'HOME' || addr.type === 'home' || !addr.type);
    const workAddresses = addresses.filter(addr => addr.type === 'WORK' || addr.type === 'work');
    
    let html = `
        <div class="mb-3">
            <p class="text-dark font-weight-bold mb-2">Chọn địa chỉ giao hàng cho đơn hàng #${orderId}</p>
            <p class="text-muted small mb-3">Địa chỉ hiện tại: <strong>${currentAddress || 'Chưa cập nhật'}</strong></p>
        </div>
    `;
    
    // Home addresses tab
    if (homeAddresses.length > 0) {
        html += `
            <div class="mb-3">
                <h6 class="text-dark mb-2"><i class="mdi mdi-home-variant-outline mr-2"></i>Nhà (${homeAddresses.length})</h6>
        `;
        homeAddresses.forEach(function(addr) {
            const isSelected = addr.address === currentAddress ? 'border-primary' : '';
            html += `
                <div class="d-flex align-items-center mb-2 border rounded p-2 address-item ${isSelected}" 
                     style="cursor: pointer;" 
                     onclick="selectAddressForOrder(${orderId}, ${addr.id}, '${(addr.address || '').replace(/'/g, "\\'")}');">
                    <div class="mr-3 bg-light rounded p-2">
                        <i class="mdi mdi-home-variant-outline"></i>
                    </div>
                    <div class="flex-grow-1">
                        <p class="mb-0 font-weight-bold text-dark">${addr.title || 'Nhà'}</p>
                        <p class="mb-0 small text-muted">${addr.address || 'N/A'}</p>
                    </div>
                    ${addr.address === currentAddress ? '<i class="mdi mdi-check-circle text-primary"></i>' : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Work addresses tab
    if (workAddresses.length > 0) {
        html += `
            <div class="mb-3">
                <h6 class="text-dark mb-2"><i class="mdi mdi-office-building-marker-outline mr-2"></i>Cơ quan (${workAddresses.length})</h6>
        `;
        workAddresses.forEach(function(addr) {
            const isSelected = addr.address === currentAddress ? 'border-primary' : '';
            html += `
                <div class="d-flex align-items-center mb-2 border rounded p-2 address-item ${isSelected}" 
                     style="cursor: pointer;" 
                     onclick="selectAddressForOrder(${orderId}, ${addr.id}, '${(addr.address || '').replace(/'/g, "\\'")}');">
                    <div class="mr-3 bg-light rounded p-2">
                        <i class="mdi mdi-office-building-marker-outline"></i>
                    </div>
                    <div class="flex-grow-1">
                        <p class="mb-0 font-weight-bold text-dark">${addr.title || 'Cơ quan'}</p>
                        <p class="mb-0 small text-muted">${addr.address || 'N/A'}</p>
                    </div>
                    ${addr.address === currentAddress ? '<i class="mdi mdi-check-circle text-primary"></i>' : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    html += `
        <div class="text-center mt-3">
            <a href="settings.html" class="btn btn-outline-primary btn-sm">
                <i class="mdi mdi-plus mr-1"></i>Thêm địa chỉ mới
            </a>
        </div>
    `;
    
    modalBody.html(html);
}

/**
 * Select address for order
 */
function selectAddressForOrder(orderId, addressId, address) {
    console.log("=== selectAddressForOrder() called ===");
    console.log("Order ID:", orderId);
    console.log("Address ID:", addressId);
    console.log("Address:", address);
    
    // Store selected address for this order
    const orderAddressKey = `order_${orderId}_address`;
    localStorage.setItem(orderAddressKey, JSON.stringify({
        addressId: addressId,
        address: address,
        updatedAt: new Date().toISOString()
    }));
    
    // Update order address via API if available
    // Note: This API endpoint may need to be implemented on backend
    if (typeof ApiService !== 'undefined' && typeof ApiService.updateOrder === 'function') {
        ApiService.updateOrder(orderId, { deliveryAddress: address, addressId: addressId })
            .done(function(response) {
                console.log("Order address updated:", response);
                alert("Đã cập nhật địa chỉ giao hàng thành công!");
                $('#myaddressModal').modal('hide');
                // Reload order detail
                if (typeof loadOrderDetail === 'function') {
                    loadOrderDetail(orderId);
                }
            })
            .fail(function(xhr) {
                console.warn("API update not available, using localStorage");
                // Fallback: update UI directly
                updateOrderAddressInUI(orderId, address);
                $('#myaddressModal').modal('hide');
            });
    } else {
        // Fallback: update UI directly
        updateOrderAddressInUI(orderId, address);
        $('#myaddressModal').modal('hide');
    }
}

/**
 * Update order address in UI
 */
function updateOrderAddressInUI(orderId, address) {
    // Update in order detail modal
    const addressElement = $('#orderDetailModalBody').find('.d-flex.align-items-center.mb-3').first();
    if (addressElement.length) {
        addressElement.find('p.font-weight-bold.text-dark').text(address);
    }
    
    alert("Đã chọn địa chỉ: " + address);
}

function showNoOrdersMessage() {
    console.log("=== showNoOrdersMessage() called ===");
    
    // Find containers by ID (most reliable)
    let upcomingRow = $('#upcoming-orders-container');
    let previousRow = $('#previous-orders-container');
    
    // Fallback: Find by class
    if (!upcomingRow || upcomingRow.length === 0) {
        upcomingRow = $('.upcoming-orders-section .row');
    }
    if (!previousRow || previousRow.length === 0) {
        previousRow = $('.previous-orders-section .row');
    }
    
    // Final fallback
    if (!upcomingRow || upcomingRow.length === 0) {
        upcomingRow = $('.container-fluid .row').first();
    }
    if (!previousRow || previousRow.length === 0) {
        const allRows = $('.container-fluid .row');
        if (allRows.length > 1) {
            previousRow = allRows.eq(1);
        }
    }
    
    const noOrdersHtml = `
        <div class="col-12">
            <div class="alert alert-info text-center">
                <i class="mdi mdi-information-outline"></i>
                <p class="mb-0">Bạn chưa có đơn hàng nào.</p>
            </div>
        </div>
    `;
    
    if (upcomingRow && upcomingRow.length > 0) {
        upcomingRow.empty().html(noOrdersHtml);
    }
    
    if (previousRow && previousRow.length > 0) {
        previousRow.empty().html('<div class="col-12"><p class="text-center text-muted py-4">Không có đơn hàng trước đó.</p></div>');
    }
}

/**
 * Open rating modal for completed order
 */
function openRatingModal(orderId, restaurantId, restaurantName) {
    console.log("=== openRatingModal() called ===");
    console.log("Order ID:", orderId);
    console.log("Restaurant ID:", restaurantId);
    console.log("Restaurant Name:", restaurantName);
    
    const modalBody = $('#ratingModalBody');
    if (modalBody.length === 0) {
        console.error("Rating modal body not found!");
        alert("Không tìm thấy modal đánh giá. Vui lòng refresh trang!");
        return;
    }
    
    modalBody.html('<div class="text-center py-4"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải...</div>');
    
    // Show modal first
    $('#ratingModal').modal('show');
    
    // Load order detail to get items
    if (typeof ApiService === 'undefined' || typeof ApiService.getOrderById !== 'function') {
        modalBody.html('<div class="alert alert-danger">API Service không khả dụng!</div>');
        return;
    }
    
    ApiService.getOrderById(orderId)
        .done(function(response) {
            console.log("=== Order Detail for Rating ===", response);
            
            let order = null;
            if (response && response.data) {
                order = response.data;
            } else if (response && response.status === 200 && (response.success || response.isSuccess)) {
                order = response.data;
            } else if (response && response.id) {
                order = response;
            } else if (response && response.result) {
                // ApiResponse format
                order = response.result;
            }
            
            if (!order) {
                console.error("Order not found in response:", response);
                modalBody.html('<div class="alert alert-danger">Không tìm thấy đơn hàng! Vui lòng thử lại.</div>');
                return;
            }
            
            console.log("Order data:", order);
            
            // Get restaurant ID from order if not provided
            const finalRestaurantId = restaurantId || order.restaurantId || (order.restaurant ? order.restaurant.id : null) || 0;
            const finalRestaurantName = restaurantName || order.restaurantTitle || (order.restaurant ? order.restaurant.title : null) || 'Nhà hàng';
            
            console.log("Final Restaurant ID:", finalRestaurantId);
            console.log("Final Restaurant Name:", finalRestaurantName);
            
            if (!finalRestaurantId || finalRestaurantId === 0) {
                console.warn("Restaurant ID is missing, trying to get from order items...");
                // Try to get restaurant ID from order items
                const itemsSource = order.items || order.listOrderItems || order.orderItems || [];
                if (itemsSource.length > 0) {
                    const firstItem = itemsSource[0];
                    const itemRestaurantId = firstItem.restaurantId || (firstItem.food && firstItem.food.restaurant ? firstItem.food.restaurant.id : null);
                    if (itemRestaurantId) {
                        finalRestaurantId = itemRestaurantId;
                    }
                }
            }
            
            // Get order items
            const itemsSource = order.items || order.listOrderItems || order.orderItems || [];
            let itemsArray = [];
            
            if (Array.isArray(itemsSource)) {
                itemsArray = itemsSource;
            } else if (itemsSource.size !== undefined) {
                itemsArray = Array.from(itemsSource);
            } else if (typeof itemsSource === 'object') {
                itemsArray = Object.values(itemsSource);
            }
            
            console.log("Order items:", itemsArray);
            
            // Render rating form
            renderRatingForm(orderId, finalRestaurantId, finalRestaurantName, itemsArray);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading order for rating:", error);
            console.error("XHR:", xhr);
            console.error("Status:", status);
            
            let errorMsg = "Không thể tải thông tin đơn hàng!";
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            } else if (xhr.status === 404) {
                errorMsg = "Không tìm thấy đơn hàng!";
            } else if (xhr.status === 401) {
                errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
            }
            
            modalBody.html(`<div class="alert alert-danger">${errorMsg}</div>`);
        });
}

/**
 * Render rating form in modal
 */
function renderRatingForm(orderId, restaurantId, restaurantName, orderItems) {
    console.log("=== renderRatingForm() called ===");
    console.log("Order ID:", orderId);
    console.log("Restaurant ID:", restaurantId);
    console.log("Restaurant Name:", restaurantName);
    console.log("Order Items:", orderItems);
    
    const modalBody = $('#ratingModalBody');
    
    if (!restaurantId || restaurantId === 0) {
        console.warn("⚠️ Restaurant ID is missing or 0, cannot rate restaurant");
        modalBody.html(`
            <div class="alert alert-warning">
                <i class="mdi mdi-alert mr-2"></i>
                Không thể lấy thông tin nhà hàng. Vui lòng thử lại sau.
            </div>
        `);
        return;
    }
    
    // Create unique IDs for rating widgets
    const restaurantRatingId = `restaurant-rating-${orderId}`;
    
    let itemsHtml = '';
    if (orderItems && orderItems.length > 0) {
        // Group items by foodId
        const itemsMap = {};
        orderItems.forEach(function(item) {
            const foodId = item.foodId || (item.food ? item.food.id : null);
            const foodName = item.foodTitle || 
                           (item.food ? (item.food.title || item.food.name) : '') ||
                           item.foodName || 
                           'Món ăn';
            
            if (foodId && !itemsMap[foodId]) {
                itemsMap[foodId] = {
                    foodId: foodId,
                    foodName: foodName
                };
            }
        });
        
        // Render food rating widgets
        const uniqueItems = Object.values(itemsMap);
        if (uniqueItems.length > 0) {
            uniqueItems.forEach(function(item, index) {
                const foodRatingId = `food-rating-${orderId}-${item.foodId}`;
                itemsHtml += `
                    <div class="border rounded p-3 mb-3">
                        <h6 class="mb-3">${escapeHtml(item.foodName)}</h6>
                        <div id="${foodRatingId}" class="mb-3"></div>
                        <textarea class="form-control" id="food-comment-${item.foodId}" rows="2" placeholder="Nhận xét về món ăn này (tùy chọn)"></textarea>
                    </div>
                `;
            });
        }
    }
    
    const html = `
        <div class="rating-form-container">
            <h5 class="mb-4">Đánh giá đơn hàng #${orderId}</h5>
            
            <!-- Restaurant Rating -->
            <div class="border rounded p-4 mb-4">
                <h6 class="mb-3">
                    <i class="mdi mdi-store mr-2 text-primary"></i>${escapeHtml(restaurantName)}
                </h6>
                <p class="text-muted small mb-3">Đánh giá nhà hàng (bắt buộc)</p>
                <div id="${restaurantRatingId}" class="mb-3"></div>
                <textarea class="form-control" id="restaurant-comment" rows="3" placeholder="Nhận xét về nhà hàng (tùy chọn)"></textarea>
            </div>
            
            <!-- Food Items Rating -->
            ${itemsHtml ? `
                <h6 class="mb-3">Đánh giá món ăn (tùy chọn)</h6>
                ${itemsHtml}
            ` : '<p class="text-muted">Không có món ăn để đánh giá</p>'}
            
            <div class="alert alert-info">
                <i class="mdi mdi-information mr-2"></i>
                Bạn có thể click vào sao để chọn điểm đánh giá từ 1 đến 5 sao.
            </div>
            
            <button class="btn btn-primary btn-block mt-4" onclick="submitRatingsFromModal(${orderId}, ${restaurantId})">
                <i class="mdi mdi-star mr-2"></i>Gửi đánh giá
            </button>
        </div>
    `;
    
    modalBody.html(html);
    
    // Initialize restaurant rating widget
    setTimeout(function() {
        if (typeof createStarRating === 'function') {
            createStarRating({
                containerId: restaurantRatingId,
                currentRating: 0,
                editable: true,
                size: 'lg',
                onRatingChange: function(rating) {
                    console.log("Restaurant rating changed:", rating);
                }
            });
        } else {
            console.warn("createStarRating function not found, using simple stars");
            // Fallback: simple star display
            $(`#${restaurantRatingId}`).html(`
                <div class="star-rating-simple">
                    ${[1,2,3,4,5].map(i => `<i class="fas fa-star text-warning" style="font-size: 24px; cursor: pointer; margin-right: 5px;" data-rating="${i}" onclick="selectRating('${restaurantRatingId}', ${i})"></i>`).join('')}
                </div>
            `);
        }
        
        // Initialize food rating widgets
        if (orderItems && orderItems.length > 0) {
            try {
                const itemsMap = {};
                orderItems.forEach(function(item) {
                    const foodId = item.foodId || (item.food ? item.food.id : null);
                    if (foodId && !itemsMap[foodId]) {
                        itemsMap[foodId] = {
                            foodId: foodId,
                            foodName: item.foodTitle || (item.food ? (item.food.title || item.food.name) : 'Món ăn')
                        };
                    }
                });
                
                Object.values(itemsMap).forEach(function(item) {
                    const foodRatingId = `food-rating-${orderId}-${item.foodId}`;
                    try {
                        if (typeof createStarRating === 'function') {
                            createStarRating({
                                containerId: foodRatingId,
                                currentRating: 0,
                                editable: true,
                                size: 'md',
                                onRatingChange: function(rating) {
                                    console.log("Food rating changed:", rating, "Food ID:", item.foodId);
                                }
                            });
                        } else {
                            // Fallback
                            const starHtml = [1,2,3,4,5].map(i => 
                                `<i class="fas fa-star text-muted" style="font-size: 20px; cursor: pointer; margin-right: 5px;" data-rating="${i}" onclick="selectRating('${foodRatingId}', ${i})"></i>`
                            ).join('');
                            $(`#${foodRatingId}`).html(`<div class="star-rating-simple">${starHtml}</div>`);
                        }
                    } catch (e) {
                        console.error("Error initializing food rating for foodId:", item.foodId, e);
                        // Fallback
                        const starHtml = [1,2,3,4,5].map(i => 
                            `<i class="fas fa-star text-muted" style="font-size: 20px; cursor: pointer; margin-right: 5px;" data-rating="${i}" onclick="selectRating('${foodRatingId}', ${i})"></i>`
                        ).join('');
                        $(`#${foodRatingId}`).html(`<div class="star-rating-simple">${starHtml}</div>`);
                    }
                });
            } catch (e) {
                console.error("Error initializing food ratings:", e);
            }
        }
    }, 200);
}

/**
 * Simple rating selection (fallback)
 */
function selectRating(containerId, rating) {
    console.log("selectRating called:", containerId, rating);
    $(`#${containerId} .fa-star`).each(function(i) {
        const starRating = $(this).data('rating') || (i + 1);
        if (starRating <= rating) {
            $(this).addClass('text-warning').removeClass('text-muted');
        } else {
            $(this).addClass('text-muted').removeClass('text-warning');
        }
    });
    $(`#${containerId}`).attr('data-rating', rating);
    console.log("Rating selected:", rating, "for container:", containerId);
}

/**
 * Submit ratings for order (called from modal button)
 */
function submitRatingsFromModal(orderId, restaurantId) {
    console.log("=== submitRatingsFromModal() called ===");
    console.log("Order ID:", orderId);
    console.log("Restaurant ID:", restaurantId);
    
    const restaurantRatingId = `restaurant-rating-${orderId}`;
    
    // Try multiple ways to get rating
    let restaurantRating = $(`#${restaurantRatingId}`).attr('data-rating');
    if (!restaurantRating || restaurantRating == 0) {
        restaurantRating = $(`#${restaurantRatingId} .star-rating-container`).attr('data-rating');
    }
    if (!restaurantRating || restaurantRating == 0) {
        restaurantRating = $(`#${restaurantRatingId} .fa-star.text-warning`).length;
    }
    if (!restaurantRating || restaurantRating == 0) {
        // Try to count selected stars
        const selectedStars = $(`#${restaurantRatingId} .fa-star.text-warning`).length;
        if (selectedStars > 0) {
            restaurantRating = selectedStars;
        }
    }
    
    restaurantRating = parseInt(restaurantRating) || 0;
    const restaurantComment = $('#restaurant-comment').val() || '';
    
    console.log("Restaurant rating:", restaurantRating);
    console.log("Restaurant ID:", restaurantId);
    
    if (!restaurantRating || restaurantRating == 0) {
        alert('Vui lòng đánh giá nhà hàng bằng cách click vào sao!');
        return;
    }
    
    if (!restaurantId || restaurantId == 0) {
        alert('Không tìm thấy thông tin nhà hàng!');
        return;
    }
    
    // Submit restaurant rating
    if (typeof ApiService === 'undefined' || typeof ApiService.rateRestaurant !== 'function') {
        alert('API Service không khả dụng!');
        return;
    }
    
    // Get all food ratings from the modal
    const foodRatings = [];
    $(`[id^="food-rating-${orderId}-"]`).each(function() {
        const foodRatingId = $(this).attr('id');
        const foodIdMatch = foodRatingId.match(/food-rating-\d+-(\d+)/);
        if (foodIdMatch && foodIdMatch[1]) {
            const foodId = parseInt(foodIdMatch[1]);
            const foodRating = $(this).attr('data-rating') || 
                              $(this).find('.star-rating-container').attr('data-rating') ||
                              $(this).find('.fa-star.text-warning').length || 0;
            const foodComment = $(`#food-comment-${foodId}`).val() || '';
            
            if (foodRating && foodRating > 0) {
                foodRatings.push({
                    foodId: foodId,
                    rating: parseInt(foodRating),
                    comment: foodComment
                });
            }
        }
    });
    
    console.log("Food ratings to submit:", foodRatings);
    
    // Submit restaurant rating first
    ApiService.rateRestaurant(restaurantId, parseInt(restaurantRating), restaurantComment)
        .done(function(response) {
            console.log("Restaurant rating submitted:", response);
            
            // Submit all food ratings
            let submittedCount = 0;
            const totalFoodRatings = foodRatings.length;
            
            if (totalFoodRatings === 0) {
                // No food ratings, just close modal
                alert('Đánh giá thành công!');
                $('#ratingModal').modal('hide');
                // Reload orders to update UI
                setTimeout(function() {
                    loadOrdersData();
                }, 500);
                return;
            }
            
            foodRatings.forEach(function(foodRating) {
                ApiService.rateFood(foodRating.foodId, foodRating.rating, foodRating.comment)
                    .done(function(response) {
                        submittedCount++;
                        console.log(`Food rating ${submittedCount}/${totalFoodRatings} submitted:`, response);
                        
                        if (submittedCount === totalFoodRatings) {
                            alert('Đánh giá thành công!');
                            $('#ratingModal').modal('hide');
                            // Reload orders to update UI
                            setTimeout(function() {
                                loadOrdersData();
                            }, 500);
                        }
                    })
                    .fail(function(xhr, status, error) {
                        console.error("Error submitting food rating:", error);
                        submittedCount++;
                        if (submittedCount === totalFoodRatings) {
                            alert('Đánh giá nhà hàng thành công! Một số đánh giá món ăn có thể chưa được lưu.');
                            $('#ratingModal').modal('hide');
                            setTimeout(function() {
                                loadOrdersData();
                            }, 500);
                        }
                    });
            });
        })
        .fail(function(xhr, status, error) {
            console.error("Error submitting restaurant rating:", error);
            let errorMsg = "Không thể gửi đánh giá!";
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
        });
}
