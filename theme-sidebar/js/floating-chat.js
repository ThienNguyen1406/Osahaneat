/*
 * Floating Chat Box - Chat trực tiếp với admin
 */

let floatingChatInitialized = false;
let floatingChatOpen = false;
let currentAdminId = null;
let chatRefreshInterval = null;

/**
 * Initialize floating chat
 */
function initFloatingChat() {
    if (floatingChatInitialized) {
        return;
    }
    
    console.log("=== initFloatingChat() called ===");
    
    // Check if button exists
    const button = $('#floating-chat-button');
    if (button.length === 0) {
        console.error("❌ Floating chat button not found in DOM!");
        return;
    }
    
    console.log("✅ Floating chat button found");
    
    // Check if user is authenticated
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        console.log("⚠️ User not authenticated, hiding chat button");
        button.hide();
        return;
    }
    
    // Check if user is admin - don't show floating chat for admin
    if (typeof isAdmin === 'function' && isAdmin()) {
        console.log("⚠️ User is admin, hiding chat button");
        button.hide();
        return;
    }
    
    console.log("✅ User is authenticated and not admin, showing chat button");
    button.show(); // Ensure button is visible
    
    floatingChatInitialized = true;
    
    // Setup event handlers
    setupFloatingChatHandlers();
    
    // Load admin ID
    loadAdminInfo();
    
    // Load unread count
    loadFloatingChatUnreadCount();
    setInterval(function() {
        loadFloatingChatUnreadCount();
    }, 30000);
}

/**
 * Setup event handlers
 */
function setupFloatingChatHandlers() {
    // Toggle chat box
    $('#floating-chat-button').off('click').on('click', function(e) {
        e.preventDefault();
        toggleFloatingChat();
    });
    
    // Close chat box
    $('#floating-chat-close').off('click').on('click', function(e) {
        e.preventDefault();
        closeFloatingChat();
    });
    
    // Send message
    $('#floating-chat-send').off('click').on('click', function(e) {
        e.preventDefault();
        sendFloatingChatMessage();
    });
    
    // Send on Enter (but allow Shift+Enter for new line)
    $('#floating-chat-input').off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendFloatingChatMessage();
        }
    });
    
    // Minimize chat box
    $('#floating-chat-minimize').off('click').on('click', function(e) {
        e.preventDefault();
        minimizeFloatingChat();
    });
}

/**
 * Toggle chat box
 */
function toggleFloatingChat() {
    if (floatingChatOpen) {
        closeFloatingChat();
    } else {
        openFloatingChat();
    }
}

/**
 * Open chat box
 */
function openFloatingChat() {
    if (floatingChatOpen) {
        return;
    }
    
    floatingChatOpen = true;
    $('#floating-chat-box').addClass('show');
    $('#floating-chat-button').addClass('active');
    
    // Load conversation with admin
    if (currentAdminId) {
        loadFloatingChatConversation();
    } else {
        loadAdminInfo(function() {
            if (currentAdminId) {
                loadFloatingChatConversation();
            }
        });
    }
    
    // Start auto refresh
    startFloatingChatRefresh();
    
    // Focus input
    setTimeout(function() {
        $('#floating-chat-input').focus();
    }, 300);
    
    // Auto-resize textarea
    $('#floating-chat-input').off('input').on('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

/**
 * Close chat box
 */
function closeFloatingChat() {
    floatingChatOpen = false;
    $('#floating-chat-box').removeClass('show');
    $('#floating-chat-button').removeClass('active');
    
    // Stop auto refresh
    stopFloatingChatRefresh();
}

/**
 * Minimize chat box
 */
function minimizeFloatingChat() {
    $('#floating-chat-box').removeClass('show');
    $('#floating-chat-button').removeClass('active');
    // Don't set floatingChatOpen = false so we can restore state
}

/**
 * Load admin info
 */
function loadAdminInfo(callback) {
    if (typeof ApiService === 'undefined' || typeof ApiService.getConversations !== 'function') {
        updateFloatingChatHeader('admin@gmail.com');
        if (callback) callback();
        return;
    }
    
    ApiService.getConversations()
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                // Get admin from conversations (should be first one)
                if (response.data.length > 0) {
                    currentAdminId = response.data[0].userId;
                    const email = response.data[0].userName || response.data[0].fullName || 'admin@gmail.com';
                    updateFloatingChatHeader(email);
                } else {
                    updateFloatingChatHeader('admin@gmail.com');
                }
            }
            if (callback) callback();
        })
        .fail(function(xhr) {
            console.error('Error loading admin info:', xhr);
            if (callback) callback();
        });
}

/**
 * Update chat header
 */
function updateFloatingChatHeader(email) {
    const emailText = email || 'admin@gmail.com';
    $('#floating-chat-header-email').text(emailText);
}

/**
 * Load conversation
 */
function loadFloatingChatConversation() {
    if (!currentAdminId) {
        return;
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getConversation !== 'function') {
        return;
    }
    
    ApiService.getConversation(currentAdminId)
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                renderFloatingChatMessages(response.data);
            }
        })
        .fail(function(xhr) {
            console.error('Error loading conversation:', xhr);
        });
}

