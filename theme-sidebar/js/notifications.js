/*
 * Notifications Page - Quản lý thông báo
 */

$(document).ready(function() {
    // Lấy userId từ token
    const userId = getUserIdFromToken();
    if (!userId) {
        alert('Vui lòng đăng nhập để xem thông báo!');
        window.location.href = './signin.html';
        return;
    }

    // Load notifications
    loadNotifications(userId);
    
    // Setup event handlers
    setupEventHandlers(userId);
    
    // Auto refresh notifications every 30 seconds
    setInterval(function() {
        loadNotifications(userId);
    }, 30000);
});

function getUserIdFromToken() {
    const token = getToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (decoded && decoded.sub) {
        // JWT subject thường là userId hoặc username
        // Nếu sub là username, cần lấy userId từ API
        return decoded.userId || decoded.id || null;
    }
    return null;
}

function loadNotifications(userId) {
    ApiService.getNotifications(userId)
        .done(function(response) {
            console.log("Notifications response:", response);
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                renderNotifications(response.data);
                updateUnreadCount(userId);
            } else {
                console.warn("Notifications response:", response);
                showNoNotificationsMessage();
            }
        })
        .fail(function(xhr) {
            console.error('Error loading notifications:', xhr);
            showNoNotificationsMessage();
        });
}

function updateUnreadCount(userId) {
    ApiService.getUnreadCount(userId)
        .done(function(response) {
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success) && response.data && response.data.count !== undefined) {
                const count = response.data.count;
                // Update badge in navbar
                $('.notification-badge').text(count > 0 ? count : '');
                $('.notification-badge').toggle(count > 0);
            }
        })
        .fail(function(xhr) {
            console.error('Error getting unread count:', xhr);
        });
}

function renderNotifications(notifications) {
    const container = $('#notifications-container');
    
    if (container.length === 0) {
        console.error("Notifications container not found");
        return;
    }
    
    if (!notifications || notifications.length === 0) {
        showNoNotificationsMessage();
        return;
    }
    
    let html = '';
    notifications.forEach(function(notification) {
        const date = notification.createDate 
            ? new Date(notification.createDate).toLocaleString('vi-VN') 
            : 'N/A';
        
        const readClass = notification.isRead ? '' : 'bg-light font-weight-bold';
        const readIcon = notification.isRead ? '' : '<i class="mdi mdi-circle text-primary small"></i>';
        
        html += `
            <div class="card mb-2 ${readClass} notification-item" data-id="${notification.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            ${readIcon}
                            <h6 class="card-title mb-1">${escapeHtml(notification.title || 'Thông báo')}</h6>
                            <p class="card-text mb-1">${escapeHtml(notification.content || '')}</p>
                            <small class="text-muted">${date}</small>
                            ${notification.type ? `<span class="badge badge-secondary ml-2">${notification.type}</span>` : ''}
                        </div>
                        <div class="ml-2">
                            ${!notification.isRead ? `
                                <button class="btn btn-sm btn-outline-primary mark-read-btn" data-id="${notification.id}">
                                    <i class="mdi mdi-check"></i> Đã đọc
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-danger delete-notification-btn" data-id="${notification.id}">
                                <i class="mdi mdi-delete"></i>
                            </button>
                        </div>
                    </div>
                    ${notification.link ? `
                        <a href="${notification.link}" class="btn btn-sm btn-link mt-2">
                            Xem chi tiết <i class="mdi mdi-arrow-right"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.html(html);
}

function showNoNotificationsMessage() {
    const container = $('#notifications-container');
    if (container.length > 0) {
        container.html(`
            <div class="alert alert-info text-center py-5">
                <i class="mdi mdi-bell-off-outline mb-3" style="font-size: 48px;"></i>
                <h5>Chưa có thông báo nào</h5>
                <p class="text-muted">Bạn sẽ nhận được thông báo khi có đơn hàng mới hoặc cập nhật.</p>
            </div>
        `);
    }
}

function setupEventHandlers(userId) {
    // Mark as read
    $(document).on('click', '.mark-read-btn', function() {
        const notificationId = $(this).data('id');
        markAsRead(notificationId, userId);
    });
    
    // Delete notification
    $(document).on('click', '.delete-notification-btn', function() {
        const notificationId = $(this).data('id');
        if (confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) {
            deleteNotification(notificationId, userId);
        }
    });
    
    // Mark all as read
    $('#mark-all-read-btn').on('click', function() {
        markAllAsRead(userId);
    });
}

function markAsRead(notificationId, userId) {
    ApiService.markNotificationAsRead(notificationId, userId)
        .done(function(response) {
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success)) {
                // Reload notifications
                loadNotifications(userId);
            } else {
                alert('Đánh dấu đã đọc thất bại!');
            }
        })
        .fail(function(xhr) {
            console.error('Error marking notification as read:', xhr);
            alert('Có lỗi xảy ra khi đánh dấu đã đọc!');
        });
}

function markAllAsRead(userId) {
    ApiService.markAllNotificationsAsRead(userId)
        .done(function(response) {
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success)) {
                alert('Đã đánh dấu tất cả thông báo là đã đọc!');
                loadNotifications(userId);
            } else {
                alert('Đánh dấu tất cả đã đọc thất bại!');
            }
        })
        .fail(function(xhr) {
            console.error('Error marking all as read:', xhr);
            alert('Có lỗi xảy ra khi đánh dấu tất cả đã đọc!');
        });
}

function deleteNotification(notificationId, userId) {
    ApiService.deleteNotification(notificationId, userId)
        .done(function(response) {
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success)) {
                loadNotifications(userId);
            } else {
                alert('Xóa thông báo thất bại!');
            }
        })
        .fail(function(xhr) {
            console.error('Error deleting notification:', xhr);
            alert('Có lỗi xảy ra khi xóa thông báo!');
        });
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
    return text.replace(/[&<>"']/g, m => map[m]);
}

