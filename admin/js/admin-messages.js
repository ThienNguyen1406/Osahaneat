/*
 * Admin Messages Page - Chat giữa admin và users
 */

// Track last successful load to avoid spamming errors
let lastConversationsLoadSuccess = true;
let conversationsLoadRetryCount = 0;
const MAX_RETRY_COUNT = 3;
let isLoadingConversations = false; // Prevent concurrent requests
let networkErrorShown = false; // Track if we've shown network error alert

$(document).ready(function() {
    console.log("=== Admin Messages.js loaded ===");
    
    // Kiểm tra authentication
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập để xem tin nhắn!');
        window.location.href = 'login.html';
        return;
    }
    
    // Kiểm tra admin role
    if (!isAdmin()) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    // Load conversations
    loadConversations();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Auto refresh conversations every 10 seconds
    // Only refresh if page is visible and last request was successful
    let conversationsRefreshInterval = null;
    
    // Make startConversationsRefresh and stopConversationsRefresh available globally
    window.stopConversationsRefresh = function() {
        if (conversationsRefreshInterval) {
            clearInterval(conversationsRefreshInterval);
            conversationsRefreshInterval = null;
            console.log('⏸️ Conversations refresh stopped manually');
        }
    };
    
    window.startConversationsRefresh = function() {
        // Stop existing interval first
        window.stopConversationsRefresh();
        
        conversationsRefreshInterval = setInterval(function() {
            // Check if page is visible
            if (document.hidden) {
                return;
            }
            
            // Don't refresh if already loading
            if (isLoadingConversations) {
                console.log('⏸️ Skipping refresh: already loading');
                return;
            }
            
            // Stop auto-refresh if we've exceeded max retry count
            if (!lastConversationsLoadSuccess && conversationsLoadRetryCount >= MAX_RETRY_COUNT) {
                console.log('⏸️ Stopping auto-refresh due to repeated failures. Vui lòng refresh trang để thử lại.');
                // Stop the interval
                if (conversationsRefreshInterval) {
                    clearInterval(conversationsRefreshInterval);
                    conversationsRefreshInterval = null;
                }
                return;
            }
            
            // Only refresh if last request was successful or retry count is low
            if (lastConversationsLoadSuccess || conversationsLoadRetryCount < MAX_RETRY_COUNT) {
                loadConversations();
                // Reload current conversation if one is selected
                const container = $('.osahan-chat-box');
                const currentUserId = container.data('current-user-id');
                if (currentUserId) {
                    loadConversation(currentUserId);
                }
            }
        }, 10000);
    }
    
    // Start refresh
    startConversationsRefresh();
    
    // Stop refresh if page becomes hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (conversationsRefreshInterval) {
                clearInterval(conversationsRefreshInterval);
                conversationsRefreshInterval = null;
            }
        } else {
            if (!conversationsRefreshInterval) {
                startConversationsRefresh();
            }
        }
    });
    
    // Load unread count badge
    loadUnreadCount();
    setInterval(function() {
        // Only load if conversations are loading successfully
        if (lastConversationsLoadSuccess || conversationsLoadRetryCount < MAX_RETRY_COUNT) {
            loadUnreadCount();
        } else {
            console.log('⏸️ Skipping unread count update due to network errors');
        }
    }, 30000); // Update every 30 seconds
});

/**
 * Load danh sách conversations (users đã chat với admin)
 */
