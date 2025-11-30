/*
 * Shipper Chat - Chat với User và Staff
 */

console.log("=== SHIPPER-CHAT.JS LOADED ===");

let currentConversationId = null;
let currentUserId = null;
let chatRefreshInterval = null;

$(document).ready(function() {
    console.log("Initializing shipper chat...");
    
    // Check authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập!');
        window.location.href = 'login.html';
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
    $.ajax({
        method: 'GET',
        url: `${ShipperApiService.API_BASE_URL}/user/my-info`,
        headers: ShipperApiService.getHeaders(),
        dataType: 'json'
    })
    .done(function(response) {
        if (response && (response.isSuccess || response.success) && response.data) {
            currentUserId = response.data.id;
            console.log("Current user ID:", currentUserId);
        }
    })
    .fail(function(xhr) {
        console.error('Error getting current user info:', xhr);
    });
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
    
    // Auto-resize textarea
    $('#message-input').on('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
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
    
    $.ajax({
        method: 'GET',
        url: `${ShipperApiService.API_BASE_URL}/message`,
        headers: ShipperApiService.getHeaders(),
        dataType: 'json'
    })
    .done(function(response) {
        console.log("Conversations response:", response);
        
        if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
            renderConversations(response.data);
        } else {
            $('#conversations-list').html(`
                <div class="empty-chat-state">
                    <i class="fas fa-comments"></i>
                    <p>Chưa có cuộc trò chuyện nào</p>
                    <small class="text-muted mt-2">Bắt đầu trò chuyện với khách hàng hoặc nhân viên</small>
                </div>
            `);
        }
    })
    .fail(function(xhr) {
        console.error('Error loading conversations:', xhr);
        $('#conversations-list').html(`
            <div class="empty-chat-state">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <p>Không thể tải danh sách chat</p>
                <button class="btn btn-primary btn-sm mt-3" onclick="loadConversations()">
                    <i class="fas fa-sync-alt mr-2"></i>Thử lại
                </button>
            </div>
        `);
    });
}

function renderConversations(conversations) {
    const container = $('#conversations-list');
    
    if (!conversations || conversations.length === 0) {
        container.html(`
            <div class="empty-chat-state">
                <i class="fas fa-comments"></i>
                <p>Chưa có cuộc trò chuyện nào</p>
                <small class="text-muted mt-2">Bắt đầu trò chuyện với khách hàng hoặc nhân viên</small>
            </div>
        `);
        return;
    }
    
    let html = '';
    conversations.forEach(function(conv) {
        const isActive = currentConversationId === conv.userId;
        const unreadBadge = conv.unreadCount > 0 ? `<span class="badge badge-danger badge-pill">${conv.unreadCount}</span>` : '';
        const timeStr = conv.lastMessageDate ? formatTimeAgo(new Date(conv.lastMessageDate)) : '';
        
        const avatarColor = getAvatarColor(conv.userId);
        const avatarLetter = (conv.fullName || conv.userName || 'U').charAt(0).toUpperCase();
        
        html += `
            <div class="conversation-item ${isActive ? 'active' : ''}" data-user-id="${conv.userId}">
                <div class="d-flex align-items-center">
                    <div class="conversation-avatar" style="background: ${avatarColor};">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-name">
                            <span>${escapeHtml(conv.fullName || conv.userName || 'User')}</span>
                            ${unreadBadge ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
                        </div>
                        <div class="conversation-last-message">
                            <i class="fas fa-comment-dots mr-1" style="font-size: 10px;"></i>
                            ${escapeHtml(conv.lastMessage || 'Chưa có tin nhắn')}
                        </div>
                        <div class="conversation-time">
                            <i class="fas fa-clock mr-1" style="font-size: 9px;"></i>${timeStr}
                        </div>
                    </div>
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
}

function selectConversation(userId) {
    console.log("Selecting conversation:", userId);
    
    currentConversationId = userId;
    
    // Update active state
    $('.conversation-item').removeClass('active');
    $(`.conversation-item[data-user-id="${userId}"]`).addClass('active');
    
    // Update header
    const convItem = $(`.conversation-item[data-user-id="${userId}"]`);
    const name = convItem.find('.conversation-name span').first().text();
    $('#chat-header-name').html(`<i class="fas fa-user-circle mr-2"></i>${name}`);
    $('#chat-header-info').html(`<i class="fas fa-circle mr-1" style="color: #4CAF50; font-size: 8px;"></i>Đang trò chuyện`);
    
    // Load messages
    loadConversation(userId);
}

function loadConversation(userId) {
    console.log("Loading conversation:", userId);
    
    $.ajax({
        method: 'GET',
        url: `${ShipperApiService.API_BASE_URL}/message/${userId}`,
        headers: ShipperApiService.getHeaders(),
        dataType: 'json'
    })
    .done(function(response) {
        console.log("Conversation response:", response);
        
        if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
            renderMessages(response.data);
        } else {
            $('#messages-container').html(`
                <div class="empty-chat-state">
                    <i class="fas fa-comments"></i>
                    <p>Chưa có tin nhắn nào</p>
                    <small class="text-muted mt-2">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</small>
                </div>
            `);
        }
    })
    .fail(function(xhr) {
        console.error('Error loading conversation:', xhr);
    });
}

function renderMessages(messages) {
    const container = $('#messages-container');
    
    if (!messages || messages.length === 0) {
        container.html(`
            <div class="empty-chat-state">
                <i class="fas fa-comments"></i>
                <p>Chưa có tin nhắn nào</p>
                <small class="text-muted mt-2">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</small>
            </div>
        `);
        return;
    }
    
    // Get current user ID from token
    const token = getToken();
    const decoded = decodeToken(token);
    const currentUserId = decoded ? decoded.sub : null;
    
    // We need to get current user ID from API
    // For now, we'll use a workaround: check if senderId matches a pattern
    // Actually, we should get current user info from API
    
    let html = '';
    messages.forEach(function(msg) {
        // Determine if message is from current user (shipper)
        const isFromMe = msg.senderId === currentUserId;
        const timeStr = formatTime(new Date(msg.createDate));
        
        html += `
            <div class="message-item ${isFromMe ? 'message-sent' : 'message-received'}">
                <div class="message-bubble">
                    ${escapeHtml(msg.content)}
                </div>
                <div class="message-time">${timeStr}</div>
            </div>
        `;
    });
    
    container.html(html);
    
    // Scroll to bottom
    container.scrollTop(container[0].scrollHeight);
}

function sendMessage() {
    const input = $('#message-input');
    const content = input.val().trim();
    
    if (!content) {
        alert('Vui lòng nhập nội dung tin nhắn!');
        return;
    }
    
    if (!currentConversationId) {
        alert('Vui lòng chọn một cuộc trò chuyện!');
        return;
    }
    
    // Disable input
    input.prop('disabled', true);
    $('#send-button').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
    
    $.ajax({
        method: 'POST',
        url: `${ShipperApiService.API_BASE_URL}/message`,
        headers: ShipperApiService.getHeaders(),
        contentType: 'application/json',
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
        input.css('height', 'auto');
        $('#send-button').prop('disabled', false).html('<i class="fas fa-paper-plane"></i>');
        
        // Reload conversation
        setTimeout(function() {
            loadConversation(currentConversationId);
            loadConversations();
        }, 300);
    })
    .fail(function(xhr) {
        console.error('Error sending message:', xhr);
        input.prop('disabled', false);
        $('#send-button').prop('disabled', false).html('<i class="fas fa-paper-plane"></i>');
        
        let errorMsg = 'Không thể gửi tin nhắn!';
        if (xhr.responseJSON && xhr.responseJSON.desc) {
            errorMsg = xhr.responseJSON.desc;
        }
        alert(errorMsg);
    });
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

function getAvatarColor(userId) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    return colors[userId % colors.length];
}

// Helper functions from shipper.js (if not already defined)
function getToken() {
    return localStorage.getItem('token');
}

function isAuthenticated() {
    return getToken() !== null;
}

function decodeToken(token) {
    try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
        return JSON.parse(atob(paddedBase64));
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
}

