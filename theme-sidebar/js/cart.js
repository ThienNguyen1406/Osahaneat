/*
 * Cart Page - Load and manage shopping cart from API
 * Version: 1.1 - Fixed user ID extraction from API
 */

console.log("=== CART.JS LOADED ===");

// Helper function to get user ID from token or API
// Cache user ID to avoid multiple API calls
// Use window object to avoid duplicate declaration when multiple scripts are loaded
if (typeof window.cachedUserId === 'undefined') {
    window.cachedUserId = null;
}

function getUserIdFromToken() {
    // Return cached user ID if available
    if (window.cachedUserId) {
        return window.cachedUserId;
    }
    
    // Try to get from localStorage cache first
    const cachedId = localStorage.getItem('userId');
    if (cachedId) {
        const parsedId = parseInt(cachedId);
        // Validate: userId must be a number > 0, not an email
        if (!isNaN(parsedId) && parsedId > 0 && !cachedId.includes('@')) {
            window.cachedUserId = parsedId;
            return window.cachedUserId;
        } else {
            // Invalid userId (might be email or invalid), clear it
            console.warn("⚠️ Invalid userId in localStorage (might be email):", cachedId);
            localStorage.removeItem('userId');
            window.cachedUserId = null;
        }
    }
    
    // If not cached, need to get from API
    // This will be handled asynchronously in loadCart()
    return null;
}

