/*
 * Inline Chat Widget - Chat trực tiếp với admin
 * Hiển thị trực tiếp trên trang, không phải popup
 */

let inlineChatInitialized = false;
let inlineChatOpen = false;
let currentAdminId = null;
let chatRefreshInterval = null;

// Storage keys for chat sync
const CHAT_OPEN_KEY = 'inlineChatOpen';
const CHAT_LAST_UPDATE_KEY = 'inlineChatLastUpdate';

/**
 * Initialize inline chat
 */
function initInlineChat() {
    if (inlineChatInitialized) {
        return;
    }
    
    console.log("=== initInlineChat() called ===");
    
    // Always show chat widget first - force display
    const widget = $('#inline-chat-widget');
    
    // Remove any inline styles that might hide it and set new inline styles with !important
    widget.attr('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; position: fixed !important; z-index: 99999 !important;');
    widget.show();
    
    // Force show again after a short delay to override any other scripts
    setTimeout(function() {
        widget.attr('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; position: fixed !important; z-index: 99999 !important;');
        widget.show();
    }, 100);
    
    // Also use a MutationObserver to watch for style changes and override them
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const currentStyle = widget.attr('style') || '';
                    if (currentStyle.includes('display: none') || currentStyle.includes('display:none')) {
                        console.log("⚠️ Widget was hidden, forcing display...");
                        widget.attr('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; position: fixed !important; z-index: 99999 !important;');
                    }
                }
            });
        });
        observer.observe(widget[0], { attributes: true, attributeFilter: ['style'] });
    }
    
    // Always setup event handlers first, regardless of authentication
    console.log("✅ Setting up event handlers");
    setupInlineChatHandlers();
    
    // Setup chat sync
    setupChatSync();
    
    // Load chat state from localStorage and apply
    const savedState = loadChatState();
    if (savedState) {
        console.log("Restoring chat state: open");
        // Delay to ensure DOM is ready
        setTimeout(function() {
            applyChatState(true);
        }, 300);
    }
    
    // Check if user is authenticated
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        console.log("⚠️ User not authenticated, but showing chat widget anyway");
        // Still show widget, but disable functionality
        inlineChatInitialized = true;
        return;
    }
    
    // Check if user is admin - don't show chat for admin
    if (typeof isAdmin === 'function' && isAdmin()) {
        console.log("⚠️ User is admin, hiding chat widget");
        $('#inline-chat-widget').hide();
        return;
    }
    
    console.log("✅ Showing chat widget");
    
    inlineChatInitialized = true;
    
    // Load admin ID
    loadAdminInfo();
    
    // Load unread count
    loadInlineChatUnreadCount();
    setInterval(function() {
        loadInlineChatUnreadCount();
    }, 30000);
}

/**
 * Setup event handlers
 */
function setupInlineChatHandlers() {
    console.log("=== setupInlineChatHandlers() called ===");
    
    // Toggle chat box
    $('#inline-chat-toggle').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("✅ Chat toggle button clicked!");
        toggleInlineChat();
    });
    
    // Close chat box
    $('#inline-chat-close').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("✅ Close button clicked!");
        closeInlineChat();
    });
    
    // Also handle click outside chat box to close
    $(document).off('click.inline-chat').on('click.inline-chat', function(e) {
        const widget = $('#inline-chat-widget');
        const chatBox = $('#inline-chat-box');
        const toggle = $('#inline-chat-toggle');
        
        // Don't close if clicking inside chat box or toggle button
        if (widget.length > 0 && chatBox.length > 0 && toggle.length > 0) {
            if (!widget.is(e.target) && widget.has(e.target).length === 0) {
                if (inlineChatOpen && !chatBox.is(e.target) && chatBox.has(e.target).length === 0 && !toggle.is(e.target) && toggle.has(e.target).length === 0) {
                    console.log("Clicking outside chat box, closing...");
                    closeInlineChat();
                }
            }
        }
    });
    
    // Send message
    $('#inline-chat-send').off('click').on('click', function(e) {
        e.preventDefault();
        sendInlineChatMessage();
    });
    
    // Send on Enter (but allow Shift+Enter for new line)
    $('#inline-chat-input').off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendInlineChatMessage();
        }
    });
    
    // Auto-resize textarea
    $('#inline-chat-input').off('input').on('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
}

