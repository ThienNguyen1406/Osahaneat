/*
 * Shipper App - JavaScript
 * Quản lý đơn hàng giao hàng
 */

console.log("=== SHIPPER.JS LOADED ===");

const ShipperApiService = {
    API_BASE_URL: 'http://localhost:82',
    
    getHeaders: function() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    },
    
    // Lấy danh sách đơn hàng có sẵn để nhận
    getAvailableOrders: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/driver/orders/available`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy danh sách đơn hàng đang giao
    getActiveOrders: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/driver/orders/active`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Chấp nhận đơn hàng
    acceptOrder: function(orderId) {
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/driver/orders/${orderId}/accept`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: function(orderId, status) {
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/driver/orders/${orderId}/status`,
            headers: this.getHeaders(),
            data: JSON.stringify({ status: status }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Lấy lịch sử giao hàng
    getDeliveryHistory: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/driver/orders/history`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy thống kê
    getStatistics: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/driver/statistics`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    }
};

// Logout function
function shipperLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html'; // Redirect to shipper login page
    }
}

$(document).ready(function() {
    console.log("=== Shipper Dashboard Ready ===");
    
    // Check authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập!');
        window.location.href = 'login.html'; // Redirect to shipper login page
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup event handlers
    $('#toggle-status-btn').on('click', toggleStatus);
    
    // Auto refresh every 30 seconds
    setInterval(function() {
        loadDashboardData();
    }, 30000);
});

function loadDashboardData() {
    loadStatistics();
    loadAvailableOrders();
    loadActiveOrders();
}

