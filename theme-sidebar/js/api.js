/*
 * API Service - Quản lý tất cả API calls
 */

console.log("=== API.JS LOADED - VERSION 2.1 ===");

const API_BASE_URL = 'http://localhost:82';
console.log("API_BASE_URL configured:", API_BASE_URL);

// Helper function để lấy token từ localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Helper function để lưu token
function setToken(token) {
    localStorage.setItem('token', token);
}

// Helper function để xóa token (logout)
function removeToken() {
    localStorage.removeItem('token');
}

// User logout function - redirect to home page
function userLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        removeToken();
        // User logout redirects to home page (index.html)
        window.location.href = 'index.html';
    }
}

// Helper function để kiểm tra đã đăng nhập chưa
function isAuthenticated() {
    return getToken() !== null;
}

// Helper function để decode JWT token và lấy thông tin user
function decodeToken(token) {
    try {
        if (!token) return null;
        
        // JWT có format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        // Decode payload (base64url)
        const payload = parts[1];
        // Replace URL-safe base64 to standard base64
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
        
        // Decode
        const decoded = JSON.parse(atob(paddedBase64));
        return decoded;
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
}

// Helper function để lấy role từ token
function getUserRole() {
    const token = getToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    // JWT scope claim chứa roles như: "ROLE_ADMIN ROLE_USER"
    const scope = decoded.scope || decoded.scopes || '';
    const scopes = scope.split(' ').filter(s => s.trim() !== '');
    
    // Tìm ADMIN role
    if (scopes.includes('ROLE_ADMIN') || scopes.includes('ADMIN')) {
        return 'ADMIN';
    }
    
    // Tìm USER role
    if (scopes.includes('ROLE_USER') || scopes.includes('USER')) {
        return 'USER';
    }
    
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
        console.log('🔑 Token included in request headers, length:', token.length);
    } else {
        console.warn('⚠️ No token found in localStorage');
    }
    return headers;
}

