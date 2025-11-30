/*
 * Restaurant Owner Portal - JavaScript
 * Quản lý cửa hàng và thống kê
 */

console.log("=== OWNER.JS LOADED ===");

const OwnerApiService = {
    API_BASE_URL: 'http://localhost:82',
    
    getHeaders: function() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    },
    
    // Lấy danh sách cửa hàng của owner
    getMyRestaurants: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/my-restaurants`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy thống kê tổng quan
    getDashboardStats: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/dashboard/stats`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy doanh thu theo ngày
    getDailyRevenue: function(days = 7) {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/revenue/daily?days=${days}`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy thống kê đơn hàng theo trạng thái
    getOrdersByStatus: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/orders/status`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Cập nhật cửa hàng (không có file)
    updateRestaurant: function(restaurantId, data) {
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}`,
            headers: this.getHeaders(),
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Cập nhật cửa hàng (với file upload)
    updateRestaurantWithFile: function(restaurantId, formData) {
        const token = localStorage.getItem('token');
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}`,
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },
    
    // Lấy menu của cửa hàng
    getRestaurantMenu: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/menu`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy đơn hàng của cửa hàng
    getRestaurantOrders: function(restaurantId, page = 0, size = 20) {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/orders?page=${page}&size=${size}`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy tất cả nhân viên của owner (tất cả cửa hàng)
    getAllStaff: function() {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/all-staff`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Lấy nhân viên của cửa hàng
    getRestaurantStaff: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/staff`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Cập nhật trạng thái nhân viên
    updateStaffStatus: function(restaurantId, userId, status) {
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/staff/${userId}/status`,
            headers: this.getHeaders(),
            data: JSON.stringify({ status: status }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Thêm nhân viên vào cửa hàng
    addStaffToRestaurant: function(restaurantId, userId) {
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/staff`,
            headers: this.getHeaders(),
            data: JSON.stringify({ userId: userId }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Xóa nhân viên khỏi cửa hàng
    removeStaffFromRestaurant: function(restaurantId, userId) {
        return $.ajax({
            method: 'DELETE',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/staff/${userId}`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Tạo cửa hàng mới (với file upload)
    createRestaurantWithFile: function(formData) {
        const token = localStorage.getItem('token');
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/restaurant/owner`,
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
                // Don't set Content-Type for FormData, let browser set it with boundary
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },
    
    // Tạo cửa hàng mới (JSON - không có file)
    createRestaurant: function(data) {
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/restaurant/owner`,
            headers: this.getHeaders(),
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Tạo món ăn cho cửa hàng
    createMenu: function(restaurantId, formData) {
        const token = localStorage.getItem('token');
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/menu`,
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },
    
    // Tạo tài khoản nhân viên cho cửa hàng
    createStaffAccount: function(restaurantId, data) {
        console.log("=== OwnerApiService.createStaffAccount() called ===");
        console.log("Restaurant ID:", restaurantId);
        console.log("Data:", data);
        console.log("URL:", `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/staff/create`);
        console.log("Headers:", this.getHeaders());
        
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/staff/create`,
            headers: this.getHeaders(),
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            timeout: 30000
        });
    },
    
    // ==================== Promo/Voucher Management APIs ====================
    // Lấy danh sách khuyến mãi của cửa hàng
    getRestaurantPromos: function(restaurantId) {
        return $.ajax({
            method: 'GET',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/promos`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Tạo khuyến mãi mới
    createPromo: function(restaurantId, data) {
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/promos`,
            headers: this.getHeaders(),
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Xóa khuyến mãi
    deletePromo: function(restaurantId, promoId) {
        return $.ajax({
            method: 'DELETE',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/promos/${promoId}`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Kiểm tra và áp dụng voucher (cho user)
    applyVoucher: function(voucherCode, restaurantId) {
        return $.ajax({
            method: 'POST',
            url: `${this.API_BASE_URL}/voucher/apply`,
            headers: this.getHeaders(),
            data: JSON.stringify({
                code: voucherCode,
                restaurantId: restaurantId
            }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Xóa cửa hàng
    deleteRestaurant: function(restaurantId) {
        return $.ajax({
            method: 'DELETE',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    },
    
    // Cập nhật món ăn
    updateMenu: function(restaurantId, menuId, formData) {
        const token = localStorage.getItem('token');
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/menu/${menuId}`,
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json'
        });
    },
    
    // Bật/tắt món ăn (ẩn/hiện)
    toggleMenu: function(restaurantId, menuId, isAvailable) {
        return $.ajax({
            method: 'PUT',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/menu/${menuId}/toggle`,
            headers: this.getHeaders(),
            data: JSON.stringify({ isAvailable: isAvailable }),
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    
    // Xóa món ăn
    deleteMenu: function(restaurantId, menuId) {
        return $.ajax({
            method: 'DELETE',
            url: `${this.API_BASE_URL}/restaurant/owner/${restaurantId}/menu/${menuId}`,
            headers: this.getHeaders(),
            dataType: 'json'
        });
    }
};

// Helper function to show toast notifications
function showToast(type, message) {
    // Simple alert for now, can be replaced with toast library
    if (type === 'success') {
        // You can use a toast library here
        console.log('Success:', message);
    } else {
        console.error('Error:', message);
    }
}

let revenueChart = null;
let ordersChart = null;

$(document).ready(function() {
    console.log("=== Owner Dashboard Ready ===");
    
    // Check authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập!');
        window.location.href = '../admin/login.html';
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
});

function loadDashboardData() {
    loadDashboardStats();
    loadMyRestaurants();
    loadRevenueChart();
    loadOrdersChart();
}

function loadDashboardStats() {
    OwnerApiService.getDashboardStats()
        .done(function(response) {
            if (response && (response.success || response.isSuccess) && response.data) {
                const stats = response.data;
                $('#today-revenue').text(formatVND(stats.todayRevenue || 0));
                $('#month-revenue').text(formatVND(stats.monthRevenue || 0));
                $('#today-orders').text(stats.todayOrders || 0);
                $('#total-restaurants').text(stats.totalRestaurants || 0);
                
                // Calculate changes
                const todayChange = stats.todayRevenueChange || 0;
                const monthChange = stats.monthRevenueChange || 0;
                const ordersChange = stats.todayOrdersChange || 0;
                
                $('#today-revenue-change').text(formatChange(todayChange));
                $('#month-revenue-change').text(formatChange(monthChange));
                $('#today-orders-change').text(formatChange(ordersChange, false));
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading dashboard stats:", error);
        });
}

function loadMyRestaurants() {
    OwnerApiService.getMyRestaurants()
        .done(function(response) {
            let restaurants = [];
            if (response && (response.success || response.isSuccess) && response.data) {
                restaurants = Array.isArray(response.data) ? response.data : [];
            }
            renderRestaurants(restaurants);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading restaurants:", error);
            $('#restaurants-list').html(`
                <div class="empty-state-owner">
                    <i class="fas fa-exclamation-triangle fa-4x mb-3 text-warning"></i>
                    <p class="mb-3">Không thể tải danh sách cửa hàng</p>
                    <button class="btn btn-owner btn-owner-primary" onclick="loadMyRestaurants()">
                        <i class="fas fa-sync-alt mr-2"></i>Thử lại
                    </button>
                </div>
            `);
        });
}

function renderRestaurants(restaurants) {
    const container = $('#restaurants-list');
    
    if (restaurants.length === 0) {
        container.html(`
            <div class="empty-state-owner">
                <i class="fas fa-store fa-4x mb-3"></i>
                <p class="mb-3">Bạn chưa có cửa hàng nào</p>
                <a href="restaurants.html" class="btn btn-owner btn-owner-primary">
                    <i class="fas fa-plus mr-2"></i>Thêm cửa hàng đầu tiên
                </a>
            </div>
        `);
        return;
    }
    
    let html = '';
    restaurants.forEach(function(restaurant) {
        html += createRestaurantCard(restaurant);
    });
    
    container.html(html);
}

function createRestaurantCard(restaurant) {
    const restaurantId = restaurant.id || 0;
    const name = restaurant.title || 'N/A';
    const address = restaurant.address || 'N/A';
    const isApproved = restaurant.isApproved;
    // Xử lý isActive: nếu null/undefined thì mặc định là true (đã được duyệt thì mặc định active)
    const isActive = restaurant.isActive === null || restaurant.isActive === undefined ? true : restaurant.isActive;
    const todayOrders = restaurant.todayOrders || 0;
    const todayRevenue = restaurant.todayRevenue || 0;
    const totalOrders = restaurant.totalOrders || 0;
    
    // Debug log để kiểm tra giá trị
    console.log(`Restaurant ${restaurantId} (${name}): isApproved=${isApproved}, isActive=${isActive}, restaurant.isActive=${restaurant.isActive}`);
    
    // Xác định trạng thái dựa trên isApproved và isActive
    let statusText = '';
    let statusClass = '';
    let statusIcon = '';
    
    if (isApproved === null || isApproved === undefined) {
        // Chưa được duyệt (pending)
        statusText = 'Đang chờ duyệt';
        statusClass = 'pending';
        statusIcon = 'fa-clock';
    } else if (isApproved === false) {
        // Bị hủy (rejected)
        statusText = 'Bị hủy';
        statusClass = 'rejected';
        statusIcon = 'fa-times-circle';
    } else if (isApproved === true && isActive === true) {
        // Được duyệt và đang hoạt động
        statusText = 'Đang hoạt động';
        statusClass = 'active';
        statusIcon = 'fa-check-circle';
    } else if (isApproved === true && isActive === false) {
        // Được duyệt nhưng tạm dừng
        statusText = 'Tạm dừng';
        statusClass = 'inactive';
        statusIcon = 'fa-pause-circle';
    } else {
        // Fallback - nếu isApproved = true nhưng isActive không rõ, coi như đang hoạt động
        statusText = 'Đang hoạt động';
        statusClass = 'active';
        statusIcon = 'fa-check-circle';
    }
    
    const imageUrl = restaurant.image 
        ? (restaurant.image.startsWith('http') ? restaurant.image : `http://localhost:82${restaurant.image}`)
        : '../admin/img/1.jpg';
    
    return `
        <div class="restaurant-card-owner">
            <div class="restaurant-header-owner">
                <div class="restaurant-name">
                    <i class="fas fa-store mr-2"></i>${escapeHtml(name)}
                </div>
                <span class="restaurant-status ${statusClass}">
                    <i class="fas ${statusIcon} mr-1"></i>
                    ${statusText}
                </span>
            </div>
            <div class="restaurant-info-owner">
                <div class="info-item-owner">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="info-label-owner">Địa chỉ:</span>
                    <span class="info-value-owner">${escapeHtml(address)}</span>
                </div>
                <div class="info-item-owner">
                    <i class="fas fa-hashtag"></i>
                    <span class="info-label-owner">ID:</span>
                    <span class="info-value-owner">#${restaurantId}</span>
                </div>
            </div>
            <div class="restaurant-stats">
                <div class="stat-item">
                    <i class="fas fa-shopping-bag text-primary fa-2x"></i>
                    <div class="stat-value">${todayOrders}</div>
                    <div class="stat-label">
                        <i class="fas fa-calendar-day mr-1"></i>Đơn hôm nay
                    </div>
                </div>
                <div class="stat-item">
                    <i class="fas fa-money-bill-wave text-success fa-2x"></i>
                    <div class="stat-value">${formatVND(todayRevenue)}</div>
                    <div class="stat-label">
                        <i class="fas fa-wallet mr-1"></i>Doanh thu hôm nay
                    </div>
                </div>
                <div class="stat-item">
                    <i class="fas fa-list-alt text-info fa-2x"></i>
                    <div class="stat-value">${totalOrders}</div>
                    <div class="stat-label">
                        <i class="fas fa-clipboard-list mr-1"></i>Tổng đơn hàng
                    </div>
                </div>
            </div>
            <div class="restaurant-actions-owner">
                <a href="restaurants.html?id=${restaurantId}" class="btn btn-owner btn-owner-primary">
                    <i class="fas fa-eye mr-1"></i>Xem chi tiết
                </a>
                <a href="restaurants.html?edit=${restaurantId}" class="btn btn-owner btn-owner-outline">
                    <i class="fas fa-edit mr-1"></i>Chỉnh sửa
                </a>
            </div>
        </div>
    `;
}

function loadRevenueChart() {
    OwnerApiService.getDailyRevenue(7)
        .done(function(response) {
            let data = [];
            let labels = [];
            
            if (response && (response.success || response.isSuccess) && response.data) {
                const revenueData = response.data;
                
                // Sort by date
                const sortedData = Object.keys(revenueData).sort().map(key => ({
                    date: key,
                    revenue: revenueData[key]
                }));
                
                labels = sortedData.map(item => formatDateShort(item.date));
                data = sortedData.map(item => item.revenue || 0);
            }
            
            renderRevenueChart(labels, data);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading revenue chart:", error);
            renderRevenueChart([], []);
        });
}

function loadOrdersChart() {
    OwnerApiService.getOrdersByStatus()
        .done(function(response) {
            let statusData = {};
            
            if (response && (response.success || response.isSuccess) && response.data) {
                statusData = response.data;
            }
            
            renderOrdersChart(statusData);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading orders chart:", error);
            renderOrdersChart({});
        });
}

function renderRevenueChart(labels, data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Chưa có dữ liệu'],
            datasets: [{
                label: 'Doanh thu (₫)',
                data: data.length > 0 ? data : [0],
                borderColor: '#3949AB',
                backgroundColor: 'rgba(57, 73, 171, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return value.toLocaleString('vi-VN') + ' ₫';
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        return 'Doanh thu: ' + tooltipItem.yLabel.toLocaleString('vi-VN') + ' ₫';
                    }
                }
            }
        }
    });
}

function renderOrdersChart(statusData) {
    const ctx = document.getElementById('ordersChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (ordersChart) {
        ordersChart.destroy();
    }
    
    const labels = Object.keys(statusData);
    const data = Object.values(statusData);
    const colors = ['#3949AB', '#5C6BC0', '#7986CB', '#C5CAE9', '#9FA8DA'];
    
    ordersChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length > 0 ? labels : ['Chưa có dữ liệu'],
            datasets: [{
                data: data.length > 0 ? data : [0],
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const label = data.labels[tooltipItem.index];
                        const value = data.datasets[0].data[tooltipItem.index];
                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return label + ': ' + value + ' (' + percentage + '%)';
                    }
                }
            }
        }
    });
}

function formatChange(value, isPercentage = true) {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    if (isPercentage) {
        return sign + value.toFixed(1) + '%';
    } else {
        return sign + value;
    }
}

function formatDateShort(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
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

function ownerLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
}

function isAuthenticated() {
    const token = localStorage.getItem('token');
    return token && token.length > 0;
}