/**
 * Toggle chat box
 */
function toggleInlineChat() {
    if (inlineChatOpen) {
        closeInlineChat();
    } else {
        openInlineChat();
    }
}

/**
 * Open chat box
 */
function openInlineChat() {
    if (inlineChatOpen) {
        console.log("Chat already open");
        return;
    }
    
    console.log("=== Opening inline chat ===");
    
    const chatBox = $('#inline-chat-box');
    if (chatBox.length === 0) {
        console.error("❌ Chat box element not found!");
        return;
    }
    
    console.log("Chat box found, adding 'show' class");
    chatBox.addClass('show');
    chatBox.css('display', 'flex');
    chatBox.css('visibility', 'visible');
    chatBox.css('opacity', '1');
    inlineChatOpen = true;
    
    // Save state to localStorage for sync
    saveChatState(true);
    
    // Load conversation
    loadInlineChatConversation();
    
    // Start auto refresh
    startInlineChatRefresh();
    
    // Focus input
    setTimeout(function() {
        $('#inline-chat-input').focus();
    }, 300);
}

/**
 * Close chat box
 */
function closeInlineChat() {
    if (!inlineChatOpen) {
        console.log("Chat already closed");
        return;
    }
    
    console.log("=== Closing inline chat ===");
    
    const chatBox = $('#inline-chat-box');
    if (chatBox.length === 0) {
        console.error("❌ Chat box element not found!");
        return;
    }
    
    console.log("Removing 'show' class and hiding chat box");
    chatBox.removeClass('show');
    chatBox.css('display', 'none');
    chatBox.css('visibility', 'hidden');
    chatBox.css('opacity', '0');
    inlineChatOpen = false;
    
    // Save state to localStorage for sync
    saveChatState(false);
    
    // Stop auto refresh
    stopInlineChatRefresh();
    
    console.log("✅ Chat box closed");
}

/**
 * Save chat state to localStorage
 */
function saveChatState(isOpen) {
    try {
        const oldValue = localStorage.getItem(CHAT_OPEN_KEY);
        localStorage.setItem(CHAT_OPEN_KEY, isOpen ? 'true' : 'false');
        localStorage.setItem(CHAT_LAST_UPDATE_KEY, Date.now().toString());
        console.log("✅ Chat state saved to localStorage:", isOpen);
        
        // Trigger custom event for same-tab sync
        $(document).trigger('chatStateChanged', [isOpen]);
        
        // Force storage event by removing and re-adding (for same-tab sync)
        if (oldValue !== (isOpen ? 'true' : 'false')) {
            setTimeout(function() {
                localStorage.removeItem(CHAT_OPEN_KEY);
                localStorage.setItem(CHAT_OPEN_KEY, isOpen ? 'true' : 'false');
            }, 10);
        }
    } catch (e) {
        console.warn("⚠️ Could not save chat state to localStorage:", e);
    }
}

/**
 * Load chat state from localStorage
 */
function loadChatState() {
    try {
        const savedState = localStorage.getItem(CHAT_OPEN_KEY);
        if (savedState === 'true') {
            console.log("✅ Chat state loaded from localStorage: open");
            return true;
        } else {
            console.log("✅ Chat state loaded from localStorage: closed");
            return false;
        }
    } catch (e) {
        console.warn("⚠️ Could not load chat state from localStorage:", e);
        return false;
    }
}

/**
 * Apply chat state (open or close)
 */
