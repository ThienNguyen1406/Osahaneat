/*
 * Checkout - Handle checkout process from cart
 * Version: 1.0
 */

console.log("=== CHECKOUT.JS LOADED ===");

// Helper function to get user ID from API
function getUserIdFromAPI(callback) {
    const cachedId = localStorage.getItem('userId');
    if (cachedId) {
        const parsedId = parseInt(cachedId);
        if (!isNaN(parsedId) && parsedId > 0 && !cachedId.includes('@')) {
            callback(parsedId);
            return;
        }
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyInfo !== 'function') {
        console.error("❌ ApiService.getMyInfo is not available!");
        callback(null);
        return;
    }
    
    ApiService.getMyInfo()
        .done(function(response) {
            let userData = null;
            if (response && response.result) {
                userData = response.result;
            } else if (response && response.data) {
                userData = response.data;
            } else if (response && response.id) {
                userData = response;
            }
            
            if (userData && userData.id) {
                const userId = parseInt(userData.id);
                if (!isNaN(userId) && userId > 0) {
                    localStorage.setItem('userId', userId.toString());
                    callback(userId);
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        })
        .fail(function() {
            callback(null);
        });
}

// Helper function to format price
function formatVND(price) {
    if (price == null || price === undefined) return '0 ₫';
    return parseFloat(price).toLocaleString('vi-VN') + ' ₫';
}

// Load cart data for checkout
function loadCartForCheckout() {
    console.log("=== loadCartForCheckout() called ===");
    
    getUserIdFromAPI(function(userId) {
        if (!userId) {
            console.warn("⚠️ No user ID found, cannot load cart for checkout");
            alert('Vui lòng đăng nhập để thanh toán!');
            $('#checkoutModal').modal('hide');
            window.location.href = 'signin.html';
            return;
        }
        
        if (typeof ApiService === 'undefined') {
            console.error("❌ ApiService is not defined!");
            return;
        }
        
        ApiService.getCart(userId)
            .done(function(response) {
                console.log("=== Cart API Response for Checkout ===");
                console.log("Full response:", response);
                
                const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
                const cart = response && response.data;
                
                if (isSuccess && cart) {
                    if (!cart.items || cart.items.length === 0) {
                        alert('Giỏ hàng của bạn đang trống!');
                        $('#checkoutModal').modal('hide');
                        return;
                    }
                    
                    // Update checkout modal with cart total
                    updateCheckoutModal(cart);
                } else {
                    console.warn("⚠️ Cart response invalid:", response);
                    alert('Không thể tải giỏ hàng!');
                }
            })
            .fail(function(xhr, status, error) {
                console.error("=== Cart API Error for Checkout ===");
                console.error("XHR:", xhr);
                console.error("Status:", status);
                console.error("Error:", error);
                alert('Không thể tải giỏ hàng!');
            });
    });
}

// Voucher state
let currentVoucher = null;
let cartTotal = 0;
let restaurantId = null;

// Payment methods state
let paymentMethods = [];
let selectedPaymentMethod = 'CARD';
let selectedCardId = null;
let stripe = null;
let stripePublishableKey = null; // Will be loaded from API
let stripeKeyLoaded = false;

// Update checkout modal with cart data
function updateCheckoutModal(cart) {
    console.log("=== updateCheckoutModal() called ===");
    console.log("Cart data:", cart);
    
    const checkoutModal = $('#checkoutModal');
    if (checkoutModal.length === 0) {
        console.error("❌ Checkout modal not found!");
        return;
    }
    
    // Store cart total and restaurant ID
    cartTotal = cart.total || 0;
    if (cart.items && cart.items.length > 0) {
        // Get restaurant ID from first item
        const firstItem = cart.items[0];
        if (firstItem.restaurantId) {
            restaurantId = firstItem.restaurantId;
        } else if (firstItem.menu && firstItem.menu.restaurantId) {
            restaurantId = firstItem.menu.restaurantId;
        }
    }
    
    // Reset voucher when cart changes
    currentVoucher = null;
    $('#voucher-code-input').val('');
    $('#voucher-message').text('').removeClass('text-success text-danger');
    $('#voucher-discount-info').addClass('d-none');
    
    // Update totals
    updateCheckoutTotals();
}

// Update checkout totals with voucher discount
function updateCheckoutTotals() {
    let finalTotal = cartTotal;
    let discountAmount = 0;
    
    if (currentVoucher) {
        discountAmount = currentVoucher.value || currentVoucher.discountValue || 0;
        finalTotal = Math.max(0, cartTotal - discountAmount);
    }
    
    // Update display
    $('#cart-total-original').text(formatVND(cartTotal));
    $('#voucher-discount-amount').text('-' + formatVND(discountAmount));
    $('#cart-total-final').text(formatVND(finalTotal));
    
    // Update confirm button
    const confirmButton = $('#confirm-payment-btn');
    if (confirmButton.length) {
        confirmButton.text(`Xác nhận thanh toán (${formatVND(finalTotal)})`);
        confirmButton.attr('data-cart-total', finalTotal);
    }
    
    // Show/hide voucher summary
    if (currentVoucher) {
        $('#voucher-summary').show();
        $('#voucher-discount-summary').show();
    } else {
        $('#voucher-summary').hide();
        $('#voucher-discount-summary').hide();
    }
}

// Apply voucher
function applyVoucher() {
    const voucherCode = $('#voucher-code-input').val().trim().toUpperCase();
    const messageDiv = $('#voucher-message');
    const discountInfo = $('#voucher-discount-info');
    
    if (!voucherCode) {
        messageDiv.text('Vui lòng nhập mã voucher!').removeClass('text-success').addClass('text-danger');
        return;
    }
    
    // restaurantId có thể null nếu voucher áp dụng cho tất cả nhà hàng
    // Không cần kiểm tra restaurantId ở đây, backend sẽ xử lý
    
    // Disable button
    const applyBtn = $('#apply-voucher-btn');
    const originalText = applyBtn.html();
    applyBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> Đang kiểm tra...');
    
    if (typeof ApiService === 'undefined' || typeof ApiService.applyVoucher !== 'function') {
        messageDiv.text('Lỗi: API service chưa sẵn sàng!').removeClass('text-success').addClass('text-danger');
        applyBtn.prop('disabled', false).html(originalText);
        return;
    }
    
    // Gửi cartTotal để backend validate min_order_value (nếu có)
    const cartTotalForVoucher = cartTotal || 0;
    
    ApiService.applyVoucher(voucherCode, restaurantId, cartTotalForVoucher)
        .done(function(response) {
            console.log("Voucher apply response:", response);
            
            const isSuccess = response && (response.success || response.isSuccess || response.status === 200);
            
            if (isSuccess && response.data) {
                currentVoucher = response.data;
                messageDiv.text('Áp dụng voucher thành công!').removeClass('text-danger').addClass('text-success');
                
                const voucherType = currentVoucher.type === 'FOOD_DISCOUNT' ? 'Giảm giá đồ ăn' : 'Giảm giá ship';
                const discountText = `${voucherType}: ${formatVND(currentVoucher.value || currentVoucher.discountValue || 0)}`;
                $('#voucher-discount-text').html(`<strong>${currentVoucher.code}</strong> - ${discountText}`);
                discountInfo.removeClass('d-none');
                
                updateCheckoutTotals();
            } else {
                const errorMsg = response?.desc || response?.message || 'Mã voucher không hợp lệ hoặc đã hết hạn!';
                messageDiv.text(errorMsg).removeClass('text-success').addClass('text-danger');
                currentVoucher = null;
                discountInfo.addClass('d-none');
                updateCheckoutTotals();
            }
            
            applyBtn.prop('disabled', false).html(originalText);
        })
        .fail(function(xhr) {
            console.error("Voucher apply error:", xhr);
            let errorMsg = 'Không thể áp dụng voucher!';
            
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            } else if (xhr.status === 404) {
                errorMsg = 'Mã voucher không tồn tại!';
            } else if (xhr.status === 400) {
                errorMsg = 'Mã voucher không hợp lệ hoặc đã hết hạn!';
            }
            
            messageDiv.text(errorMsg).removeClass('text-success').addClass('text-danger');
            currentVoucher = null;
            discountInfo.addClass('d-none');
            updateCheckoutTotals();
            
            applyBtn.prop('disabled', false).html(originalText);
        });
}

// Remove voucher
function removeVoucher() {
    currentVoucher = null;
    $('#voucher-code-input').val('');
    $('#voucher-message').text('').removeClass('text-success text-danger');
    $('#voucher-discount-info').addClass('d-none');
    updateCheckoutTotals();
}

// Wait for ApiService to be available
function waitForApiService(callback, maxAttempts = 10, attempt = 0) {
    if (typeof ApiService !== 'undefined' && typeof ApiService.checkoutFromCart === 'function') {
        callback();
        return;
    }
    
    if (attempt >= maxAttempts) {
        console.error("❌ ApiService.checkoutFromCart not available after", maxAttempts, "attempts");
        console.error("ApiService:", typeof ApiService !== 'undefined' ? ApiService : 'undefined');
        if (typeof ApiService !== 'undefined') {
            console.error("ApiService methods:", Object.keys(ApiService));
        }
        alert('Lỗi: API service chưa được load! Vui lòng refresh trang.');
        return;
    }
    
    setTimeout(function() {
        waitForApiService(callback, maxAttempts, attempt + 1);
    }, 100);
}

// Handle checkout (create order from cart)
function handleCheckout() {
    console.log("=== handleCheckout() called ===");
    
    // Wait for ApiService to be available
    waitForApiService(function() {
        console.log("✅ ApiService.checkoutFromCart is available");
        
        getUserIdFromAPI(function(userId) {
            if (!userId) {
                console.warn("⚠️ No user ID found, cannot checkout");
                alert('Vui lòng đăng nhập để thanh toán!');
                $('#checkoutModal').modal('hide');
                window.location.href = 'signin.html';
                return;
            }
        
        // Disable confirm button
        const confirmButton = $('#checkoutModal').find('.modal-footer .btn-primary');
        const originalText = confirmButton.text();
        confirmButton.prop('disabled', true).html('<i class="mdi mdi-loading mdi-spin mr-1"></i> Đang xử lý...');
        
        // Get selected delivery address
        const selectedAddressStr = localStorage.getItem('selectedDeliveryAddress');
        let deliveryAddress = null;
        let userLat = null;
        let userLng = null;
        
        if (selectedAddressStr) {
            try {
                const addressData = JSON.parse(selectedAddressStr);
                deliveryAddress = addressData.address || null;
                // Try to get lat/lng from address data if available
                userLat = addressData.lat || addressData.latitude || null;
                userLng = addressData.lng || addressData.longitude || null;
                console.log("Selected address:", deliveryAddress);
                console.log("Address coordinates:", userLat, userLng);
            } catch (e) {
                console.warn("Failed to parse selected address:", e);
            }
        }
        
        // Call checkout API
        console.log("Calling ApiService.checkoutFromCart()...");
        ApiService.checkoutFromCart(userId, deliveryAddress, userLat, userLng)
            .done(function(response) {
                console.log("=== Checkout API Response ===");
                console.log("Full response:", response);
                
                // Check multiple response formats
                let isSuccess = false;
                let orderId = null;
                
                if (response) {
                    // Check for ResponseData format: { status, isSuccess, success, data, desc }
                    if (response.isSuccess === true || response.success === true || response.status === 200) {
                        isSuccess = true;
                        // Order ID can be in response.data (could be int or object)
                        const data = response.data;
                        if (typeof data === 'number') {
                            orderId = data;
                        } else if (data && typeof data === 'object' && data.id) {
                            orderId = data.id;
                        } else if (data && typeof data === 'object' && data.orderId) {
                            orderId = data.orderId;
                        } else if (data) {
                            // Try to parse as number
                            orderId = parseInt(data);
                            if (isNaN(orderId)) {
                                orderId = null;
                            }
                        }
                    }
                }
                
                console.log("isSuccess:", isSuccess, "orderId:", orderId);
                
                if (isSuccess && orderId && orderId > 0) {
                    console.log("✅ Checkout successful! Order ID:", orderId);
                    
                    // Clear cart from localStorage FIRST
                    localStorage.removeItem('cart');
                    localStorage.setItem('cartCleared', Date.now().toString());
                    
                    // Update cart badge to 0 immediately
                    if (typeof CartSync !== 'undefined' && CartSync.updateCartBadge) {
                        CartSync.updateCartBadge(0);
                    }
                    
                    // Trigger storage event to sync across tabs
                    try {
                        window.dispatchEvent(new StorageEvent('storage', {
                            key: 'cartCleared',
                            newValue: Date.now().toString(),
                            oldValue: null
                        }));
                    } catch (e) {
                        // Fallback for browsers that don't support StorageEvent constructor
                        window.dispatchEvent(new Event('storage'));
                    }
                    
                    // Force reload cart after a short delay to ensure backend has cleared it
                    setTimeout(function() {
                        if (typeof CartService !== 'undefined' && CartService.loadCart) {
                            console.log("Reloading cart after checkout...");
                            // Force reload by removing cartCleared flag temporarily
                            const clearedFlag = localStorage.getItem('cartCleared');
                            localStorage.removeItem('cartCleared');
                            CartService.loadCart();
                            // Restore flag after reload
                            if (clearedFlag) {
                                setTimeout(function() {
                                    localStorage.setItem('cartCleared', clearedFlag);
                                }, 100);
                            }
                        }
                    }, 500);
                    
                    // Show success message
                    alert('Đặt hàng thành công! Đơn hàng của bạn đã được tạo. Mã đơn hàng: #' + orderId);
                    
                    // Close checkout modal
                    $('#checkoutModal').modal('hide');
                    
                    // Close cart modal if open
                    $('#cartModal').modal('hide');
                    
                    // Redirect to orders page with reload flag
                    setTimeout(function() {
                        // Add timestamp to force reload
                        const timestamp = new Date().getTime();
                        if (window.location.pathname.includes('orders.html')) {
                            // Already on orders page, just reload
                            window.location.reload();
                        } else {
                            // Navigate to orders page
                            window.location.href = 'orders.html?orderCreated=' + timestamp;
                        }
                    }, 800);
                } else {
                    console.warn("⚠️ Checkout failed:", response);
                    const errorMsg = response?.desc || response?.message || 'Đặt hàng thất bại! Vui lòng thử lại.';
                    alert(errorMsg);
                    confirmButton.prop('disabled', false).html(originalText);
                }
            })
            .fail(function(xhr, status, error) {
                console.error("=== Checkout API Error ===");
                console.error("XHR:", xhr);
                console.error("Status:", status);
                console.error("Error:", error);
                console.error("Status Code:", xhr.status);
                console.error("Ready State:", xhr.readyState);
                console.error("Response Text:", xhr.responseText);
                console.error("Response JSON:", xhr.responseJSON);
                
                let errorMsg = 'Đặt hàng thất bại!';
                
                // Handle specific error cases
                if (xhr.status === 0 || (status === 'error' && xhr.readyState === 0)) {
                    // Network error or CORS issue
                    errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại!';
                    console.error("❌ Network error or CORS issue - request not sent");
                } else if (xhr.status === 401) {
                    errorMsg = 'Vui lòng đăng nhập để đặt hàng!';
                    alert(errorMsg);
                    $('#checkoutModal').modal('hide');
                    window.location.href = 'signin.html';
                    return;
                } else if (xhr.status === 403) {
                    errorMsg = 'Không có quyền đặt hàng!';
                } else if (xhr.status === 400) {
                    errorMsg = 'Thông tin đặt hàng không hợp lệ. Vui lòng kiểm tra lại!';
                    if (xhr.responseJSON && xhr.responseJSON.desc) {
                        errorMsg = xhr.responseJSON.desc;
                    }
                } else if (xhr.status === 500) {
                    errorMsg = 'Lỗi server. Vui lòng thử lại sau!';
                    if (xhr.responseJSON && xhr.responseJSON.desc) {
                        errorMsg = xhr.responseJSON.desc;
                    }
                } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                    errorMsg = xhr.responseJSON.desc;
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
                
                alert(errorMsg);
                confirmButton.prop('disabled', false).text(originalText);
            });
        });
    });
}

// Initialize checkout functionality
$(document).ready(function() {
    console.log("=== $(document).ready() fired in checkout.js ===");
    console.log("ApiService available:", typeof ApiService !== 'undefined');
    if (typeof ApiService !== 'undefined') {
        console.log("ApiService object:", ApiService);
        console.log("ApiService methods:", Object.keys(ApiService));
        console.log("ApiService.checkoutFromCart:", ApiService.checkoutFromCart);
        console.log("ApiService.checkoutFromCart type:", typeof ApiService.checkoutFromCart);
        console.log("ApiService.checkoutFromCart available:", typeof ApiService.checkoutFromCart === 'function');
    } else {
        console.error("❌ ApiService is not defined in checkout.js ready handler!");
        console.error("Available window properties:", Object.keys(window).filter(k => k.toLowerCase().includes('api')));
    }
    
    // Load cart when checkout modal is shown
    $('#checkoutModal').on('show.bs.modal', function() {
        console.log("=== Checkout modal shown ===");
        loadCartForCheckout();
        
        // Reset voucher when modal opens
        currentVoucher = null;
        $('#voucher-code-input').val('');
        $('#voucher-message').text('').removeClass('text-success text-danger');
        $('#voucher-discount-info').addClass('d-none');
        
        // Reset payment method state
        selectedPaymentMethod = 'CARD';
        selectedCardId = null;
        paymentMethods = [];
        
        // Load Stripe publishable key from API if not loaded yet
        if (!stripeKeyLoaded && typeof ApiService !== 'undefined' && typeof ApiService.getStripePublishableKey === 'function') {
            console.log("Loading Stripe publishable key from API...");
            ApiService.getStripePublishableKey()
                .done(function(response) {
                    console.log("=== Stripe Key API Response ===");
                    console.log("Full response:", response);
                    
                    if (response && (response.isSuccess === true || response.success === true || response.status === 200)) {
                        const keyData = response.data;
                        if (keyData && keyData.publishableKey) {
                            stripePublishableKey = keyData.publishableKey;
                            stripeKeyLoaded = true;
                            console.log("✅ Stripe publishable key loaded from API");
                            
                            // Initialize Stripe with the key
                            initializeStripe();
                        } else {
                            console.error("❌ Invalid key data in response");
                            showStripeError("Không thể lấy Stripe key từ server");
                        }
                    } else {
                        console.error("❌ Failed to load Stripe key");
                        showStripeError("Không thể tải cấu hình Stripe");
                    }
                })
                .fail(function(xhr, status, error) {
                    console.error("=== Stripe Key API Error ===");
                    console.error("XHR:", xhr);
                    console.error("Status:", status);
                    console.error("Error:", error);
                    showStripeError("Không thể kết nối đến server để lấy Stripe key");
                });
        } else if (stripePublishableKey) {
            // Key already loaded, just initialize
            initializeStripe();
        } else {
            console.error("❌ Stripe key not available");
            showStripeError("Stripe chưa được cấu hình");
        }
        
        // Reset Stripe Elements
        if (cardElement) {
            try {
                cardElement.unmount();
            } catch (e) {
                console.warn("Error unmounting card element:", e);
            }
            cardElement = null;
        }
        stripeElements = null;
        cardFormVisible = false;
        
        // Set default payment method to CARD and show cards section
        $('#cards-section').show();
        $('#cod-section').hide();
        $('#paypal-section').hide();
        $('#stripe-card-form').hide();
        
        // Load payment methods
        console.log("Loading payment methods...");
        loadPaymentMethods();
        
        // Force render payment methods after a short delay to ensure Stripe is ready
        setTimeout(function() {
            console.log("Re-rendering payment methods after delay...");
            renderPaymentMethods();
        }, 500);
    });
    
    // Allow Enter key to apply voucher
    $('#voucher-code-input').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            applyVoucher();
        }
    });
    
    // Handle confirm payment button click
    $(document).on('click', '#checkoutModal .modal-footer .btn-primary', function(e) {
        e.preventDefault();
        console.log("Confirm payment button clicked");
        console.log("ApiService available:", typeof ApiService !== 'undefined');
        if (typeof ApiService !== 'undefined') {
            console.log("ApiService.checkoutFromCart:", typeof ApiService.checkoutFromCart);
        }
        handleCheckout();
    });
});