function loadConversations() {
    // Prevent concurrent requests
    if (isLoadingConversations) {
        console.log("⏸️ Already loading conversations, skipping...");
        return;
    }
    
    // Don't retry if we've exceeded max retry count and last attempt failed
    if (!lastConversationsLoadSuccess && conversationsLoadRetryCount >= MAX_RETRY_COUNT) {
        console.log("⏸️ Skipping conversations load: exceeded max retry count");
        return;
    }
    
    console.log("Loading conversations...");
    console.log("API_BASE_URL:", typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'not defined');
    
    if (typeof AdminApiService === 'undefined' || typeof AdminApiService.getConversations !== 'function') {
        console.error("❌ AdminApiService.getConversations is not defined!");
        console.error("AdminApiService:", typeof AdminApiService);
        return;
    }
    
    isLoadingConversations = true;
    
    console.log("Calling AdminApiService.getConversations()...");
    AdminApiService.getConversations()
        .done(function(response) {
            isLoadingConversations = false;
            console.log("Conversations response:", response);
            
            // Reset retry count on success
            conversationsLoadRetryCount = 0;
            lastConversationsLoadSuccess = true;
            networkErrorShown = false; // Reset error flag on success
            
            // Check response format
            console.log("Response check - isSuccess:", response && (response.isSuccess || response.success));
            console.log("Response check - hasData:", response && response.data);
            console.log("Response check - isArray:", response && response.data && Array.isArray(response.data));
            
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                console.log("✅ Conversations data is valid, rendering " + response.data.length + " conversations");
                renderConversations(response.data);
            } else {
                console.warn("⚠️ Conversations response format invalid:", response);
                if (response && response.data && !Array.isArray(response.data)) {
                    console.warn("⚠️ Response.data is not an array:", typeof response.data, response.data);
                }
                showNoConversationsMessage();
            }
        })
        .fail(function(xhr, status, error) {
            isLoadingConversations = false;
            console.error('Error loading conversations:', xhr);
            console.error('Status:', status);
            console.error('XHR Status:', xhr.status);
            console.error('Error:', error);
            console.error('Response:', xhr.responseJSON);
            console.error('ReadyState:', xhr.readyState);
            
            // Increment retry count
            conversationsLoadRetryCount++;
            
            // Handle different error types
            if (status === 'timeout') {
                console.error('Request timeout');
                lastConversationsLoadSuccess = false;
                
                // Only show alert once
                if (!networkErrorShown && conversationsLoadRetryCount >= MAX_RETRY_COUNT) {
                    networkErrorShown = true;
                    alert('Kết nối timeout nhiều lần. Vui lòng kiểm tra kết nối mạng và thử lại.');
                }
                
                showNoConversationsMessage();
            } else if (status === 'error' && (xhr.readyState === 0 || xhr.status === 0)) {
                console.error('Network error: Cannot connect to server');
                lastConversationsLoadSuccess = false;
                
                // Stop auto-refresh immediately if we've exceeded max retry count
                if (conversationsLoadRetryCount >= MAX_RETRY_COUNT) {
                    console.log('⏸️ Auto-refresh stopped due to network errors (retry count: ' + conversationsLoadRetryCount + ')');
                    
                    // Stop the interval - we need to access it through the closure
                    // Since conversationsRefreshInterval is in the closure, we'll stop it in the next interval check
                    // But we can also try to stop it by calling the stop function if available
                    if (typeof window.stopConversationsRefresh === 'function') {
                        window.stopConversationsRefresh();
                    }
                    
                    // Only show alert once
                    if (!networkErrorShown) {
                        networkErrorShown = true;
                        alert('Không thể kết nối đến server sau ' + MAX_RETRY_COUNT + ' lần thử. Vui lòng kiểm tra:\n1. Server có đang chạy không?\n2. URL API có đúng không?\n3. Kết nối mạng có ổn định không?\n\nSau khi server sẵn sàng, vui lòng refresh trang (F5) hoặc click nút "Thử lại" để thử lại.');
                    }
                }
                
                showNoConversationsMessage();
            } else if (xhr.status === 403) {
                alert('Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
            } else if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
            } else {
                lastConversationsLoadSuccess = false;
                showNoConversationsMessage();
            }
        });
}

/**
 * Render danh sách conversations
 */