function applyChatState(isOpen) {
    if (isOpen === inlineChatOpen) {
        return; // Already in correct state
    }
    
    if (isOpen) {
        // Open chat box without triggering save (to avoid loop)
        const chatBox = $('#inline-chat-box');
        if (chatBox.length > 0) {
            chatBox.addClass('show');
            chatBox.css('display', 'flex');
            chatBox.css('visibility', 'visible');
            chatBox.css('opacity', '1');
            inlineChatOpen = true;
            
            // Load conversation
            loadInlineChatConversation();
            
            // Start auto refresh
            startInlineChatRefresh();
            
            console.log("✅ Chat box opened from sync");
        }
    } else {
        // Close chat box without triggering save (to avoid loop)
        const chatBox = $('#inline-chat-box');
        if (chatBox.length > 0) {
            chatBox.removeClass('show');
            chatBox.css('display', 'none');
            chatBox.css('visibility', 'hidden');
            chatBox.css('opacity', '0');
            inlineChatOpen = false;
            
            // Stop auto refresh
            stopInlineChatRefresh();
            
            console.log("✅ Chat box closed from sync");
        }
    }
}

/**
 * Load staff/admin info for chat
 * User can chat with staff for order support
 */
function loadAdminInfo(callback) {
    console.log("=== loadAdminInfo() called ===");
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        updateInlineChatHeader('Nhân viên hỗ trợ');
        if (callback) callback();
        return;
    }
    
    // First, try to get staff from conversations (already chatted)
    if (typeof ApiService.getConversations === 'function') {
        ApiService.getConversations()
            .done(function(response) {
                console.log("=== Conversations response ===");
                console.log("Response:", response);
                
                if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                    if (response.data.length > 0) {
                        // Get first staff/admin from conversations
                        const firstConversation = response.data[0];
                        currentAdminId = firstConversation.userId || firstConversation.id || firstConversation.user?.id;
                        const email = firstConversation.userName || firstConversation.userEmail || firstConversation.fullName || firstConversation.user?.userName || 'Nhân viên hỗ trợ';
                        const name = firstConversation.fullName || firstConversation.userName || firstConversation.user?.fullName || 'Nhân viên hỗ trợ';
                        
                        console.log("✅ Loaded staff/admin ID from conversations:", currentAdminId);
                        console.log("✅ Staff/admin name:", name);
                        
                        updateInlineChatHeader(name || email);
                        if (callback) callback();
                        return;
                    }
                }
                
                // No conversations found, try to get available staff users
                console.log("⚠️ No conversations found, trying to get available staff users...");
                loadAvailableStaffUsers(callback);
            })
            .fail(function(xhr, status, error) {
                console.error('=== Error loading conversations ===');
                console.error('XHR:', xhr);
                console.error('Status:', status);
                console.error('Error:', error);
                
                // Try to get available staff users as fallback
                console.log("Trying to get available staff users as fallback...");
                loadAvailableStaffUsers(callback);
            });
    } else {
        // Fallback: try to get available staff users directly
        loadAvailableStaffUsers(callback);
    }
}

/**
 * Load available staff users (not requiring previous conversation)
 */