// Get user ID from API (async)
function getUserIdFromAPI(callback) {
    if (window.cachedUserId) {
        callback(window.cachedUserId);
        return;
    }
    
    const cachedId = localStorage.getItem('userId');
    if (cachedId) {
        const parsedId = parseInt(cachedId);
        // Validate: userId must be a number > 0, not an email
        if (!isNaN(parsedId) && parsedId > 0 && !cachedId.includes('@')) {
            window.cachedUserId = parsedId;
            callback(window.cachedUserId);
            return;
        } else {
            // Invalid userId (might be email or invalid), clear it
            console.warn("⚠️ Invalid userId in localStorage (might be email):", cachedId);
            localStorage.removeItem('userId');
            window.cachedUserId = null;
        }
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyInfo !== 'function') {
        console.error("❌ ApiService.getMyInfo is not available!");
        callback(null);
        return;
    }
    
    console.log("Calling ApiService.getMyInfo() to get user ID...");
    ApiService.getMyInfo()
        .done(function(response) {
            console.log("=== Get My Info API Response ===");
            console.log("Full response:", response);
            
            // Check response format - could be ApiResponse or ResponseData
            let userData = null;
            if (response && response.result) {
                // ApiResponse format: { code, result, message }
                userData = response.result;
            } else if (response && response.data) {
                // ResponseData format: { status, isSuccess, data, desc }
                userData = response.data;
            } else if (response && response.id) {
                // Direct UserDTO
                userData = response;
            }
            
            if (userData && userData.id) {
                const userId = parseInt(userData.id);
                if (isNaN(userId) || userId <= 0) {
                    console.error("❌ Invalid user ID from API:", userData.id);
                    console.error("User data:", JSON.stringify(userData, null, 2));
                    callback(null);
                    return;
                }
                window.cachedUserId = userId;
                localStorage.setItem('userId', userId.toString());
                console.log("✅ User ID cached:", userId, "Type:", typeof userId);
                callback(userId);
            } else {
                console.error("❌ User ID not found in response");
                console.error("User data:", JSON.stringify(userData, null, 2));
                console.error("Response:", JSON.stringify(response, null, 2));
                callback(null);
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Get My Info API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            callback(null);
        });
}

// Helper function to format price
function formatPrice(price) {
    if (price == null || price === undefined) return '$0';
    return '$' + parseFloat(price).toFixed(2);
}

// Helper function to format Vietnamese currency
function formatVND(price) {
    if (price == null || price === undefined) return '0 ₫';
    return parseFloat(price).toLocaleString('vi-VN') + ' ₫';
}

// Track if cart is currently loading to prevent multiple simultaneous loads
let isLoadingCart = false;
let lastCartLoadTime = 0;
const CART_LOAD_DEBOUNCE_MS = 500; // Minimum time between cart loads

// Export loading state for other scripts to check
window.isLoadingCart = false;

// Load cart data from API
function loadCart() {
    console.log("=== loadCart() called ===");
    
    // Check if cart was cleared
    const cartCleared = localStorage.getItem('cartCleared');
    if (cartCleared) {
        console.log("✅ Cart was cleared, showing empty state");
        localStorage.removeItem('cartCleared');
        // Show empty cart immediately
        renderEmptyCart();
        // Update badge to 0
        if (typeof CartSync !== 'undefined' && CartSync.updateCartBadge) {
            CartSync.updateCartBadge(0);
        }
        return;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoadingCart) {
        console.log("⏸️ Cart is already loading, skipping...");
        return;
    }
    
    // Debounce: don't load if called too soon after last load
    const now = Date.now();
    if (now - lastCartLoadTime < CART_LOAD_DEBOUNCE_MS) {
        console.log("⏸️ Cart load debounced (too soon after last load)");
        return;
    }
    
    isLoadingCart = true;
    window.isLoadingCart = true; // Export for other scripts
    lastCartLoadTime = now;
    
    // Get user ID (from cache or API)
    getUserIdFromAPI(function(userId) {
        if (!userId) {
            console.warn("⚠️ No user ID found, cannot load cart");
            renderEmptyCart();
            return;
        }
        
        // Validate userId is a number
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId) || parsedUserId <= 0) {
            console.error("❌ Invalid user ID:", userId, "Type:", typeof userId);
            console.error("Clearing invalid userId from localStorage");
            localStorage.removeItem('userId');
            window.cachedUserId = null;
            renderEmptyCart();
            return;
        }
        
        console.log("User ID:", parsedUserId, "Type:", typeof parsedUserId);
        
        if (typeof ApiService === 'undefined') {
            console.error("❌ ApiService is not defined!");
            return;
        }
        
        console.log("Calling ApiService.getCart() with userId:", parsedUserId);
        
        ApiService.getCart(parsedUserId)
            .done(function(response) {
                console.log("=== Cart API Response ===");
                console.log("Full response:", response);
                
                const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
                const cart = response && response.data;
                
                if (isSuccess && cart) {
                    console.log("✅ Cart data loaded successfully");
                    renderCart(cart);
                    
                    // Update cart badge count and sync across tabs
                    const itemCount = cart.itemCount || (cart.items ? cart.items.length : 0);
                    console.log("Cart item count:", itemCount);
                    if (typeof CartSync !== 'undefined' && CartSync.updateCartBadge) {
                        CartSync.updateCartBadge(itemCount);
                        console.log("✅ Cart badge updated and synced");
                    } else {
                        console.warn("⚠️ CartSync.updateCartBadge not available");
                    }
                } else {
                    console.warn("⚠️ Cart response invalid:", response);
                    renderEmptyCart();
                    
                    // Update cart badge to 0 and sync
                    if (typeof CartSync !== 'undefined' && CartSync.updateCartBadge) {
                        CartSync.updateCartBadge(0);
                        console.log("✅ Cart badge updated to 0 and synced");
                    }
                }
                
                // Reset loading flag
                isLoadingCart = false;
                window.isLoadingCart = false;
            })
            .fail(function(xhr, status, error) {
                console.error("=== Cart API Error ===");
                console.error("XHR:", xhr);
                console.error("Status:", status);
                console.error("Error:", error);
                renderEmptyCart();
                
                // Reset loading flag
                isLoadingCart = false;
                window.isLoadingCart = false;
            });
    });
}

