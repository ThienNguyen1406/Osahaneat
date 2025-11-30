/*
 * Staff Chat - Chat với User và Driver
 */

console.log("=== STAFF-CHAT.JS LOADED ===");

let currentConversationId = null;
let currentUserId = null;
let chatRefreshInterval = null;

$(document).ready(function() {
    console.log("Initializing staff chat...");
    
    // Check authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập!');
        window.location.href = '../admin/login.html';
        return;
    }
    
    // Get current user ID
    getCurrentUserInfo();
    
    // Load conversations
    loadConversations();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Auto refresh every 5 seconds
    chatRefreshInterval = setInterval(function() {
        if (currentConversationId) {
            loadConversation(currentConversationId);
        }
        loadConversations();
    }, 5000);
});

function getCurrentUserInfo() {
    // Try to get user info from token or use a default approach
    // Since we might not have a direct endpoint, we'll get it from the first message response
    // For now, we'll set it when we get conversations
    console.log("Getting current user info...");
    
    // Alternative: Try to decode token to get user ID (if token contains it)
    try {
        const token = localStorage.getItem('token');
        if (token) {
            // Token is JWT, we can decode it to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.sub || payload.userId || payload.id) {
                currentUserId = payload.sub || payload.userId || payload.id;
                console.log("Current user ID from token:", currentUserId);
                return;
            }
        }
    } catch (e) {
        console.log("Could not decode token, will get from API");
    }
    
    // If token decode fails, we'll get it from the conversations response
    // This will be set in loadConversations when we get the response
}