function renderConversations(conversations) {
    const container = $('.osahan-chat-list');
    if (container.length === 0) {
        console.error("Conversations container not found!");
        return;
    }
    
    console.log("=== renderConversations() called ===");
    console.log("Conversations count:", conversations ? conversations.length : 0);
    console.log("Conversations data:", conversations);
    
    if (!conversations || conversations.length === 0) {
        console.log("⚠️ No conversations to render, showing empty message");
        showNoConversationsMessage();
        return;
    }
    
    console.log("✅ Rendering", conversations.length, "conversations");
    
    let html = '';
    conversations.forEach(function(conversation, index) {
        console.log(`Processing conversation ${index + 1}:`, conversation);
        const userName = conversation.userName || conversation.fullName || 'User';
        const fullName = conversation.fullName || userName;
        const lastMessage = conversation.lastMessage || 'Chưa có tin nhắn';
        const lastMessageDate = conversation.lastMessageDate ? new Date(conversation.lastMessageDate) : null;
        const unreadCount = conversation.unreadCount || 0;
        // Track active conversation
        const container = $('.osahan-chat-box');
        const currentUserId = container.data('current-user-id');
        const isActive = currentUserId === conversation.userId;
        
        const timeStr = lastMessageDate ? formatTimeAgo(lastMessageDate) : '';
        const unreadBadge = unreadCount > 0 ? `<span class="badge badge-danger badge-counter">${unreadCount}</span>` : '';
        
        html += `
            <div class="p-3 d-flex align-items-center border-bottom osahan-post-header overflow-hidden conversation-item ${isActive ? 'bg-light' : ''}" 
                 data-user-id="${conversation.userId}" 
                 style="cursor: pointer; transition: all 0.3s;">
                <div class="dropdown-list-image mr-3 flex-shrink-0">
                    <div class="d-flex align-items-center bg-primary justify-content-center rounded-circle text-white" style="width: 48px; height: 48px; font-size: 18px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        ${fullName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="font-weight-bold mr-1 overflow-hidden flex-grow-1" style="min-width: 0;">
                    <div class="text-truncate font-weight-bold" style="font-size: 15px; color: #333;">${escapeHtml(fullName)}</div>
                    <div class="small text-truncate overflow-hidden text-black-50 mt-1">
                        ${escapeHtml(lastMessage)}
                    </div>
                </div>
                <span class="ml-auto mb-auto text-right flex-shrink-0" style="min-width: 60px;">
                    ${unreadBadge}
                    <div class="text-muted pt-1 small" style="font-size: 11px;">${timeStr}</div>
                </span>
            </div>
        `;
    });
    
    container.html(html);
    
    // Setup click handlers
    $('.conversation-item').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const userId = $(this).data('user-id');
        console.log("=== Conversation item clicked ===");
        console.log("User ID from data attribute:", userId);
        console.log("Element:", this);
        
        if (userId) {
            console.log("✅ Valid userId, calling selectConversation");
            selectConversation(userId);
        } else {
            console.error("❌ No userId found in conversation item");
        }
    });
    
    console.log("✅ Click handlers attached to", $('.conversation-item').length, "conversation items");
}

/**
 * Select conversation và load messages
 */
function selectConversation(userId) {
    console.log("=== selectConversation() called ===");
    console.log("User ID:", userId);
    
    if (!userId || userId <= 0) {
        console.error("❌ Invalid userId:", userId);
        return;
    }
    
    // Store current user ID in chat box for reference
    const chatBox = $('.osahan-chat-box');
    if (chatBox.length > 0) {
        chatBox.data('current-user-id', userId);
        console.log("✅ Stored current-user-id in chat box:", userId);
    }
    
    // Update active state
    $('.conversation-item').removeClass('bg-light active');
    const selectedItem = $(`.conversation-item[data-user-id="${userId}"]`);
    if (selectedItem.length > 0) {
        selectedItem.addClass('bg-light active');
        console.log("✅ Conversation item selected and highlighted");
        
        // Scroll to selected item
        const container = $('.osahan-chat-list');
        if (container.length > 0) {
            const itemTop = selectedItem.offset().top - container.offset().top + container.scrollTop();
            container.animate({
                scrollTop: itemTop - 20
            }, 300);
        }
    } else {
        console.warn("⚠️ Conversation item not found for userId:", userId);
    }
    
    // Show chat box if hidden
    if (chatBox.length > 0) {
        chatBox.show();
        console.log("✅ Chat box shown");
    }
    
    // Load messages
    console.log("Loading conversation messages for user:", userId);
    loadConversation(userId);
}

