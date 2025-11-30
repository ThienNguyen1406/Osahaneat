/*
 * Admin API Service
 */

console.log("=== API.JS LOADED ===");

// API Base URL - can be configured
const API_BASE_URL = 'http://localhost:82';

// Log API configuration
console.log("API_BASE_URL configured as:", API_BASE_URL);

// Helper function để lấy token từ localStorage
// Sử dụng cùng token với theme-sidebar để có thể login từ theme-sidebar
function getToken() {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
}

// Helper function để lưu token
// Lưu vào cả 'token' và 'adminToken' để tương thích
function setToken(token) {
    localStorage.setItem('token', token);
    localStorage.setItem('adminToken', token);
}

// Helper function để xóa token (logout)
function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
}

// Helper function để kiểm tra đã đăng nhập chưa
function isAuthenticated() {
    return getToken() !== null;
}

// Helper function để decode JWT token và lấy thông tin user
function decodeToken(token) {
    try {
        if (!token) {
            console.debug("decodeToken - No token provided");
            return null;
        }
        
        console.debug("decodeToken - Token length:", token.length);
        
        // JWT có format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error("decodeToken - Invalid token format, expected 3 parts, got:", parts.length);
            return null;
        }
        
        // Decode payload (base64url)
        const payload = parts[1];
        console.debug("decodeToken - Payload (first 50 chars):", payload.substring(0, 50));
        
        // Replace URL-safe base64 to standard base64
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
        
        // Decode
        const decoded = JSON.parse(atob(paddedBase64));
        console.debug("decodeToken - Decoded payload:", decoded);
        return decoded;
    } catch (e) {
        console.error('Error decoding token:', e);
        console.error('Token (first 100 chars):', token ? token.substring(0, 100) : 'null');
        return null;
    }
}

// Helper function để lấy role từ token
function getUserRole() {
    const token = getToken();
    if (!token) {
        console.debug("getUserRole - No token found");
        return null;
    }
    
    const decoded = decodeToken(token);
    if (!decoded) {
        console.error("getUserRole - Failed to decode token");
        return null;
    }
    
    console.debug("getUserRole - Decoded token:", decoded);
    
    // JWT scope claim chứa roles như: "ROLE_ADMIN ROLE_USER"
    const scope = decoded.scope || decoded.scopes || '';
    console.debug("getUserRole - Scope from token:", scope);
    
    const scopes = scope.split(' ').filter(s => s.trim() !== '');
    console.debug("getUserRole - Scopes array:", scopes);
    
    // Tìm ADMIN role
    if (scopes.includes('ROLE_ADMIN') || scopes.includes('ADMIN')) {
        console.debug("getUserRole - Found ADMIN role");
        return 'ADMIN';
    }
    
    // Tìm USER role
    if (scopes.includes('ROLE_USER') || scopes.includes('USER')) {
        console.debug("getUserRole - Found USER role");
        return 'USER';
    }
    
    console.warn("getUserRole - No role found in scopes:", scopes);
    return null;
}

// Helper function để kiểm tra user có phải admin không
function isAdmin() {
    return getUserRole() === 'ADMIN';
}