function loadStatistics() {
    ShipperApiService.getStatistics()
        .done(function(response) {
            if (response && (response.success || response.isSuccess) && response.data) {
                const stats = response.data;
                $('#today-orders').text(stats.todayOrders || 0);
                $('#active-orders').text(stats.activeOrders || 0);
                $('#today-earnings').text(formatVND(stats.todayEarnings || 0));
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading statistics:", error);
        });
}

function loadAvailableOrders() {
    ShipperApiService.getAvailableOrders()
        .done(function(response) {
            let orders = [];
            if (response && (response.success || response.isSuccess) && response.data) {
                orders = Array.isArray(response.data) ? response.data : [];
            }
            renderAvailableOrders(orders);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading available orders:", error);
            $('#available-orders-list').html(`
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <p class="text-muted">Không thể tải đơn hàng</p>
                    <button class="btn btn-primary mt-2" onclick="loadAvailableOrders()">
                        <i class="fas fa-sync-alt mr-2"></i>Thử lại
                    </button>
                </div>
            `);
        });
}

function loadActiveOrders() {
    ShipperApiService.getActiveOrders()
        .done(function(response) {
            let orders = [];
            if (response && (response.success || response.isSuccess) && response.data) {
                orders = Array.isArray(response.data) ? response.data : [];
            }
            renderActiveOrders(orders);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading active orders:", error);
        });
}

function renderAvailableOrders(orders) {
    const container = $('#available-orders-list');
    
    if (orders.length === 0) {
        container.html(`
            <div class="text-center py-5">
                <i class="fas fa-bell fa-3x text-muted mb-3"></i>
                <p class="text-muted">Hiện tại không có đơn hàng nào</p>
            </div>
        `);
        return;
    }
    
    let html = '';
    orders.forEach(function(order) {
        html += createOrderCard(order, 'available');
    });
    
    container.html(html);
}

function renderActiveOrders(orders) {
    const container = $('#active-orders-list');
    
    if (orders.length === 0) {
        container.html(`
            <div class="text-center py-5">
                <i class="fas fa-shipping-fast fa-3x text-muted mb-3"></i>
                <p class="text-muted">Chưa có đơn hàng đang giao</p>
            </div>
        `);
        return;
    }
    
    let html = '';
    orders.forEach(function(order) {
        html += createOrderCard(order, 'active');
    });
    
    container.html(html);
}

function createOrderCard(order, type) {
    const orderId = order.id || 0;
    const restaurantName = order.restaurantTitle || (order.restaurant ? (order.restaurant.title || 'N/A') : 'N/A');
    const customerName = order.userFullName || order.userName || 'N/A';
    const customerPhone = order.userPhoneNumber || 'N/A';
    const address = order.deliveryAddress || order.address || 'N/A';
    const totalPrice = order.totalPrice || 0;
    const deliveryFee = order.deliveryFee || 0;
    const status = order.status || 'new';
    const createDate = order.createDate || order.createdAt || '';
    
    const statusClass = type === 'active' ? 'delivering' : 'new';
    const statusText = type === 'active' ? 'Đang giao' : 'Mới';
    
    let actionsHtml = '';
    if (type === 'available') {
        actionsHtml = `
            <button class="btn btn-shipper btn-shipper-primary btn-block" onclick="acceptOrder(${orderId})">
                <i class="fas fa-hand-paper mr-2"></i>Nhận đơn
            </button>
        `;
    } else {
        actionsHtml = `
            <button class="btn btn-shipper btn-shipper-warning btn-block mb-2" onclick="updateOrderStatus(${orderId}, 'picked_up')">
                <i class="fas fa-box mr-2"></i>Đã lấy hàng
            </button>
            <button class="btn btn-shipper btn-shipper-success btn-block" onclick="updateOrderStatus(${orderId}, 'delivered')">
                <i class="fas fa-check-circle mr-2"></i>Đã giao
            </button>
        `;
    }
    
    return `
        <div class="order-card ${type === 'active' ? 'active' : ''}">
            <div class="order-header">
                <div class="order-id">
                    <i class="fas fa-hashtag mr-1"></i>#${orderId}
                </div>
                <span class="order-status ${statusClass}">
                    <i class="fas fa-${type === 'active' ? 'shipping-fast' : 'bell'} mr-1"></i>${statusText}
                </span>
            </div>
            <div class="order-info">
                <div class="info-item">
                    <i class="fas fa-store text-primary"></i>
                    <span class="info-label">Nhà hàng:</span>
                    <span class="info-value">${escapeHtml(restaurantName)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-user text-info"></i>
                    <span class="info-label">Khách hàng:</span>
                    <span class="info-value">${escapeHtml(customerName)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone text-success"></i>
                    <span class="info-label">SĐT:</span>
                    <span class="info-value">${escapeHtml(customerPhone)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt text-danger"></i>
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">${escapeHtml(address)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-money-bill-wave text-warning"></i>
                    <span class="info-label">Tổng tiền:</span>
                    <span class="info-value font-weight-bold">${formatVND(totalPrice)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-truck text-secondary"></i>
                    <span class="info-label">Phí ship:</span>
                    <span class="info-value">${formatVND(deliveryFee)}</span>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-shipper btn-shipper-info btn-block mb-2" 
                        onclick="showOrderMap(${orderId}, ${order.userLat || 10.8231}, ${order.userLng || 106.6297}, '${escapeHtml(address)}')">
                    <i class="fas fa-map-marked-alt mr-2"></i>Xem bản đồ
                </button>
                ${actionsHtml}
            </div>
        </div>
    `;
}

function acceptOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn nhận đơn hàng này?')) {
        return;
    }
    
    ShipperApiService.acceptOrder(orderId)
        .done(function(response) {
            if (response && (response.success || response.isSuccess)) {
                showToast('success', 'Nhận đơn hàng thành công!');
                loadDashboardData();
            } else {
                showToast('error', response?.desc || 'Nhận đơn hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error accepting order:", error);
            showToast('error', 'Lỗi khi nhận đơn hàng!');
        });
}

function updateOrderStatus(orderId, status) {
    const statusText = status === 'picked_up' ? 'đã lấy hàng' : 'đã giao';
    
    if (!confirm(`Bạn có chắc chắn đã ${statusText}?`)) {
        return;
    }
    
    ShipperApiService.updateOrderStatus(orderId, status)
        .done(function(response) {
            if (response && (response.success || response.isSuccess)) {
                showToast('success', `Cập nhật trạng thái thành công!`);
                loadDashboardData();
            } else {
                showToast('error', response?.desc || 'Cập nhật thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error updating order status:", error);
            showToast('error', 'Lỗi khi cập nhật trạng thái!');
        });
}

function toggleStatus() {
    const btn = $('#toggle-status-btn');
    const isActive = btn.text().includes('Tạm dừng');
    
    if (isActive) {
        btn.html('<i class="fas fa-play"></i> Tiếp tục').removeClass('btn-warning').addClass('btn-success');
    } else {
        btn.html('<i class="fas fa-power-off"></i> Tạm dừng').removeClass('btn-success').addClass('btn-warning');
    }
}

function shipperLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html'; // Redirect to shipper login page
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

// Vietmap integration
const VIETMAP_API_KEY = 'aa2f6b8b5aa074db4aeedae1c422d41bd6a6dd9af87dc54c';
const VIETMAP_TILE_URL = `https://maps.vietmap.vn/api/tm/{z}/{x}/{y}@2x.png?apikey=${VIETMAP_API_KEY}`;
let shipperMapInstance = null;

function showOrderMap(orderId, userLat, userLng, userAddress) {
    console.log("=== showOrderMap() called from shipper.js ===");
    console.log("Order ID:", orderId);
    console.log("User Lat:", userLat);
    console.log("User Lng:", userLng);
    console.log("User Address:", userAddress);
    
    // Validate coordinates
    if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
        console.warn("⚠️ Invalid coordinates, using default (Ho Chi Minh City)");
        userLat = 10.8231;
        userLng = 106.6297;
    }
    
    // Set modal content
    $('#map-order-id').text(orderId);
    $('#map-user-address').text(userAddress || `${userLat}, ${userLng}`);
    $('#map-shipper-address').text('Đang lấy vị trí...');
    
    // Show modal
    $('#mapModal').modal('show');
    
    // Initialize map after modal is shown (remove previous handlers to avoid duplicates)
    $('#mapModal').off('shown.bs.modal').on('shown.bs.modal', function() {
        setTimeout(function() {
            // Use initShipperVietmap from vietmap.js if available, otherwise use initShipperMap
            if (typeof initShipperVietmap === 'function') {
                console.log("✅ Using initShipperVietmap from vietmap.js");
                initShipperVietmap({
                    userLat: userLat,
                    userLng: userLng,
                    userAddress: userAddress,
                    orderId: orderId,
                    containerId: 'vietmap-container'
                });
            } else if (typeof initShipperMap === 'function') {
                console.log("✅ Using initShipperMap from shipper.js");
                initShipperMap(userLat, userLng, userAddress);
            } else {
                console.error("❌ Neither initShipperVietmap nor initShipperMap found!");
                alert('Lỗi: Không thể tải bản đồ. Vui lòng reload trang.');
                $('#map-shipper-address').text('Lỗi: Không thể tải bản đồ');
            }
        }, 300);
    });
}

function initShipperMap(userLat, userLng, userAddress) {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet.js is not loaded!');
        alert('Đang tải bản đồ... Vui lòng thử lại.');
        return;
    }
    
    // Destroy existing map
    if (shipperMapInstance) {
        shipperMapInstance.remove();
        shipperMapInstance = null;
    }
    
    const container = document.getElementById('vietmap-container');
    if (!container) {
        console.error('Map container not found');
        return;
    }
    
    // Initialize map
    shipperMapInstance = L.map('vietmap-container', {
        center: [userLat, userLng],
        zoom: 15,
        zoomControl: true
    });
    
    // Add Vietmap tile layer
    L.tileLayer(VIETMAP_TILE_URL, {
        attribution: '© VietMap',
        maxZoom: 18,
        minZoom: 3
    }).addTo(shipperMapInstance);
    
    // Create user marker (green)
    const userIcon = L.divIcon({
        className: 'vietmap-marker-user',
        html: '<div style="background-color: #4CAF50; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-map-marker-alt" style="color: white; font-size: 16px;"></i></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    
    const userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(shipperMapInstance)
        .bindPopup(`<b>📍 Vị trí khách hàng</b><br>${userAddress || `${userLat}, ${userLng}`}`);
    
    const markers = [userMarker];
    
    // Try to get current location (shipper location)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const shipperLat = position.coords.latitude;
                const shipperLng = position.coords.longitude;
                
                // Create shipper marker (red)
                const shipperIcon = L.divIcon({
                    className: 'vietmap-marker-shipper',
                    html: '<div style="background-color: #FF5722; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-motorcycle" style="color: white; font-size: 16px;"></i></div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });
                
                const shipperMarker = L.marker([shipperLat, shipperLng], { icon: shipperIcon })
                    .addTo(shipperMapInstance)
                    .bindPopup(`<b>🚚 Vị trí của bạn</b><br>${shipperLat.toFixed(6)}, ${shipperLng.toFixed(6)}`);
                
                markers.push(shipperMarker);
                
                // Draw route line
                const polyline = L.polyline([
                    [userLat, userLng],
                    [shipperLat, shipperLng]
                ], {
                    color: '#2196F3',
                    weight: 4,
                    opacity: 0.7,
                    dashArray: '10, 10'
                }).addTo(shipperMapInstance);
                
                // Fit bounds to show both markers
                const group = new L.featureGroup(markers);
                shipperMapInstance.fitBounds(group.getBounds().pad(0.1));
                
                $('#map-shipper-address').text(`${shipperLat.toFixed(6)}, ${shipperLng.toFixed(6)}`);
            },
            function(error) {
                console.warn('Error getting location:', error);
                $('#map-shipper-address').text('Không thể lấy vị trí (cho phép truy cập vị trí trong trình duyệt)');
                shipperMapInstance.setView([userLat, userLng], 15);
            }
        );
    } else {
        $('#map-shipper-address').text('Trình duyệt không hỗ trợ Geolocation');
        shipperMapInstance.setView([userLat, userLng], 15);
    }
}

// Destroy map when modal is hidden
$(document).ready(function() {
    $('#mapModal').on('hidden.bs.modal', function() {
        if (shipperMapInstance) {
            shipperMapInstance.remove();
            shipperMapInstance = null;
        }
    });
});

function showToast(type, message) {
    // Simple toast notification
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