// Render cart items
function renderCart(cart) {
    console.log("=== renderCart() called ===");
    console.log("Cart data:", cart);
    
    // Update cart modal title with item count
    const cartModal = $('#cartModal');
    if (cartModal.length) {
        const itemCount = cart.itemCount || (cart.items ? cart.items.length : 0);
        const title = cartModal.find('.modal-title');
        if (title.length) {
            title.html(`My cart <span class="small">(${itemCount} ${itemCount === 1 ? 'item' : 'items'})</span>`);
        }
    }
    
    // Find cart items container
    const cartItemsContainer = $('.osahan-my-cart-item');
    if (cartItemsContainer.length === 0) {
        console.error("❌ Cart items container not found!");
        return;
    }
    
    // Clear existing items (except static parts like delivery, promo)
    cartItemsContainer.find('.cart-item-dynamic').remove();
    
    if (!cart.items || cart.items.length === 0) {
        console.log("Cart is empty");
        renderEmptyCart();
        
        // Reset promo code display when cart is empty
        const cartPromoDisplay = $('#cart-promo-code-display');
        if (cartPromoDisplay.length) {
            cartPromoDisplay.text('Chưa có mã');
        }
        return;
    }
    
    // Group items by restaurant (if items have restaurant info)
    // For now, we'll just render all items
    let itemsHTML = '';
    
    // Render each cart item
    cart.items.forEach(function(item) {
        // Get image URL - use ApiService helper if available
        let imageUrl = item.foodImage || 'img/food1.jpg';
        if (typeof ApiService !== 'undefined' && ApiService.getCartItemImage) {
            // Extract filename from path if it's a full path
            const filename = imageUrl.includes('/') ? imageUrl.split('/').pop() : imageUrl;
            imageUrl = ApiService.getCartItemImage(filename);
        } else if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/') && !imageUrl.startsWith('img/')) {
            // If it's just a filename, prepend API base URL
            imageUrl = 'http://localhost:82/menu/file/' + imageUrl;
        }
        
        const itemHTML = `
            <div class="d-flex align-items-center mb-3 cart-item-dynamic" data-item-id="${item.id}">
                <div class="mr-2">
                    <img src="${imageUrl}" 
                         class="img-fluid rounded" 
                         alt="${item.foodTitle || 'Food item'}"
                         onerror="this.src='img/food1.jpg'"
                         style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="ml-2 flex-grow-1">
                    <p class="mb-0 text-black font-weight-bold">${item.foodTitle || 'Food item'}</p>
                    <p class="mb-0 small text-muted">${formatVND(item.totalPrice || 0)}</p>
                    <div class="d-flex align-items-center mt-2">
                        <button class="btn btn-sm btn-outline-secondary decrease-quantity" 
                                data-item-id="${item.id}" 
                                data-quantity="${item.quantity}"
                                style="width: 30px; height: 30px; padding: 0; line-height: 1;">
                            <i class="mdi mdi-minus"></i>
                        </button>
                        <input type="number" 
                               class="form-control form-control-sm cart-item-quantity mx-2" 
                               value="${item.quantity}" 
                               min="1" 
                               max="99"
                               data-item-id="${item.id}"
                               style="width: 50px; text-align: center; display: inline-block;">
                        <button class="btn btn-sm btn-outline-secondary increase-quantity" 
                                data-item-id="${item.id}" 
                                data-quantity="${item.quantity}"
                                style="width: 30px; height: 30px; padding: 0; line-height: 1;">
                            <i class="mdi mdi-plus"></i>
                        </button>
                    </div>
                </div>
                <a href="#" class="ml-auto remove-cart-item" data-item-id="${item.id}" title="Xóa món">
                    <i class="btn btn-light text-danger mdi mdi-trash-can-outline rounded"></i>
                </a>
            </div>
        `;
        itemsHTML += itemHTML;
    });
    
    // Insert items before "Add more items" link or delivery section
    const addMoreItemsLink = cartItemsContainer.find('a[href="explore.html"]').parent();
    if (addMoreItemsLink.length) {
        addMoreItemsLink.before(itemsHTML);
    } else {
        // If "Add more items" link not found, insert before delivery section
        const deliverySection = cartItemsContainer.find('a[data-target="#mycoupansModal"]').first();
        if (deliverySection.length) {
            deliverySection.before(itemsHTML);
        } else {
            // Just prepend to container (before static elements)
            const firstStaticElement = cartItemsContainer.children().first();
            if (firstStaticElement.length) {
                firstStaticElement.before(itemsHTML);
            } else {
                cartItemsContainer.prepend(itemsHTML);
            }
        }
    }
    
    // Calculate total with promo discount
    let total = cart.total || 0;
    let discount = 0;
    let finalTotal = total;
    
    // Check for applied promo
    if (typeof PromoService !== 'undefined' && PromoService.getAppliedPromo) {
        const promo = PromoService.getAppliedPromo();
        if (promo) {
            discount = PromoService.calculateDiscount(total, promo);
            finalTotal = total - discount;
            
            // Update promo code display in cart
            updatePromoDisplayInCart(promo, discount);
            
            // Update promo code display in cart sidebar
            const cartPromoDisplay = $('#cart-promo-code-display');
            if (cartPromoDisplay.length) {
                const promoCode = promo.code || `PROMO${promo.id}`;
                cartPromoDisplay.text(promoCode);
            }
        } else {
            // Remove promo display if no promo applied
            removePromoDisplayFromCart();
        }
    } else {
        // No promo service available, reset display
        const cartPromoDisplay = $('#cart-promo-code-display');
        if (cartPromoDisplay.length) {
            cartPromoDisplay.text('Chưa có mã');
        }
    }
    
    // Update checkout button with final total
    const checkoutButton = cartModal.find('.osahan-my-cart-footer .btn-primary');
    if (checkoutButton.length) {
        checkoutButton.text(`Checkout (${formatVND(finalTotal)})`);
        // Attach click handler to open checkout modal
        checkoutButton.off('click').on('click', function(e) {
            e.preventDefault();
            $('#cartModal').modal('hide');
            $('#checkoutModal').modal('show');
        });
    }
    
    // Attach event handlers for remove buttons
    attachCartItemEvents();
    
    // Attach quantity change handlers
    attachCartQuantityHandlers();
    
    console.log("✅ Cart rendered successfully");
    console.log("Total:", total, "Discount:", discount, "Final:", finalTotal);
}