/**
 * Load messages giữa admin và user
 */
function loadConversation(userId) {
    console.log("Loading conversation with user:", userId);
    
    if (typeof AdminApiService === 'undefined' || typeof AdminApiService.getConversation !== 'function') {
        console.error("❌ AdminApiService.getConversation is not defined!");
        return;
    }
    
    AdminApiService.getConversation(userId)
        .done(function(response) {
            console.log("Conversation response:", response);
            
            // Check response format
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                renderMessages(response.data, userId);
            } else {
                console.warn("Conversation response:", response);
                showNoMessagesMessage();
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Error loading conversation:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            
            if (status === 'timeout' || (status === 'error' && xhr.readyState === 0)) {
                console.error('Network error when loading conversation');
                // Show error message but don't block UI
                const container = $('.osahan-chat-box');
                if (container.length > 0) {
                    container.html(`
                        <div class="alert alert-warning text-center py-3 m-3">
                            <i class="feather-alert-circle h4 mb-2"></i>
                            <p class="mb-0">Không thể tải tin nhắn. Vui lòng kiểm tra kết nối và thử lại.</p>
                        </div>
                    `);
                }
            } else {
                showNoMessagesMessage();
            }
        });
}

/**
 * Render messages
 */
function renderMessages(messages, userId) {
    console.log("=== renderMessages() called ===");
    console.log("Messages count:", messages ? messages.length : 0);
    console.log("User ID:", userId);
    
    const container = $('.osahan-chat-box');
    if (container.length === 0) {
        console.error("❌ Messages container (.osahan-chat-box) not found!");
        return;
    }
    
    console.log("✅ Messages container found");
    
    // Store current user ID in container
    container.data('current-user-id', userId);
    
    // Get current user ID from token (backend will handle it)
    // For admin, we don't need to pass currentUserId to backend
    
    if (!messages || messages.length === 0) {
        console.log("⚠️ No messages to render, showing empty message");
        showNoMessagesMessage();
        return;
    }
    
    console.log("✅ Rendering", messages.length, "messages");
    
    // Update chat header - userId is the user we're chatting with
    // We need to get user info from conversations list or API
    // For now, we'll use the first message to get user info
    const firstMessage = messages.length > 0 ? messages[0] : null;
    if (firstMessage) {
        // User is the one who is NOT admin
        // Admin is sender if receiverId === userId, or receiver if senderId === userId
        const otherUser = firstMessage.senderId === userId ? firstMessage.senderName : firstMessage.receiverName;
        const otherUserName = firstMessage.senderId === userId ? firstMessage.senderUserName : firstMessage.receiverUserName;
        
        $('#chat-header-name').text(otherUser || 'User');
        $('#chat-header-email').text(otherUserName || '');
    }
    
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
    
    // Render messages
    let html = '';
    Object.keys(messagesByDate).forEach(function(dateKey) {
        const date = new Date(dateKey);
        const dateStr = formatDate(date);
        
        html += `
            <div class="text-center my-3">
                <span class="px-3 py-2 small bg-white shadow-sm rounded">${dateStr}</span>
            </div>
        `;
        
        messagesByDate[dateKey].forEach(function(message) {
            // userId is the user we're chatting with (the other user, not admin)
            // Logic:
            // - If message.senderId === userId → message từ user → hiển thị bên trái (isFromMe = false)
            // - If message.receiverId === userId → message từ admin (admin gửi cho user) → hiển thị bên phải (isFromMe = true)
            const isFromMe = message.receiverId === userId; // Message từ admin (admin gửi cho user)
            const senderName = message.senderName || 'User';
            const receiverName = message.receiverName || 'Admin';
            const displayName = isFromMe ? 'Admin' : senderName;
            const timeStr = formatTime(new Date(message.createDate));
            
            console.log(`Message ${message.id}: senderId=${message.senderId}, receiverId=${message.receiverId}, userId=${userId}, isFromMe=${isFromMe}`);
            
            html += `
                <div class="d-flex align-items-start mb-3 ${isFromMe ? 'justify-content-end' : 'justify-content-start'}">
                    ${!isFromMe ? `
                        <!-- User avatar (left side) -->
                        <div class="dropdown-list-image mr-2 flex-shrink-0">
                            <div class="d-flex align-items-center bg-primary justify-content-center rounded-circle text-white" style="width: 36px; height: 36px; font-size: 14px; font-weight: 600;">
                                ${senderName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ` : ''}
                    <div class="flex-grow-1 ${isFromMe ? 'text-right' : 'text-left'}" style="max-width: 70%;">
                        ${!isFromMe ? `<div class="small font-weight-bold mb-1 text-dark">${escapeHtml(senderName)}</div>` : ''}
                        <div class="osahan-post-header ${isFromMe ? 'justify-content-end' : ''}" style="display: inline-block; margin: 0;">
                            <p class="mb-0" style="word-wrap: break-word; white-space: pre-wrap;">${escapeHtml(message.content)}</p>
                        </div>
                        <div class="small text-muted mt-1 ${isFromMe ? 'text-right' : 'text-left'}">${timeStr}</div>
                    </div>
                    ${isFromMe ? `
                        <!-- Admin avatar (right side) -->
                        <div class="dropdown-list-image ml-2 flex-shrink-0">
                            <div class="d-flex align-items-center bg-success justify-content-center rounded-circle text-white" style="width: 36px; height: 36px; font-size: 14px; font-weight: 600;">
                                A
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    });
    
    container.html(html);
    
    // Store current conversation ID
    container.data('current-user-id', userId);
    
    // Scroll to bottom with smooth animation
    setTimeout(function() {
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 300);
    }, 100);
}

/**
 * Send message
 */
function sendMessage() {
    const input = $('#admin-chat-input');
    const content = input.val().trim();
    
    if (!content) {
        alert('Vui lòng nhập nội dung tin nhắn!');
        return;
    }
    
    const container = $('.osahan-chat-box');
    const currentUserId = container.data('current-user-id');
    
    if (!currentUserId) {
        alert('Vui lòng chọn một cuộc trò chuyện trước!');
        return;
    }
    
    if (typeof AdminApiService === 'undefined' || typeof AdminApiService.sendMessage !== 'function') {
        console.error("❌ AdminApiService.sendMessage is not defined!");
        return;
    }
    
    // Disable input while sending
    input.prop('disabled', true);
    const sendButton = $('#admin-send-button');
    sendButton.prop('disabled', true);
    
    AdminApiService.sendMessage({
        receiverId: currentUserId,
        content: content
    })
        .done(function(response) {
            console.log("Send message response:", response);
            
            // Clear input and reset height
            input.val('');
            input.css('height', '60px');
            input.prop('disabled', false);
            sendButton.prop('disabled', false);
            
            // Reload conversation
            setTimeout(function() {
                loadConversation(currentUserId);
            }, 300);
            
            // Reload conversations list to update last message
            setTimeout(function() {
                loadConversations();
            }, 500);
        })
        .fail(function(xhr) {
            console.error('Error sending message:', xhr);
            input.prop('disabled', false);
            sendButton.prop('disabled', false);
            
            let errorMsg = 'Không thể gửi tin nhắn! Vui lòng thử lại.';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
        });
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Send message button
    $('#admin-send-button').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        sendMessage();
    });
    
    // Send message on Enter (but allow Shift+Enter for new line)
    $('#admin-chat-input').off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    $('#admin-chat-input').off('input').on('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

/**
 * Show no conversations message
 */
function showNoConversationsMessage() {
    const container = $('.osahan-chat-list');
    if (container.length > 0) {
        // Check if we have network errors
        const hasNetworkError = !lastConversationsLoadSuccess && conversationsLoadRetryCount >= MAX_RETRY_COUNT;
        
        if (hasNetworkError) {
            container.html(`
                <div class="alert alert-warning text-center py-5 m-0">
                    <i class="mdi mdi-alert-circle-outline h3 mb-3" style="color: #ffc107;"></i>
                    <h5>Không thể kết nối đến server</h5>
                    <p class="text-muted mb-3">Vui lòng kiểm tra server có đang chạy không</p>
                    <button class="btn btn-primary btn-sm" onclick="retryLoadConversations()">
                        <i class="mdi mdi-refresh"></i> Thử lại
                    </button>
                </div>
            `);
        } else {
            container.html(`
                <div class="alert alert-info text-center py-5 m-0">
                    <i class="feather-message-square h3 mb-3"></i>
                    <h5>Chưa có cuộc trò chuyện nào</h5>
                    <p class="text-muted mb-0">Các cuộc trò chuyện sẽ xuất hiện ở đây khi users gửi tin nhắn.</p>
                </div>
            `);
        }
    }
}

/**
 * Retry loading conversations manually
 */
function retryLoadConversations() {
    console.log("=== Manual retry requested ===");
    
    // Reset retry count and flags
    conversationsLoadRetryCount = 0;
    lastConversationsLoadSuccess = true;
    networkErrorShown = false;
    isLoadingConversations = false;
    
    // Restart auto-refresh if it was stopped
    if (typeof window.startConversationsRefresh === 'function') {
        window.startConversationsRefresh();
    }
    
    // Load conversations
    loadConversations();
}

// Make function available globally
window.retryLoadConversations = retryLoadConversations;

/**
 * Show no messages message
 */
function showNoMessagesMessage() {
    const container = $('.osahan-chat-box');
    if (container.length > 0) {
        container.html(`
            <div class="text-center py-5 text-muted">
                <i class="feather-message-square h3 mb-3"></i>
                <p>Chọn một cuộc trò chuyện để xem tin nhắn</p>
            </div>
        `);
    }
}

/**
 * Helper: Get current user ID from token
 */
function getCurrentUserId() {
    const token = getToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.sub) return null;
    
    // TODO: Get user ID from token or API
    // For now, return null and let backend handle it
    return null;
}

/**
 * Helper: Format time ago
 */
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
    
    return formatDate(date);
}

