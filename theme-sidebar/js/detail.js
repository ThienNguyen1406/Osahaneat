/*
 * Detail Page - Load restaurant detail and menu from API
 * Version: 2.3 - Fixed user ID extraction from API for Add to Cart
 */

console.log("=== DETAIL.JS LOADED - VERSION 2.3 ===");
console.log("API_BASE_URL should be defined in api.js");
console.log("ApiService available:", typeof ApiService !== 'undefined');

// API_BASE_URL is defined in api.js

// Helper function to safely format rating
function formatRating(rating) {
    if (rating == null || rating === undefined) {
        return '0.0';
    }
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum)) {
        return '0.0';
    }
    return ratingNum.toFixed(1);
}

// Helper function to format price
function formatPrice(price) {
    if (price == null || price === undefined) {
        return '0 ₫';
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
        return '0 ₫';
    }
    return priceNum.toLocaleString('vi-VN') + ' ₫';
}

// Helper function to get image URL
function getImageUrl(image, defaultImage = 'img/burgerking.png') {
    if (!image) {
        console.warn("⚠️ No image provided, using default:", defaultImage);
        return defaultImage;
    }
    
    console.log("🔍 Processing image URL - Original:", image);
    
    // Nếu đã là full URL, trả về luôn
    if (image.startsWith('http://') || image.startsWith('https://')) {
        console.log("✅ Image is already full URL:", image);
        return image;
    }
    
    // Nếu bắt đầu bằng /, thêm base URL
    if (image.startsWith('/')) {
        const fullUrl = 'http://localhost:82' + image;
        console.log("✅ Image path starts with /, full URL:", fullUrl);
        return fullUrl;
    }
    
    // Nếu có chứa "restaurant/file" hoặc "menu/file", thêm base URL
    if (image.includes('restaurant/file/') || image.includes('menu/file/')) {
        const fullUrl = 'http://localhost:82' + (image.startsWith('/') ? image : '/' + image);
        console.log("✅ Image contains file path, full URL:", fullUrl);
        return fullUrl;
    }
    
    // Nếu bắt đầu bằng "images/", thêm base URL
    if (image.startsWith('images/')) {
        const fullUrl = 'http://localhost:82/' + image;
        console.log("✅ Image starts with images/, full URL:", fullUrl);
        return fullUrl;
    }
    
    // Use ApiService if available
    if (typeof ApiService !== 'undefined' && ApiService.getRestaurantImage) {
        const apiUrl = ApiService.getRestaurantImage(image);
        console.log("✅ Using ApiService, URL:", apiUrl);
        return apiUrl;
    }
    
    // Default: thêm /restaurant/file/
    const defaultUrl = 'http://localhost:82/restaurant/file/' + image;
    console.log("✅ Using default format, URL:", defaultUrl);
    return defaultUrl;
}

// Helper function to get menu image URL
function getMenuImageUrl(image, defaultImage = 'img/food1.jpg') {
    if (!image) {
        return defaultImage;
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    if (image.startsWith('/')) {
        return 'http://localhost:82' + image;
    }
    // Use ApiService if available, otherwise hardcode
    if (typeof ApiService !== 'undefined' && ApiService.getMenuImage) {
        return ApiService.getMenuImage(image);
    }
    return 'http://localhost:82/menu/file/' + image;
}

$(document).ready(function() {
    console.log("=== $(document).ready() fired in detail.js ===");
    console.log("jQuery available:", typeof jQuery !== 'undefined');
    console.log("$ available:", typeof $ !== 'undefined');
    console.log("ApiService available:", typeof ApiService !== 'undefined');
    
    // Check dependencies
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        console.error("Available globals:", Object.keys(window).filter(k => k.includes('Api') || k.includes('Service')));
        
        setTimeout(function() {
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService still not loaded after 500ms!");
                console.error("Available globals after delay:", Object.keys(window).filter(k => k.includes('Api') || k.includes('Service')));
                return;
            }
            console.log("✅ ApiService loaded after delay");
            console.log("ApiService methods:", Object.keys(ApiService));
            loadRestaurantDetailFromURL();
        }, 500);
        return;
    }
    
    console.log("✅ ApiService is available");
    console.log("ApiService methods:", Object.keys(ApiService));
    console.log("getRestaurantDetail method:", typeof ApiService.getRestaurantDetail);
    
    loadRestaurantDetailFromURL();
});