/**
 * Render messages
 */
function renderFloatingChatMessages(messages) {
    const container = $('#floating-chat-messages');
    if (container.length === 0) {
        return;
    }
    
    container.empty();
    
    if (!messages || messages.length === 0) {
        container.html(`
            <div class="text-center py-3 text-muted">
                <p class="small mb-0">Chưa có tin nhắn. Gửi tin nhắn đầu tiên để bắt đầu!</p>
            </div>
        `);
        return;
    }
    
    const currentUserId = getUserIdFromToken();
    
    // Group messages by date
    const messagesByDate = {};
    messages.forEach(function(message) {
        const date = new Date(message.createDate);
        const dateKey = date.toDateString();
        if (!messagesByDate[dateKey]) {
            messagesByDate[dateKey] = [];
        }
        messagesByDate[dateKey].push(message);
    });
    
    // Render messages grouped by date
    Object.keys(messagesByDate).forEach(function(dateKey) {
        const date = new Date(dateKey);
        const dateStr = formatFloatingChatDate(date);
        
        // Date header
        container.append(`
            <div class="text-center my-3">
                <span style="background: white; padding: 6px 12px; border-radius: 12px; font-size: 11px; color: #667eea; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ${dateStr}
                </span>
            </div>
        `);
        
        // Messages for this date
        messagesByDate[dateKey].forEach(function(message) {
            const isSent = message.senderId === currentUserId;
            const time = new Date(message.createDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            const messageHtml = `
                <div class="floating-chat-message ${isSent ? 'sent' : 'received'}">
                    <div class="floating-chat-message-content">
                        ${escapeHtml(message.content)}
                    </div>
                    <div class="floating-chat-message-time">${time}</div>
                </div>
            `;
            
            container.append(messageHtml);
        });
    });
    
    // Scroll to bottom with smooth animation
    setTimeout(function() {
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 300);
    }, 100);
}

/**
 * Format date for floating chat
 */
function formatFloatingChatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
    } else {
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    }
}

/**
 * Send message
 */
function sendFloatingChatMessage() {
    const input = $('#floating-chat-input');
    const content = input.val().trim();
    
    if (!content) {
        return;
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.sendMessage !== 'function') {
        alert('Chức năng gửi tin nhắn chưa được triển khai!');
        return;
    }
    
    // Disable input while sending
    input.prop('disabled', true);
    $('#floating-chat-send').prop('disabled', true);
    
    ApiService.sendMessage({
        content: content
    })
        .done(function(response) {
            // Clear input and reset height
            input.val('');
            input.css('height', 'auto');
            input.prop('disabled', false);
            const sendButton = $('#floating-chat-send');
            sendButton.prop('disabled', false);
            
            // Reload conversation
            setTimeout(function() {
                loadFloatingChatConversation();
            }, 300);
            
            // Update unread count
            loadFloatingChatUnreadCount();
        })
        .fail(function(xhr) {
            console.error('Error sending message:', xhr);
            input.prop('disabled', false);
            const sendButton = $('#floating-chat-send');
            sendButton.prop('disabled', false);
            
            let errorMsg = 'Không thể gửi tin nhắn! Vui lòng thử lại.';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
        });
}

/**
 * Start auto refresh
 */
function startFloatingChatRefresh() {
    stopFloatingChatRefresh();
    chatRefreshInterval = setInterval(function() {
        if (floatingChatOpen && currentAdminId) {
            loadFloatingChatConversation();
        }
    }, 10000); // Refresh every 10 seconds
}

/**
 * Stop auto refresh
 */
function stopFloatingChatRefresh() {
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
}

/**
 * Load unread count
 */
function loadFloatingChatUnreadCount() {
    if (typeof ApiService === 'undefined' || typeof ApiService.getUnreadMessageCount !== 'function') {
        return;
    }
    
    ApiService.getUnreadMessageCount()
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data) {
                const count = response.data.count || 0;
                updateFloatingChatBadge(count);
            }
        })
        .fail(function(xhr) {
            console.error('Error loading unread count:', xhr);
        });
}

/**
 * Update badge
 */
function updateFloatingChatBadge(count) {
    const badge = $('#floating-chat-badge');
    if (badge.length > 0) {
        if (count > 0) {
            badge.text(count > 99 ? '99+' : count).show();
        } else {
            badge.hide();
        }
    }
}

/**
 * Helper: Get user ID from token
 */
function getUserIdFromToken() {
    const token = getToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return decoded.sub || decoded.id || decoded.userId || null;
}

/**
 * Helper: Escape HTML
 */
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

// Initialize when document is ready
$(document).ready(function() {
    console.log("=== Floating Chat: Document ready ===");
    
    // Ensure button is visible by default (will be hidden if needed)
    const button = $('#floating-chat-button');
    if (button.length > 0) {
        console.log("✅ Floating chat button found in DOM");
        button.css('display', 'flex'); // Force display
    } else {
        console.error("❌ Floating chat button NOT found in DOM!");
    }
    
    // Wait a bit for other scripts to load
    setTimeout(function() {
        initFloatingChat();
    }, 500);
});