// Payment methods state - already declared above, don't redeclare

// Load payment methods from API
function loadPaymentMethods() {
    console.log("=== loadPaymentMethods() called ===");
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        $('#cards-list').html(`
            <div class="text-center py-3">
                <p class="text-muted small mb-0">Lỗi: API service chưa được tải</p>
            </div>
        `);
        return;
    }
    
    if (typeof ApiService.getMyPaymentMethods !== 'function') {
        console.error("❌ ApiService.getMyPaymentMethods is not a function!");
        console.error("Available ApiService methods:", Object.keys(ApiService));
        $('#cards-list').html(`
            <div class="text-center py-3">
                <p class="text-muted small mb-0">Lỗi: API method không tồn tại</p>
            </div>
        `);
        return;
    }
    
    console.log("Calling ApiService.getMyPaymentMethods()...");
    
    // Show loading state
    $('#cards-list').html(`
        <div class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p class="text-muted small mt-2 mb-0">Đang tải thẻ...</p>
        </div>
    `);
    
    ApiService.getMyPaymentMethods()
        .done(function(response) {
            console.log("=== Payment methods API response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            
            // Check multiple response formats
            let isSuccess = false;
            let methodsData = null;
            
            if (response) {
                // Check for ResponseData format: { status, isSuccess, success, data, desc }
                if (response.isSuccess === true || response.success === true || response.status === 200) {
                    isSuccess = true;
                    methodsData = response.data;
                }
                // Check if response is already an array
                else if (Array.isArray(response)) {
                    isSuccess = true;
                    methodsData = response;
                }
                // Check for ApiResponse format: { code, result, message }
                else if (response.result) {
                    isSuccess = true;
                    methodsData = Array.isArray(response.result) ? response.result : [];
                }
            }
            
            console.log("isSuccess:", isSuccess);
            console.log("methodsData:", methodsData);
            
            if (isSuccess && methodsData) {
                paymentMethods = Array.isArray(methodsData) ? methodsData : [];
                console.log("✅ Payment methods loaded:", paymentMethods.length);
                renderPaymentMethods();
            } else {
                console.warn("⚠️ No payment methods found or invalid response");
                paymentMethods = [];
                renderPaymentMethods();
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Payment methods API error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Response text:", xhr.responseText);
            
            paymentMethods = [];
            
            // Show error message
            let errorMsg = 'Không thể tải danh sách thẻ';
            if (xhr.status === 401) {
                errorMsg = 'Vui lòng đăng nhập để xem thẻ thanh toán';
            } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            
            $('#cards-list').html(`
                <div class="text-center py-3">
                    <i class="mdi mdi-alert-circle text-warning fa-2x mb-2"></i>
                    <p class="text-muted small mb-0">${errorMsg}</p>
                </div>
            `);
            
            // Still render to show empty state
            renderPaymentMethods();
        });
}

// Stripe Elements
let stripeElements = null;
let cardElement = null;
let cardFormVisible = false;

// Render payment methods
function renderPaymentMethods() {
    console.log("=== renderPaymentMethods() called ===");
    console.log("Payment methods:", paymentMethods);
    console.log("Selected payment method:", selectedPaymentMethod);
    console.log("Stripe initialized:", !!stripe);
    
    const cardsList = $('#cards-list');
    const cardsCount = $('#cards-count');
    
    if (cardsList.length === 0) {
        console.error("❌ cards-list element not found!");
        return;
    }
    
    if (cardsCount.length) {
        cardsCount.text(paymentMethods.filter(m => m.type === 'CREDIT_CARD' || m.type === 'DEBIT_CARD').length);
    }
    
    // Only show Stripe form if CARD method is selected and no cards exist
    const hasCards = paymentMethods.filter(m => m.type === 'CREDIT_CARD' || m.type === 'DEBIT_CARD').length > 0;
    const isCardMethodSelected = selectedPaymentMethod === 'CARD';
    
    console.log("hasCards:", hasCards, "isCardMethodSelected:", isCardMethodSelected);
    console.log("Payment methods array:", paymentMethods);
    
    if (!hasCards && isCardMethodSelected) {
        console.log("✅ No cards and CARD method selected - rendering Stripe form");
        if (cardsList.length) {
            // Clear any existing content
            cardsList.html('');
            // Show Stripe card form only when CARD method is selected
            renderStripeCardForm(cardsList);
        }
        $('#add-card-btn').hide(); // Hide "Add" button since form is already shown
        return;
    }
    
    if (!hasCards) {
        // No cards but not CARD method selected - show empty message
        console.log("⚠️ No cards but CARD method not selected");
        if (cardsList.length) {
            cardsList.html(`
                <div class="text-center py-3">
                    <p class="text-muted small mb-0">Chưa có thẻ thanh toán</p>
                    <p class="text-muted small">Vui lòng chọn phương thức thanh toán "Thẻ" để thêm thẻ</p>
                </div>
            `);
        }
        $('#add-card-btn').hide();
        $('#stripe-card-form').hide();
        return;
    }
    
    if (!cardsList.length) return;
    
    let html = '';
    let firstCard = true;
    paymentMethods.forEach(function(method) {
        if (method.type !== 'CREDIT_CARD' && method.type !== 'DEBIT_CARD') return;
        
        const cardNumber = method.cardNumber || '****';
        const cardBrand = method.cardBrand || 'VISA';
        const isDefault = method.isDefault || false;
        const isActive = firstCard || isDefault;
        if (isActive && firstCard) {
            selectedCardId = method.id;
            firstCard = false;
        }
        
        // Get card icon
        let cardIcon = 'fab fa-cc-visa';
        if (cardBrand === 'MASTERCARD') {
            cardIcon = 'fab fa-cc-mastercard text-warning';
        } else if (cardBrand === 'AMEX') {
            cardIcon = 'fab fa-cc-amex text-primary';
        }
        
        html += `
            <label class="btn osahan-radio osahan-card-pay btn-light btn-sm rounded mb-2 w-100 ${isActive ? 'active' : ''}" 
                   onclick="selectCard(${method.id})">
                <input type="radio" name="cardOption" value="${method.id}" ${isActive ? 'checked' : ''}>
                <div class="d-flex align-items-center card-detials small mb-3">
                    <p class="small"><i class="mdi mdi-chip"></i></p>
                    <p class="ml-auto d-flex align-items-center">
                        <span class="card-no mr-2"><i class="mdi mdi-circle"></i> <i class="mdi mdi-circle"></i> <i class="mdi mdi-circle"></i> <i class="mdi mdi-circle"></i></span>
                        <span class="small">${cardNumber}</span>
                    </p>
                </div>
                <h1 class="mb-0">${cardBrand}</h1>
                <p class="small mb-1">${method.cardHolderName || 'Card Holder'}</p>
                <p class="text-right mb-0"><i class="${cardIcon}"></i></p>
            </label>
        `;
    });
    
    cardsList.html(html);
    $('#add-card-btn').show();
    
    // Hide Stripe form if cards exist
    $('#stripe-card-form').hide();
    cardFormVisible = false;
}

// Select card
function selectCard(cardId) {
    selectedCardId = cardId;
    console.log("Selected card ID:", cardId);
}

// Switch payment method
function switchPaymentMethod(method) {
    selectedPaymentMethod = method;
    console.log("Switched to payment method:", method);
    
    // Hide all sections
    $('#cards-section').hide();
    $('#cod-section').hide();
    $('#paypal-section').hide();
    $('#stripe-card-form').hide(); // Hide Stripe form when switching methods
    
    // Show selected section
    if (method === 'CARD') {
        $('#cards-section').show();
        
        // Show Stripe form if no cards exist
        const hasCards = paymentMethods.filter(m => m.type === 'CREDIT_CARD' || m.type === 'DEBIT_CARD').length > 0;
        console.log("switchPaymentMethod - hasCards:", hasCards, "cardFormVisible:", cardFormVisible);
        if (!hasCards) {
            // Show Stripe form in cards section
            const cardsList = $('#cards-list');
            if (cardsList.length) {
                if (!cardFormVisible) {
                    console.log("Rendering Stripe form in switchPaymentMethod...");
                    renderStripeCardForm(cardsList);
                } else {
                    $('#stripe-card-form').show();
                }
            }
            $('#add-card-btn').hide();
        } else {
            $('#add-card-btn').show();
            $('#stripe-card-form').hide();
        }
    } else if (method === 'COD') {
        $('#cod-section').show();
        $('#add-card-btn').hide();
        $('#stripe-card-form').hide(); // Hide Stripe form for COD
    } else if (method === 'PAYPAL') {
        $('#paypal-section').show();
        $('#add-card-btn').hide();
        $('#stripe-card-form').hide(); // Hide Stripe form for PayPal
        generateQRCode();
    }
}

// Generate QR code for PayPal/Bank transfer
function generateQRCode() {
    const qrContainer = $('#qr-code-container');
    if (!qrContainer.length) return;
    
    // For now, we'll create a simple QR code placeholder
    // In production, you would call an API to generate QR code with payment info
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('Thanh toán đơn hàng: ' + (cartTotal || 0) + ' VND')}`;
    
    qrContainer.html(`
        <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid" style="max-width: 200px;">
        <p class="mt-2 small text-muted">Quét mã QR để thanh toán</p>
        <p class="small text-danger"><strong>Lưu ý:</strong> Vui lòng thanh toán đúng số tiền: ${formatVND(cartTotal)}</p>
    `);
}

/**
 * Render Stripe card form when no cards exist
 */
function renderStripeCardForm(container) {
    console.log("=== renderStripeCardForm() called ===");
    console.log("Container:", container.length > 0 ? "Found" : "Not found");
    console.log("Stripe:", stripe ? "Initialized" : "Not initialized");
    console.log("Stripe type:", typeof Stripe);
    
    if (!container || container.length === 0) {
        console.error("❌ Container not found!");
        return;
    }
    
    if (!stripe) {
        console.error("❌ Stripe not initialized");
        // Try to initialize Stripe again
        if (typeof Stripe !== 'undefined') {
            console.log("Attempting to initialize Stripe...");
            stripe = Stripe(stripePublishableKey);
            if (stripe) {
                console.log("✅ Stripe initialized successfully");
            } else {
                console.error("❌ Failed to initialize Stripe");
            }
        }
        
        if (!stripe) {
            container.html(`
                <div class="text-center py-3">
                    <i class="mdi mdi-alert-circle text-danger fa-2x mb-2"></i>
                    <p class="text-danger small mb-0">Lỗi: Stripe chưa được khởi tạo</p>
                    <p class="text-muted small mt-2">Vui lòng refresh trang và thử lại</p>
                </div>
            `);
            return;
        }
    }
    
    // Create form HTML
    const formHtml = `
        <div id="stripe-card-form" class="stripe-card-form">
            <div class="mb-3">
                <label class="form-label small text-dark">Tên chủ thẻ</label>
                <input type="text" id="cardholder-name" class="form-control form-control-sm" placeholder="NGUYEN VAN A" required>
            </div>
            <div class="mb-3">
                <label class="form-label small text-dark">Thông tin thẻ</label>
                <div id="card-element" class="form-control form-control-sm" style="height: 40px; padding: 10px;">
                    <!-- Stripe Elements will create form elements here -->
                </div>
                <div id="card-errors" role="alert" class="text-danger small mt-1"></div>
            </div>
            <button type="button" id="save-card-btn" class="btn btn-primary btn-sm btn-block">
                <i class="mdi mdi-content-save mr-1"></i>Lưu thẻ
            </button>
        </div>
    `;
    
    container.html(formHtml);
    cardFormVisible = true;
    
    console.log("✅ Form HTML inserted, waiting for DOM update...");
    
    // Wait for DOM to update before mounting Stripe Elements
    setTimeout(function() {
        // Check if card element container exists
        const cardElementContainer = document.getElementById('card-element');
        if (!cardElementContainer) {
            console.error("❌ card-element container not found in DOM!");
            container.html(`
                <div class="text-center py-3">
                    <i class="mdi mdi-alert-circle text-danger fa-2x mb-2"></i>
                    <p class="text-danger small mb-0">Lỗi: Không tìm thấy container cho form thẻ</p>
                </div>
            `);
            return;
        }
        
        console.log("✅ card-element container found, initializing Stripe Elements...");
        
        // Initialize Stripe Elements
        if (!stripeElements) {
            try {
                stripeElements = stripe.elements();
                console.log("✅ Stripe Elements created");
            } catch (e) {
                console.error("❌ Error creating Stripe Elements:", e);
                container.html(`
                    <div class="text-center py-3">
                        <i class="mdi mdi-alert-circle text-danger fa-2x mb-2"></i>
                        <p class="text-danger small mb-0">Lỗi khởi tạo Stripe Elements</p>
                    </div>
                `);
                return;
            }
        }
        
        // Create card element
        if (!cardElement) {
            try {
                const style = {
                    base: {
                        fontSize: '14px',
                        color: '#32325d',
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a',
                    },
                };
                
                cardElement = stripeElements.create('card', { style: style });
                cardElement.mount('#card-element');
                console.log("✅ Stripe card element mounted successfully");
                
                // Handle real-time validation errors
                cardElement.on('change', function(event) {
                    const displayError = document.getElementById('card-errors');
                    if (displayError) {
                        if (event.error) {
                            displayError.textContent = event.error.message;
                        } else {
                            displayError.textContent = '';
                        }
                    }
                });
            } catch (e) {
                console.error("❌ Error creating/mounting card element:", e);
                container.html(`
                    <div class="text-center py-3">
                        <i class="mdi mdi-alert-circle text-danger fa-2x mb-2"></i>
                        <p class="text-danger small mb-0">Lỗi tạo form nhập thẻ: ${e.message}</p>
                    </div>
                `);
                return;
            }
        } else {
            // Re-mount if already created
            try {
                cardElement.mount('#card-element');
                console.log("✅ Stripe card element re-mounted");
            } catch (e) {
                console.error("❌ Error re-mounting card element:", e);
                // Try to create new element
                cardElement = null;
                stripeElements = null;
                renderStripeCardForm(container);
            }
        }
        
        // Handle save card button
        $('#save-card-btn').off('click').on('click', function() {
            saveCardToStripe();
        });
    }, 200); // Wait 200ms for DOM to update
}

/**
 * Save card to Stripe and backend
 */
function saveCardToStripe() {
    console.log("=== saveCardToStripe() called ===");
    
    const cardholderName = $('#cardholder-name').val().trim();
    if (!cardholderName) {
        alert('Vui lòng nhập tên chủ thẻ!');
        return;
    }
    
    if (!cardElement) {
        alert('Lỗi: Card element chưa được khởi tạo!');
        return;
    }
    
    // Disable button
    const saveBtn = $('#save-card-btn');
    const originalText = saveBtn.html();
    saveBtn.prop('disabled', true).html('<i class="mdi mdi-loading mdi-spin mr-1"></i> Đang lưu...');
    
    // Create PaymentMethod from card element
    stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
            name: cardholderName,
        },
    }).then(function(result) {
        if (result.error) {
            // Show error
            const errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
            saveBtn.prop('disabled', false).html(originalText);
        } else {
            // PaymentMethod created successfully
            const paymentMethod = result.paymentMethod;
            console.log("PaymentMethod created:", paymentMethod);
            
            // Get card details from PaymentMethod
            const card = paymentMethod.card;
            const cardBrand = card.brand ? card.brand.toUpperCase() : 'VISA';
            const last4 = card.last4 || '****';
            const expMonth = card.exp_month;
            const expYear = card.exp_year;
            
            // Save to backend
            if (typeof ApiService === 'undefined' || typeof ApiService.createPaymentMethod !== 'function') {
                alert('Lỗi: API service chưa sẵn sàng!');
                saveBtn.prop('disabled', false).html(originalText);
                return;
            }
            
            const paymentData = {
                type: 'CREDIT_CARD',
                cardNumber: last4,
                cardHolderName: cardholderName,
                expiryMonth: expMonth,
                expiryYear: expYear,
                cardBrand: cardBrand,
                stripePaymentMethodId: paymentMethod.id,
                isDefault: true // Set as default if no other cards
            };
            
            console.log("Saving payment method to backend:", paymentData);
            
            ApiService.createPaymentMethod(paymentData)
                .done(function(response) {
                    console.log("Create payment method response:", response);
                    
                    const isSuccess = response && (response.success || response.isSuccess || response.status === 200);
                    
                    if (isSuccess) {
                        alert('Lưu thẻ thành công!');
                        
                        // Reload payment methods
                        loadPaymentMethods();
                        
                        // Clear form
                        $('#cardholder-name').val('');
                        if (cardElement) {
                            cardElement.clear();
                        }
                        $('#card-errors').text('');
                    } else {
                        const errorMsg = response?.desc || response?.message || 'Lưu thẻ thất bại!';
                        alert(errorMsg);
                        saveBtn.prop('disabled', false).html(originalText);
                    }
                })
                .fail(function(xhr) {
                    console.error("Error saving payment method:", xhr);
                    let errorMsg = 'Lưu thẻ thất bại!';
                    
                    if (xhr.responseJSON && xhr.responseJSON.desc) {
                        errorMsg = xhr.responseJSON.desc;
                    } else if (xhr.status === 401) {
                        errorMsg = 'Vui lòng đăng nhập để lưu thẻ!';
                    }
                    
                    alert(errorMsg);
                    saveBtn.prop('disabled', false).html(originalText);
                });
        }
    });
}

// Export functions for use in other scripts
window.CheckoutService = {
    loadCartForCheckout: loadCartForCheckout,
    handleCheckout: handleCheckout,
    loadPaymentMethods: loadPaymentMethods,
    switchPaymentMethod: switchPaymentMethod,
    renderStripeCardForm: renderStripeCardForm,
    saveCardToStripe: saveCardToStripe
};

// Helper function to initialize Stripe
function initializeStripe() {
    if (typeof Stripe === 'undefined') {
        console.error("❌ Stripe.js library is not loaded!");
        showStripeError("Stripe.js chưa được tải. Vui lòng refresh trang.");
        return;
    }
    
    if (!stripePublishableKey) {
        console.error("❌ Stripe publishable key is not available!");
        showStripeError("Stripe key chưa được cấu hình");
        return;
    }
    
    try {
        stripe = Stripe(stripePublishableKey);
        console.log("✅ Stripe initialized with key from API");
    } catch (e) {
        console.error("❌ Error initializing Stripe:", e);
        showStripeError("Lỗi khởi tạo Stripe: " + e.message);
    }
}

// Helper function to show Stripe error
function showStripeError(message) {
    $('#cards-list').html(`
        <div class="text-center py-3">
            <i class="mdi mdi-alert-circle text-danger fa-2x mb-2"></i>
            <p class="text-danger small mb-0">${message}</p>
        </div>
    `);
}