function loadRestaurantDetailFromURL() {
    console.log("=== loadRestaurantDetailFromURL() called ===");
    
    // Lấy restaurant ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');
    
    console.log("Current URL:", window.location.href);
    console.log("URL search params:", window.location.search);
    console.log("Restaurant ID from URL:", restaurantId);
    
    if (restaurantId) {
        const id = parseInt(restaurantId);
        console.log("Parsed restaurant ID:", id);
        if (isNaN(id)) {
            console.error("❌ Invalid restaurant ID (not a number):", restaurantId);
            alert("ID nhà hàng không hợp lệ!");
            return;
        }
        loadRestaurantDetail(id);
    } else {
        console.error("❌ Restaurant ID not found in URL");
        console.error("URL:", window.location.href);
        alert("Không tìm thấy ID nhà hàng trong URL! Vui lòng truy cập với URL dạng: detail.html?id=1");
    }
}

function loadRestaurantDetail(restaurantId) {
    console.log("=== loadRestaurantDetail() called ===");
    console.log("Restaurant ID:", restaurantId);
    
    if (!restaurantId || isNaN(restaurantId)) {
        console.error("❌ Invalid restaurant ID:", restaurantId);
        alert("ID nhà hàng không hợp lệ!");
        return;
    }
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        console.error("Available globals:", Object.keys(window).filter(k => k.includes('Api') || k.includes('Service')));
        alert("Lỗi: API service chưa được load!");
        return;
    }
    
    if (typeof ApiService.getRestaurantDetail !== 'function') {
        console.error("❌ ApiService.getRestaurantDetail is not a function!");
        console.error("ApiService:", ApiService);
        console.error("Available methods:", Object.keys(ApiService));
        alert("Lỗi: API service không có method getRestaurantDetail!");
        return;
    }
    
    console.log("Calling ApiService.getRestaurantDetail()...");
    console.log("API URL will be:", `http://localhost:82/restaurant/detail?id=${restaurantId}`);
    
    const apiCall = ApiService.getRestaurantDetail(restaurantId);
    
    console.log("API call returned:", apiCall);
    console.log("API call type:", typeof apiCall);
    console.log("API call has done method:", typeof apiCall?.done === 'function');
    
    if (!apiCall || typeof apiCall.done !== 'function') {
        console.error("❌ API call did not return a jQuery promise!");
        console.error("Returned:", apiCall);
        alert("Lỗi: API call không trả về promise hợp lệ!");
        return;
    }
    
    console.log("✅ API call is valid, waiting for response...");
    
    apiCall
        .done(function(response) {
            console.log("=== Restaurant Detail API Response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.status:", response?.status);
            console.log("Response.data:", response?.data);
            
            // Backend response format: { status, isSuccess/success, desc, data }
            // Check cả isSuccess, success, và status === 200
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data;
            
            console.log("Restaurant detail check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData) {
                console.log("✅ Restaurant data is valid, rendering...");
                renderRestaurantDetail(response.data);
            } else {
                console.warn("⚠️ Restaurant detail response format invalid:", response);
                const errorMsg = response?.desc || "Không thể tải thông tin nhà hàng!";
                alert(errorMsg);
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Restaurant Detail API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Status code:", xhr.status);
            console.error("Response text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            
            let errorMsg = "Không thể tải thông tin nhà hàng!";
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            } else if (xhr.status === 404) {
                errorMsg = "Không tìm thấy nhà hàng với ID này!";
            }
            alert(errorMsg);
        });
}

