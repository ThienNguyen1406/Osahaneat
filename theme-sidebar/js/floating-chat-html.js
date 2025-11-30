/*
 * Floating Chat Box HTML - Include this in all user pages
 * This script adds the floating chat box HTML to the page
 */

(function() {
    // Check if floating chat HTML already exists
    if ($('#floating-chat-button').length > 0) {
        return;
    }
    
    // Add floating chat HTML before closing body tag
    const floatingChatHTML = `
    <!-- Floating Chat Button -->
    <button id="floating-chat-button" title="Chat với admin">
        <i class="mdi mdi-message-text"></i>
        <span id="floating-chat-badge" style="display: none;">0</span>
    </button>
    
    <!-- Floating Chat Box -->
    <div id="floating-chat-box">
        <!-- Header -->
        <div id="floating-chat-header">
            <div id="floating-chat-header-icon">
                <i class="mdi mdi-message-text-outline"></i>
            </div>
            <div id="floating-chat-header-info">
                <p id="floating-chat-header-email">admin@gmail.com</p>
                <p id="floating-chat-header-status">Đang online</p>
            </div>
            <div id="floating-chat-header-actions">
                <button id="floating-chat-minimize" title="Thu nhỏ">
                    <i class="mdi mdi-minus"></i>
                </button>
                <button id="floating-chat-close" title="Đóng">
                    <i class="mdi mdi-close"></i>
                </button>
            </div>
        </div>
        
        <!-- Messages Area -->
        <div id="floating-chat-messages">
            <div class="text-center py-3 text-muted">
                <p class="small mb-0">Đang tải tin nhắn...</p>
            </div>
        </div>
        
        <!-- Input Area -->
        <div id="floating-chat-input-container">
            <textarea id="floating-chat-input" placeholder="Nhập tin nhắn của bạn..." rows="1"></textarea>
            <button id="floating-chat-send" title="Gửi">
                <i class="mdi mdi-send"></i>
            </button>
        </div>
    </div>
    `;
    
    $('body').append(floatingChatHTML);
})();

