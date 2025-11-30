/*
 * Restaurant Staff App - JavaScript
 * Quản lý đơn hàng nhà hàng
 */

console.log("=== STAFF.JS LOADED ===");

// Helper function to decode JWT token
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

const StaffApiService = {
    API_BASE_URL: 'http://localhost:82',
    
    getHeaders: function() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    },
    
    // Lấy đơn hàng của nhà hàng
    getRestaurantOrders: function(status = null) {
        let url = `${this.API_BASE_URL}/restaurant/staff/orders`;
        if (status) {
            url += `?status=${encodeURIComponent(status)}`;
        }
        console.log("=== StaffApiService.getRestaurantOrders ===");
        console.log("URL:", url);
        console.log("Status filter:", status);
        return $.ajax({
            method: 'GET',
            url: url,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: function(orderId, status) {
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/staff/orders/${orderId}/status`,
            headers: this.getHeaders(),
            data: JSON.stringify({ status: status }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Bật/tắt món
    toggleMenu: function(menuId, isAvailable) {
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/staff/menu/${menuId}/toggle`,
            headers: this.getHeaders(),
            data: JSON.stringify({ isAvailable: isAvailable }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Lấy doanh thu ngày
    getDailyRevenue: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/staff/revenue/daily`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy menu của nhà hàng
    getRestaurantMenu: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/staff/menu`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    }
};

// Logout function
function staffLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
}

// Helper function to check if user has RESTAURANT_STAFF role
function hasStaffRole() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const decoded = decodeToken(token);
        if (!decoded) return false;
        
        const scope = decoded.scope || decoded.scopes || '';
        const scopes = scope.split(' ').filter(s => s.trim() !== '');
        
        return scopes.includes('ROLE_RESTAURANT_STAFF') || scopes.includes('RESTAURANT_STAFF');
    } catch (e) {
        console.error('Error checking staff role:', e);
        return false;
    }
}

$(document).ready(function() {
    console.log("=== Staff Dashboard Ready ===");
    
    // Check authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập!');
        window.location.href = '../admin/login.html';
        return;
    }
    
    // Check if user has RESTAURANT_STAFF role
    if (!hasStaffRole()) {
        console.error("❌ User does not have RESTAURANT_STAFF role");
        alert('Bạn không có quyền truy cập trang nhân viên nhà hàng!\n\nVui lòng đăng nhập với tài khoản nhân viên.');
        window.location.href = '../theme-sidebar/index.html';
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Auto refresh every 10 seconds
    setInterval(function() {
        loadDashboardData();
    }, 10000);
});

function loadDashboardData() {
    loadOrders();
    loadDailyRevenue();
}