// API Service Object
const ApiService = {
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

    signup: function(signupData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/login/signup`,
            contentType: 'application/json',
            data: JSON.stringify(signupData),
            dataType: 'json'
        });
    },

    checkAdminUser: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/login/check-admin-user`,
            dataType: 'json'
        });
    },

    // ==================== Restaurant APIs ====================
    getRestaurants: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/restaurant`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getRestaurantDetail: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/restaurant/detail?id=${restaurantId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getRestaurantImage: function(filename) {
        return `${API_BASE_URL}/restaurant/file/${filename}`;
    },

    // ==================== Category APIs ====================
    getCategories: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/category`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getCategoryById: function(categoryId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/category/${categoryId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Menu/Food APIs ====================
    getMenus: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/menu`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getMenuById: function(menuId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/menu/${menuId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getMenuImage: function(filename) {
        return `${API_BASE_URL}/menu/file/${filename}`;
    },

    // ==================== Order APIs ====================
    createOrder: function(orderData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/order`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(orderData),
            dataType: 'json'
        });
    },

    getOrders: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/order`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getOrdersByUser: function(userId) {
        console.log("=== ApiService.getOrdersByUser() called ===");
        console.log("UserId:", userId);
        console.log("UserId type:", typeof userId);
        console.log("API_BASE_URL:", API_BASE_URL);
        console.log("API_BASE_URL type:", typeof API_BASE_URL);
        
        const fullUrl = `${API_BASE_URL}/order/user/${userId}`;
        console.log("Full URL:", fullUrl);
        
        const headers = getHeaders();
        console.log("Request headers:", headers);
        console.log("Token in headers:", headers['Authorization'] ? 'Present' : 'Missing');
        
        console.log("Sending AJAX request...");
        
        return $.ajax({
            method: 'GET',
            url: fullUrl,
            headers: headers,
            dataType: 'json',
            timeout: 15000, // 15 seconds timeout
            crossDomain: true,
            xhrFields: {
                withCredentials: false
            },
            beforeSend: function(xhr) {
                console.log("=== AJAX beforeSend ===");
                console.log("XHR readyState:", xhr.readyState);
                console.log("Request URL:", fullUrl);
            },
            success: function(data, textStatus, xhr) {
                console.log("=== AJAX Success ===");
                console.log("Status:", textStatus);
                console.log("Status Code:", xhr.status);
                console.log("Response:", data);
            },
            error: function(xhr, status, error) {
                console.error('=== AJAX Error Details ===');
                console.error('Status:', status);
                console.error('Error:', error);
                console.error('ReadyState:', xhr.readyState);
                console.error('Status Code:', xhr.status);
                console.error('Status Text:', xhr.statusText);
                console.error('Response Text:', xhr.responseText);
                console.error('Response URL:', xhr.responseURL || 'N/A');
                console.error('Request URL:', fullUrl);
                
                if (status === 'timeout') {
                    console.error('Request timeout when loading orders');
                } else if (status === 'error' && xhr.readyState === 0) {
                    console.error('Network error: Cannot connect to server. Please check if server is running.');
                    console.error('Attempted URL:', fullUrl);
                    console.error('This usually means:');
                    console.error('1. Server is not running');
                    console.error('2. URL is incorrect');
                    console.error('3. CORS is blocking the request');
                    console.error('4. Network/firewall issue');
                } else if (xhr.status > 0) {
                    console.error('Server responded with error status:', xhr.status);
                    if (xhr.responseJSON) {
                        console.error('Error response:', xhr.responseJSON);
                    }
                }
            }
        });
    },
    
    checkoutFromCart: function(userId, deliveryAddress, userLat, userLng) {
        console.log("=== ApiService.checkoutFromCart() called ===");
        console.log("UserId:", userId);
        console.log("DeliveryAddress:", deliveryAddress);
        console.log("UserLat:", userLat);
        console.log("UserLng:", userLng);
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/order/checkout`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                deliveryAddress: deliveryAddress || null,
                userLat: userLat || null,
                userLng: userLng || null
            }),
            dataType: 'json'
        });
    },

    cancelOrder: function(orderId) {
        console.log("=== ApiService.cancelOrder() called ===");
        console.log("OrderId:", orderId);
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/order/${orderId}/cancel`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Rating APIs ====================
    rateFood: function(foodId, ratePoint, content) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/rating/food`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                foodId: foodId,
                ratePoint: ratePoint,
                content: content || ''
            }),
            dataType: 'json'
        });
    },
    
    getMyFoodRating: function(foodId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/rating/food/${foodId}/my`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getFoodRatings: function(foodId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/rating/food/${foodId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    rateRestaurant: function(restaurantId, ratePoint, content) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/rating/restaurant`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                restaurantId: restaurantId,
                ratePoint: ratePoint,
                content: content || ''
            }),
            dataType: 'json'
        });
    },
    
    getMyRestaurantRating: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/rating/restaurant/${restaurantId}/my`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getRestaurantRatings: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/rating/restaurant/${restaurantId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    updateFoodRating: function(foodId, ratePoint, content) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/rating/food/${foodId}`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                ratePoint: ratePoint,
                content: content || ''
            }),
            dataType: 'json'
        });
    },

    deleteFoodRating: function(ratingId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/rating/food/${ratingId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    updateRestaurantRating: function(restaurantId, ratePoint, content) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/rating/restaurant/${restaurantId}`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                ratePoint: ratePoint,
                content: content || ''
            }),
            dataType: 'json'
        });
    },

    deleteRestaurantRating: function(ratingId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/rating/restaurant/${ratingId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== User APIs ====================
    getAllUsers: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getUserInfo: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getMyInfo: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/me`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    checkAdmin: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/check-admin`,
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

    updateMyProfile: function(userData, avatarFile) {
        // If avatarFile is provided, use FormData for multipart request
        if (avatarFile) {
            const formData = new FormData();
            if (userData.fullname) formData.append('fullname', userData.fullname);
            if (userData.phoneNumber) formData.append('phoneNumber', userData.phoneNumber);
            if (userData.email) formData.append('email', userData.email);
            if (userData.address) formData.append('address', userData.address);
            if (userData.password) formData.append('password', userData.password);
            formData.append('avatar', avatarFile);
            
            const headers = getHeaders();
            // Remove Content-Type header to let browser set it with boundary for multipart
            delete headers['Content-Type'];
            
            return $.ajax({
                method: 'PUT',
                url: `${API_BASE_URL}/user/profile`,
                headers: headers,
                processData: false,
                contentType: false,
                data: formData,
                dataType: 'json'
            });
        } else {
            // Regular JSON request
            return $.ajax({
                method: 'PUT',
                url: `${API_BASE_URL}/user/profile`,
                headers: getHeaders(),
                contentType: 'application/json',
                data: JSON.stringify(userData),
                dataType: 'json'
            });
        }
    },

    deleteMyAvatar: function() {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/user/avatar`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    grantAdminRole: function(userId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/user/${userId}/grant-admin`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    grantUserRole: function(userId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/user/${userId}/grant-user`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Order APIs ====================
    getOrderById: function(orderId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/order/${orderId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Notification APIs ====================
    getNotifications: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/notification?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getUnreadNotifications: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/notification/unread?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    getUnreadCount: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/notification/count?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    markNotificationAsRead: function(notificationId, userId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/notification/${notificationId}/read?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    markAllNotificationsAsRead: function(userId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/notification/read-all?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    deleteNotification: function(notificationId, userId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/notification/${notificationId}?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ==================== Voucher/Promo APIs ====================
    applyVoucher: function(voucherCode, restaurantId, cartTotal) {
        // Gửi restaurantId ngay cả khi null (để backend xử lý voucher áp dụng cho tất cả)
        const requestData = {
            voucherCode: voucherCode,
            code: voucherCode // Fallback
        };
        
        // Chỉ thêm restaurantId nếu có
        if (restaurantId) {
            requestData.restaurantId = restaurantId;
        }
        
        // Thêm cartTotal để backend validate min_order_value (nếu có)
        if (cartTotal) {
            requestData.cartTotal = cartTotal;
        }
        
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/voucher/apply`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            dataType: 'json'
        });
    },

    // ==================== Search APIs ====================
    searchAll: function(keyword) {
        console.log("=== ApiService.searchAll() called ===");
        console.log("Keyword:", keyword);
        console.log("URL:", `${API_BASE_URL}/search/all?keyword=${encodeURIComponent(keyword)}`);
        
        // Search is public endpoint, no need for auth headers
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/search/all?keyword=${encodeURIComponent(keyword)}`,
            dataType: 'json'
        });
    },

    searchRestaurants: function(keyword) {
        // Search is public endpoint, no need for auth headers
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/search/restaurant?keyword=${encodeURIComponent(keyword)}`,
            dataType: 'json'
        });
    },

    searchFoods: function(keyword) {
        // Search is public endpoint, no need for auth headers
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/search/food?keyword=${encodeURIComponent(keyword)}`,
            dataType: 'json'
        });
    },

    searchRestaurantsAdvanced: function(keyword, address, isFreeship) {
        // Search is public endpoint, no need for auth headers
        let url = `${API_BASE_URL}/search/restaurant/advanced?`;
        if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
        if (address) url += `address=${encodeURIComponent(address)}&`;
        if (isFreeship !== undefined) url += `isFreeship=${isFreeship}&`;
        return $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json'
        });
    },

    searchFoodsAdvanced: function(keyword, categoryId, minPrice, maxPrice) {
        // Search is public endpoint, no need for auth headers
        let url = `${API_BASE_URL}/search/food/advanced?`;
        if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
        if (categoryId) url += `categoryId=${categoryId}&`;
        if (minPrice) url += `minPrice=${minPrice}&`;
        if (maxPrice) url += `maxPrice=${maxPrice}&`;
        return $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json'
        });
    },

    // ==================== Cart APIs ====================
    /**
     * Lấy giỏ hàng của user
     * @param {number} userId - ID của user
     */
    getCart: function(userId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/cart?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Thêm món ăn vào giỏ hàng
     * @param {number} userId - ID của user
     * @param {number} foodId - ID của món ăn
     * @param {number} quantity - Số lượng
     */
    addToCart: function(userId, foodId, quantity) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/cart/item`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                foodId: foodId,
                quantity: quantity
            }),
            dataType: 'json'
        });
    },

    /**
     * Cập nhật số lượng món trong giỏ hàng
     * @param {number} itemId - ID của cart item
     * @param {number} quantity - Số lượng mới
     */
    updateCartItem: function(itemId, quantity) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/cart/item/${itemId}`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify({
                quantity: quantity
            }),
            dataType: 'json'
        });
    },

    /**
     * Xóa món khỏi giỏ hàng
     * @param {number} itemId - ID của cart item
     */
    removeCartItem: function(itemId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/cart/item/${itemId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Xóa toàn bộ giỏ hàng
     * @param {number} userId - ID của user
     */
    clearCart: function(userId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/cart?userId=${userId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Helper: Lấy image URL cho cart item (food)
     */
    getCartItemImage: function(imageFilename) {
        if (!imageFilename) return 'img/food1.jpg';
        if (imageFilename.startsWith('http://') || imageFilename.startsWith('https://')) {
            return imageFilename;
        }
        if (imageFilename.startsWith('/')) {
            return API_BASE_URL + imageFilename;
        }
        return `${API_BASE_URL}/menu/file/${imageFilename}`;
    },

    /**
     * ============================================
     * MESSAGE APIs - Chat giữa user và admin
     * ============================================
     */

    /**
     * Lấy danh sách conversations
     * - User: trả về admin
     * - Admin: trả về danh sách users đã chat
     */
    getConversations: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/message`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Lấy tin nhắn giữa user hiện tại và otherUserId
     * @param {number} otherUserId - ID của user khác (admin nếu là user, user nếu là admin)
     */
    getConversation: function(otherUserId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/message/${otherUserId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },
    
    /**
     * Lấy danh sách staff users available (không cần đã chat trước)
     * Dành cho user để tìm staff hỗ trợ
     */
    getAvailableStaffUsers: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/message/staff/available`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Gửi tin nhắn
     * - User: tự động gửi đến admin (receiverId không cần thiết)
     * - Admin: cần chỉ định receiverId
     * @param {object} messageData - { receiverId?: number, content: string }
     */
    sendMessage: function(messageData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/message`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(messageData),
            dataType: 'json'
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
            dataType: 'json'
        });
    },

    // ==================== Promo APIs ====================
    /**
     * Lấy tất cả promo codes đang active
     */
    getAllPromos: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/promo`,
            dataType: 'json'
        });
    },

    /**
     * Lấy promo codes theo restaurant ID đang active
     * @param {number} restaurantId - ID của restaurant
     */
    getPromosByRestaurant: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/promo/restaurant/${restaurantId}`,
            dataType: 'json'
        });
    },

    /**
     * Validate promo code
     * @param {number} promoId - ID của promo
     * @param {number} restaurantId - ID của restaurant (optional)
     */
    validatePromo: function(promoId, restaurantId) {
        let url = `${API_BASE_URL}/promo/validate?promoId=${promoId}`;
        if (restaurantId) {
            url += `&restaurantId=${restaurantId}`;
        }
        return $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json'
        });
    },

    // ============================================
    // ADDRESS MANAGEMENT APIs
    // ============================================

    /**
     * Lấy tất cả địa chỉ của user hiện tại
     */
    getMyAddresses: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/address`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Lấy địa chỉ theo loại (HOME, OFFICE, OTHER)
     */
    getAddressesByType: function(type) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/address/type/${type}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Lấy địa chỉ theo ID
     */
    getAddressById: function(addressId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/address/${addressId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Lấy địa chỉ mặc định (hoặc địa chỉ đầu tiên nếu không có mặc định)
     */
    getDefaultAddress: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/address/default`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * Tạo địa chỉ mới
     */
    createAddress: function(addressData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/user/address`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(addressData),
            dataType: 'json'
        });
    },

    /**
     * Cập nhật địa chỉ
     */
    updateAddress: function(addressId, addressData) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/user/address/${addressId}`,
            headers: getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(addressData),
            dataType: 'json'
        });
    },

    /**
     * Xóa địa chỉ
     */
    deleteAddress: function(addressId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/user/address/${addressId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    // ============================================
    // FILTERED SEARCH APIs
    // ============================================

    /**
     * Tìm kiếm món ăn với filter đầy đủ
     * @param {string} keyword - Từ khóa tìm kiếm
     * @param {string} sort - Sắp xếp: "popular", "delivery", "rating"
     * @param {number} priceRange - Khoảng giá: 1 ($), 2 ($$), 3 ($$$)
     * @param {Array<number>} categoryIds - Danh sách ID danh mục
     */
    searchFoodsFiltered: function(keyword, sort, priceRange, categoryIds) {
        let url = `${API_BASE_URL}/search/food/filtered?`;
        const params = [];
        if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
        if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
        if (priceRange) params.push(`priceRange=${priceRange}`);
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
            categoryIds.forEach(id => params.push(`categoryIds=${id}`));
        }
        url += params.join('&');
        
        return $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json'
        });
    },

    /**
     * Tìm kiếm nhà hàng với filter đầy đủ
     * @param {string} keyword - Từ khóa tìm kiếm
     * @param {string} sort - Sắp xếp: "popular", "delivery", "rating"
     * @param {number} priceRange - Khoảng giá: 1 ($), 2 ($$), 3 ($$$)
     * @param {Array<number>} categoryIds - Danh sách ID danh mục
     */
    searchRestaurantsFiltered: function(keyword, sort, priceRange, categoryIds) {
        let url = `${API_BASE_URL}/search/restaurant/filtered?`;
        const params = [];
        if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
        if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
        if (priceRange) params.push(`priceRange=${priceRange}`);
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
            categoryIds.forEach(id => params.push(`categoryIds=${id}`));
        }
        url += params.join('&');
        
        return $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json'
        });
    },

    // ============================================
    // PAYMENT METHOD API METHODS
    // ============================================
    
    /**
     * GET /user/payment-method - Lấy tất cả phương thức thanh toán của user hiện tại
     */
    getMyPaymentMethods: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/payment-method`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * GET /user/payment-method/default - Lấy phương thức thanh toán mặc định
     */
    getDefaultPaymentMethod: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/payment-method/default`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * GET /user/payment-method/{id} - Lấy phương thức thanh toán theo ID
     */
    getPaymentMethodById: function(methodId) {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/user/payment-method/${methodId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },
    
    /**
     * GET /payment/stripe-key - Lấy Stripe publishable key từ backend
     */
    getStripePublishableKey: function() {
        return $.ajax({
            method: 'GET',
            url: `${API_BASE_URL}/payment/stripe-key`,
            dataType: 'json'
        });
    },

    /**
     * POST /user/payment-method - Tạo phương thức thanh toán mới
     */
    createPaymentMethod: function(paymentData) {
        return $.ajax({
            method: 'POST',
            url: `${API_BASE_URL}/user/payment-method`,
            headers: getHeaders(),
            data: JSON.stringify(paymentData),
            dataType: 'json'
        });
    },

    /**
     * PUT /user/payment-method/{id} - Cập nhật phương thức thanh toán
     */
    updatePaymentMethod: function(methodId, paymentData) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/user/payment-method/${methodId}`,
            headers: getHeaders(),
            data: JSON.stringify(paymentData),
            dataType: 'json'
        });
    },

    /**
     * PUT /user/payment-method/{id}/set-default - Đặt làm phương thức thanh toán mặc định
     */
    setDefaultPaymentMethod: function(methodId) {
        return $.ajax({
            method: 'PUT',
            url: `${API_BASE_URL}/user/payment-method/${methodId}/set-default`,
            headers: getHeaders(),
            dataType: 'json'
        });
    },

    /**
     * DELETE /user/payment-method/{id} - Xóa phương thức thanh toán
     */
    deletePaymentMethod: function(methodId) {
        return $.ajax({
            method: 'DELETE',
            url: `${API_BASE_URL}/user/payment-method/${methodId}`,
            headers: getHeaders(),
            dataType: 'json'
        });
    }
};

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}

// Debug: Log ApiService methods after definition
console.log("=== API.JS - ApiService methods ===");
console.log("ApiService defined:", typeof ApiService !== 'undefined');
if (typeof ApiService !== 'undefined') {
    console.log("ApiService methods count:", Object.keys(ApiService).length);
    console.log("ApiService methods:", Object.keys(ApiService));
    console.log("checkoutFromCart exists:", 'checkoutFromCart' in ApiService);
    console.log("checkoutFromCart type:", typeof ApiService.checkoutFromCart);
    console.log("getConversations exists:", 'getConversations' in ApiService);
    console.log("getConversations type:", typeof ApiService.getConversations);
    console.log("sendMessage exists:", 'sendMessage' in ApiService);
    console.log("sendMessage type:", typeof ApiService.sendMessage);
    console.log("getConversation exists:", 'getConversation' in ApiService);
    console.log("getUnreadMessageCount exists:", 'getUnreadMessageCount' in ApiService);
}

