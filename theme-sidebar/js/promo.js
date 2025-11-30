/*
 * Promo Code Management
 * Version: 1.0
 */

console.log("=== PROMO.JS LOADED ===");

// Global state for applied promo
let appliedPromo = null;

/**
 * Load and display promo codes in modal
 */
function loadPromoCodes(restaurantId = null) {
    console.log("=== loadPromoCodes() called ===");
    console.log("Restaurant ID:", restaurantId);
    
    const promoModal = $('#mycoupansModal');
    if (!promoModal.length) {
        console.warn("⚠️ Promo modal not found");
        return;
    }
    
    const modalBody = promoModal.find('.modal-body');
    if (!modalBody.length) {
        console.warn("⚠️ Promo modal body not found");
        return;
    }
    
    // Show loading state
    modalBody.html('<div class="text-center py-4"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải mã khuyến mãi...</div>');
    
    // Call API
    let apiCall;
    if (restaurantId) {
        apiCall = ApiService.getPromosByRestaurant(restaurantId);
    } else {
        apiCall = ApiService.getAllPromos();
    }
    
    apiCall
        .done(function(response) {
            console.log("=== Promo API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const promos = response && response.data;
            
            if (isSuccess && promos && Array.isArray(promos) && promos.length > 0) {
                renderPromoCodes(promos);
            } else {
                showNoPromoCodes();
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Promo API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            showNoPromoCodes();
        });
}

/**
 * Render promo codes in modal
 */
function renderPromoCodes(promos) {
    console.log("=== renderPromoCodes() called ===");
    console.log("Promos:", promos);
    
    const modalBody = $('#mycoupansModal .modal-body');
    if (!modalBody.length) {
        console.error("❌ Promo modal body not found!");
        return;
    }
    
    let html = '';
    promos.forEach(function(promo) {
        // Get all fields from API response dynamically
        const promoId = promo.id || promo.promoId;
        // Always use code from API - this is the actual promo code
        const promoCode = promo.code || promo.promoCode || `PROMO${promoId}`;
        const name = promo.name || promo.promoName || '';
        const type = promo.type || 'FOOD_DISCOUNT'; // FOOD_DISCOUNT or SHIP_DISCOUNT
        const percent = promo.percent || promo.discountPercent || 0;
        const value = promo.value || promo.discountValue || 0;
        const maxDiscount = promo.maxDiscount || promo.maxDiscountValue || 0;
        const restaurantName = promo.restaurantName || promo.restaurantTitle || 'Tất cả nhà hàng';
        const description = promo.description || promo.desc || '';
        const startDate = promo.startDate ? new Date(promo.startDate).toLocaleDateString('vi-VN') : '';
        const endDate = promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : '';
        const minOrderValue = promo.minOrderValue || promo.minOrder || 0;
        
        // Format discount text based on type
        let discountText = '';
        if (type === 'SHIP_DISCOUNT') {
            discountText = percent > 0 ? `Giảm ${percent}% phí ship` : `Giảm ${formatVND(value)} phí ship`;
        } else {
            discountText = percent > 0 ? `Giảm ${percent}%` : `Giảm ${formatVND(value)}`;
        }
        
        // Build description text
        let fullDescription = description;
        if (!fullDescription) {
            if (type === 'SHIP_DISCOUNT') {
                fullDescription = `Sử dụng mã ${promoCode} & giảm ${percent > 0 ? percent + '%' : formatVND(value)} phí ship cho đơn hàng${restaurantName !== 'Tất cả nhà hàng' ? ' tại ' + restaurantName : ''}.`;
            } else {
                fullDescription = `Sử dụng mã ${promoCode} & giảm ${percent > 0 ? percent + '%' : formatVND(value)} cho đơn hàng${restaurantName !== 'Tất cả nhà hàng' ? ' tại ' + restaurantName : ''}.`;
            }
            if (maxDiscount > 0) {
                fullDescription += ` Giảm giá tối đa: ${formatVND(maxDiscount)}`;
            }
            if (minOrderValue > 0) {
                fullDescription += ` Áp dụng cho đơn hàng từ ${formatVND(minOrderValue)}`;
            }
        }
        
        const validPeriod = startDate && endDate ? `Áp dụng từ ${startDate} đến ${endDate}` : '';
        
        // Determine badge color based on discount amount
        const badgeClass = percent >= 50 ? 'badge-danger' : percent >= 20 ? 'badge-warning' : 'badge-primary';
        
        html += `
            <div class="card offer-card bg-light border rounded mb-3" data-promo-id="${promoId}" style="box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                        <span class="badge ${badgeClass} badge-pill mr-2" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">${promoCode}</span>
                        <h5 class="card-title mb-0 flex-grow-1">${promoCode}</h5>
                    </div>
                    <h6 class="card-subtitle mb-2 text-danger font-weight-bold">${discountText}${name ? ' - ' + name : ''}</h6>
                    <p class="card-text text-muted small">${fullDescription}</p>
                    ${validPeriod ? `<p class="card-text small text-muted mb-2"><i class="mdi mdi-calendar-range"></i> ${validPeriod}</p>` : ''}
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <a href="#" class="btn btn-sm btn-primary apply-promo-btn" data-promo-id="${promoId}" data-promo-code="${promoCode}" data-percent="${percent}" data-value="${value}" data-type="${type}">
                            <i class="mdi mdi-check-circle mr-1"></i> ÁP DỤNG MÃ
                        </a>
                        <a href="#" class="text-muted small" onclick="return false;">
                            <i class="mdi mdi-information-outline"></i> TÌM HIỂU THÊM
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    modalBody.html(html);
    
    // Attach event handlers
    attachPromoEventHandlers();
    
    console.log("✅ Promo codes rendered successfully");
}

/**
 * Show message when no promo codes available
 */
function showNoPromoCodes() {
    console.log("=== showNoPromoCodes() called ===");
    
    const modalBody = $('#mycoupansModal .modal-body');
    if (!modalBody.length) {
        return;
    }
    
    modalBody.html(`
        <div class="text-center py-4">
            <i class="mdi mdi-tag-off-outline" style="font-size: 48px; color: #ccc;"></i>
            <p class="text-muted mt-3">Hiện tại không có mã khuyến mãi nào</p>
        </div>
    `);
}

/**
 * Attach event handlers for promo codes
 */
function attachPromoEventHandlers() {
    // Remove existing handlers
    $(document).off('click', '.apply-promo-btn');
    
    // Apply promo button click
    $(document).on('click', '.apply-promo-btn', function(e) {
        e.preventDefault();
        
        const button = $(this);
        const promoId = button.data('promo-id');
        // Get promo code from data attribute (set from API)
        const promoCode = button.data('promo-code') || '';
        const percent = button.data('percent') || 0;
        const value = button.data('value') || 0;
        const type = button.data('type') || 'FOOD_DISCOUNT';
        
        console.log("=== Apply promo clicked ===");
        console.log("Promo ID:", promoId);
        console.log("Promo Code from API:", promoCode);
        console.log("Percent:", percent);
        console.log("Value:", value);
        console.log("Type:", type);
        
        applyPromoCode(promoId, promoCode, percent, value, type);
    });
}

/**
 * Helper function to format VND currency
 */
function formatVND(amount) {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Apply promo code to cart
 */
function applyPromoCode(promoId, promoCode, percent, value, type) {
    console.log("=== applyPromoCode() called ===");
    console.log("Promo ID:", promoId);
    console.log("Promo Code:", promoCode);
    console.log("Percent:", percent);
    console.log("Value:", value);
    console.log("Type:", type);
    
    if (!promoId) {
        alert('Mã khuyến mãi không hợp lệ!');
        return;
    }
    
    // Store applied promo with all data including code from API
    appliedPromo = {
        id: promoId,
        code: promoCode || `PROMO${promoId}`, // Store code from API
        percent: percent || 0,
        value: value || 0,
        type: type || 'FOOD_DISCOUNT'
    };
    
    // Save to localStorage
    localStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
    
    // Close modal
    $('#mycoupansModal').modal('hide');
    
    // Update promo code display in cart sidebar immediately
    const cartPromoDisplay = $('#cart-promo-code-display');
    if (cartPromoDisplay.length) {
        cartPromoDisplay.text(promoCode || `PROMO${promoId}`);
    }
    
    // Reload cart to show discount
    if (typeof loadCart === 'function') {
        loadCart();
    } else if (typeof CartService !== 'undefined' && CartService.loadCart) {
        CartService.loadCart();
    }
    
    // Show success message
    const discountText = percent > 0 ? `${percent}%` : formatVND(value);
    showPromoAppliedMessage(discountText, type);
    
    console.log("✅ Promo applied:", appliedPromo);
}

/**
 * Get applied promo from localStorage
 */
function getAppliedPromo() {
    const stored = localStorage.getItem('appliedPromo');
    if (stored) {
        try {
            appliedPromo = JSON.parse(stored);
            return appliedPromo;
        } catch (e) {
            console.error("Error parsing applied promo:", e);
            localStorage.removeItem('appliedPromo');
            return null;
        }
    }
    return null;
}

/**
 * Remove applied promo
 */
function removeAppliedPromo() {
    appliedPromo = null;
    localStorage.removeItem('appliedPromo');
    
    // Update promo code display in cart sidebar immediately
    const cartPromoDisplay = $('#cart-promo-code-display');
    if (cartPromoDisplay.length) {
        cartPromoDisplay.text('Chưa có mã');
    }
    
    // Reload cart
    if (typeof loadCart === 'function') {
        loadCart();
    } else if (typeof CartService !== 'undefined' && CartService.loadCart) {
        CartService.loadCart();
    }
    
    console.log("✅ Promo removed");
}

/**
 * Calculate discount amount
 */
function calculateDiscount(totalPrice, promo) {
    if (!promo || totalPrice <= 0) {
        return 0;
    }
    
    let discount = 0;
    
    // Check if it's percentage discount or fixed value discount
    if (promo.percent && promo.percent > 0) {
        // Percentage discount
        discount = (totalPrice * promo.percent) / 100;
        
        // Apply max discount if exists
        if (promo.maxDiscount && promo.maxDiscount > 0 && discount > promo.maxDiscount) {
            discount = promo.maxDiscount;
        }
    } else if (promo.value && promo.value > 0) {
        // Fixed value discount
        discount = promo.value;
        
        // Don't exceed total price
        if (discount > totalPrice) {
            discount = totalPrice;
        }
    }
    
    return Math.round(discount);
}

/**
 * Show success message when promo is applied
 */
function showPromoAppliedMessage(discountText, type) {
    // You can customize this to show a toast notification
    const discountType = type === 'SHIP_DISCOUNT' ? 'phí ship' : '';
    const message = `Đã áp dụng mã khuyến mãi giảm ${discountText}${discountType ? ' ' + discountType : ''}!`;
    console.log("✅ " + message);
    
    // Show alert for now (can be replaced with toast notification)
    alert(message);
}

/**
 * Initialize promo functionality
 */
$(document).ready(function() {
    console.log("=== Promo.js $(document).ready() ===");
    
    // Load promo codes when modal is shown
    $('#mycoupansModal').on('show.bs.modal', function() {
        console.log("Promo modal shown, loading promo codes...");
        
        // Get restaurant ID from cart if available
        let restaurantId = null;
        if (typeof getCartRestaurantId === 'function') {
            restaurantId = getCartRestaurantId();
        }
        
        loadPromoCodes(restaurantId);
    });
    
    // Load applied promo on page load
    getAppliedPromo();
    
    console.log("✅ Promo.js initialized");
});

// Export functions for use in other scripts
window.PromoService = {
    loadPromoCodes: loadPromoCodes,
    applyPromoCode: applyPromoCode,
    getAppliedPromo: getAppliedPromo,
    removeAppliedPromo: removeAppliedPromo,
    calculateDiscount: calculateDiscount
};