function loadOrders() {
    console.log("=== loadOrders() called ===");
    StaffApiService.getRestaurantOrders()
        .done(function(response) {
            console.log("=== Orders API Response ===");
            console.log("Full response:", response);
            
            let orders = [];
            if (response && (response.success || response.isSuccess) && response.data) {
                orders = Array.isArray(response.data) ? response.data : [];
            }
            
            console.log("Total orders received:", orders.length);
            if (orders.length > 0) {
                console.log("Sample order:", orders[0]);
                console.log("Sample order status:", orders[0].status);
                console.log("All order statuses:", orders.map(o => o.status || 'null'));
            }
            
            // Group orders by status - normalize status to lowercase for comparison
            const newOrders = orders.filter(o => {
                const status = (o.status || '').toLowerCase().trim();
                return status === 'created' || status === 'new' || status === 'pending';
            });
            
            const processingOrders = orders.filter(o => {
                const status = (o.status || '').toLowerCase().trim();
                return status === 'processing' || status === 'preparing';
            });
            
            const readyOrders = orders.filter(o => {
                const status = (o.status || '').toLowerCase().trim();
                return status === 'ready' || status === 'prepared';
            });
            
            console.log("Filtered orders:");
            console.log("  - New orders (created/new/pending):", newOrders.length);
            console.log("  - Processing orders:", processingOrders.length);
            console.log("  - Ready orders:", readyOrders.length);
            
            // Update counts
            $('#new-orders-count').text(newOrders.length);
            $('#processing-orders-count').text(processingOrders.length);
            $('#ready-orders-count').text(readyOrders.length);
            $('#new-orders-badge').text(newOrders.length);
            $('#new-orders-badge-header').text(newOrders.length);
            $('#processing-orders-badge-header').text(processingOrders.length);
            $('#ready-orders-badge-header').text(readyOrders.length);
            
            // Render orders
            renderOrders(newOrders, 'new-orders-list', 'new');
            renderOrders(processingOrders, 'processing-orders-list', 'processing');
            renderOrders(readyOrders, 'ready-orders-list', 'ready');
        })
        .fail(function(xhr, status, error) {
            console.error("=== Error loading orders ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Status Code:", xhr.status);
            console.error("Response Text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            
            // Handle 403 errors silently (user doesn't have permission)
            if (xhr.status === 403) {
                console.warn("⚠️ Access denied - user does not have RESTAURANT_STAFF role");
                // Don't spam console with 403 errors
                return;
            }
            // Only log other errors
            console.error("Error loading orders:", error);
        });
}

function renderOrders(orders, containerId, statusClass) {
    const container = $(`#${containerId}`);
    
    if (orders.length === 0) {
        const emptyIcons = {
            'new': 'fa-bell',
            'processing': 'fa-spinner',
            'ready': 'fa-check-circle'
        };
        const icon = emptyIcons[statusClass] || 'fa-inbox';
        container.html(`
            <div class="text-center py-5">
                <i class="fas ${icon} fa-3x text-muted mb-3"></i>
                <p class="text-muted">Chưa có đơn hàng</p>
            </div>
        `);
        return;
    }
    
    let html = '';
    orders.forEach(function(order) {
        html += createOrderCard(order, statusClass);
    });
    
    container.html(html);
    
    // Add flash animation for new orders
    if (statusClass === 'new') {
        container.find('.order-card-staff').addClass('new-order-flash');
        setTimeout(function() {
            container.find('.order-card-staff').removeClass('new-order-flash');
        }, 3000);
    }
}

function createOrderCard(order, statusClass) {
    // Add icons to order card
    const orderId = order.id || 0;
    const customerName = order.users ? (order.users.fullName || order.users.userName || 'N/A') : 'N/A';
    const totalPrice = order.totalPrice || 0;
    const createDate = order.createDate || order.createdAt || '';
    const formattedTime = formatTime(createDate);
    
    // Get order items - Fix: OrderDTO uses 'items' field, not 'listOrderItems'
    let itemsHtml = '';
    const items = order.items || order.orderItems || order.listOrderItems || [];
    console.log("Order #" + orderId + " items:", items);
    console.log("Order #" + orderId + " items count:", items.length);
    
    if (items.length > 0) {
        items.forEach(function(item) {
            // Fix: OrderItemDTO uses 'foodTitle' field
            const foodName = item.foodTitle || 
                           item.food?.title || 
                           item.foodName || 
                           (item.food && item.food.name) ||
                           'N/A';
            const quantity = item.quantity || item.amount || 1;
            itemsHtml += `
                <div class="order-item">
                    <span class="item-name">${escapeHtml(foodName)}</span>
                    <span class="item-quantity">x${quantity}</span>
                </div>
            `;
        });
    } else {
        itemsHtml = '<div class="order-item"><span class="text-muted">Không có món</span></div>';
    }
    
    // Get user info for chat
    const userId = order.userId || (order.users ? order.users.id : null) || 0;
    const userName = order.userName || 
                    order.userFullName || 
                    (order.users ? (order.users.fullName || order.users.userName) : null) || 
                    'Khách hàng';
    
    // Action buttons based on status
    let actionsHtml = '';
    if (statusClass === 'new') {
        actionsHtml = `
            <button class="btn btn-staff btn-staff-primary" onclick="updateOrderStatus(${orderId}, 'processing')">
                <i class="fas fa-check"></i> Nhận đơn
            </button>
            <button class="btn btn-staff btn-staff-danger" onclick="updateOrderStatus(${orderId}, 'cancelled')">
                <i class="fas fa-times"></i> Hủy
            </button>
        `;
    } else if (statusClass === 'processing') {
        actionsHtml = `
            <button class="btn btn-staff btn-staff-success" onclick="updateOrderStatus(${orderId}, 'ready')">
                <i class="fas fa-check-circle"></i> Sẵn sàng
            </button>
        `;
    } else if (statusClass === 'ready') {
        actionsHtml = `
            <button class="btn btn-staff btn-staff-info mb-2" onclick="updateOrderStatus(${orderId}, 'completed')">
                <i class="fas fa-check-double"></i> Hoàn tất
            </button>
            <button class="btn btn-staff btn-staff-secondary" onclick="openChatWithUser(${orderId}, ${userId}, '${escapeHtml(userName)}')">
                <i class="fas fa-comments"></i> Liên hệ
            </button>
        `;
    }
    
    return `
        <div class="order-card-staff ${statusClass}" onclick="viewOrderDetail(${orderId})">
            <div class="order-header-staff">
                <div class="order-id-staff">
                    <i class="fas fa-hashtag mr-1"></i>#${orderId}
                </div>
                <div class="order-time">
                    <i class="fas fa-clock mr-1"></i>${formattedTime}
                </div>
            </div>
            <div class="order-items">
                ${itemsHtml}
            </div>
            <div class="order-total">
                <span class="total-label">
                    <i class="fas fa-money-bill-wave mr-1"></i>Tổng tiền:
                </span>
                <span class="total-value"><strong>${formatVND(totalPrice)}</strong></span>
            </div>
            <div class="order-actions-staff" onclick="event.stopPropagation();">
                ${actionsHtml}
            </div>
        </div>
    `;
}

function updateOrderStatus(orderId, status) {
    const statusText = {
        'processing': 'nhận đơn',
        'ready': 'sẵn sàng',
        'completed': 'hoàn tất',
        'cancelled': 'hủy'
    }[status] || status;
    
    if (!confirm(`Bạn có chắc chắn muốn ${statusText} đơn hàng #${orderId}?`)) {
        return;
    }
    
    StaffApiService.updateOrderStatus(orderId, status)
        .done(function(response) {
            console.log('Update order status response:', response);
            if (response && (response.success || response.isSuccess)) {
                showToast('success', `Cập nhật trạng thái thành công!`);
                loadDashboardData();
            } else {
                const errorMsg = response?.desc || response?.message || 'Cập nhật thất bại!';
                console.error('Update order status failed:', response);
                showToast('error', errorMsg);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Update order status error:', error);
            console.error('Status code:', xhr.status);
            console.error('Response:', xhr.responseText);
            console.error('Response JSON:', xhr.responseJSON);
            
            let errorMsg = 'Lỗi khi cập nhật trạng thái!';
            
            // Kiểm tra response từ server
            if (xhr.responseJSON) {
                errorMsg = xhr.responseJSON.desc || xhr.responseJSON.message || xhr.responseJSON.error || errorMsg;
            } else if (xhr.status === 403 || xhr.status === 401) {
                errorMsg = 'Bạn không có quyền cập nhật đơn hàng này. Đơn hàng có thể không thuộc về nhà hàng của bạn.';
            } else if (xhr.status === 404) {
                errorMsg = 'Không tìm thấy đơn hàng. Vui lòng làm mới trang và thử lại.';
            } else if (xhr.status === 400) {
                errorMsg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            } else if (xhr.status === 500) {
                errorMsg = 'Lỗi server. Vui lòng thử lại sau.';
            } else if (xhr.status === 0) {
                errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }
            
            showToast('error', errorMsg);
        });
}

function viewOrderDetail(orderId) {
    // Navigate to order detail page
    window.location.href = `order-detail.html?id=${orderId}`;
}

function openChatWithUser(orderId, userId, userName) {
    console.log('=== openChatWithUser ===');
    console.log('Order ID:', orderId);
    console.log('User ID:', userId);
    console.log('User Name:', userName);
    
    if (!userId || userId <= 0) {
        alert('Không thể lấy thông tin khách hàng!');
        return;
    }
    
    // Store order and user info for chat
    window.currentChatOrderId = orderId;
    window.currentChatUserId = userId;
    window.currentChatUserName = userName;
    
    // Open chat modal or redirect to chat page
    // For now, we'll open a simple chat interface
    const chatModal = `
        <div class="modal fade" id="chatModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-comments mr-2"></i>Chat với ${escapeHtml(userName)}
                        </h5>
                        <button type="button" class="close text-white" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" style="height: 400px; overflow-y: auto;" id="chatMessages">
                        <div class="text-center py-3">
                            <i class="fas fa-spinner fa-spin"></i> Đang tải tin nhắn...
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="input-group w-100">
                            <input type="text" class="form-control" id="chatMessageInput" placeholder="Nhập tin nhắn...">
                            <div class="input-group-append">
                                <button class="btn btn-primary" onclick="sendChatMessage()">
                                    <i class="fas fa-paper-plane"></i> Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    $('#chatModal').remove();
    
    // Add modal to body
    $('body').append(chatModal);
    
    // Show modal
    $('#chatModal').modal('show');
    
    // Load conversation
    loadChatConversation(userId);
    
    // Handle Enter key
    $('#chatMessageInput').on('keypress', function(e) {
        if (e.which === 13) {
            sendChatMessage();
        }
    });
}

function loadChatConversation(userId) {
    console.log('Loading chat conversation with user:', userId);
    
    $.ajax({
        method: 'GET',
        url: `http://localhost:82/message/${userId}`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    })
    .done(function(response) {
        console.log('Chat conversation response:', response);
        const messages = response && response.data ? (Array.isArray(response.data) ? response.data : []) : [];
        renderChatMessages(messages);
    })
    .fail(function(xhr) {
        console.error('Error loading chat conversation:', xhr);
        $('#chatMessages').html('<div class="alert alert-danger">Không thể tải tin nhắn!</div>');
    });
}

function renderChatMessages(messages) {
    const container = $('#chatMessages');
    if (messages.length === 0) {
        container.html('<div class="text-center py-3 text-muted">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>');
        return;
    }
    
    // Get current user ID from token
    const token = localStorage.getItem('token');
    let currentUserId = 0;
    if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.userId) {
            currentUserId = decoded.userId;
        } else if (decoded && decoded.sub) {
            // Try 'sub' field
            currentUserId = parseInt(decoded.sub) || 0;
        }
    }
    
    let html = '';
    messages.forEach(function(msg) {
        const isFromMe = msg.senderId === currentUserId;
        const senderName = msg.senderName || msg.senderUserName || 'N/A';
        const time = formatTime(msg.createDate);
        
        html += `
            <div class="mb-3 ${isFromMe ? 'text-right' : 'text-left'}">
                <div class="d-inline-block p-2 rounded ${isFromMe ? 'bg-primary text-white' : 'bg-light'}" style="max-width: 70%;">
                    <div class="small ${isFromMe ? 'text-white-50' : 'text-muted'}">${escapeHtml(senderName)}</div>
                    <div>${escapeHtml(msg.content || '')}</div>
                    <div class="small ${isFromMe ? 'text-white-50' : 'text-muted'} mt-1">${time}</div>
                </div>
            </div>
        `;
    });
    
    container.html(html);
    container.scrollTop(container[0].scrollHeight);
}

