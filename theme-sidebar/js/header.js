/*
 * Header Script - Load notifications count and handle search
 */

$(document).ready(function() {
    // Load notification count if user is logged in
    loadNotificationCount();
    
    // Setup search handlers if search input exists
    setupHeaderSearch();
});

function loadNotificationCount() {
    const token = getToken();
    if (!token) {
        $('.notification-badge').text('').hide();
        return;
    }
    
    const decoded = decodeToken(token);
    if (decoded && (decoded.userId || decoded.id || decoded.sub)) {
        const userId = decoded.userId || decoded.id || null;
        if (userId && typeof ApiService !== 'undefined') {
            ApiService.getUnreadCount(userId)
                .done(function(response) {
                    if (response && response.isSuccess && response.data && response.data.count !== undefined) {
                        const count = response.data.count;
                        $('.notification-badge').text(count > 0 ? count : '');
                        $('.notification-badge').toggle(count > 0);
                    }
                })
                .fail(function(xhr) {
                    console.error('Error loading notification count:', xhr);
                });
        }
    }
}

function setupHeaderSearch() {
    // Handle search in topbar
    $('.navbar-search input, .topbar-search input').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            const keyword = $(this).val().trim();
            if (keyword) {
                window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
            }
        }
    });
    
    // Handle search button click
    $('.navbar-search button, .topbar-search button').on('click', function() {
        const input = $(this).closest('.input-group').find('input');
        const keyword = input.val().trim();
        if (keyword) {
            window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
        }
    });
}