function setupEventHandlers() {
    // Send message
    $('#send-button').on('click', function() {
        sendMessage();
    });
    
    // Send on Enter (Shift+Enter for new line)
    $('#message-input').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Search conversations
    $('#search-conversations').on('input', function() {
        const keyword = $(this).val().toLowerCase();
        $('.conversation-item').each(function() {
            const name = $(this).find('.conversation-name').text().toLowerCase();
            if (name.includes(keyword)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

function loadConversations() {
    console.log("Loading conversations...");
    
    const token = localStorage.getItem('token');
    if (!token) {
        $('#conversations-list').html(`
            <div class="alert alert-warning m-3">
                <i class="fas fa-exclamation-triangle"></i> Vui lòng đăng nhập lại
            </div>
        `);
        return;
    }
    
    $.ajax({
        method: 'GET',
        url: `${StaffApiService.API_BASE_URL}/message`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    })
    .done(function(response) {
        console.log("Conversations response:", response);
        
        if (response && (response.isSuccess || response.success)) {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                renderConversations(response.data);
            } else {
                $('#conversations-list').html(`
                    <div class="text-center py-5 text-muted">
                        <i class="fas fa-comments fa-3x mb-3" style="opacity: 0.3;"></i>
                        <p class="mb-0">Chưa có cuộc trò chuyện nào</p>
                        <small class="text-muted">Bắt đầu trò chuyện với khách hàng hoặc tài xế</small>
                    </div>
                `);
            }
        } else {
            $('#conversations-list').html(`
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-comments fa-3x mb-3" style="opacity: 0.3;"></i>
                    <p class="mb-0">Chưa có cuộc trò chuyện nào</p>
                </div>
            `);
        }
    })
    .fail(function(xhr) {
        console.error('Error loading conversations:', xhr);
        
        let errorMsg = 'Không thể tải danh sách chat';
        if (xhr.status === 403) {
            errorMsg = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else if (xhr.status === 401) {
            errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (xhr.status === 0) {
            errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        }
        
        $('#conversations-list').html(`
            <div class="alert alert-danger m-3">
                <i class="fas fa-exclamation-triangle mr-2"></i>${errorMsg}
                <br><small class="mt-2 d-block">
                    <button class="btn btn-sm btn-warning mt-2" onclick="location.reload()">
                        <i class="fas fa-sync-alt mr-1"></i>Tải lại trang
                    </button>
                </small>
            </div>
        `);
    });
}

function renderConversations(conversations) {
    const container = $('#conversations-list');
    
    if (!conversations || conversations.length === 0) {
        container.html(`
            <div class="text-center py-5 text-muted">
                <i class="fas fa-comments fa-3x mb-3" style="opacity: 0.3;"></i>
                <p class="mb-0">Chưa có cuộc trò chuyện nào</p>
                <small class="text-muted">Bắt đầu trò chuyện với khách hàng hoặc tài xế</small>
            </div>
        `);
        return;
    }
    
    let html = '';
    conversations.forEach(function(conv) {
        const isActive = currentConversationId === conv.userId;
        const unreadBadge = conv.unreadCount > 0 ? `<span class="badge badge-warning badge-pill ml-2">${conv.unreadCount}</span>` : '';
        const timeStr = conv.lastMessageDate ? formatTimeAgo(new Date(conv.lastMessageDate)) : '';
        const userName = escapeHtml(conv.fullName || conv.userName || 'User');
        const lastMessage = escapeHtml(conv.lastMessage || 'Chưa có tin nhắn');
        const initial = userName.charAt(0).toUpperCase();
        
        // Determine user type icon
        let userIcon = 'fa-user';
        let userType = '';
        if (conv.roleName) {
            if (conv.roleName.includes('USER')) {
                userIcon = 'fa-user';
                userType = 'Khách hàng';
            } else if (conv.roleName.includes('DRIVER')) {
                userIcon = 'fa-motorcycle';
                userType = 'Tài xế';
            } else if (conv.roleName.includes('STAFF')) {
                userIcon = 'fa-utensils';
                userType = 'Nhân viên';
            }
        }
        
        html += `
            <div class="conversation-item ${isActive ? 'active' : ''}" data-user-id="${conv.userId}">
                <div class="conversation-avatar bg-warning text-white position-relative">
                    ${initial}
                    ${unreadBadge ? `<span class="badge badge-danger badge-pill position-absolute" style="top: -5px; right: -5px; font-size: 10px; padding: 2px 5px; min-width: 18px;">${conv.unreadCount}</span>` : ''}
                </div>
                <div class="conversation-info">
                    <div class="conversation-name">${userName}</div>
                    <div class="conversation-preview">${lastMessage}</div>
                    ${timeStr ? `<div class="conversation-time"><i class="fas fa-clock mr-1"></i>${timeStr}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    container.html(html);
    
    // Setup click handlers
    $('.conversation-item').off('click').on('click', function() {
        const userId = $(this).data('user-id');
        selectConversation(userId);
    });
    
    // Hover effect is handled by CSS
}

function selectConversation(userId) {
    console.log("Selecting conversation:", userId);
    
    currentConversationId = userId;
    
    // Update active state
    $('.conversation-item').removeClass('active');
    $(`.conversation-item[data-user-id="${userId}"]`).addClass('active');
    
    // Update header
    const convItem = $(`.conversation-item[data-user-id="${userId}"]`);
    const name = convItem.find('.conversation-name').text();
    const avatar = convItem.find('.conversation-avatar').html();
    $('#chat-header-name').html(`<i class="fas fa-comments mr-2 text-primary"></i>${name}`);
    $('#chat-header-info').text('Đang trò chuyện');
    
    // Update header avatar
    $('.chat-header-avatar').html(avatar);
    
    // Load messages
    loadConversation(userId);
}

function loadConversation(userId) {
    console.log("Loading conversation:", userId);
    
    if (!userId) {
        console.error("No user ID provided");
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập lại!');
        window.location.href = '../admin/login.html';
        return;
    }
    
    // Show loading
    $('#messages-container').html(`
        <div class="text-center py-5">
            <i class="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
            <p class="text-muted">Đang tải tin nhắn...</p>
        </div>
    `);
    
    $.ajax({
        method: 'GET',
        url: `${StaffApiService.API_BASE_URL}/message/${userId}`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    })
    .done(function(response) {
        console.log("Conversation response:", response);
        
        if (response && (response.isSuccess || response.success)) {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                renderMessages(response.data);
            } else {
                $('#messages-container').html(`
                    <div class="text-center py-5 text-muted">
                        <i class="fas fa-comments fa-3x mb-3" style="opacity: 0.3;"></i>
                        <p class="mb-0">Chưa có tin nhắn nào</p>
                        <small class="text-muted">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</small>
                    </div>
                `);
            }
        } else {
            $('#messages-container').html(`
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-comments fa-3x mb-3" style="opacity: 0.3;"></i>
                    <p>Chưa có tin nhắn nào</p>
                </div>
            `);
        }
    })
    .fail(function(xhr) {
        console.error('Error loading conversation:', xhr);
        
        let errorMsg = 'Không thể tải tin nhắn';
        if (xhr.status === 403) {
            errorMsg = 'Không có quyền truy cập';
        } else if (xhr.status === 401) {
            errorMsg = 'Phiên đăng nhập đã hết hạn';
        }
        
        $('#messages-container').html(`
            <div class="alert alert-danger m-3">
                <i class="fas fa-exclamation-triangle mr-2"></i>${errorMsg}
            </div>
        `);
    });
}

function renderMessages(messages) {
    const container = $('#messages-container');
    
    if (!messages || messages.length === 0) {
        container.html(`
            <div class="text-center py-5 text-muted">
                <i class="fas fa-comments fa-3x mb-3" style="opacity: 0.3;"></i>
                <p class="mb-0">Chưa có tin nhắn nào</p>
                <small class="text-muted">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</small>
            </div>
        `);
        return;
    }
    
    // Try to determine current user ID from first message
    if (!currentUserId && messages.length > 0) {
        // We'll assume the first message's sender or receiver is us
        // This is a workaround - ideally we'd get this from token or API
        const firstMsg = messages[0];
        // We'll set it when we compare messages
    }
    
    let html = '';
    messages.forEach(function(msg) {
        // Determine if message is from current user (staff)
        // If we don't have currentUserId, we'll try to infer from the message
        let isFromMe = false;
        
        if (currentUserId) {
            isFromMe = msg.senderId === currentUserId;
        } else {
            // Try to infer: if sender name matches staff pattern or if it's the first message
            // This is a heuristic - not perfect but better than nothing
            isFromMe = msg.senderName && (
                msg.senderName.toLowerCase().includes('staff') || 
                msg.senderName.toLowerCase().includes('nhân viên')
            );
        }
        
        const timeStr = formatTime(new Date(msg.createDate));
        const senderName = escapeHtml(msg.senderName || 'Người gửi');
        
        html += `
            <div class="message-item ${isFromMe ? 'message-sent' : 'message-received'}">
                ${!isFromMe ? `<div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; padding: 0 4px;"><i class="fas fa-user mr-1"></i>${senderName}</div>` : ''}
                <div class="message-bubble">
                    ${escapeHtml(msg.content)}
                    <div class="message-time">
                        ${timeStr}
                        ${msg.isRead && isFromMe ? ' <i class="fas fa-check-double ml-1" style="opacity: 0.8;" title="Đã đọc"></i>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.html(html);
    
    // Scroll to bottom
    setTimeout(function() {
        container.scrollTop(container[0].scrollHeight);
    }, 100);
}

function sendMessage() {
    const input = $('#message-input');
    const content = input.val().trim();
    
    if (!content) {
        // Show a subtle notification instead of alert
        showNotification('Vui lòng nhập nội dung tin nhắn!', 'warning');
        return;
    }
    
    if (!currentConversationId) {
        showNotification('Vui lòng chọn một cuộc trò chuyện!', 'warning');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập lại!');
        window.location.href = '../admin/login.html';
        return;
    }
    
    // Disable input
    input.prop('disabled', true);
    $('#send-button').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
    
    $.ajax({
        method: 'POST',
        url: `${StaffApiService.API_BASE_URL}/message`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            receiverId: currentConversationId,
            content: content
        }),
        dataType: 'json'
    })
    .done(function(response) {
        console.log("Send message response:", response);
        
        // Clear input
        input.val('');
        input.prop('disabled', false);
        $('#send-button').prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Gửi');
        
        // Reload conversation
        setTimeout(function() {
            loadConversation(currentConversationId);
            loadConversations();
        }, 300);
    })
    .fail(function(xhr) {
        console.error('Error sending message:', xhr);
        input.prop('disabled', false);
        $('#send-button').prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Gửi');
        
        let errorMsg = 'Không thể gửi tin nhắn!';
        if (xhr.status === 403) {
            errorMsg = 'Không có quyền gửi tin nhắn. Vui lòng đăng nhập lại.';
        } else if (xhr.status === 401) {
            errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (xhr.responseJSON && xhr.responseJSON.desc) {
            errorMsg = xhr.responseJSON.desc;
        }
        
        showNotification(errorMsg, 'danger');
    });
}

function showNotification(message, type) {
    const alertClass = type === 'danger' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
    const notification = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(function() {
        notification.fadeOut(function() {
            $(this).remove();
        });
    }, 3000);
}

// Helper functions
function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours12}:${minutesStr} ${ampm}`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Helper functions from staff.js (if not already defined)
function getToken() {
    return localStorage.getItem('token');
}

function isAuthenticated() {
    return getToken() !== null;
}

