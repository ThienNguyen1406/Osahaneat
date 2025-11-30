/*
 * Admin Notifications Page - Quản lý thông báo
 */

$(document).ready(function() {
    // Load notifications list
    loadNotifications();
    
    // Setup event handlers
    setupEventHandlers();
});

function loadNotifications() {
    AdminApiService.getAllNotifications()
        .done(function(response) {
            console.log("Notifications response:", response);
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                renderNotificationsTable(response.data);
            } else {
                console.warn("Notifications response:", response);
                showNoNotificationsMessage();
            }
        })
        .fail(function(xhr) {
            console.error('Error loading notifications:', xhr);
            if (xhr.status === 403) {
                alert('Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin.');
                removeToken();
                window.location.href = 'login.html';
            } else {
                showNoNotificationsMessage();
            }
        });
}

function renderNotificationsTable(notifications) {
    const tbody = $('#notificationsTable tbody');
    
    if (tbody.length === 0) {
        console.error("Notifications table tbody not found");
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
        
        const userName = notification.users ? (notification.users.fullName || notification.users.userName || 'N/A') : 'N/A';
        const userId = notification.users ? notification.users.id : 'N/A';
        const isRead = notification.isRead ? 'Có' : 'Chưa';
        const readClass = notification.isRead ? 'text-success' : 'text-danger';
        const typeBadge = getTypeBadge(notification.type);
        
        html += `
            <tr>
                <td>${notification.id || 'N/A'}</td>
                <td>
                    ${userName} <br>
                    <small class="text-muted">ID: ${userId}</small>
                </td>
                <td>${escapeHtml(notification.title || 'N/A')}</td>
                <td>${typeBadge}</td>
                <td class="${readClass}">${isRead}</td>
                <td>${date}</td>
                <td>
                    ${notification.link ? `<a href="${notification.link}" class="btn btn-sm btn-link" target="_blank">Xem</a>` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.html(html);
    
    // Initialize DataTable
    if ($.fn.DataTable) {
        if ($.fn.DataTable.isDataTable('#notificationsTable')) {
            $('#notificationsTable').DataTable().destroy();
        }
        $('#notificationsTable').DataTable({
            language: {
                "sProcessing": "Đang xử lý...",
                "sLengthMenu": "Hiển thị _MENU_ mục",
                "sZeroRecords": "Không tìm thấy dữ liệu",
                "sInfo": "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                "sInfoEmpty": "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                "sInfoFiltered": "(được lọc từ _MAX_ mục)",
                "sInfoPostFix": "",
                "sSearch": "Tìm kiếm:",
                "sUrl": "",
                "oPaginate": {
                    "sFirst": "Đầu",
                    "sPrevious": "Trước",
                    "sNext": "Tiếp",
                    "sLast": "Cuối"
                }
            },
            order: [[5, 'desc']] // Sort by date descending
        });
    }
}

function getTypeBadge(type) {
    const badges = {
        'SYSTEM': '<span class="badge badge-secondary">Hệ thống</span>',
        'ORDER': '<span class="badge badge-primary">Đơn hàng</span>',
        'PROMOTION': '<span class="badge badge-warning">Khuyến mãi</span>',
        'ACCOUNT': '<span class="badge badge-info">Tài khoản</span>'
    };
    return badges[type] || `<span class="badge badge-light">${escapeHtml(type || 'N/A')}</span>`;
}

function showNoNotificationsMessage() {
    const tbody = $('#notificationsTable tbody');
    if (tbody.length > 0) {
        tbody.html(`
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        <i class="feather-info"></i>
                        Chưa có thông báo nào.
                    </div>
                </td>
            </tr>
        `);
    }
}

function setupEventHandlers() {
    // Create notification form submit
    $('#create-notification-form').on('submit', function(e) {
        e.preventDefault();
        createNotification();
    });
}

function createNotification() {
    const userId = parseInt($('#notification-user-id').val());
    const title = $('#notification-title').val().trim();
    const content = $('#notification-content').val().trim();
    const type = $('#notification-type').val();
    const link = $('#notification-link').val().trim();
    
    // Validate
    if (!userId || userId <= 0) {
        alert('Vui lòng nhập User ID hợp lệ!');
        return;
    }
    
    if (!title) {
        alert('Vui lòng nhập tiêu đề!');
        return;
    }
    
    if (!content) {
        alert('Vui lòng nhập nội dung!');
        return;
    }
    
    AdminApiService.createNotification(userId, title, content, type, link || '')
        .done(function(response) {
            console.log("Create notification response:", response);
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success)) {
                alert('Tạo thông báo thành công!');
                // Reset form
                $('#create-notification-form')[0].reset();
                // Reload notifications
                loadNotifications();
            } else {
                const errorMsg = response.desc || 'Tạo thông báo thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error('Error creating notification:', xhr);
            let errorMsg = 'Không thể tạo thông báo!';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
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

