/*
 * User Info Sync - Đồng bộ thông tin user giữa các màn hình
 * Version: 1.0
 */

console.log("=== USER-SYNC.JS LOADED ===");

// Storage keys for user sync
const USER_INFO_KEY = 'userInfo';
const USER_INFO_LAST_UPDATE_KEY = 'userInfoLastUpdate';

// Global user info cache
let cachedUserInfo = null;

/**
 * Load user info from API
 */
function loadUserInfoFromAPI(callback) {
    console.log("=== loadUserInfoFromAPI() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyInfo !== 'function') {
        console.error("❌ ApiService.getMyInfo is not available!");
        if (callback) callback(null);
        return;
    }
    
    ApiService.getMyInfo()
        .done(function(response) {
            console.log("=== User Info API Response ===");
            console.log("Full response:", response);
            
            // Check response format (ApiResponse or ResponseData)
            let userData = null;
            
            if (response && response.result) {
                // ApiResponse format: { code, result, message }
                userData = response.result;
            } else if (response && response.data) {
                // ResponseData format: { status, isSuccess, data, desc }
                userData = response.data;
            } else if (response && response.id) {
                // Direct user object
                userData = response;
            }
            
            if (userData) {
                console.log("✅ User data loaded:", userData);
                cachedUserInfo = userData;
                
                // Save to localStorage for sync
                saveUserInfoToStorage(userData);
                
                // Update UI
                updateUserInfoDisplay(userData);
                
                if (callback) callback(userData);
            } else {
                console.warn("⚠️ No user data found in response");
                if (callback) callback(null);
            }
        })
        .fail(function(xhr) {
            console.error("=== User Info API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", xhr.status);
            
            // If 401, user might not be logged in
            if (xhr.status === 401 || xhr.status === 403) {
                console.warn("⚠️ User not authenticated");
                // Clear cached info
                cachedUserInfo = null;
                clearUserInfoFromStorage();
                // Show default or login prompt
                updateUserInfoDisplay(null);
            }
            
            if (callback) callback(null);
        });
}

/**
 * Save user info to localStorage for sync
 */
function saveUserInfoToStorage(userInfo) {
    try {
        const oldValue = localStorage.getItem(USER_INFO_KEY);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        localStorage.setItem(USER_INFO_LAST_UPDATE_KEY, Date.now().toString());
        
        console.log("✅ User info saved to localStorage");
        
        // Trigger custom event for same-tab sync
        $(document).trigger('userInfoChanged', [userInfo]);
        
        // Force storage event by removing and re-adding (for same-tab sync)
        if (oldValue !== JSON.stringify(userInfo)) {
            setTimeout(function() {
                localStorage.removeItem(USER_INFO_KEY);
                localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
            }, 10);
        }
    } catch (e) {
        console.warn("⚠️ Could not save user info to localStorage:", e);
    }
}

/**
 * Load user info from localStorage
 */
function loadUserInfoFromStorage() {
    try {
        const stored = localStorage.getItem(USER_INFO_KEY);
        if (stored) {
            cachedUserInfo = JSON.parse(stored);
            console.log("✅ User info loaded from localStorage");
            return cachedUserInfo;
        }
    } catch (e) {
        console.warn("⚠️ Could not load user info from localStorage:", e);
        localStorage.removeItem(USER_INFO_KEY);
    }
    return null;
}

/**
 * Clear user info from storage
 */
function clearUserInfoFromStorage() {
    try {
        localStorage.removeItem(USER_INFO_KEY);
        localStorage.removeItem(USER_INFO_LAST_UPDATE_KEY);
        console.log("✅ User info cleared from localStorage");
    } catch (e) {
        console.warn("⚠️ Could not clear user info from localStorage:", e);
    }
}

/**
 * Update user info display in sidebar
 */
function updateUserInfoDisplay(userInfo) {
    console.log("=== updateUserInfoDisplay() called ===");
    console.log("User info:", userInfo);
    
    // Find all user info containers in sidebar
    // Try multiple selectors to ensure we find the container
    let userContainers = $('.user.d-flex.align-items-center');
    if (userContainers.length === 0) {
        userContainers = $('.user');
    }
    if (userContainers.length === 0) {
        userContainers = $('div.user');
    }
    
    console.log("Found", userContainers.length, "user container(s)");
    
    if (userContainers.length === 0) {
        console.warn("⚠️ User info container not found");
        console.warn("Available elements with 'user' class:", $('.user').length);
        return;
    }
    
    userContainers.each(function() {
        const container = $(this);
        const nameElement = container.find('p.mb-0.text-white').first();
        const emailElement = container.find('p.mb-0.text-white-50').first();
        
        if (userInfo) {
            // Update name
            const fullName = userInfo.fullname || userInfo.fullName || userInfo.name || 'User';
            if (nameElement.length) {
                nameElement.text(fullName);
            } else {
                // Create if not exists
                container.find('div').last().prepend(`<p class="mb-0 text-white">${fullName}</p>`);
            }
            
            // Update email
            const email = userInfo.email || userInfo.userName || userInfo.username || '';
            if (emailElement.length) {
                emailElement.text(email);
            } else {
                // Create if not exists
                const nameEl = container.find('p.mb-0.text-white').first();
                if (nameEl.length) {
                    nameEl.after(`<p class="mb-0 text-white-50 small">${email}</p>`);
                }
            }
            
            // Update avatar if exists
            const iconContainer = container.find('.pr-3, .mr-3').first();
            if (userInfo.avatar && userInfo.avatar.trim() !== '') {
                const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:82';
                const avatarUrl = userInfo.avatar.startsWith('http') 
                    ? userInfo.avatar 
                    : `${baseUrl}/uploads/${userInfo.avatar}`;
                
                // Replace icon with avatar image
                if (iconContainer.length) {
                    const img = $('<img>').attr('src', avatarUrl)
                        .addClass('rounded-circle')
                        .css({
                            'width': '40px',
                            'height': '40px',
                            'object-fit': 'cover'
                        })
                        .on('error', function() {
                            $(this).attr('src', 'img/user1.png');
                        });
                    
                    // Replace icon inside the container
                    iconContainer.find('i').remove();
                    iconContainer.html(img);
                }
            }
        } else {
            // Show default/placeholder
            if (nameElement.length) {
                nameElement.text('User');
            }
            if (emailElement.length) {
                emailElement.text('Chưa đăng nhập');
            }
        }
    });
    
    console.log("✅ User info display updated");
}