function renderRestaurantDetail(restaurant) {
    console.log("=== renderRestaurantDetail() called ===");
    console.log("Restaurant data:", restaurant);
    
    if (!restaurant) {
        console.error("❌ Restaurant data is null or undefined!");
        return;
    }
    
    // Update restaurant header
    const restaurantHeader = $('#restaurant-header');
    if (restaurantHeader.length === 0) {
        console.error("❌ Restaurant header container not found!");
        return;
    }
    
    console.log("Updating restaurant header...");
    
    // Update title
    if (restaurant.title) {
        $('.restaurant-title').text(restaurant.title);
        console.log("Restaurant title set to:", restaurant.title);
    }
    
    // Update subtitle (if exists)
    if (restaurant.subtitle) {
        // Add subtitle to restaurant detail if needed
        if ($('.restaurant-subtitle').length === 0) {
            $('.restaurant-title').after(`<p class="mb-0 small text-muted restaurant-subtitle">${restaurant.subtitle}</p>`);
        } else {
        $('.restaurant-subtitle').text(restaurant.subtitle);
        }
        console.log("Restaurant subtitle set to:", restaurant.subtitle);
    }
    
    // Update description
    if (restaurant.description) {
        $('.restaurant-description').text(restaurant.description);
        console.log("Restaurant description set");
    }
    
    // Update restaurant logo/image
    console.log("🖼️ Restaurant image data:", restaurant.image);
    if (restaurant.image) {
        const imageUrl = getImageUrl(restaurant.image);
        const restaurantImageEl = $('.restaurant-image');
        if (restaurantImageEl.length > 0) {
            // Remove old error handler to avoid duplicates
            restaurantImageEl.off('error');
            restaurantImageEl.attr('src', imageUrl).attr('alt', restaurant.title || 'Restaurant');
            console.log("✅ Restaurant image set to:", imageUrl);
            // Add error handler
            restaurantImageEl.on('error', function() {
                console.error("❌ Failed to load restaurant image:", imageUrl);
                console.error("Trying fallback image: img/king-logo.png");
                $(this).attr('src', 'img/king-logo.png');
            });
        } else {
            console.warn("⚠️ .restaurant-image element not found!");
            console.warn("Available image elements:", $('img').length);
            console.warn("Restaurant header HTML:", $('#restaurant-header').html());
        }
    } else {
        console.warn("⚠️ Restaurant has no image data");
        // Set default image if no image provided
        const restaurantImageEl = $('.restaurant-image');
        if (restaurantImageEl.length > 0) {
            restaurantImageEl.attr('src', 'img/king-logo.png');
        }
    }
    
    // Update banner image (if exists)
    if (restaurant.image) {
        const bannerImageUrl = getImageUrl(restaurant.image);
        const bannerImageEl = $('.banner-image img');
        if (bannerImageEl.length > 0) {
            bannerImageEl.attr('src', bannerImageUrl).attr('alt', restaurant.title || 'Restaurant Banner');
            console.log("✅ Banner image set to:", bannerImageUrl);
            // Add error handler
            bannerImageEl.off('error').on('error', function() {
                console.error("❌ Failed to load banner image:", bannerImageUrl);
                $(this).attr('src', 'img/banner.jpg');
            });
        } else {
            console.warn("⚠️ .banner-image img element not found!");
        }
    } else {
        console.warn("⚠️ Restaurant has no image for banner");
    }
    
    // Update rating - safely handle null/undefined/NaN
    const rating = formatRating(restaurant.rating);
    $('.restaurant-rating').text(rating);
    console.log("Restaurant rating set to:", rating);
    
    // Update free ship badge
    const restaurantDetail = $('.restaurant-detail');
    if (restaurant.isFreeShip || restaurant.freeShip) {
        if (restaurantDetail.find('.badge-light').length === 0) {
            restaurantDetail.html('<span class="badge badge-light"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>');
        }
        console.log("Free ship badge added");
    }
    
    // Render tabs dynamically based on categories
    if (restaurant.categories && Array.isArray(restaurant.categories) && restaurant.categories.length > 0) {
        console.log("Rendering tabs and menus, count:", restaurant.categories.length);
        renderTabsAndMenus(restaurant.categories);
    } else {
        console.warn("⚠️ No categories found in restaurant data");
        $('#restaurant-menu-container').html('<div class="col-12"><p class="text-center text-muted">Không có menu nào.</p></div>');
    }
    
    console.log("✅ Restaurant detail rendered successfully");
    
    // Load rating widget and ratings list
    if (restaurant.id) {
        loadRatingWidget(restaurant.id, 'restaurant', 'restaurant-rating-widget');
        loadRestaurantRatings(restaurant.id);
    }
}