// Attach event handlers for quantity controls
function attachCartQuantityHandlers() {
    // Decrease quantity button
    $(document).off('click', '.decrease-quantity').on('click', '.decrease-quantity', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = $(this);
        const itemId = button.data('item-id');
        const quantityInput = button.closest('.cart-item-dynamic').find('.cart-item-quantity');
        const currentQuantity = parseInt(quantityInput.val()) || 1;
        const newQuantity = Math.max(1, currentQuantity - 1);
        
        if (newQuantity !== currentQuantity) {
            quantityInput.val(newQuantity);
            updateCartItemQuantity(itemId, newQuantity);
        }
    });
    
    // Increase quantity button
    $(document).off('click', '.increase-quantity').on('click', '.increase-quantity', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = $(this);
        const itemId = button.data('item-id');
        const quantityInput = button.closest('.cart-item-dynamic').find('.cart-item-quantity');
        const currentQuantity = parseInt(quantityInput.val()) || 1;
        const newQuantity = Math.min(99, currentQuantity + 1);
        
        if (newQuantity !== currentQuantity) {
            quantityInput.val(newQuantity);
            updateCartItemQuantity(itemId, newQuantity);
        }
    });
    
    // Quantity input change
    $(document).off('change', '.cart-item-quantity').on('change', '.cart-item-quantity', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const input = $(this);
        const itemId = input.data('item-id');
        let newQuantity = parseInt(input.val()) || 1;
        
        // Validate quantity
        if (newQuantity < 1) {
            newQuantity = 1;
            input.val(1);
        } else if (newQuantity > 99) {
            newQuantity = 99;
            input.val(99);
        }
        
        updateCartItemQuantity(itemId, newQuantity);
    });
    
    // Prevent form submission on Enter key
    $(document).off('keypress', '.cart-item-quantity').on('keypress', '.cart-item-quantity', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $(this).blur();
        }
    });
}

/**
 * Update promo display in cart
 */
