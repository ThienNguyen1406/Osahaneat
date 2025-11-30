/*
 * Cart Sync - Đồng bộ giỏ hàng giữa các trang
 * Sử dụng localStorage và storage events để đồng bộ
 */

console.log("=== CART-SYNC.JS LOADED ===");

// Cart Sync Service
const CartSync = {
    // Storage key for cart count
    CART_COUNT_KEY: 'cartItemCount',
    CART_LAST_UPDATE_KEY: 'cartLastUpdate',
    
    // Network error tracking
    networkErrorCount: 0,
    lastNetworkErrorTime: 0,
    isNetworkError: false,
    retryDelay: 5000, // Start with 5 seconds
    
    /**
     * Update cart badge count on all pages
     * @param {number} count - Number of items in cart
     */
    updateCartBadge: function(count) {
        console.log("=== updateCartBadge() called ===");
        console.log("Cart count:", count);
        
        // Update badge in topbar (cart icon)
        const cartBadge = $('.cart-badge, .cart-count, [data-cart-count]');
        if (cartBadge.length > 0) {
            cartBadge.text(count > 0 ? count : '');
            cartBadge.toggle(count > 0);
            cartBadge.css('display', count > 0 ? 'inline-block' : 'none');
            console.log("✅ Cart badge updated:", count);
        } else {
            // Try to find cart icon and add badge if not exists
            const cartIcon = $('a[data-target="#cartModal"], .btn-danger[data-target="#cartModal"], a[href="#cartModal"]');
            if (cartIcon.length > 0) {
                // Check if badge already exists
                let badge = cartIcon.find('.cart-badge');
                if (badge.length === 0) {
                    // Create badge
                    badge = $('<span class="cart-badge rounded-circle bg-danger text-white position-absolute px-1 small" style="top: -5px; right: -5px; font-size: 0.7rem; min-width: 18px; height: 18px; line-height: 18px; text-align: center;"></span>');
                    cartIcon.css('position', 'relative').append(badge);
                }
                badge.text(count > 0 ? count : '');
                badge.toggle(count > 0);
                badge.css('display', count > 0 ? 'inline-block' : 'none');
                console.log("✅ Cart badge created and updated:", count);
            } else {
                console.warn("⚠️ Cart icon not found for badge");
            }
        }
        
        // Update cart modal title if visible
        const cartModal = $('#cartModal');
        if (cartModal.length) {
            const title = cartModal.find('.modal-title');
            if (title.length) {
                title.html(`Giỏ hàng của tôi <span class="small">(${count} ${count === 1 ? 'món' : 'món'})</span>`);
            }
        }
        
        // Save to localStorage for sync across tabs
        // Use setItem + removeItem trick to trigger storage event in same tab
        const oldValue = localStorage.getItem(this.CART_COUNT_KEY);
        localStorage.setItem(this.CART_COUNT_KEY, count.toString());
        localStorage.setItem(this.CART_LAST_UPDATE_KEY, Date.now().toString());
        
        // Force storage event by removing and re-adding (for same-tab sync)
        if (oldValue !== count.toString()) {
            localStorage.removeItem(this.CART_COUNT_KEY);
            localStorage.setItem(this.CART_COUNT_KEY, count.toString());
        }
        
        // Trigger custom event for other scripts
        $(document).trigger('cartUpdated', [count]);
        
        console.log("✅ Cart badge synced to localStorage");
    },
    
    /**
     * Get cart count from localStorage
     * @returns {number} Cart item count
     */
    getCartCount: function() {
        const count = localStorage.getItem(this.CART_COUNT_KEY);
        return count ? parseInt(count) : 0;
    },
    
    /**
     * Load cart count from API and update badge
     */
    loadCartCount: function() {
        // Check if we're in a network error state and should skip
        const now = Date.now();
        if (this.isNetworkError) {
            const timeSinceLastError = now - this.lastNetworkErrorTime;
            if (timeSinceLastError < this.retryDelay) {
                // Skip this call, will retry later
                return;
            }
            // Reset error state after retry delay
            this.isNetworkError = false;
            this.networkErrorCount = 0;
            this.retryDelay = 5000; // Reset to initial delay
        }
        
        // Check if browser is online
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            console.warn("⚠️ Browser is offline, skipping cart count load");
            this.isNetworkError = true;
            this.lastNetworkErrorTime = now;
            return;
        }
        
        console.log("=== loadCartCount() called ===");
        
        // Get user ID
        const userId = this.getUserId();
        if (!userId) {
            console.log("No user ID, setting cart count to 0");
            this.updateCartBadge(0);
            return;
        }
        
        if (typeof ApiService === 'undefined' || typeof ApiService.getCart !== 'function') {
            console.warn("⚠️ ApiService.getCart not available");
            return;
        }
        
        // Only log on first call or when not in error state
        if (!this.isNetworkError) {
            console.log("Calling ApiService.getCart() to get cart count...");
            console.log("User ID:", userId, "Type:", typeof userId);
        }
        
        // Validate userId before making request
        if (!userId || userId <= 0) {
            console.warn("⚠️ Invalid userId, setting cart count to 0");
            CartSync.updateCartBadge(0);
            return;
        }
        
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("⚠️ No token found, setting cart count to 0");
            CartSync.updateCartBadge(0);
            return;
        }
        
        ApiService.getCart(userId)
            .done(function(response) {
                console.log("=== Cart Count API Response ===");
                console.log("Full response:", response);
                
                const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
                const cart = response && response.data;
                
                if (isSuccess && cart) {
                    const itemCount = cart.itemCount || (cart.items ? cart.items.length : 0);
                    console.log("✅ Cart count loaded:", itemCount);
                    CartSync.updateCartBadge(itemCount);
                } else {
                    console.warn("⚠️ Cart response invalid, setting count to 0");
                    CartSync.updateCartBadge(0);
                }
            })
            .fail(function(xhr, status, error) {
                const isNetworkError = xhr.status === 0 || (status === 'error' && xhr.readyState === 0);
                
                // Only log detailed error on first occurrence or non-network errors
                if (!isNetworkError || CartSync.networkErrorCount === 0) {
                    console.error("=== Cart Count API Error ===");
                    if (!isNetworkError) {
                        console.error("XHR:", xhr);
                        console.error("Status:", status);
                        console.error("Error:", error);
                        console.error("Status Code:", xhr.status);
                        console.error("Ready State:", xhr.readyState);
                        console.error("Response Text:", xhr.responseText);
                    } else {
                        console.error("Network error - backend not available or connection lost");
                    }
                }
                
                // Handle specific error cases
                if (xhr.status === 401) {
                    if (CartSync.networkErrorCount === 0) {
                        console.warn("⚠️ Unauthorized - user not logged in");
                    }
                    CartSync.updateCartBadge(0);
                    CartSync.isNetworkError = false; // Reset on auth errors
                    CartSync.networkErrorCount = 0;
                } else if (xhr.status === 403) {
                    if (CartSync.networkErrorCount === 0) {
                        console.warn("⚠️ Forbidden - no permission");
                    }
                    CartSync.updateCartBadge(0);
                    CartSync.isNetworkError = false; // Reset on auth errors
                    CartSync.networkErrorCount = 0;
                } else if (isNetworkError) {
                    // Network error - implement exponential backoff
                    CartSync.networkErrorCount++;
                    CartSync.lastNetworkErrorTime = Date.now();
                    CartSync.isNetworkError = true;
                    
                    // Exponential backoff: 5s, 10s, 20s, 30s (max)
                    CartSync.retryDelay = Math.min(5000 * Math.pow(2, Math.min(CartSync.networkErrorCount - 1, 2)), 30000);
                    
                    if (CartSync.networkErrorCount === 1) {
                        console.warn("⚠️ Network error detected. Will retry in " + (CartSync.retryDelay / 1000) + " seconds");
                        console.warn("⚠️ Keeping current cart count to avoid flickering");
                    }
                    // Don't update badge on network errors to avoid flickering
                } else {
                    // On other errors, set count to 0
                    if (CartSync.networkErrorCount === 0) {
                        console.warn("⚠️ API error, setting cart count to 0");
                    }
                    CartSync.updateCartBadge(0);
                    CartSync.isNetworkError = false; // Reset on other errors
                    CartSync.networkErrorCount = 0;
                }
            });
    },
    
    /**
     * Get user ID from token or localStorage
     * @returns {number|null} User ID
     */
    getUserId: function() {
        // Try localStorage first
        const cachedId = localStorage.getItem('userId');
        if (cachedId) {
            const parsedId = parseInt(cachedId);
            if (!isNaN(parsedId) && parsedId > 0 && !cachedId.includes('@')) {
                return parsedId;
            }
        }
        
        // Try to get from token
        try {
            const token = getToken();
            if (token) {
                const decoded = decodeToken(token);
                if (decoded && decoded.sub) {
                    const userId = decoded.userId || decoded.id || decoded.sub;
                    if (userId && !isNaN(parseInt(userId))) {
                        return parseInt(userId);
                    }
                }
            }
        } catch (e) {
            console.error("Error getting userId from token:", e);
        }
        
        return null;
    },
    
    /**
     * Initialize cart sync
     */
    init: function() {
        console.log("=== CartSync.init() called ===");
        
        // Load cart count on page load
        this.loadCartCount();
        
        // Listen for storage events (cross-tab sync)
        $(window).on('storage', function(e) {
            if (e.originalEvent.key === CartSync.CART_COUNT_KEY) {
                console.log("=== Storage event received (cross-tab sync) ===");
                const newCount = e.originalEvent.newValue ? parseInt(e.originalEvent.newValue) : 0;
                console.log("New cart count from storage:", newCount);
                // Only update badge, don't save again to avoid loop
                const cartBadge = $('.cart-badge, .cart-count, [data-cart-count]');
                if (cartBadge.length > 0) {
                    cartBadge.text(newCount > 0 ? newCount : '');
                    cartBadge.toggle(newCount > 0);
                    cartBadge.css('display', newCount > 0 ? 'inline-block' : 'none');
                } else {
                    const cartIcon = $('a[data-target="#cartModal"], .btn-danger[data-target="#cartModal"]');
                    if (cartIcon.length > 0) {
                        let badge = cartIcon.find('.cart-badge');
                        if (badge.length === 0) {
                            badge = $('<span class="cart-badge rounded-circle bg-danger text-white position-absolute px-1 small" style="top: -5px; right: -5px; font-size: 0.7rem; min-width: 18px; height: 18px; line-height: 18px; text-align: center;"></span>');
                            cartIcon.css('position', 'relative').append(badge);
                        }
                        badge.text(newCount > 0 ? newCount : '');
                        badge.toggle(newCount > 0);
                        badge.css('display', newCount > 0 ? 'inline-block' : 'none');
                    }
                }
                
                // Update cart modal title
                const cartModal = $('#cartModal');
                if (cartModal.length) {
                    const title = cartModal.find('.modal-title');
                    if (title.length) {
                        title.html(`Giỏ hàng của tôi <span class="small">(${newCount} ${newCount === 1 ? 'món' : 'món'})</span>`);
                    }
                }
                
                console.log("✅ Cart badge updated from storage event");
            }
        });
        
        // Listen for custom cartUpdated event
        $(document).on('cartUpdated', function(e, count) {
            console.log("=== cartUpdated event received ===");
            console.log("Cart count:", count);
            // Badge is already updated by the event trigger
            // cart.js will handle reloading cart if modal is open
        });
        
        // Listen for cart modal open to refresh count and reload cart
        $('#cartModal').on('show.bs.modal', function() {
            console.log("Cart modal opened, refreshing cart count and reloading cart...");
            CartSync.loadCartCount();
            // Also reload cart if CartService is available
            // Note: cart.js already loads cart on show.bs.modal, so we don't need to reload here
            // Just update the count
        });
        
        // Listen for page visibility change to refresh cart when tab becomes active
        $(document).on('visibilitychange', function() {
            if (!document.hidden) {
                console.log("Page became visible, refreshing cart count...");
                CartSync.loadCartCount();
            }
        });
        
        // Periodically check for cart updates (every 5 seconds when page is visible)
        setInterval(function() {
            if (!document.hidden) {
                // Skip if we're in network error state
                if (CartSync.isNetworkError) {
                    const timeSinceLastError = Date.now() - CartSync.lastNetworkErrorTime;
                    if (timeSinceLastError < CartSync.retryDelay) {
                        return; // Skip this interval
                    }
                }
                
                const lastUpdate = localStorage.getItem(CartSync.CART_LAST_UPDATE_KEY);
                if (lastUpdate) {
                    const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
                    // Only refresh if last update was more than 2 seconds ago (to avoid too frequent calls)
                    if (timeSinceUpdate > 2000) {
                        CartSync.loadCartCount();
                    }
                }
            }
        }, 5000);
        
        // Listen for online/offline events
        if (typeof window !== 'undefined') {
            window.addEventListener('online', function() {
                console.log("✅ Network connection restored");
                CartSync.isNetworkError = false;
                CartSync.networkErrorCount = 0;
                CartSync.retryDelay = 5000;
                // Immediately try to load cart count
                setTimeout(function() {
                    CartSync.loadCartCount();
                }, 1000);
            });
            
            window.addEventListener('offline', function() {
                console.warn("⚠️ Network connection lost");
                CartSync.isNetworkError = true;
                CartSync.lastNetworkErrorTime = Date.now();
            });
        }
        
        console.log("✅ CartSync initialized");
    }
};

// Initialize on document ready
$(document).ready(function() {
    // Wait for ApiService to be available
    if (typeof ApiService === 'undefined') {
        setTimeout(function() {
            if (typeof ApiService !== 'undefined') {
                CartSync.init();
            }
        }, 500);
    } else {
        CartSync.init();
    }
});

// Export for global use
window.CartSync = CartSync;