/**
 * Helper: Format date
 */
function formatDate(date) {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

/**
 * Helper: Format time
 */
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours12}:${minutesStr}${ampm}`;
}

/**
 * Load unread message count and update badge
 */
function loadUnreadCount() {
    if (typeof AdminApiService === 'undefined' || typeof AdminApiService.getUnreadMessageCount !== 'function') {
        return;
    }
    
    AdminApiService.getUnreadMessageCount()
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data) {
                const count = response.data.count || 0;
                updateUnreadBadge(count);
            }
        })
        .fail(function(xhr, status, error) {
            // Silently fail for unread count - don't show error to user
            if (status !== 'timeout' && !(status === 'error' && xhr.readyState === 0)) {
                console.error('Error loading unread count:', xhr);
            }
        });
}

    /**
     * Update unread badge in navbar
     */
    function updateUnreadBadge(count) {
        // Update badge in messages dropdown
        const badge = $('.osahan-list-dropdown .badge-counter');
        if (badge.length > 0) {
            if (count > 0) {
                badge.text(count).show();
            } else {
                badge.hide();
            }
        }

        // Update badge in sidebar
        const sidebarBadge = $('#sidebar-message-badge');
        if (sidebarBadge.length > 0) {
            if (count > 0) {
                sidebarBadge.text(count).show();
            } else {
                sidebarBadge.hide();
            }
        }
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