function updatePromoDisplayInCart(promo, discount) {
    const cartItemsContainer = $('.osahan-my-cart-item');
    if (!cartItemsContainer.length) return;
    
    // Find or create promo display section
    let promoSection = cartItemsContainer.find('.promo-applied-section');
    
    if (promoSection.length === 0) {
        // Insert before delivery section
        const deliverySection = cartItemsContainer.find('a[data-target="#mycoupansModal"]').first();
        if (deliverySection.length) {
            promoSection = $('<div class="promo-applied-section border-top pt-2 mb-2"></div>');
            deliverySection.before(promoSection);
        } else {
            return;
        }
    }
    
    // Get promo code from stored data - MUST use code from API
    const promoCode = promo.code || `PROMO${promo.id}`;
    const discountText = promo.percent > 0 ? `Giảm ${promo.percent}%` : (promo.value > 0 ? `Giảm ${formatVND(promo.value)}` : 'Giảm giá');
    
    // Update the promo code display in cart sidebar
    const cartPromoDisplay = $('#cart-promo-code-display');
    if (cartPromoDisplay.length) {
        cartPromoDisplay.text(promoCode);
    }
    
    promoSection.html(`
        <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center">
                <i class="mdi mdi-tag-check text-success mr-2"></i>
                <div>
                    <p class="mb-0 text-dark small font-weight-bold">${promoCode}</p>
                    <p class="mb-0 text-success small">${discountText}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="mb-0 text-success small font-weight-bold">-${formatVND(discount)}</p>
                <a href="#" class="remove-promo-btn text-danger small" title="Xóa mã khuyến mãi">
                    <i class="mdi mdi-close"></i>
                </a>
            </div>
        </div>
    `);
    
    // Attach remove promo handler
    promoSection.find('.remove-promo-btn').off('click').on('click', function(e) {
        e.preventDefault();
        if (typeof PromoService !== 'undefined' && PromoService.removeAppliedPromo) {
            PromoService.removeAppliedPromo();
        }
    });
}

/**
 * Remove promo display from cart
 */
function removePromoDisplayFromCart() {
    $('.promo-applied-section').remove();
    
    // Reset promo code display in cart sidebar
    const cartPromoDisplay = $('#cart-promo-code-display');
    if (cartPromoDisplay.length) {
        cartPromoDisplay.text('Chưa có mã');
    }
}

// Render empty cart
function renderEmptyCart() {
    console.log("=== renderEmptyCart() called ===");
    
    const cartModal = $('#cartModal');
    if (cartModal.length) {
        const title = cartModal.find('.modal-title');
        if (title.length) {
            title.html('My cart <span class="small">(0 items)</span>');
        }
    }
    
    const cartItemsContainer = $('.osahan-my-cart-item');
    if (cartItemsContainer.length) {
        // Clear dynamic items
        cartItemsContainer.find('.cart-item-dynamic').remove();
        
        // Add empty cart message if no items
        if (cartItemsContainer.find('.cart-item-dynamic').length === 0) {
            const emptyMessage = `
                <div class="text-center py-4 cart-item-dynamic">
                    <p class="text-muted mb-0">Giỏ hàng của bạn đang trống</p>
                    <a href="explore.html" class="btn btn-primary btn-sm mt-2">Xem món ăn</a>
                </div>
            `;
            const addMoreItemsLink = cartItemsContainer.find('a[data-target="#myitemsModal"]').parent();
            if (addMoreItemsLink.length) {
                addMoreItemsLink.before(emptyMessage);
            } else {
                cartItemsContainer.prepend(emptyMessage);
            }
        }
    }
    
    // Reset promo code display when cart is empty
    const cartPromoDisplay = $('#cart-promo-code-display');
    if (cartPromoDisplay.length) {
        cartPromoDisplay.text('Chưa có mã');
    }
    
    // Update checkout button
    const checkoutButton = cartModal.find('.osahan-my-cart-footer .btn-primary');
    if (checkoutButton.length) {
        checkoutButton.text('Checkout ($0)');
    }
}

// Attach event handlers for cart items
function attachCartItemEvents() {
    // Remove item handler
    $(document).off('click', '.remove-cart-item').on('click', '.remove-cart-item', function(e) {
        e.preventDefault();
        const itemId = $(this).data('item-id');
        if (!itemId) return;
        
        console.log("Remove cart item clicked, itemId:", itemId);
        
        if (confirm('Bạn có chắc muốn xóa món này khỏi giỏ hàng?')) {
            removeCartItem(itemId);
        }
    });
}