function loadAvailableStaffUsers(callback) {
    console.log("=== loadAvailableStaffUsers() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getAvailableStaffUsers !== 'function') {
        console.warn("⚠️ ApiService.getAvailableStaffUsers is not available");
        currentAdminId = null;
        updateInlineChatHeader('Nhân viên hỗ trợ');
        if (callback) callback();
        return;
    }
    
    ApiService.getAvailableStaffUsers()
        .done(function(response) {
            console.log("=== Available staff users response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.data:", response?.data);
            console.log("Response.data type:", typeof response?.data);
            console.log("Is array:", Array.isArray(response?.data));
            
            if (response && (response.isSuccess === true || response.success === true) && response.data) {
                const staffList = Array.isArray(response.data) ? response.data : [];
                console.log("Staff list length:", staffList.length);
                
                if (staffList.length > 0) {
                    // Get first available staff user
                    const firstStaff = staffList[0];
                    console.log("First staff object:", firstStaff);
                    
                    currentAdminId = firstStaff.id || firstStaff.userId || firstStaff.user?.id;
                    const email = firstStaff.userName || firstStaff.userEmail || firstStaff.email || firstStaff.fullName || 'Nhân viên hỗ trợ';
                    const name = firstStaff.fullName || firstStaff.userName || 'Nhân viên hỗ trợ';
                    
                    console.log("✅ Loaded available staff ID:", currentAdminId);
                    console.log("✅ Staff name:", name);
                    console.log("✅ Staff email:", email);
                    
                    if (currentAdminId) {
                        updateInlineChatHeader(name || email);
                    } else {
                        console.error("❌ Staff ID is null or undefined after parsing");
                        currentAdminId = null;
                        updateInlineChatHeader('Nhân viên hỗ trợ');
                    }
                } else {
                    console.warn("⚠️ No available staff users found in response");
                    console.warn("Response data:", response.data);
                    currentAdminId = null;
                    updateInlineChatHeader('Nhân viên hỗ trợ');
                }
            } else {
                console.warn("⚠️ Invalid available staff users response format");
                console.warn("Response:", response);
                currentAdminId = null;
                updateInlineChatHeader('Nhân viên hỗ trợ');
            }
            if (callback) callback();
        })
        .fail(function(xhr, status, error) {
            console.error('=== Error loading available staff users ===');
            console.error('XHR:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Status Code:', xhr.status);
            console.error('Response Text:', xhr.responseText);
            console.error('Response JSON:', xhr.responseJSON);
            
            // If 401 or 403, user might not be authenticated
            if (xhr.status === 401) {
                console.error("❌ Unauthorized - user not logged in");
            } else if (xhr.status === 403) {
                console.error("❌ Forbidden - no permission");
            } else if (xhr.status === 404) {
                console.error("❌ Endpoint not found - API might not be available");
            }
            
            currentAdminId = null;
            updateInlineChatHeader('Nhân viên hỗ trợ');
            if (callback) callback();
        });
}

/**
 * Update chat header
 */
function updateInlineChatHeader(email) {
    const emailText = email || 'admin@gmail.com';
    $('.inline-chat-header-email').text(emailText);
}

/**
 * Load conversation with staff/admin
 */