/**
 * Setup user info sync listeners
 */
function setupUserInfoSync() {
    console.log("=== setupUserInfoSync() called ===");
    
    // Listen for storage events (cross-tab sync)
    $(window).on('storage', function(e) {
        if (e.originalEvent.key === USER_INFO_KEY) {
            console.log("=== User info storage event received (cross-tab sync) ===");
            const newValue = e.originalEvent.newValue;
            if (newValue) {
                try {
                    const userInfo = JSON.parse(newValue);
                    cachedUserInfo = userInfo;
                    updateUserInfoDisplay(userInfo);
                    console.log("✅ User info updated from storage event");
                } catch (e) {
                    console.error("Error parsing user info from storage:", e);
                }
            }
        }
    });
    
    // Listen for custom userInfoChanged event (same-tab sync)
    $(document).on('userInfoChanged', function(e, userInfo) {
        console.log("=== userInfoChanged event received ===");
        cachedUserInfo = userInfo;
        updateUserInfoDisplay(userInfo);
    });
    
    console.log("✅ User info sync initialized");
}

/**
 * Initialize user info sync
 */
// Prevent multiple initializations
let userSyncInitialized = false;

function initUserInfoSync() {
    // Prevent multiple initializations
    if (userSyncInitialized) {
        console.log("⚠️ User sync already initialized, skipping...");
        // But still update display from cache or storage
        const storedUserInfo = loadUserInfoFromStorage();
        if (storedUserInfo) {
            updateUserInfoDisplay(storedUserInfo);
        }
        return;
    }
    
    console.log("=== initUserInfoSync() called ===");
    userSyncInitialized = true;
    
    // Setup sync listeners (only once)
    setupUserInfoSync();
    
    // Try to load from localStorage first (for faster display)
    const storedUserInfo = loadUserInfoFromStorage();
    if (storedUserInfo) {
        console.log("✅ Loading user info from localStorage for fast display");
        cachedUserInfo = storedUserInfo;
        updateUserInfoDisplay(storedUserInfo);
    } else {
        console.log("⚠️ No user info in localStorage, will load from API");
    }
    
    // Then load from API to get latest data
    // Wait for ApiService to be available
    if (typeof ApiService === 'undefined') {
        console.log("⚠️ ApiService not available yet, waiting...");
        let attempts = 0;
        const maxAttempts = 20; // Increase attempts
        const checkApiService = setInterval(function() {
            attempts++;
            if (typeof ApiService !== 'undefined' && typeof ApiService.getMyInfo === 'function') {
                clearInterval(checkApiService);
                console.log("✅ ApiService available, loading user info from API");
                loadUserInfoFromAPI();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkApiService);
                console.error("❌ ApiService not available after", maxAttempts, "attempts");
                // Still try to show cached info
                if (storedUserInfo) {
                    updateUserInfoDisplay(storedUserInfo);
                }
            }
        }, 200);
    } else {
        console.log("✅ ApiService available, loading user info from API");
        loadUserInfoFromAPI();
    }
    
    // Periodically refresh user info (every 2 minutes instead of 5)
    setInterval(function() {
        if (!document.hidden && typeof ApiService !== 'undefined') {
            loadUserInfoFromAPI();
        }
    }, 120000); // 2 minutes
    
    console.log("✅ User info sync initialized");
}

// Initialize when document is ready
$(document).ready(function() {
    console.log("=== User Sync: Document ready ===");
    
    // Wait a bit for other scripts to load
    setTimeout(function() {
        initUserInfoSync();
    }, 300);
});

// Also run immediately if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        initUserInfoSync();
    }, 100);
}

// Run on window load as well
window.addEventListener('load', function() {
    console.log("=== User Sync: Window loaded ===");
    setTimeout(function() {
        initUserInfoSync();
    }, 200);
});

// Also check when page becomes visible (user switches back to tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log("=== User Sync: Page visible ===");
        // Check if we need to refresh user info
        const lastUpdate = localStorage.getItem(USER_INFO_LAST_UPDATE_KEY);
        const now = Date.now();
        if (!lastUpdate || (now - parseInt(lastUpdate)) > 60000) { // Refresh if older than 1 minute
            console.log("User info might be stale, refreshing...");
            if (typeof ApiService !== 'undefined' && typeof ApiService.getMyInfo === 'function') {
                loadUserInfoFromAPI();
            } else {
                // Just update from storage
                const storedUserInfo = loadUserInfoFromStorage();
                if (storedUserInfo) {
                    updateUserInfoDisplay(storedUserInfo);
                }
            }
        }
    }
});

// Export functions for use in other scripts
window.UserSync = {
    loadUserInfo: loadUserInfoFromAPI,
    updateUserInfo: updateUserInfoDisplay,
    getCachedUserInfo: function() { return cachedUserInfo; },
    clearUserInfo: clearUserInfoFromStorage
};