// Helper function để tạo headers với token
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Admin API Service Object
const AdminApiService = {
    // ==================== Authentication APIs ====================
    login: function(username, password) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/login/signin`,
            data: {
                username: username,
                password: password
            },
            dataType: 'json'
        });
    },

    // ==================== User Management APIs (Admin Only) ====================
    getAllUsers: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    checkAdmin: function() {
        console.log("AdminApiService.checkAdmin - Calling API...");
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/check-admin`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getUserById: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    updateUser: function(userId, userData) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/user/${userId}`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(userData),
            dataType: 'json'
        });
    },

    deleteUser: function(userId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/user/${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    searchUsers: function(keyword) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/search?keyword=${encodeURIComponent(keyword)}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    createUser: function(userData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/user`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(userData),
            dataType: 'json'
        });
    },

    // ==================== Restaurant Management APIs (Admin Only) ====================
    createRestaurant: function(formData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/admin/restaurant`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },

    updateRestaurant: function(restaurantId, formData) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/restaurant/${restaurantId}`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },

    deleteRestaurant: function(restaurantId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/admin/restaurant/${restaurantId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    approveRestaurant: function(restaurantId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/restaurant/${restaurantId}/approve`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    rejectRestaurant: function(restaurantId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/restaurant/${restaurantId}/reject`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getRestaurants: function() {
        // Use admin endpoint if available, fallback to public endpoint
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/restaurant`,
            headers: getHeaders(),
            dataType: 'json'
        }).fail(function(xhr) {
            // Fallback to public endpoint if admin endpoint fails
            if (xhr.status === 404 || xhr.status === 403) {
                return $.ajax({
                    method: 'GET',
                    url: `${API_BASE_URL}/restaurant`,
                    headers: getHeaders(),
                    dataType: 'json'
                });
            }
            return $.Deferred().reject(xhr);
        });
    },

    getRestaurantDetail: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/restaurant/detail`,
            headers: getHeaders(),
            data: { id: restaurantId },
            dataType: 'json'
        });
    },

    /**
     * GET /admin/restaurant/{id} - Lấy restaurant theo ID (Admin only)
     */
    getRestaurantById: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/restaurant/${restaurantId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Menu Management APIs (Admin Only) ====================
    getAllMenus: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/menu`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getMenuById: function(menuId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/menu/${menuId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    createMenu: function(formData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/admin/menu`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },

    updateMenu: function(menuId, formData) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/menu/${menuId}`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },

    deleteMenu: function(menuId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/admin/menu/${menuId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getMenuImage: function(filename) {
        return `${API_BASE_URL}/menu/file/${filename}`;
    },

    // ==================== Category Management APIs (Admin Only) ====================
    createCategory: function(nameCate) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/admin/category?nameCate=${encodeURIComponent(nameCate)}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    updateCategory: function(categoryId, nameCate) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/category/${categoryId}?nameCate=${encodeURIComponent(nameCate)}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    deleteCategory: function(categoryId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/admin/category/${categoryId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getAllCategories: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/category`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    searchCategories: function(keyword) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/category/search?keyword=${encodeURIComponent(keyword)}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getCategories: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/category`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Order Management APIs ====================
    getAllOrders: function() {
        console.log("=== AdminApiService.getAllOrders() called ===");
        console.log("URL:", `${API_BASE_URL}/admin/order`);
        
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/order`,
            headers: getHeaders(),
            dataType: 'json',
            timeout: 15000, // 15 seconds timeout
            error: function(xhr, status, error) {
                if (status === 'timeout') {
                    console.error('Request timeout when loading orders');
                } else if (status === 'error' && xhr.readyState === 0) {
                    console.error('Network error: Cannot connect to server. Please check if server is running.');
                }
            }
        });
    },

    getOrderById: function(orderId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/order/${orderId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getOrdersByUserId: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/order/user/${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    updateOrder: function(orderId, status) {
        console.log("=== AdminApiService.updateOrder() called ===");
        console.log("Order ID:", orderId);
        console.log("Status:", status);
        
        if (!status || status.trim() === '') {
            console.error("Status is empty!");
            return $.Deferred().reject({
                status: 400,
                responseJSON: {
                    desc: "Status không được để trống!"
                }
            });
        }
        
        const url = `${API_BASE_URL}/admin/order/${orderId}?status=${encodeURIComponent(status)}`;
        console.log("Request URL:", url);
        
        return $.ajax({
            method: 'PUT',
            url: url,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    deleteOrder: function(orderId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/admin/order/${orderId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Notification APIs ====================
    getAllNotifications: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/notification`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    createNotification: function(userId, title, content, type, link) {
        let url = `${API_BASE_URL}/admin/notification?userId=${userId}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`;
        if (type) url += `&type=${encodeURIComponent(type)}`;
        if (link) url += `&link=${encodeURIComponent(link)}`;
        return $.ajax({
            method: 'POST',
            url: url,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Search APIs ====================
    searchUsers: function(keyword) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/search/user?keyword=${encodeURIComponent(keyword)}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Message APIs - Chat giữa admin và users ====================
    /**
     * Lấy danh sách conversations
     * Admin: trả về danh sách users đã chat
     */
    getConversations: function() {
        console.log("=== AdminApiService.getConversations() called ===");
        console.log("API_BASE_URL:", API_BASE_URL);
        console.log("Full URL:", `${API_BASE_URL}/message`);
        console.log("Headers:", getHeaders());
        
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/message`,
            headers: getHeaders(),
            dataType: 'json',
            timeout: 15000, // 15 seconds timeout (increased)
            crossDomain: true, // Allow cross-domain requests
            xhrFields: {
                withCredentials: false // Don't send credentials for CORS
            },
            error: function(xhr, status, error) {
                console.error('=== getConversations Error ===');
                console.error('Status:', status);
                console.error('Error:', error);
                console.error('XHR Status:', xhr.status);
                console.error('ReadyState:', xhr.readyState);
                console.error('Response Text:', xhr.responseText);
                console.error('Response JSON:', xhr.responseJSON);
                
                if (status === 'timeout') {
                    console.error('Request timeout when loading conversations');
                } else if (status === 'error' && xhr.readyState === 0) {
                    console.error('Network error: Cannot connect to server. Please check:');
                    console.error('1. Server URL:', API_BASE_URL);
                    console.error('2. Server is running on port 82?');
                    console.error('3. CORS is configured correctly?');
                    console.error('4. Firewall blocking the connection?');
                } else if (xhr.status === 0) {
                    console.error('Connection refused or CORS error. Check:');
                    console.error('1. Server is running?');
                    console.error('2. CORS configuration in backend?');
                    console.error('3. Network connectivity?');
                }
            }
        });
    },

    /**
     * Lấy tin nhắn giữa admin và user
     * @param {number} userId - ID của user
     */
    getConversation: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/message/${userId}`,
            headers: getHeaders(),
            dataType: 'json',
            timeout: 10000
        });
    },

    /**
     * Gửi tin nhắn
     * Admin: cần chỉ định receiverId (userId)
     * @param {object} messageData - { receiverId: number, content: string }
     */
    sendMessage: function(messageData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/message`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(messageData),
            dataType: 'json',
            timeout: 10000
        });
    },

    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    getUnreadMessageCount: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/message/unread/count`,
            headers: getHeaders(),
            dataType: 'json',
            timeout: 10000
        });
    },

    // ==================== Driver/Shipper Management APIs ====================
    /**
     * GET /user/drivers - Lấy danh sách tất cả drivers (shippers)
     * @param {string} keyword - Từ khóa tìm kiếm (optional)
     */
    getDrivers: function(keyword = '') {
        let url = `${API_BASE_URL}/user/drivers`;
        if (keyword && keyword.trim() !== '') {
            url += `?keyword=${encodeURIComponent(keyword.trim())}`;
        }
        return $.ajax({
            method: 'GET',
            url: url,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Role Management APIs ====================
    /**
     * GET /admin/role - Lấy danh sách tất cả roles với số lượng users
     */
    getRoles: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/role`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * POST /admin/role - Tạo role mới
     */
    createRole: function(roleName, description) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/admin/role`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                roleName: roleName,
                description: description
            }),
            dataType: 'json'
        });
    },

    /**
     * PUT /admin/role/{id} - Cập nhật role
     */
    updateRole: function(roleId, roleName, description) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/role/${roleId}`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                roleName: roleName,
                description: description
            }),
            dataType: 'json'
        });
    },

    /**
     * DELETE /admin/role/{id} - Xóa role
     */
    deleteRole: function(roleId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/admin/role/${roleId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Shipper Management APIs ====================
    approveShipper: function(shipperId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/shipper/${shipperId}/approve`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    deleteShipper: function(shipperId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/admin/shipper/${shipperId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    resetShipperPassword: function(shipperId, newPassword) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/admin/shipper/${shipperId}/reset-password`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({ password: newPassword || '123456' }),
            dataType: 'json'
        });
    },

    // ==================== Statistics APIs ====================
    /**
     * GET /admin/statistics/user-growth - Lấy số lượng người đăng ký theo tháng
     */
    getUserGrowthByMonth: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/admin/statistics/user-growth`,
            headers: getHeaders(),
            dataType: 'json'
        });
    }
};