function loadInlineChatConversation() {
    if (!currentAdminId) {
        console.log("Staff/Admin ID not available, loading staff info...");
        loadAdminInfo(function() {
            if (currentAdminId) {
                console.log("Staff/Admin ID loaded, loading conversation...");
                loadInlineChatConversation();
            } else {
                console.log("⚠️ Could not load staff/admin ID, showing empty conversation");
                renderInlineChatMessages([]);
            }
        });
        return;
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getConversation !== 'function') {
        console.error("❌ ApiService.getConversation is not defined!");
        renderInlineChatMessages([]);
        return;
    }
    
    console.log("Loading conversation with staff/admin ID:", currentAdminId);
    
    ApiService.getConversation(currentAdminId)
        .done(function(response) {
            console.log("Conversation response:", response);
            if (response && (response.isSuccess || response.success) && response.data) {
                const messages = Array.isArray(response.data) ? response.data : [];
                console.log("✅ Loaded", messages.length, "messages");
                renderInlineChatMessages(messages);
            } else {
                console.log("⚠️ Invalid response format, showing empty");
                renderInlineChatMessages([]);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('=== Error loading conversation ===');
            console.error('XHR:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Status Code:', xhr.status);
            console.error('Ready State:', xhr.readyState);
            
            // Handle network errors gracefully
            if (xhr.status === 0 || (status === 'error' && xhr.readyState === 0)) {
                console.error("❌ Network error: Server not reachable");
                // Show message in chat box
                const container = $('.inline-chat-messages');
                if (container.length > 0) {
                    container.html(`
                        <div class="text-center py-5 text-muted">
                            <i class="mdi mdi-alert-circle-outline" style="font-size: 48px; color: #ffc107; margin-bottom: 16px;"></i>
                            <p class="mb-0" style="font-size: 14px; color: #dc3545;">Không thể kết nối đến server.</p>
                            <p class="mb-0 small" style="font-size: 12px; margin-top: 8px;">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
                        </div>
                    `);
                }
            } else {
                renderInlineChatMessages([]);
            }
        });
}

/**
 * Render messages
 */
function renderInlineChatMessages(messages) {
    const container = $('.inline-chat-messages');
    if (container.length === 0) {
        return;
    }
    
    container.empty();
    
    if (!messages || messages.length === 0) {
        container.html(`
            <div class="text-center py-5 text-muted">
                <i class="mdi mdi-message-text-outline" style="font-size: 48px; color: #adb5bd; margin-bottom: 16px;"></i>
                <p class="mb-0" style="font-size: 14px;">Chưa có tin nhắn. Gửi tin nhắn đầu tiên để bắt đầu!</p>
            </div>
        `);
        return;
    }
    
    const currentUserId = getUserIdFromToken();
    console.log("=== renderInlineChatMessages ===");
    console.log("Current User ID:", currentUserId);
    console.log("Messages count:", messages.length);
    
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
        const dateStr = formatInlineChatDate(date);
        
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
            // Logic: 
            // - Nếu message.senderId === currentUserId → message từ user → hiển thị bên trái (received)
            // - Nếu message.senderId !== currentUserId → message từ admin → hiển thị bên phải (sent)
            const isFromUser = message.senderId === currentUserId;
            const time = new Date(message.createDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            console.log(`Message ${message.id}: senderId=${message.senderId}, currentUserId=${currentUserId}, isFromUser=${isFromUser}, class=${isFromUser ? 'received' : 'sent'}`);
            
            // User messages: bên trái (received)
            // Admin messages: bên phải (sent)
            const messageHtml = `
                <div class="inline-chat-message ${isFromUser ? 'received' : 'sent'}">
                    <div class="inline-chat-message-content">
                        ${escapeHtml(message.content)}
                    </div>
                    <div class="inline-chat-message-time">${time}</div>
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
 * Format date for inline chat
 */
function formatInlineChatDate(date) {
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
 * Send message to staff for order support
 */
function sendInlineChatMessage() {
    const input = $('#inline-chat-input');
    const content = input.val().trim();
    
    if (!content) {
        console.log("⚠️ Empty message content, not sending");
        return;
    }
    
    console.log("=== sendInlineChatMessage() called ===");
    console.log("Content:", content);
    console.log("Current Staff/Admin ID:", currentAdminId);
    
    if (typeof ApiService === 'undefined' || typeof ApiService.sendMessage !== 'function') {
        console.error("❌ ApiService.sendMessage is not defined!");
        alert('Chức năng gửi tin nhắn chưa được triển khai!');
        return;
    }
    
    // Check authentication
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        console.error("❌ User not authenticated!");
        alert('Vui lòng đăng nhập để gửi tin nhắn!');
        return;
    }
    
    // If no staff ID, try to load it first
    if (!currentAdminId) {
        console.log("⚠️ No staff ID available, loading staff info...");
        
        // Disable input while loading
        input.prop('disabled', true);
        sendButton.prop('disabled', true);
        const originalButtonHtml = sendButton.html();
        sendButton.html('<i class="mdi mdi-loading mdi-spin"></i>');
        
        loadAdminInfo(function() {
            // Re-enable input
            input.prop('disabled', false);
            sendButton.prop('disabled', false);
            sendButton.html(originalButtonHtml);
            
            if (currentAdminId) {
                console.log("✅ Staff ID loaded, retrying to send message...");
                // Retry sending after loading staff ID
                sendInlineChatMessage();
            } else {
                console.error("❌ Still no staff ID after loading");
                
                // Try one more time with a different approach - get any staff user
                console.log("Trying alternative method to find staff...");
                
                // Try to get staff from admin endpoint or any other method
                if (typeof ApiService !== 'undefined' && typeof ApiService.getAvailableStaffUsers === 'function') {
                    ApiService.getAvailableStaffUsers()
                        .done(function(response) {
                            console.log("Alternative staff search response:", response);
                            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data) && response.data.length > 0) {
                                const firstStaff = response.data[0];
                                currentAdminId = firstStaff.id || firstStaff.userId;
                                console.log("✅ Found staff via alternative method:", currentAdminId);
                                
                                if (currentAdminId) {
                                    // Retry sending
                                    sendInlineChatMessage();
                                } else {
                                    alert('Không thể tìm thấy nhân viên hỗ trợ. Vui lòng thử lại sau hoặc liên hệ quản trị viên!');
                                }
                            } else {
                                alert('Hiện tại không có nhân viên hỗ trợ online. Vui lòng thử lại sau!');
                            }
                        })
                        .fail(function(xhr) {
                            const isNetworkError = xhr.status === 0 || (xhr.readyState === 0);
                            if (!isNetworkError) {
                                console.error("Alternative staff search failed:", xhr);
                            } else {
                                console.warn("⚠️ Network error - cannot load staff users");
                            }
                            // Only show alert if not a network error (to avoid spam)
                            if (!isNetworkError) {
                                alert('Không thể tìm thấy nhân viên hỗ trợ. Vui lòng thử lại sau!');
                            }
                        });
                } else {
                    alert('Không thể tìm thấy nhân viên hỗ trợ. Vui lòng thử lại sau!');
                }
            }
        });
        return;
    }
    
    // Disable input while sending
    input.prop('disabled', true);
    const sendButton = $('#inline-chat-send');
    sendButton.prop('disabled', true);
    
    // Prepare message data with receiverId (staff ID)
    const messageData = {
        content: content,
        receiverId: currentAdminId  // Send to staff/admin
    };
    
    console.log("Sending message data:", messageData);
    console.log("API URL:", `${API_BASE_URL}/message`);
    
    ApiService.sendMessage(messageData)
        .done(function(response) {
            console.log("✅ Send message success:", response);
            
            // Clear input and reset height
            input.val('');
            input.css('height', '40px');
            input.prop('disabled', false);
            sendButton.prop('disabled', false);
            
            // Reload conversation
            setTimeout(function() {
                loadInlineChatConversation();
            }, 300);
            
            // Update unread count
            loadInlineChatUnreadCount();
        })
        .fail(function(xhr, status, error) {
            console.error('=== Error sending message ===');
            console.error('XHR:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Status Code:', xhr.status);
            console.error('Response Text:', xhr.responseText);
            console.error('Response JSON:', xhr.responseJSON);
            
            input.prop('disabled', false);
            sendButton.prop('disabled', false);
            
            let errorMsg = 'Không thể gửi tin nhắn! Vui lòng thử lại.';
            
            // Try to parse error message
            if (xhr.responseJSON) {
                if (xhr.responseJSON.desc) {
                    errorMsg = xhr.responseJSON.desc;
                } else if (xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
            } else if (xhr.responseText) {
                try {
                    const errorObj = JSON.parse(xhr.responseText);
                    if (errorObj.desc) {
                        errorMsg = errorObj.desc;
                    } else if (errorObj.message) {
                        errorMsg = errorObj.message;
                    }
                } catch (e) {
                    console.warn("Could not parse responseText as JSON");
                }
            }
            
            // Handle specific status codes
            if (xhr.status === 400) {
                errorMsg = errorMsg || "Thông tin không hợp lệ. Vui lòng kiểm tra lại!";
            } else if (xhr.status === 401) {
                errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
                setTimeout(function() {
                    window.location.href = 'signin.html';
                }, 2000);
            } else if (xhr.status === 403) {
                errorMsg = "Bạn không có quyền gửi tin nhắn!";
            }
            
            alert(errorMsg);
        });
}

/**
 * Load unread count
 */
function loadInlineChatUnreadCount() {
    if (typeof ApiService === 'undefined' || typeof ApiService.getUnreadMessageCount !== 'function') {
        return;
    }
    
    ApiService.getUnreadMessageCount()
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data) {
                const count = response.data.count || 0;
                updateInlineChatBadge(count);
            }
        })
            .fail(function(xhr) {
                const isNetworkError = xhr.status === 0 || (xhr.readyState === 0);
                if (!isNetworkError) {
                    console.error('Error loading unread count:', xhr);
                }
                // Silently fail on network errors to avoid spam
            });
}

/**
 * Update badge
 */
function updateInlineChatBadge(count) {
    const badge = $('#inline-chat-badge');
    if (count > 0) {
        badge.text(count).show();
    } else {
        badge.hide();
    }
}

/**
 * Start auto refresh
 */
function startInlineChatRefresh() {
    stopInlineChatRefresh();
    chatRefreshInterval = setInterval(function() {
        if (inlineChatOpen && currentAdminId) {
            loadInlineChatConversation();
        }
    }, 10000); // Refresh every 10 seconds
}

/**
 * Stop auto refresh
 */
function stopInlineChatRefresh() {
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
}

/**
 * Helper: Get token
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Helper: Decode token
 */
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
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
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Setup chat sync with storage events
 */
function setupChatSync() {
    console.log("=== Setting up chat sync ===");
    
    // Listen for storage events (cross-tab sync)
    $(window).on('storage', function(e) {
        if (e.originalEvent.key === CHAT_OPEN_KEY) {
            console.log("=== Chat storage event received (cross-tab sync) ===");
            const newState = e.originalEvent.newValue === 'true';
            console.log("New chat state from storage:", newState);
            
            // Apply state without saving (to avoid loop)
            applyChatState(newState);
        }
    });
    
    // Also listen for custom chatStateChanged event (same-tab sync)
    $(document).on('chatStateChanged', function(e, isOpen) {
        console.log("=== chatStateChanged event received ===");
        console.log("Chat state:", isOpen);
        // State is already applied, just log
    });
    
    console.log("✅ Chat sync initialized");
}

// Force show widget immediately
function forceShowChatWidget() {
    const widget = $('#inline-chat-widget');
    if (widget.length > 0) {
        widget.attr('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; position: fixed !important; z-index: 99999 !important; bottom: 20px !important; right: 20px !important;');
        widget.show();
        console.log("✅ Force showing chat widget");
        
        // Also ensure event handlers are setup
        if (!inlineChatInitialized) {
            console.log("Setting up event handlers in forceShowChatWidget");
            setupInlineChatHandlers();
        }
    }
}

// Initialize when document is ready
$(document).ready(function() {
    console.log("=== Inline Chat: Document ready ===");
    
    // Force show immediately
    forceShowChatWidget();
    
    // Wait a bit for other scripts to load
    setTimeout(function() {
        initInlineChat();
        forceShowChatWidget();
    }, 500);
    
    // Force show again after longer delay
    setTimeout(function() {
        forceShowChatWidget();
    }, 1000);
    
    // Force show every 2 seconds to override any hiding
    setInterval(function() {
        const widget = $('#inline-chat-widget');
        if (widget.length > 0) {
            const currentStyle = widget.attr('style') || '';
            if (currentStyle.includes('display: none') || currentStyle.includes('display:none') || widget.is(':hidden')) {
                console.log("⚠️ Widget was hidden, forcing display...");
                forceShowChatWidget();
            }
        }
    }, 2000);
});

// Also run on window load
window.addEventListener('load', function() {
    console.log("=== Inline Chat: Window loaded ===");
    setTimeout(function() {
        forceShowChatWidget();
        initInlineChat();
    }, 100);
});

// Run immediately if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        forceShowChatWidget();
        initInlineChat();
    }, 100);
}