function sendChatMessage() {
    const input = $('#chatMessageInput');
    const content = input.val().trim();
    const userId = window.currentChatUserId;
    
    if (!content) {
        return;
    }
    
    if (!userId || userId <= 0) {
        alert('Không thể gửi tin nhắn!');
        return;
    }
    
    console.log('Sending message to user:', userId, 'Content:', content);
    
    // Disable input
    input.prop('disabled', true);
    
    $.ajax({
        method: 'POST',
        url: 'http://localhost:82/message',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            receiverId: userId,
            content: content
        }),
        dataType: 'json'
    })
    .done(function(response) {
        console.log('Message sent successfully:', response);
        input.val('').prop('disabled', false);
        // Reload conversation
        loadChatConversation(userId);
    })
    .fail(function(xhr) {
        console.error('Error sending message:', xhr);
        alert('Không thể gửi tin nhắn!');
        input.prop('disabled', false);
    });
}

function loadDailyRevenue() {
    StaffApiService.getDailyRevenue()
        .done(function(response) {
            if (response && (response.success || response.isSuccess) && response.data) {
                const revenue = response.data.revenue || response.data.total || 0;
                $('#today-revenue').text(formatVND(revenue));
            }
        })
        .fail(function(xhr, status, error) {
            // Handle 403 errors silently (user doesn't have permission)
            if (xhr.status === 403) {
                console.warn("⚠️ Access denied - user does not have RESTAURANT_STAFF role");
                // Don't spam console with 403 errors
                return;
            }
            // Only log other errors
            console.error("Error loading revenue:", error);
        });
}

function staffLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
}

function formatTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function formatVND(amount) {
    if (amount == null || amount === undefined) return '0 ₫';
    return parseFloat(amount).toLocaleString('vi-VN') + ' ₫';
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function showToast(type, message) {
    const toast = $(`
        <div class="alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show" 
             style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(function() {
        toast.alert('close');
    }, 3000);
}

function isAuthenticated() {
    const token = localStorage.getItem('token');
    return token && token.length > 0;
}