// Remove cart item
function removeCartItem(itemId) {
    console.log("=== removeCartItem() called ===");
    console.log("Item ID:", itemId);
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        alert('Lỗi: API service chưa được load!');
        return;
    }
    
    ApiService.removeCartItem(itemId)
        .done(function(response) {
            console.log("=== Remove Cart Item API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            
            if (isSuccess) {
                console.log("✅ Cart item removed successfully");
                // Reload cart (with debounce check)
                setTimeout(function() {
                    if (!isLoadingCart) {
                        loadCart();
                    }
                }, 300);
                
                // Update cart badge immediately
                if (typeof CartSync !== 'undefined' && CartSync.loadCartCount) {
                    CartSync.loadCartCount();
                }
            } else {
                console.warn("⚠️ Remove cart item failed:", response);
                alert(response?.desc || 'Xóa món khỏi giỏ hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Remove Cart Item API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            alert('Xóa món khỏi giỏ hàng thất bại!');
        });
}

// Update cart item quantity
function updateCartItemQuantity(itemId, quantity) {
    console.log("=== updateCartItemQuantity() called ===");
    console.log("Item ID:", itemId, "Quantity:", quantity);
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        alert('Lỗi: API service chưa được load!');
        return;
    }
    
    if (quantity <= 0) {
        // If quantity is 0 or less, remove item
        removeCartItem(itemId);
        return;
    }
    
    ApiService.updateCartItem(itemId, quantity)
        .done(function(response) {
            console.log("=== Update Cart Item API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            
            if (isSuccess) {
                console.log("✅ Cart item updated successfully");
                // Reload cart (with debounce check)
                setTimeout(function() {
                    if (!isLoadingCart) {
                        loadCart();
                    }
                }, 300);
                
                // Update cart badge immediately and sync across tabs
                if (typeof CartSync !== 'undefined' && CartSync.loadCartCount) {
                    CartSync.loadCartCount();
                    console.log("✅ Cart badge updated and synced after quantity change");
                }
            } else {
                console.warn("⚠️ Update cart item failed:", response);
                alert(response?.desc || 'Cập nhật giỏ hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Update Cart Item API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            alert('Cập nhật giỏ hàng thất bại!');
        });
}

// Load cart when modal is shown
$(document).ready(function() {
    console.log("=== $(document).ready() fired in cart.js ===");
    
    // Update promo code display on page load
    if (typeof PromoService !== 'undefined' && PromoService.getAppliedPromo) {
        const promo = PromoService.getAppliedPromo();
        const cartPromoDisplay = $('#cart-promo-code-display');
        if (cartPromoDisplay.length) {
            if (promo && promo.code) {
                cartPromoDisplay.text(promo.code);
            } else {
                cartPromoDisplay.text('Chưa có mã');
            }
        }
    }
    
    // Load cart when cart modal is shown (only once per modal open)
    $('#cartModal').on('show.bs.modal', function() {
        console.log("Cart modal shown, loading cart...");
        
        // Check if cart needs refresh (item was added while modal was closed)
        const needsRefresh = localStorage.getItem('cartNeedsRefresh') === 'true';
        const refreshTime = localStorage.getItem('cartNeedsRefreshTime');
        if (needsRefresh && refreshTime) {
            const timeSinceRefresh = Date.now() - parseInt(refreshTime);
            // Only refresh if flag was set recently (within last 30 seconds)
            if (timeSinceRefresh < 30000) {
                console.log("Cart needs refresh (item was added while modal was closed)");
                localStorage.removeItem('cartNeedsRefresh');
                localStorage.removeItem('cartNeedsRefreshTime');
            }
        }
        
        // Use a small delay to ensure modal is fully shown before loading
        setTimeout(function() {
            if (!isLoadingCart) {
                loadCart();
            } else {
                // If already loading, wait and retry
                setTimeout(function() {
                    if (!isLoadingCart) {
                        loadCart();
                    }
                }, 500);
            }
        }, 150);
    });
    
    // Also listen for shown.bs.modal (after animation completes) to ensure cart is loaded
    $('#cartModal').on('shown.bs.modal', function() {
        console.log("Cart modal fully shown, ensuring cart is loaded...");
        // Double-check cart is loaded after modal animation completes
        setTimeout(function() {
            const cartItemsContainer = $('.osahan-my-cart-item');
            const hasItems = cartItemsContainer.find('.cart-item-dynamic').length > 0;
            const isEmptyMessage = cartItemsContainer.find('.empty-cart-message').length > 0;
            
            // If cart container exists but no items and no empty message, cart might not be loaded
            if (cartItemsContainer.length > 0 && !hasItems && !isEmptyMessage) {
                console.log("Cart appears not loaded, forcing reload...");
                if (!isLoadingCart) {
                    loadCart();
                }
            }
        }, 300);
    });
    
    // Listen for cart item added event - reload cart if modal is open
    $(document).on('cartItemAdded', function(e, foodId) {
        console.log("=== cartItemAdded event received ===");
        console.log("Food ID:", foodId);
        const cartModal = $('#cartModal');
        // More reliable check for modal open state
        const isModalOpen = cartModal.length > 0 && (
            cartModal.hasClass('show') || 
            cartModal.is(':visible') || 
            cartModal.hasClass('in') ||
            $('body').hasClass('modal-open')
        );
        
        console.log("Modal state when cartItemAdded:", {
            exists: cartModal.length > 0,
            hasShow: cartModal.hasClass('show'),
            isVisible: cartModal.is(':visible'),
            bodyHasModalOpen: $('body').hasClass('modal-open'),
            isModalOpen: isModalOpen
        });
        
        if (isModalOpen) {
            console.log("Cart modal is open, reloading cart after item added...");
            // Wait longer for API to process, then reload
            setTimeout(function() {
                console.log("Attempting to reload cart...");
                if (!isLoadingCart) {
                    loadCart();
                } else {
                    // If already loading, wait a bit more and force reload
                    console.log("Cart is loading, will retry...");
                    setTimeout(function() {
                        // Force reset loading flag and reload
                        isLoadingCart = false;
                        window.isLoadingCart = false;
                        loadCart();
                    }, 1000);
                }
            }, 1000); // Increased delay to ensure API processed
        } else {
            console.log("Cart modal not open, cart will reload when modal opens");
            // Set flag so cart reloads when modal opens
            localStorage.setItem('cartNeedsRefresh', 'true');
            localStorage.setItem('cartNeedsRefreshTime', Date.now().toString());
        }
    });
    
    // Also listen for cartUpdated event from cart-sync.js
    $(document).on('cartUpdated', function(e, count) {
        console.log("=== cartUpdated event received in cart.js ===");
        console.log("Cart count:", count);
        const cartModal = $('#cartModal');
        // More reliable check for modal open state
        const isModalOpen = cartModal.length > 0 && (
            cartModal.hasClass('show') || 
            cartModal.is(':visible') || 
            cartModal.hasClass('in') ||
            $('body').hasClass('modal-open')
        );
        
        if (isModalOpen) {
            console.log("Cart modal is open, reloading cart after count update...");
            // Use a longer delay to avoid conflicts with other loadCart calls
            setTimeout(function() {
                if (!isLoadingCart) {
                    loadCart();
                } else {
                    // If loading, wait and retry
                    setTimeout(function() {
                        if (!isLoadingCart) {
                            loadCart();
                        }
                    }, 1000);
                }
            }, 1000);
        }
    });
    
    // Also load cart on page load if modal is already visible
    if ($('#cartModal').hasClass('show')) {
        setTimeout(function() {
            if (!isLoadingCart) {
                loadCart();
            }
        }, 200);
    }
    
    // Listen for cart cleared event from checkout
    window.addEventListener('storage', function(e) {
        if (e.key === 'cartCleared') {
            console.log("✅ Cart cleared event detected, reloading cart...");
            // Clear cart immediately
            if (!isLoadingCart) {
                loadCart();
            }
            // Remove the flag
            localStorage.removeItem('cartCleared');
        }
    });
    
    // Also check on page load if cart was cleared
    if (localStorage.getItem('cartCleared')) {
        console.log("✅ Cart was cleared, reloading cart...");
        setTimeout(function() {
            if (!isLoadingCart) {
                loadCart();
            }
            localStorage.removeItem('cartCleared');
        }, 300);
    }
});

// Export functions for use in other scripts
window.CartService = {
    loadCart: loadCart,
    removeCartItem: removeCartItem,
    updateCartItemQuantity: updateCartItemQuantity,
    getUserIdFromToken: getUserIdFromToken
};