function renderTabsAndMenus(categories) {
    console.log("=== renderTabsAndMenus() called ===");
    console.log("Categories count:", categories.length);
    console.log("Categories data:", categories);
    
    if (!categories || categories.length === 0) {
        console.warn("⚠️ No categories to render");
        $('#restaurant-menu-container').html('<div class="col-12"><p class="text-center text-muted">Không có menu nào.</p></div>');
        return;
    }
    
    // Render tabs dynamically
    const tabsContainer = $('#myTab');
    if (tabsContainer.length > 0) {
        console.log("✅ Found tabs container, clearing existing tabs...");
        // Clear existing tabs (remove static tabs)
        tabsContainer.empty();
        
        // Create tabs for each category
        let tabsHtml = '';
        let tabContentHtml = '<div class="tab-content" id="myTabContent">';
        
        categories.forEach(function(category, categoryIndex) {
            const categoryName = category.name || `Category ${categoryIndex + 1}`;
            const tabId = `category-${categoryIndex}`;
            const tabContentId = `category-${categoryIndex}-content`;
            const isActive = categoryIndex === 0 ? 'active' : '';
            
            // Create tab button
            tabsHtml += `
                <li class="nav-item ${categoryIndex > 0 ? 'mx-2' : 'mr-2'}" role="presentation">
                    <a class="nav-link border-0 btn btn-light ${isActive}" id="${tabId}-tab" data-toggle="tab" href="#${tabContentId}" role="tab" aria-controls="${tabContentId}" aria-selected="${categoryIndex === 0 ? 'true' : 'false'}">${categoryName}</a>
                </li>
            `;
            
            // Create tab content
            tabContentHtml += `
                <div class="tab-pane fade ${isActive ? 'show active' : ''}" id="${tabContentId}" role="tabpanel" aria-labelledby="${tabId}-tab">
                    <div class="row">
            `;
            
            // Render menu items for this category
            if (category.menus && Array.isArray(category.menus) && category.menus.length > 0) {
                console.log(`Category "${categoryName}" has ${category.menus.length} menus`);
                
                category.menus.forEach(function(menu, menuIndex) {
                    console.log(`Processing menu ${menuIndex + 1}:`, menu.title);
                    console.log(`Menu data:`, menu); // Debug: log toàn bộ menu object
                    
                    const imageUrl = getMenuImageUrl(menu.image);
                    const freeShipBadge = (menu.isFreeShip || menu.freeShip) 
                        ? '<span class="badge badge-success freeship-badge-inline"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' 
                        : '';
                    
                    const menuPrice = menu.price || 0;
                    const priceFormatted = formatPrice(menuPrice);
                    // Lấy ID từ nhiều nguồn có thể có
                    // Kiểm tra tất cả các khả năng
                    let menuId = null;
                    if (menu.id !== undefined && menu.id !== null) {
                        menuId = parseInt(menu.id);
                    } else if (menu.foodId !== undefined && menu.foodId !== null) {
                        menuId = parseInt(menu.foodId);
                    } else if (menu.menuId !== undefined && menu.menuId !== null) {
                        menuId = parseInt(menu.menuId);
                    }
                    
                    if (!menuId || isNaN(menuId) || menuId <= 0) {
                        console.error(`❌ Menu "${menu.title}" has no valid ID!`);
                        console.error(`Menu object keys:`, Object.keys(menu));
                        console.error(`Menu object:`, JSON.stringify(menu, null, 2));
                        // Không render món này nếu không có ID hợp lệ
                        return; // Skip this menu item
                    }
                    
                    console.log(`✅ Menu "${menu.title}" has ID: ${menuId} (type: ${typeof menuId})`);
                    
                    tabContentHtml += `
                        <div class="col-xl-4 col-md-6 mb-4">
                            <div class="bg-white shadow-sm rounded d-flex align-items-center p-1 osahan-list">
                                <div class="bg-light p-3 rounded">
                                    <img src="${imageUrl}" class="img-fluid" alt="${menu.title || 'Food Item'}" onerror="this.src='img/food1.jpg'" style="width: 80px; height: 80px; object-fit: cover;">
                                </div>
                                <div class="mx-3 py-2 w-100 d-flex flex-column" style="min-width: 0;">
                                    <div style="flex: 0 0 auto;">
                                        <p class="mb-1 text-black font-weight-bold" style="font-size: 1rem; line-height: 1.3;">${menu.title || 'Food Item'}</p>
                                        ${menu.description ? `<p class="mb-1 small text-muted" style="line-height: 1.3; font-size: 0.85rem;">${menu.description}</p>` : ''}
                                        <div class="mb-2 d-flex align-items-center flex-wrap" style="gap: 8px; row-gap: 4px; width: 100%;">
                                            ${menu.timeShip ? `<span class="small text-muted d-flex align-items-center" style="flex-shrink: 0;"><i class="mdi mdi-clock-outline mr-1"></i> ${menu.timeShip}</span>` : ''}
                                            ${freeShipBadge ? `<span style="margin-left: auto; flex-shrink: 0;">${freeShipBadge}</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="mt-auto" style="flex: 0 0 auto; margin-top: 8px !important;">
                                        <p class="mb-2 text-primary font-weight-bold" style="font-size: 1.1rem;">${priceFormatted}</p>
                                        <div class="d-flex align-items-center gap-2">
                                            ${menuId && menuId > 0 ? `
                                            <button class="btn btn-sm btn-primary add-to-cart-btn" data-food-id="${menuId}" data-food-title="${(menu.title || 'Food Item').replace(/"/g, '&quot;')}" data-food-price="${menuPrice}">
                                                <i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ
                                            </button>
                                            ` : `
                                            <button class="btn btn-sm btn-secondary" disabled title="Món ăn không có ID hợp lệ">
                                                <i class="mdi mdi-alert-circle mr-1"></i> Không thể thêm
                                            </button>
                                            `}
                                            ${menuId && menuId > 0 ? `
                                            <button class="btn btn-sm btn-outline-warning rate-food-btn" data-food-id="${menuId}" data-food-title="${(menu.title || 'Food Item').replace(/"/g, '&quot;')}" title="Đánh giá món ăn">
                                                <i class="fas fa-star"></i>
                                            </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                console.warn(`Category "${categoryName}" has no menus`);
                tabContentHtml += `
                    <div class="col-12">
                        <p class="text-muted small text-center">Không có món nào trong category này.</p>
                    </div>
                `;
            }
            
            tabContentHtml += `
                    </div>
                </div>
            `;
        });
        
        tabContentHtml += '</div>';
        
        // Update tabs
        tabsContainer.html(tabsHtml);
        console.log("✅ Tabs rendered successfully");
        
        // Insert tab content into menu container
        const menuContainer = $('#restaurant-menu-container');
        if (menuContainer.length > 0) {
            menuContainer.html(tabContentHtml);
            console.log("✅ Tab content inserted into menu container");
            console.log("✅ Total categories rendered:", categories.length);
            console.log("✅ Tab content HTML length:", tabContentHtml.length);
            
            // Initialize Bootstrap tabs - activate first tab
            setTimeout(function() {
                const firstTabLink = tabsContainer.find('a.nav-link').first();
                if (firstTabLink.length > 0) {
                    firstTabLink.tab('show');
                    console.log("✅ First tab activated");
                }
            }, 100);
        } else {
            console.error("❌ Menu container (#restaurant-menu-container) not found, creating new one...");
            const containerFluid = $('.container-fluid');
            if (containerFluid.length > 0) {
                containerFluid.append(`<div id="restaurant-menu-container">${tabContentHtml}</div>`);
                console.log("✅ Created new menu container");
            } else {
                console.error("❌ Cannot find .container-fluid to insert menu!");
            }
        }
        
        console.log("✅ Categories and menus rendered successfully with tabs");
        
        // Attach event handlers for add to cart buttons
        attachAddToCartHandlers();
        
        // Attach event handlers for rating buttons
        attachRatingHandlers();
    } else {
        console.error("❌ Tabs container not found!");
        // Fallback: render without tabs
        renderCategoriesAndMenus(categories);
    }
}

// Attach event handlers for add to cart buttons
function attachAddToCartHandlers() {
    console.log("=== attachAddToCartHandlers() called ===");
    
    // Remove existing handlers to avoid duplicates
    $(document).off('click', '.add-to-cart-btn').on('click', '.add-to-cart-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = $(this);
        let foodId = button.data('food-id');
        const foodTitle = button.data('food-title');
        const foodPrice = button.data('food-price');
        
        // Convert to integer if it's a string
        if (typeof foodId === 'string') {
            foodId = parseInt(foodId);
        }
        
        console.log("Add to cart clicked - Food ID:", foodId, "Type:", typeof foodId, "Title:", foodTitle, "Price:", foodPrice);
        console.log("Button data attributes:", button.data()); // Debug: log tất cả data attributes
        console.log("Button HTML:", button[0].outerHTML); // Debug: log HTML của button
        
        if (!foodId || isNaN(foodId) || foodId <= 0 || foodId === '0' || foodId === 0) {
            console.error("❌ Invalid food ID:", foodId, "Type:", typeof foodId);
            alert('Không thể thêm món này vào giỏ hàng! Món ăn không có ID hợp lệ. Vui lòng tải lại trang và thử lại.');
            return;
        }
        
        // Disable button to prevent double-click
        button.prop('disabled', true);
        button.html('<i class="mdi mdi-loading mdi-spin mr-1"></i> Đang thêm...');
        
        // Get user ID from API (async)
        getUserIdFromAPI(function(userId) {
            if (!userId) {
                console.warn("⚠️ No user ID found, redirecting to login...");
                alert('Vui lòng đăng nhập để thêm món vào giỏ hàng!');
                button.prop('disabled', false);
                button.html('<i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ');
                window.location.href = 'signin.html';
                return;
            }
            
            // Call API to add to cart
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService is not defined!");
                alert('Lỗi: API service chưa được load!');
                button.prop('disabled', false);
                button.html('<i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ');
                return;
            }
            
            console.log("Calling ApiService.addToCart()...");
            ApiService.addToCart(userId, foodId, 1)
            .done(function(response) {
                console.log("=== Add to Cart API Response ===");
                console.log("Full response:", response);
                
                const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
                
                if (isSuccess) {
                    console.log("✅ Item added to cart successfully");
                    
                    // Show success message
                    button.html('<i class="mdi mdi-check mr-1"></i> Đã thêm!');
                    button.removeClass('btn-primary').addClass('btn-success');
                    
                    // Update cart badge immediately to sync across tabs
                    if (typeof CartSync !== 'undefined' && CartSync.loadCartCount) {
                        console.log("Updating cart badge count...");
                        CartSync.loadCartCount();
                    }
                    
                    // Force reload cart - check if modal is open and reload immediately
                    const cartModal = $('#cartModal');
                    // More reliable check for modal open state
                    const isModalOpen = cartModal.length > 0 && (
                        cartModal.hasClass('show') || 
                        cartModal.is(':visible') || 
                        cartModal.hasClass('in') ||
                        $('body').hasClass('modal-open')
                    );
                    
                    console.log("Cart modal state check:", {
                        exists: cartModal.length > 0,
                        hasShow: cartModal.hasClass('show'),
                        isVisible: cartModal.is(':visible'),
                        bodyHasModalOpen: $('body').hasClass('modal-open'),
                        isModalOpen: isModalOpen
                    });
                    
                    if (typeof CartService !== 'undefined' && CartService.loadCart) {
                        if (isModalOpen) {
                            // Modal is open, reload after API has processed
                            console.log("Cart modal is open, will reload cart after API processes...");
                            // Wait longer to ensure API has processed the add to cart request
                            setTimeout(function() {
                                console.log("Reloading cart now...");
                                // Force reload by resetting loading flag if needed
                                if (typeof window.isLoadingCart !== 'undefined' && window.isLoadingCart) {
                                    console.log("Cart is loading, will retry...");
                                    setTimeout(function() {
                                        window.isLoadingCart = false;
                                        CartService.loadCart();
                                    }, 800);
                                } else {
                                    CartService.loadCart();
                                }
                            }, 800); // Increased delay to ensure API processed
                        } else {
                            // Modal not open, set flag so cart reloads when modal opens
                            console.log("Cart modal not open, setting flag for reload when opened...");
                            // Set a flag in localStorage to indicate cart needs refresh
                            localStorage.setItem('cartNeedsRefresh', 'true');
                            localStorage.setItem('cartNeedsRefreshTime', Date.now().toString());
                        }
                    }
                    
                    // Always trigger events for other listeners
                    $(document).trigger('cartItemAdded', [foodId]);
                    $(document).trigger('cartUpdated');
                    
                    // Reset button after 2 seconds
                    setTimeout(function() {
                        button.prop('disabled', false);
                        button.html('<i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ');
                        button.removeClass('btn-success').addClass('btn-primary');
                    }, 2000);
                } else {
                    console.warn("⚠️ Add to cart failed:", response);
                    const errorMsg = response?.desc || 'Thêm món vào giỏ hàng thất bại!';
                    alert(errorMsg);
                    
                    button.prop('disabled', false);
                    button.html('<i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ');
                }
            })
            .fail(function(xhr, status, error) {
                console.error("=== Add to Cart API Error ===");
                console.error("XHR:", xhr);
                console.error("Status:", status);
                console.error("Error:", error);
                console.error("Status code:", xhr.status);
                console.error("Response text:", xhr.responseText);
                console.error("Response JSON:", xhr.responseJSON);
                
                let errorMsg = 'Thêm món vào giỏ hàng thất bại!';
                
                // Check token
                const token = localStorage.getItem('token');
                console.log("Token present:", token !== null);
                if (token) {
                    console.log("Token length:", token.length);
                }
                
                if (xhr.status === 401) {
                    errorMsg = 'Vui lòng đăng nhập để thêm món vào giỏ hàng!';
                    console.warn("⚠️ Unauthorized - redirecting to login");
                    alert(errorMsg);
                    window.location.href = 'signin.html';
                    return;
                } else if (xhr.status === 403) {
                    errorMsg = 'Không có quyền truy cập! Vui lòng đăng nhập lại.';
                    console.error("❌ Forbidden - user may not have proper role or token is invalid");
                    
                    // Check if token exists and is valid
                    if (!token) {
                        errorMsg = 'Vui lòng đăng nhập để thêm món vào giỏ hàng!';
                        alert(errorMsg);
                        window.location.href = 'signin.html';
                        return;
                    } else {
                        // Token exists but 403 - might be expired or invalid
                        errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                        alert(errorMsg);
                        // Clear token and redirect
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        window.location.href = 'signin.html';
                        return;
                    }
                } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                    errorMsg = xhr.responseJSON.desc;
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                
                alert(errorMsg);
                
                button.prop('disabled', false);
                button.html('<i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ');
            });
        });
    });
}

// Helper function to get user ID from token or API
// Use same caching mechanism as cart.js
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
    if (cachedId && !isNaN(parseInt(cachedId))) {
        window.cachedUserId = parseInt(cachedId);
        return window.cachedUserId;
    }
    
    // If not cached, need to get from API
    // This will be handled asynchronously
    return null;
}

// Get user ID from API (async)
function getUserIdFromAPI(callback) {
    if (window.cachedUserId) {
        callback(window.cachedUserId);
        return;
    }
    
    const cachedId = localStorage.getItem('userId');
    if (cachedId && !isNaN(parseInt(cachedId))) {
        window.cachedUserId = parseInt(cachedId);
        callback(window.cachedUserId);
        return;
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
                window.cachedUserId = userId;
                localStorage.setItem('userId', userId.toString());
                console.log("✅ User ID cached:", userId);
                callback(userId);
            } else {
                console.error("❌ User ID not found in response:", userData);
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

function renderCategoriesAndMenus(categories) {
    console.log("=== renderCategoriesAndMenus() called (fallback) ===");
    console.log("Categories count:", categories.length);
    
    if (!categories || categories.length === 0) {
        console.warn("⚠️ No categories to render");
        $('#restaurant-menu-container').html('<div class="col-12"><p class="text-center text-muted">Không có menu nào.</p></div>');
        return;
    }
    
    let html = '';
    
    categories.forEach(function(category, categoryIndex) {
        console.log(`Processing category ${categoryIndex + 1}:`, category.name);
        
        html += `
            <div class="mb-4">
                <h5 class="mb-3 font-weight-bold">${category.name || 'Category'}</h5>
                <div class="row">
        `;
        
        if (category.menus && Array.isArray(category.menus) && category.menus.length > 0) {
            console.log(`Category "${category.name}" has ${category.menus.length} menus`);
            
            category.menus.forEach(function(menu, menuIndex) {
                console.log(`Processing menu ${menuIndex + 1}:`, menu.title);
                
                const imageUrl = getMenuImageUrl(menu.image);
                const freeShipBadge = (menu.isFreeShip || menu.freeShip) 
                    ? '<span class="badge badge-success freeship-badge-inline"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' 
                    : '';
                const menuPrice = menu.price || 0;
                const priceFormatted = formatPrice(menuPrice);
                
                // Lấy ID từ nhiều nguồn có thể có
                let menuId = null;
                if (menu.id !== undefined && menu.id !== null) {
                    menuId = parseInt(menu.id);
                } else if (menu.foodId !== undefined && menu.foodId !== null) {
                    menuId = parseInt(menu.foodId);
                } else if (menu.menuId !== undefined && menu.menuId !== null) {
                    menuId = parseInt(menu.menuId);
                }
                
                if (!menuId || isNaN(menuId) || menuId <= 0) {
                    console.error(`❌ Menu "${menu.title}" has no valid ID in renderCategoriesAndMenus!`);
                    console.error(`Menu object keys:`, Object.keys(menu));
                    console.error(`Menu object:`, JSON.stringify(menu, null, 2));
                    return; // Skip this menu item
                }
                
                console.log(`✅ Menu "${menu.title}" has ID: ${menuId} (type: ${typeof menuId})`);
                
                html += `
                    <div class="col-xl-4 col-md-6 mb-4">
                        <div class="bg-white shadow-sm rounded d-flex align-items-center p-1 osahan-list">
                            <div class="bg-light p-3 rounded">
                                <img src="${imageUrl}" class="img-fluid" alt="${menu.title || 'Food Item'}" onerror="this.src='img/food1.jpg'" style="width: 80px; height: 80px; object-fit: cover;">
                            </div>
                            <div class="mx-3 py-2 w-100 d-flex flex-column" style="min-width: 0;">
                                <div style="flex: 0 0 auto;">
                                    <p class="mb-1 text-black font-weight-bold" style="font-size: 1rem; line-height: 1.3;">${menu.title || 'Food Item'}</p>
                                    ${menu.description ? `<p class="mb-1 small text-muted" style="line-height: 1.3; font-size: 0.85rem;">${menu.description}</p>` : ''}
                                    <div class="mb-2 d-flex align-items-center flex-wrap" style="gap: 8px; row-gap: 4px; width: 100%;">
                                        ${menu.timeShip ? `<span class="small text-muted d-flex align-items-center" style="flex-shrink: 0;"><i class="mdi mdi-clock-outline mr-1"></i> ${menu.timeShip}</span>` : ''}
                                        ${freeShipBadge ? `<span style="margin-left: auto; flex-shrink: 0;">${freeShipBadge}</span>` : ''}
                                    </div>
                                </div>
                                <div class="mt-auto" style="flex: 0 0 auto; margin-top: 8px !important;">
                                    <p class="mb-2 text-primary font-weight-bold" style="font-size: 1.1rem;">${priceFormatted}</p>
                                    ${menuId && menuId > 0 ? `
                                    <button class="btn btn-sm btn-primary add-to-cart-btn" data-food-id="${menuId}" data-food-title="${(menu.title || 'Food Item').replace(/"/g, '&quot;')}" data-food-price="${menuPrice}">
                                        <i class="mdi mdi-cart-plus mr-1"></i> Thêm vào giỏ
                                    </button>
                                    ` : `
                                    <button class="btn btn-sm btn-secondary" disabled title="Món ăn không có ID hợp lệ">
                                        <i class="mdi mdi-alert-circle mr-1"></i> Không thể thêm
                                    </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            console.warn(`Category "${category.name}" has no menus`);
            html += `
                <div class="col-12">
                    <p class="text-muted small">Không có món nào trong category này.</p>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    console.log("Menu HTML generated, length:", html.length);
    
    // Insert vào container phù hợp
    const menuContainer = $('#restaurant-menu-container');
    if (menuContainer.length > 0) {
        menuContainer.html(html);
        console.log("✅ Menu HTML inserted into container");
    } else {
        console.error("❌ Menu container not found, creating new one...");
        const containerFluid = $('.container-fluid');
        if (containerFluid.length > 0) {
            containerFluid.append(`<div id="restaurant-menu-container">${html}</div>`);
            console.log("✅ Created new menu container");
        }
    }
    
    console.log("✅ Categories and menus rendered successfully");
    
    // Attach event handlers for add to cart buttons
    attachAddToCartHandlers();
    
    // Attach event handlers for rating buttons
    attachRatingHandlers();
}

// Attach event handlers for rating buttons
function attachRatingHandlers() {
    console.log("=== attachRatingHandlers() called ===");
    
    // Remove existing handlers to avoid duplicates
    $(document).off('click', '.rate-food-btn').on('click', '.rate-food-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = $(this);
        const foodId = parseInt(button.data('food-id'));
        const foodTitle = button.data('food-title');
        
        console.log("Rate food clicked - Food ID:", foodId, "Title:", foodTitle);
        
        if (!foodId || isNaN(foodId) || foodId <= 0) {
            console.error("❌ Invalid food ID:", foodId);
            alert('Không thể đánh giá món này! Món ăn không có ID hợp lệ.');
            return;
        }
        
        // Show rating modal for this food
        showFoodRatingModal(foodId, foodTitle);
    });
}

// Show food rating modal
function showFoodRatingModal(foodId, foodTitle) {
    // Create or update modal
    let modal = $('#food-rating-modal');
    if (modal.length === 0) {
        modal = $(`
            <div class="modal fade" id="food-rating-modal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-star text-warning mr-2"></i>Đánh giá món ăn
                            </h5>
                            <button type="button" class="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="food-rating-widget-container">
                                <!-- Rating widget will be loaded here -->
                            </div>
                            <hr>
                            <h6 class="mb-3">Đánh giá từ người dùng khác</h6>
                            <div id="food-ratings-list-container">
                                <!-- Ratings list will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        $('body').append(modal);
    }
    
    // Update modal title
    modal.find('.modal-title').html(`<i class="fas fa-star text-warning mr-2"></i>Đánh giá: ${foodTitle}`);
    
    // Load rating widget
    if (typeof loadRatingWidget === 'function') {
        loadRatingWidget(foodId, 'food', 'food-rating-widget-container');
    }
    if (typeof loadFoodRatings === 'function') {
        loadFoodRatings(foodId);
    }
    
    // Show modal
    modal.modal('show');
}

