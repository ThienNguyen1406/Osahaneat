/*
 * Index Page - Load restaurants and categories from API
 * Note: API_BASE_URL is defined in api.js
 * Version: 2.0 - Fixed API_BASE_URL duplicate declaration
 */

console.log("=== INDEX.JS LOADED - VERSION 2.0 ===");

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Check dependencies
console.log("jQuery available:", typeof jQuery !== 'undefined');
console.log("$ available:", typeof $ !== 'undefined');
console.log("ApiService available:", typeof ApiService !== 'undefined');

// Wait for DOM and dependencies
$(document).ready(function() {
    console.log("=== $(document).ready() fired ===");
    
    // Double check dependencies
    if (typeof jQuery === 'undefined' || typeof $ === 'undefined') {
        console.error("❌ jQuery is not loaded!");
        return;
    }
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not loaded! Waiting 500ms...");
        setTimeout(function() {
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService still not loaded after 500ms!");
                return;
            }
            console.log("✅ ApiService loaded after delay");
            loadCategories();
            loadRestaurants();
        }, 500);
        return;
    }
    
    console.log("✅ All dependencies loaded, starting API calls...");
    
    try {
        // Load categories with delay to ensure DOM is ready
        setTimeout(function() {
            console.log("Loading categories...");
            loadCategories();
        }, 100);
        
        // Load restaurants with delay
        setTimeout(function() {
            console.log("Loading restaurants...");
            loadRestaurants();
        }, 200);
        
        // Load popular food items from a specific category (to avoid empty space)
        setTimeout(function() {
            console.log("Loading popular food items...");
            loadPopularFood();
        }, 300);
    } catch (error) {
        console.error("❌ Error in $(document).ready():", error);
        console.error("Stack trace:", error.stack);
    }
});

function loadCategories() {
    console.log("=== loadCategories() called ===");
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        console.error("Available globals:", Object.keys(window).filter(k => k.includes('Api') || k.includes('Service')));
        return;
    }
    
    if (typeof ApiService.getCategories !== 'function') {
        console.error("❌ ApiService.getCategories is not a function!");
        console.error("ApiService methods:", Object.keys(ApiService));
        return;
    }
    
    console.log("Calling ApiService.getCategories()...");
    console.log("API URL will be:", 'http://localhost:82/category');
    
    const categoriesPromise = ApiService.getCategories();
    
    if (!categoriesPromise || typeof categoriesPromise.done !== 'function') {
        console.error("❌ ApiService.getCategories() did not return a jQuery promise!");
        console.error("Returned:", categoriesPromise);
        return;
    }
    
    categoriesPromise
        .done(function(response) {
            console.log("=== Categories API Response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.status:", response?.status);
            console.log("Response.data:", response?.data);
            console.log("Response.data type:", typeof response?.data);
            console.log("Response.data is array:", Array.isArray(response?.data));
            
            if (response && response.data) {
                console.log("Response.data length:", response.data.length);
            }
            
            // Backend response format: { status, isSuccess/success, desc, data }
            // Check cả isSuccess, success, và status === 200 (vì Jackson có thể serialize khác nhau)
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data && Array.isArray(response.data);
            
            console.log("Categories check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData && response.data.length > 0) {
                console.log("✅ Categories data is valid, rendering " + response.data.length + " categories...");
                // Load categories vào dropdown filter (TẤT CẢ categories)
                loadCategoriesToFilter(response.data);
                // Render categories vào grid (chỉ 6 categories đầu)
                renderCategories(response.data);
            } else {
                console.warn("⚠️ Categories response format invalid or empty:", response);
                console.warn("Response structure:", {
                    hasResponse: !!response,
                    status: response?.status,
                    isSuccess: response?.isSuccess,
                    success: response?.success,
                    hasData: !!response?.data,
                    dataIsArray: Array.isArray(response?.data),
                    dataLength: response?.data?.length,
                    data: response?.data
                });
                
                // Fallback: Nếu có data nhưng không có success flag, vẫn render
                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    console.log("⚠️ Fallback: Rendering categories even without success flag");
                    // Load categories vào dropdown filter (TẤT CẢ categories)
                    loadCategoriesToFilter(response.data);
                    // Render categories vào grid (chỉ 6 categories đầu)
                    renderCategories(response.data);
                } else {
                    console.error("❌ No categories data to render!");
                }
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Categories API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Status code:", xhr.status);
            console.error("Status text:", xhr.statusText);
            console.error("Response text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            
            // Try to show error message from backend
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                console.error("Error message:", xhr.responseJSON.desc);
            }
            
            // Show error to user
            alert('Không thể tải danh sách categories. Vui lòng kiểm tra console để xem chi tiết lỗi.');
        });
}

function renderCategories(categories) {
    console.log("=== renderCategories() called ===");
    console.log("Categories count:", categories.length);
    console.log("Categories data:", categories);
    
    if (!categories || categories.length === 0) {
        console.warn("⚠️ No categories to render");
        return;
    }
    
    // Tìm container "Explore categories" section
    let categorySection = null;
    $('.d-flex.align-items-center.justify-content-between').each(function() {
        const h5 = $(this).find('h5');
        if (h5.length > 0) {
            const h5Text = h5.text().trim();
            console.log("Checking h5 text:", h5Text);
            if (h5Text.includes('Explore categories') || h5Text.includes('categories')) {
                categorySection = $(this);
                console.log("✅ Found category section");
                return false; // Break loop
            }
        }
    });
    
    console.log("Category section found:", categorySection ? "YES" : "NO");
    
    // Tìm row container - strategy 1: next row
    let categoryRow = categorySection ? categorySection.next('.row') : null;
    console.log("Category row (next):", categoryRow ? categoryRow.length : 0);
    
    // Strategy 2: Find first row in container-fluid
    if (!categoryRow || categoryRow.length === 0) {
        categoryRow = $('.container-fluid .row').first();
        console.log("Category row (first in container-fluid):", categoryRow.length);
    }
    
    // Strategy 3: Find row with comment "Categories will be rendered here"
    if (!categoryRow || categoryRow.length === 0) {
        $('.container-fluid .row').each(function() {
            const comment = $(this).html();
            if (comment && comment.includes('Categories will be rendered')) {
                categoryRow = $(this);
                console.log("✅ Found category row by comment");
                return false;
            }
        });
    }
    
    // Strategy 4: Find any empty row
    if (!categoryRow || categoryRow.length === 0) {
        $('.container-fluid .row').each(function() {
            const content = $(this).html().trim();
            if (content === '' || content.includes('Categories will be rendered')) {
                categoryRow = $(this);
                console.log("✅ Found empty row for categories");
                return false;
            }
        });
    }
    
    if (!categoryRow || categoryRow.length === 0) {
        console.error("❌ Could not find category row container, creating new one...");
        // Create new row if section found
        if (categorySection && categorySection.length > 0) {
            categoryRow = $('<div class="row"></div>');
            categorySection.after(categoryRow);
            console.log("✅ Created new category row");
        } else {
            // Last resort: append to container-fluid
            const container = $('.container-fluid');
            if (container.length > 0) {
                categoryRow = $('<div class="row"></div>');
                container.append(categoryRow);
                console.log("✅ Created new category row in container-fluid");
            } else {
                console.error("❌ Could not find container-fluid either!");
                return;
            }
        }
    }
    
    console.log("✅ Category row container found, rendering categories...");
    console.log("Category row:", categoryRow);
    console.log("Category row HTML before:", categoryRow.html().substring(0, 100));
    
    let html = '';
    // Hiển thị 6 categories đầu tiên
    categories.forEach(function(category, index) {
        if (index < 6) { // Chỉ hiển thị 6 categories đầu
            const categoryName = category.name || category.nameCate || 'Category';
            const menuCount = category.menus ? category.menus.length : 0;
            html += `
                <a href="listing.html?category=${category.id || index}" class="text-decoration-none col-xl-2 col-md-4 mb-4">
                    <div class="rounded py-4 bg-white shadow-sm text-center">
                        <i class="mdi mdi-fire bg-danger text-white osahan-icon mx-auto rounded-pill"></i>
                        <h6 class="mb-1 mt-3">${escapeHtml(categoryName)}</h6>
                        <p class="mb-0 small">${menuCount}+ options</p>
                    </div>
                </a>
            `;
        }
    });
    
    console.log("Category HTML generated, length:", html.length);
    console.log("Category HTML preview:", html.substring(0, 300));
    
    // Insert HTML vào container
    categoryRow.html(html);
    console.log("✅ Categories rendered successfully, count:", Math.min(categories.length, 6));
    console.log("Category row HTML after:", categoryRow.html().substring(0, 200));
}

// Load TẤT CẢ categories vào dropdown filter
function loadCategoriesToFilter(categories) {
    console.log("=== loadCategoriesToFilter() called ===");
    console.log("Categories count:", categories.length);
    
    const $select = $('#category-filter');
    if ($select.length === 0) {
        console.warn("⚠️ Category filter dropdown not found");
        return;
    }
    
    // Clear existing options except "Tất cả danh mục"
    $select.find('option:not(:first)').remove();
    
    // Add all categories to dropdown
    categories.forEach(function(category) {
        const categoryName = category.name || category.nameCate || 'Category';
        const categoryId = category.id || category.cateId || '';
        if (categoryId) {
            $select.append(`<option value="${categoryId}">${escapeHtml(categoryName)}</option>`);
        }
    });
    
    console.log(`✅ Loaded ${categories.length} categories into filter dropdown`);
    
    // Add change event handler for filtering
    $select.off('change').on('change', function() {
        const selectedCategoryId = $(this).val();
        console.log("Category filter changed:", selectedCategoryId);
        filterByCategory(selectedCategoryId);
    });
}

// Filter categories by selected category ID
function filterByCategory(categoryId) {
    console.log("=== filterByCategory() called ===");
    console.log("Category ID:", categoryId);
    
    if (!categoryId) {
        // Show all category cards
        $('.col-xl-2.col-md-4').show();
        return;
    }
    
    // Hide all category cards
    $('.col-xl-2.col-md-4').hide();
    
    // Show only categories matching the selected ID
    $(`a[href*="category=${categoryId}"]`).closest('.col-xl-2, .col-md-4').show();
}

function loadRestaurants() {
    console.log("=== loadRestaurants() called ===");
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        console.error("Available globals:", Object.keys(window).filter(k => k.includes('Api') || k.includes('Service')));
        return;
    }
    
    if (typeof ApiService.getRestaurants !== 'function') {
        console.error("❌ ApiService.getRestaurants is not a function!");
        console.error("ApiService methods:", Object.keys(ApiService));
        return;
    }
    
    console.log("Calling ApiService.getRestaurants()...");
    console.log("API URL will be:", 'http://localhost:82/restaurant');
    
    const restaurantsPromise = ApiService.getRestaurants();
    
    if (!restaurantsPromise || typeof restaurantsPromise.done !== 'function') {
        console.error("❌ ApiService.getRestaurants() did not return a jQuery promise!");
        console.error("Returned:", restaurantsPromise);
        return;
    }
    
    restaurantsPromise
        .done(function(response) {
            console.log("=== Restaurants API Response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.status:", response?.status);
            console.log("Response.data:", response?.data);
            console.log("Response.data type:", typeof response?.data);
            console.log("Response.data is array:", Array.isArray(response?.data));
            
            if (response && response.data) {
                console.log("Response.data length:", response.data.length);
            }
            
            // Backend response format: { status, isSuccess/success, desc, data }
            // Check cả isSuccess, success, và status === 200 (vì Jackson có thể serialize khác nhau)
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data && Array.isArray(response.data);
            
            console.log("Restaurants check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData && response.data.length > 0) {
                console.log("✅ Restaurants data is valid, rendering " + response.data.length + " restaurants...");
                renderRestaurants(response.data);
            } else {
                console.warn("⚠️ Restaurants response format invalid or empty:", response);
                console.warn("Response structure:", {
                    hasResponse: !!response,
                    status: response?.status,
                    isSuccess: response?.isSuccess,
                    success: response?.success,
                    hasData: !!response?.data,
                    dataIsArray: Array.isArray(response?.data),
                    dataLength: response?.data?.length,
                    data: response?.data
                });
                
                // Fallback: Nếu có data nhưng không có success flag, vẫn render
                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    console.log("⚠️ Fallback: Rendering restaurants even without success flag");
                    renderRestaurants(response.data);
                } else {
                    console.error("❌ No restaurants data to render!");
                }
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Restaurants API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Status code:", xhr.status);
            console.error("Status text:", xhr.statusText);
            console.error("Response text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            
            // Try to show error message from backend
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                console.error("Error message:", xhr.responseJSON.desc);
            }
            
            // Show error to user
            alert('Không thể tải danh sách restaurants. Vui lòng kiểm tra console để xem chi tiết lỗi.');
        });
}

function renderRestaurants(restaurants) {
    console.log("=== renderRestaurants() called ===");
    console.log("Restaurants count:", restaurants.length);
    console.log("Restaurants data:", restaurants);
    
    if (!restaurants || restaurants.length === 0) {
        console.warn("⚠️ No restaurants to render");
        return;
    }
    
    // Tìm container "Featured restaurants" section - hỗ trợ cả tiếng Anh và tiếng Việt
    let featuredSection = null;
    $('.d-flex.align-items-center.justify-content-between').each(function() {
        const h5 = $(this).find('h5');
        if (h5.length > 0) {
            const h5Text = h5.text().trim();
            console.log("Checking h5 text:", h5Text);
            if (h5Text.includes('Featured restaurants') || 
                h5Text.includes('Nhà hàng nổi bật') ||
                h5Text.includes('restaurants') ||
                h5Text.includes('Nhà hàng')) {
                featuredSection = $(this);
                console.log("✅ Found featured section");
                return false; // Break loop
            }
        }
    });
    
    console.log("Featured section found:", featuredSection ? "YES" : "NO");
    
    // Tìm row container - strategy 1: next row
    let restaurantRow = featuredSection ? featuredSection.next('.row') : null;
    console.log("Restaurant row (next):", restaurantRow ? restaurantRow.length : 0);
    
    // Strategy 2: Find second row in container-fluid
    if (!restaurantRow || restaurantRow.length === 0) {
        restaurantRow = $('.container-fluid .row').eq(1); // Second row
        console.log("Restaurant row (second in container-fluid):", restaurantRow.length);
    }
    
    // Strategy 3: Find row with comment "Restaurants will be rendered here"
    if (!restaurantRow || restaurantRow.length === 0) {
        $('.container-fluid .row').each(function() {
            const comment = $(this).html();
            if (comment && comment.includes('Restaurants will be rendered')) {
                restaurantRow = $(this);
                console.log("✅ Found restaurant row by comment");
                return false;
            }
        });
    }
    
    // Strategy 4: Find any empty row after first row
    if (!restaurantRow || restaurantRow.length === 0) {
        $('.container-fluid .row').each(function(index) {
            if (index > 0) { // Skip first row (categories)
                const content = $(this).html().trim();
                if (content === '' || content.includes('Restaurants will be rendered')) {
                    restaurantRow = $(this);
                    console.log("✅ Found empty row for restaurants at index", index);
                    return false;
                }
            }
        });
    }
    
    // Strategy 5: Create new row if section found
    if (!restaurantRow || restaurantRow.length === 0) {
        if (featuredSection && featuredSection.length > 0) {
            console.log("Creating new restaurant row after featured section...");
            restaurantRow = $('<div class="row"></div>');
            featuredSection.after(restaurantRow);
            console.log("✅ Created new restaurant row");
        } else {
            // Last resort: append to container-fluid
            const container = $('.container-fluid');
            if (container.length > 0) {
                restaurantRow = $('<div class="row"></div>');
                container.append(restaurantRow);
                console.log("✅ Created new restaurant row in container-fluid");
            } else {
                console.error("❌ Could not find container-fluid either!");
                return;
            }
        }
    }
    
    console.log("✅ Restaurant row container found, rendering restaurants...");
    console.log("Restaurant row:", restaurantRow);
    console.log("Restaurant row HTML before:", restaurantRow.html().substring(0, 100));
    
    renderRestaurantsToContainer(restaurants, restaurantRow);
}

function renderRestaurantsToContainer(restaurants, container) {
    console.log("=== renderRestaurantsToContainer() called ===");
    console.log("Container found:", container && container.length > 0);
    console.log("Restaurants count:", restaurants.length);
    
    if (!container || container.length === 0) {
        console.error("❌ Container is empty or invalid!");
        return;
    }
    
    if (!restaurants || restaurants.length === 0) {
        console.warn("⚠️ No restaurants to render");
        container.html('<div class="col-12"><p class="text-center text-muted">Không có nhà hàng nào.</p></div>');
        return;
    }
    
    console.log("Container element:", container[0]);
    console.log("Container HTML before:", container.html().substring(0, 200));
    
    // Tạo HTML từ dữ liệu backend
    let html = '';
    restaurants.forEach(function(restaurant, index) {
        console.log(`Processing restaurant ${index + 1}:`, restaurant.title || restaurant.id);
        
        // Get image URL - if image is already a full path, use it; otherwise build URL
        let imageUrl = 'img/burgerking.png';
        if (restaurant.image) {
            if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
                // Full URL
                imageUrl = restaurant.image;
            } else if (restaurant.image.startsWith('/')) {
                // Path starting with /
                imageUrl = 'http://localhost:82' + restaurant.image;
            } else {
                // Just filename, build full URL
                if (typeof ApiService !== 'undefined' && ApiService.getRestaurantImage) {
                    imageUrl = ApiService.getRestaurantImage(restaurant.image);
                } else {
                    imageUrl = 'http://localhost:82/restaurant/file/' + restaurant.image;
                }
            }
        }
        
        console.log(`Restaurant ${index + 1} image URL:`, imageUrl);
        
        // Convert rating to number and handle null/undefined/NaN
        let rating = '0.0';
        if (restaurant.rating != null && restaurant.rating !== undefined) {
            const ratingNum = parseFloat(restaurant.rating);
            if (!isNaN(ratingNum)) {
                rating = ratingNum.toFixed(1);
            }
        }
        
        // Free delivery badge - luôn dành chỗ để đảm bảo chiều cao đều
        const freeDeliveryBadge = (restaurant.freeShip || restaurant.isFreeShip) ?
            '<span class="badge badge-light"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' :
            '<span class="badge badge-light" style="visibility: hidden;"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>';
        
        html += `
            <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
                <a href="detail.html?id=${restaurant.id}" class="text-dark text-decoration-none">
                    <div class="bg-white shadow-sm rounded d-flex align-items-center p-1 h-100 osahan-list" style="min-height: 120px;">
                        <div class="bg-light p-3 rounded" style="flex-shrink: 0; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                            <img src="${imageUrl}" class="img-fluid" alt="${restaurant.title || 'Restaurant'}" 
                                 onerror="this.src='img/burgerking.png'"
                                 style="max-width: 100%; max-height: 100%; object-fit: cover; border-radius: 4px;">
                        </div>
                        <div class="mx-3 py-2 w-100 d-flex flex-column justify-content-between" style="min-height: 100px;">
                            <div>
                                <p class="mb-2 text-black font-weight-bold" style="font-size: 1rem; line-height: 1.3;">${restaurant.title || 'Restaurant'}</p>
                                <p class="small mb-2 text-muted" style="line-height: 1.4;">
                                    <i class="mdi mdi-star text-warning mr-1"></i>
                                    <span class="font-weight-bold text-dark">${rating}</span>
                                    <span class="mx-1">•</span>
                                    ${restaurant.subtitle || 'Food'}
                                </p>
                            </div>
                            <div class="mt-auto" style="min-height: 24px;">
                                ${freeDeliveryBadge}
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    
    console.log("Restaurant HTML generated, length:", html.length);
    console.log("Restaurant HTML preview:", html.substring(0, 500));
    
    // Thay thế HTML trong container
    try {
        container.html(html);
        console.log("✅ HTML inserted into container");
        
        // Verify HTML was inserted
        const containerHtmlAfter = container.html();
        console.log("Container HTML after render (first 500 chars):", containerHtmlAfter.substring(0, 500));
        console.log("Container HTML length after render:", containerHtmlAfter.length);
        
        // Check if HTML is actually in DOM
        const containerElement = container[0];
        if (containerElement) {
            console.log("Container element innerHTML length:", containerElement.innerHTML.length);
            console.log("Container element children count:", containerElement.children.length);
        }
        
        console.log("✅ Restaurants rendered successfully, count:", restaurants.length);
    } catch (error) {
        console.error("❌ Error inserting HTML into container:", error);
        console.error("Error stack:", error.stack);
    }
}

// ============================================
// Load Popular Food Items from Category
// ============================================

function loadPopularFood() {
    console.log("=== loadPopularFood() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getCategories !== 'function') {
        console.error("❌ ApiService.getCategories is not available!");
        return;
    }
    
    console.log("Calling ApiService.getCategories() to get food items...");
    
    ApiService.getCategories()
        .done(function(response) {
            console.log("=== Categories API Response (for Popular Food) ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data && Array.isArray(response.data);
            
            console.log("Categories check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData && response.data.length > 0) {
                console.log("✅ Categories data is valid, selecting category to display...");
                
                // Chọn 1 category cụ thể để hiển thị (ưu tiên "Cơm" hoặc "Bún - Phở")
                let selectedCategory = null;
                
                // Tìm category "Cơm" hoặc "Bún - Phở"
                const preferredCategories = ['Cơm', 'Bún - Phở', 'Lẩu'];
                for (let i = 0; i < preferredCategories.length; i++) {
                    selectedCategory = response.data.find(function(cat) {
                        return cat.name === preferredCategories[i] || cat.name_cate === preferredCategories[i];
                    });
                    if (selectedCategory && selectedCategory.menus && selectedCategory.menus.length > 0) {
                        console.log(`✅ Found category "${preferredCategories[i]}" with ${selectedCategory.menus.length} items`);
                        break;
                    }
                }
                
                // Nếu không tìm thấy category ưu tiên, lấy category đầu tiên có món ăn
                if (!selectedCategory || !selectedCategory.menus || selectedCategory.menus.length === 0) {
                    selectedCategory = response.data.find(function(cat) {
                        return cat.menus && Array.isArray(cat.menus) && cat.menus.length > 0;
                    });
                }
                
                if (selectedCategory && selectedCategory.menus && selectedCategory.menus.length > 0) {
                    console.log(`✅ Selected category: "${selectedCategory.name || selectedCategory.name_cate}" with ${selectedCategory.menus.length} items`);
                    console.log("Sample menu item:", selectedCategory.menus[0]);
                    console.log("Menu item keys:", selectedCategory.menus[0] ? Object.keys(selectedCategory.menus[0]) : 'null');
                    renderPopularFood(selectedCategory.menus, selectedCategory.name || selectedCategory.name_cate);
                } else {
                    console.warn("⚠️ No category with food items found");
                }
            } else {
                console.warn("⚠️ Categories response format invalid or empty:", response);
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Categories API Error (for Popular Food) ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
        });
}

function renderPopularFood(foodItems, categoryName) {
    console.log("=== renderPopularFood() called ===");
    console.log("Food items count:", foodItems.length);
    console.log("Category name:", categoryName);
    
    if (!foodItems || foodItems.length === 0) {
        console.warn("⚠️ No food items to render");
        return;
    }
    
    // Thêm section "Popular food" sau restaurants section
    // Tìm restaurants row trực tiếp - sử dụng nhiều strategy
    console.log("=== Finding restaurants row ===");
    
    // Strategy 1: Tìm row thứ 2 trong container-fluid (restaurants row)
    let restaurantsRow = $('.container-fluid .row').eq(1);
    console.log("Strategy 1 - Second row in container-fluid:", restaurantsRow.length);
    
    // Strategy 2: Tìm row có chứa restaurants (check children có link đến detail.html)
    if (!restaurantsRow || restaurantsRow.length === 0 || restaurantsRow.find('a[href*="detail.html"]').length === 0) {
        $('.container-fluid .row').each(function() {
            if ($(this).find('a[href*="detail.html"]').length > 0) {
                restaurantsRow = $(this);
                console.log("✅ Found restaurant row by detail.html links");
                return false;
            }
        });
    }
    
    // Strategy 3: Tìm row có comment "Restaurants will be rendered here"
    if (!restaurantsRow || restaurantsRow.length === 0) {
        $('.container-fluid .row').each(function() {
            const html = $(this).html();
            if (html && (html.includes('Restaurants will be rendered') || 
                        html.includes('restaurants'))) {
                restaurantsRow = $(this);
                console.log("✅ Found restaurant row by comment");
                return false;
            }
        });
    }
    
    // Strategy 4: Tìm section "Nhà hàng nổi bật" và lấy row tiếp theo
    if (!restaurantsRow || restaurantsRow.length === 0) {
        $('.d-flex.align-items-center.justify-content-between').each(function() {
            const h5 = $(this).find('h5');
            if (h5.length > 0) {
                const h5Text = h5.text().trim();
                if (h5Text.includes('Featured restaurants') || 
                    h5Text.includes('Nhà hàng nổi bật') ||
                    h5Text.includes('restaurants') ||
                    h5Text.includes('Nhà hàng')) {
                    const nextRow = $(this).next('.row');
                    if (nextRow.length > 0) {
                        restaurantsRow = nextRow;
                        console.log("✅ Found restaurant row after section");
                        return false;
                    }
                }
            }
        });
    }
    
    console.log("Restaurants row found:", restaurantsRow ? "YES (length: " + restaurantsRow.length + ")" : "NO");
    
    if (!restaurantsRow || restaurantsRow.length === 0) {
        console.warn("⚠️ Could not find restaurants row to add food section after");
        console.warn("Available rows in container-fluid:", $('.container-fluid .row').length);
        return;
    }
    
    console.log("✅ Found restaurants row, adding food section after it");
    
    // Kiểm tra xem đã có food section chưa
    let foodSection = restaurantsRow.next('.d-flex.align-items-center.justify-content-between').filter(function() {
        const text = $(this).find('h5').text();
        return text.includes('Popular food') || 
               text.includes('Món ăn phổ biến') ||
               text.includes(categoryName);
    });
    
    console.log("Food section already exists:", foodSection.length > 0 ? "YES" : "NO");
    
    if (foodSection.length === 0) {
        // Tạo section mới sau restaurants row
        const sectionHtml = `
            <div class="d-flex align-items-center justify-content-between mb-3 mt-2">
                <h5 class="mb-0">${categoryName || 'Món ăn phổ biến'}</h5>
                <a href="listing.html" class="small font-weight-bold text-dark">Xem tất cả <i class="mdi mdi-chevron-right mr-2"></i></a>
            </div>
        `;
        const foodSectionElement = $(sectionHtml);
        restaurantsRow.after(foodSectionElement);
        foodSection = foodSectionElement;
        
        // Tạo row container
        const foodRow = $('<div class="row" id="popular-food-row"></div>');
        foodSection.after(foodRow);
        
        console.log("✅ Created food section and row");
        
        // Render food items
        renderFoodItemsToContainer(foodItems.slice(0, 6), foodRow, categoryName);
    } else {
        // Tìm row container
        let foodRow = foodSection.next('.row');
        if (foodRow.length === 0) {
            foodRow = $('<div class="row" id="popular-food-row"></div>');
            foodSection.after(foodRow);
        }
        
        console.log("✅ Using existing food section");
        
        // Render food items
        renderFoodItemsToContainer(foodItems.slice(0, 6), foodRow, categoryName);
    }
}

function renderFoodItemsToContainer(foodItems, container, categoryName) {
    console.log("renderFoodItemsToContainer() called, container:", container.length > 0);
    console.log("Category name:", categoryName);
    
    if (!container || container.length === 0) {
        console.error("❌ Container is empty or invalid!");
        return;
    }
    
    // Helper function to get menu image URL
    function getMenuImageUrl(image) {
        if (!image) {
            return 'img/food1.jpg';
        }
        if (image.startsWith('http://') || image.startsWith('https://')) {
            return image;
        }
        if (image.startsWith('/')) {
            return 'http://localhost:82' + image;
        }
        return 'http://localhost:82/menu/file/' + image;
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
    
    let html = '';
    foodItems.forEach(function(food, index) {
        if (index >= 6) return; // Limit to 6 per row
        
        console.log(`Processing food item ${index + 1}:`, food);
        console.log("Food keys:", Object.keys(food));
        console.log("Food.id:", food.id, "Type:", typeof food.id);
        console.log("Food.title:", food.title);
        
        const imageUrl = getMenuImageUrl(food.image);
        const freeShipBadge = (food.isFreeShip || food.freeShip) 
            ? '<span class="badge badge-light ml-auto"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' 
            : '';
        
        // Tạo card đẹp hơn, giống restaurant card nhưng nhỏ hơn
        const foodPrice = food.price || 0;
        const priceFormatted = formatPrice(foodPrice);
        const foodId = food.id ? parseInt(food.id) : 0;
        
        // Validate food ID
        if (!foodId || foodId <= 0) {
            console.warn("⚠️ Skipping food item with invalid ID:", food.id, "Food:", food.title);
            console.warn("Full food object:", JSON.stringify(food, null, 2));
            return; // Skip this food item
        }
        
        html += `
            <div class="food-item-card col-xl-4 col-lg-6 col-md-6 mb-4" 
                 data-food-id="${foodId}"
                 data-food-title="${(food.title || 'Food Item').replace(/"/g, '&quot;')}"
                 data-food-price="${foodPrice}"
                 data-food-image="${food.image || ''}"
                 data-food-description="${(food.description || '').replace(/"/g, '&quot;')}"
                 data-food-time-ship="${food.timeShip || ''}"
                 data-food-free-ship="${food.isFreeShip || food.freeShip || false}"
                 style="cursor: pointer;">
                <div class="bg-white shadow-sm rounded overflow-hidden">
                    <div class="position-relative">
                        <img src="${imageUrl}" class="img-fluid w-100" style="height: 200px; object-fit: cover;" alt="${food.title || 'Food Item'}" onerror="this.src='img/food1.jpg'">
                        ${freeShipBadge ? `<div class="freeship-badge-wrapper">${freeShipBadge}</div>` : ''}
                    </div>
                    <div class="p-3">
                        <h6 class="mb-2 text-black">${food.title || 'Food Item'}</h6>
                        <p class="small mb-1 text-muted">
                            <i class="mdi mdi-silverware-fork-knife mr-1"></i> ${categoryName || 'Food'}
                            ${food.timeShip ? `<i class="mdi mdi-clock-outline ml-2 mr-1"></i> ${food.timeShip}` : ''}
                        </p>
                        <p class="mb-0 text-primary font-weight-bold">${priceFormatted}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    console.log("Food HTML generated, length:", html.length);
    
    // Replace content in container
    container.html(html);
    console.log("✅ Food items rendered successfully, count:", Math.min(foodItems.length, 6));
}

// ============================================
// Home Page Search Functionality
// ============================================

// Setup search handlers when document is ready
$(document).ready(function() {
    console.log("=== Setting up home search handlers ===");
    // Wait a bit to ensure DOM is fully ready
    setTimeout(function() {
        setupHomeSearch();
    }, 100);
});

// Also setup immediately if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        setupHomeSearch();
    }, 50);
}

// Debounce function for autocomplete
let autocompleteTimeout = null;
let lastAutocompleteKeyword = '';

function setupHomeSearch() {
    console.log("=== setupHomeSearch() called ===");
    
    // Check if elements exist
    const searchBtn = $('#home-search-btn');
    const searchInput = $('#home-search-input');
    const searchForm = $('#home-search-form');
    const clearBtn = $('#clear-search-btn');
    
    console.log("Search button found:", searchBtn.length > 0);
    console.log("Search input found:", searchInput.length > 0);
    console.log("Search form found:", searchForm.length > 0);
    console.log("Clear button found:", clearBtn.length > 0);
    
    if (searchBtn.length === 0 || searchInput.length === 0) {
        console.error("❌ Search elements not found! Retrying in 500ms...");
        setTimeout(function() {
            setupHomeSearch();
        }, 500);
        return;
    }
    
    // Remove existing handlers to avoid duplicates
    searchBtn.off('click');
    searchForm.off('submit');
    searchInput.off('keypress input keyup');
    clearBtn.off('click');
    
    // Search button click
    searchBtn.on('click', function(e) {
        console.log("🔍 Search button clicked!");
        e.preventDefault();
        e.stopPropagation();
        performHomeSearch();
        return false;
    });
    
    // Search form submit (prevent default navigation)
    searchForm.on('submit', function(e) {
        console.log("🔍 Search form submitted!");
        e.preventDefault();
        e.stopPropagation();
        performHomeSearch();
        return false;
    });
    
    // Search input Enter key
    searchInput.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            console.log("🔍 Enter key pressed in search input!");
            e.preventDefault();
            e.stopPropagation();
            // Hide suggestions
            hideSearchSuggestions();
            performHomeSearch();
            return false;
        }
    });
    
    // Autocomplete on input (with debounce)
    searchInput.on('input keyup', function(e) {
        // Don't trigger on Enter, Arrow keys, etc.
        if (e.which === 13 || e.which === 38 || e.which === 40) {
            return;
        }
        
        const keyword = $(this).val().trim();
        
        // Clear previous timeout
        if (autocompleteTimeout) {
            clearTimeout(autocompleteTimeout);
        }
        
        // Hide suggestions if input is empty
        if (!keyword || keyword.length === 0) {
            hideSearchSuggestions();
            return;
        }
        
        // Only show suggestions if keyword is at least 1 character
        if (keyword.length >= 1) {
            // Debounce: wait 300ms after user stops typing
            autocompleteTimeout = setTimeout(function() {
                if (keyword !== lastAutocompleteKeyword) {
                    lastAutocompleteKeyword = keyword;
                    showSearchSuggestions(keyword);
                }
            }, 300);
        }
    });
    
    // Hide suggestions when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#home-search-form, #search-suggestions').length) {
            hideSearchSuggestions();
        }
    });
    
    // Clear search button
    clearBtn.on('click', function(e) {
        console.log("🔍 Clear search button clicked!");
        e.preventDefault();
        e.stopPropagation();
        clearHomeSearch();
        hideSearchSuggestions();
        return false;
    });
    
    console.log("✅ Home search handlers setup complete");
    
    // Ensure restaurant links work correctly (they should navigate to detail page)
    // This is correct behavior - restaurant cards should go to detail page
    // Food cards will open modal (handled by food-modal.js)
}

function performHomeSearch() {
    const keyword = $('#home-search-input').val().trim();
    
    if (!keyword) {
        alert('Vui lòng nhập từ khóa tìm kiếm!');
        return;
    }
    
    console.log("=== performHomeSearch() called ===");
    console.log("Keyword:", keyword);
    
    // Show loading
    showHomeSearchLoading();
    
    // Hide default content, show search results section
    const defaultSection = $('#default-content-section');
    const searchSection = $('#search-results-section');
    
    console.log("Default section found:", defaultSection.length > 0);
    console.log("Search section found:", searchSection.length > 0);
    
    if (defaultSection.length > 0) {
        defaultSection.hide();
        console.log("✅ Default content section hidden");
    } else {
        console.warn("⚠️ Default content section not found!");
    }
    
    if (searchSection.length > 0) {
        searchSection.show();
        console.log("✅ Search results section shown");
    } else {
        console.error("❌ Search results section not found!");
    }
    
    // Search all
    if (typeof ApiService === 'undefined' || typeof ApiService.searchAll !== 'function') {
        console.error("❌ ApiService.searchAll is not available!");
        showHomeSearchError('Chức năng tìm kiếm chưa sẵn sàng. Vui lòng thử lại sau.');
        return;
    }
    
    ApiService.searchAll(keyword)
        .done(function(response) {
            console.log("=== Home Search API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data;
            
            console.log("isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData) {
                // Check if data has restaurants and foods keys
                if (typeof response.data === 'object' && (response.data.restaurants || response.data.foods)) {
                    console.log("✅ Rendering home search results...");
                    console.log("Restaurants:", response.data.restaurants?.length || 0);
                    console.log("Foods:", response.data.foods?.length || 0);
                    renderHomeSearchResults(response.data);
                } else if (Array.isArray(response.data)) {
                    // If data is array, treat as restaurants
                    console.log("⚠️ Data is array, treating as restaurants...");
                    renderHomeSearchRestaurants(response.data);
                } else {
                    console.warn("⚠️ Data format not recognized:", response.data);
                    showHomeSearchNoResults();
                }
            } else {
                console.warn("⚠️ Response not successful or no data");
                showHomeSearchNoResults();
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Home Search API Error ===");
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("XHR:", xhr);
            showHomeSearchError('Không thể tìm kiếm. Vui lòng thử lại sau.');
        });
}

function renderHomeSearchResults(results) {
    const container = $('#search-results-container');
    
    if (container.length === 0) {
        console.error("Search results container not found");
        return;
    }
    
    console.log("=== renderHomeSearchResults() called ===");
    
    let html = '';
    let hasResults = false;
    
    // Restaurants section
    if (results && results.restaurants && Array.isArray(results.restaurants) && results.restaurants.length > 0) {
        console.log("✅ Rendering", results.restaurants.length, "restaurants");
        html += '<h5 class="mt-4 mb-3">Nhà hàng</h5>';
        html += '<div class="row">';
        results.restaurants.forEach(function(restaurant) {
            html += renderHomeRestaurantCard(restaurant);
        });
        html += '</div>';
        hasResults = true;
    }
    
    // Foods section
    if (results && results.foods && Array.isArray(results.foods) && results.foods.length > 0) {
        console.log("✅ Rendering", results.foods.length, "foods");
        html += '<h5 class="mt-4 mb-3">Món ăn</h5>';
        html += '<div class="row">';
        results.foods.forEach(function(food) {
            html += renderHomeFoodCard(food);
        });
        html += '</div>';
        hasResults = true;
    }
    
    if (!hasResults || !html) {
        console.warn("⚠️ No results to display");
        showHomeSearchNoResults();
        return;
    }
    
    console.log("✅ Rendering HTML, length:", html.length);
    container.html(html);
}

function renderHomeSearchRestaurants(restaurants) {
    const container = $('#search-results-container');
    if (container.length === 0) return;
    
    if (!restaurants || restaurants.length === 0) {
        showHomeSearchNoResults();
        return;
    }
    
    let html = '<h5 class="mt-4 mb-3">Nhà hàng</h5><div class="row">';
    restaurants.forEach(function(restaurant) {
        html += renderHomeRestaurantCard(restaurant);
    });
    html += '</div>';
    
    container.html(html);
}

// Helper functions for search results (same as search.js)
function getImageUrlForSearch(image, defaultImage = 'img/burgerking.png') {
    if (!image) {
        return defaultImage;
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    if (image.startsWith('/')) {
        return 'http://localhost:82' + image;
    }
    if (typeof ApiService !== 'undefined' && ApiService.getRestaurantImage) {
        return ApiService.getRestaurantImage(image);
    }
    return 'http://localhost:82/restaurant/file/' + image;
}

function getMenuImageUrlForSearch(image, defaultImage = 'img/food1.jpg') {
    if (!image || image.trim() === '') {
        console.log("⚠️ No image provided, using default:", defaultImage);
        return defaultImage;
    }
    
    // Log original image value
    console.log("🖼️ Processing image:", image);
    
    if (image.startsWith('http://') || image.startsWith('https://')) {
        console.log("✅ Full URL detected:", image);
        return image;
    }
    
    if (image.startsWith('/')) {
        const fullUrl = 'http://localhost:82' + image;
        console.log("✅ Path with /, converted to:", fullUrl);
        return fullUrl;
    }
    
    // Try ApiService first
    if (typeof ApiService !== 'undefined' && ApiService.getMenuImage) {
        const apiUrl = ApiService.getMenuImage(image);
        console.log("✅ Using ApiService.getMenuImage:", apiUrl);
        return apiUrl;
    }
    
    // Fallback to direct URL construction
    const directUrl = 'http://localhost:82/menu/file/' + image;
    console.log("✅ Using direct URL:", directUrl);
    return directUrl;
}

function formatRatingForSearch(rating) {
    if (rating == null || rating === undefined) {
        return '0.0';
    }
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum)) {
        return '0.0';
    }
    return ratingNum.toFixed(1);
}

function formatPriceForSearch(price) {
    if (price == null || price === undefined) {
        return '0 ₫';
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
        return '0 ₫';
    }
    return priceNum.toLocaleString('vi-VN') + ' ₫';
}

function escapeHtmlForSearch(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

function renderHomeRestaurantCard(restaurant) {
    const imageUrl = getImageUrlForSearch(restaurant.image, 'img/burgerking.png');
    const rating = formatRatingForSearch(restaurant.rating);
    
    // Free delivery badge - luôn dành chỗ để đảm bảo chiều cao đều
    const freeDeliveryBadge = (restaurant.freeShip || restaurant.isFreeShip) ?
        '<span class="badge badge-success"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' :
        '<span class="badge badge-success" style="visibility: hidden;"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>';
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 d-flex flex-column">
                <img src="${imageUrl}" class="card-img-top" alt="${escapeHtmlForSearch(restaurant.title || '')}" style="height: 200px; object-fit: cover;" onerror="this.src='img/burgerking.png'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtmlForSearch(restaurant.title || 'Nhà hàng')}</h5>
                    ${restaurant.subtitle ? `<p class="card-text text-muted">${escapeHtmlForSearch(restaurant.subtitle)}</p>` : '<p class="card-text text-muted" style="visibility: hidden;">&nbsp;</p>'}
                    <div class="mb-2">
                        ${restaurant.rating != null ? `<p class="card-text small mb-1"><i class="mdi mdi-star text-warning"></i> <span class="font-weight-bold">${rating}</span></p>` : '<p class="card-text small mb-1" style="visibility: hidden;">&nbsp;</p>'}
                        ${restaurant.address ? `<p class="card-text mb-1"><small class="text-muted"><i class="mdi mdi-map-marker"></i> ${escapeHtmlForSearch(restaurant.address)}</small></p>` : '<p class="card-text mb-1" style="visibility: hidden;">&nbsp;</p>'}
                        <div style="min-height: 24px;">
                            ${freeDeliveryBadge}
                        </div>
                    </div>
                    <div class="mt-auto">
                        <a href="detail.html?id=${restaurant.id}" class="btn btn-primary btn-sm">Xem chi tiết</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderHomeFoodCard(food) {
    const imageUrl = getMenuImageUrlForSearch(food.image);
    
    // Free delivery badge - luôn dành chỗ để đảm bảo chiều cao đều
    const freeDeliveryBadge = (food.freeShip || food.isFreeShip) ?
        '<span class="badge badge-success"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' :
        '<span class="badge badge-success" style="visibility: hidden;"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>';
    
    const foodId = food.id ? parseInt(food.id) : 0;
    if (!foodId || foodId <= 0) {
        console.warn("⚠️ Skipping food item with invalid ID:", food.id);
        return '';
    }
    
    // Escape for data attributes (double escape for HTML attribute)
    const escapeForAttr = function(text) {
        if (!text) return '';
        return escapeHtmlForSearch(text).replace(/"/g, '&quot;');
    };
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 d-flex flex-column food-item-card" 
                 data-food-id="${foodId}"
                 data-food-title="${escapeForAttr(food.title || 'Food Item')}"
                 data-food-price="${food.price || 0}"
                 data-food-image="${escapeForAttr(food.image || '')}"
                 data-food-description="${escapeForAttr(food.desc || food.description || '')}"
                 data-food-time-ship="${escapeForAttr(food.timeShip || food.time_ship || '')}"
                 data-food-free-ship="${food.isFreeShip || food.freeShip || false}"
                 style="cursor: pointer;">
                <img src="${imageUrl}" class="card-img-top" alt="${escapeHtmlForSearch(food.title || '')}" style="height: 200px; object-fit: cover;" onerror="this.src='img/food1.jpg'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtmlForSearch(food.title || 'Món ăn')}</h5>
                    ${food.desc || food.description ? `<p class="card-text">${escapeHtmlForSearch(food.desc || food.description)}</p>` : '<p class="card-text" style="visibility: hidden;">&nbsp;</p>'}
                    <div class="mb-2">
                        <p class="card-text">
                            <strong class="text-primary">${formatPriceForSearch(food.price || 0)}</strong>
                            ${food.time_ship || food.timeShip ? `<small class="text-muted ml-2"><i class="mdi mdi-clock"></i> ${food.time_ship || food.timeShip}</small>` : ''}
                        </p>
                        <div style="min-height: 24px;">
                            ${freeDeliveryBadge}
                        </div>
                    </div>
                    <div class="mt-auto">
                        <button class="btn btn-primary btn-sm">Thêm vào giỏ</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showHomeSearchLoading() {
    const container = $('#search-results-container');
    container.html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="sr-only">Đang tìm kiếm...</span></div><p class="mt-3 text-muted">Đang tìm kiếm...</p></div>');
}

function showHomeSearchNoResults() {
    const container = $('#search-results-container');
    container.html('<div class="text-center py-5"><i class="mdi mdi-magnify text-muted" style="font-size: 3rem;"></i><p class="mt-3 text-muted">Không tìm thấy kết quả nào.</p></div>');
}

function showHomeSearchError(message) {
    const container = $('#search-results-container');
    container.html(`<div class="text-center py-5"><i class="mdi mdi-alert-circle text-danger" style="font-size: 3rem;"></i><p class="mt-3 text-danger">${message || 'Có lỗi xảy ra khi tìm kiếm.'}</p></div>`);
}

function clearHomeSearch() {
    console.log("=== clearHomeSearch() called ===");
    const searchInput = $('#home-search-input');
    const searchSection = $('#search-results-section');
    const defaultSection = $('#default-content-section');
    const resultsContainer = $('#search-results-container');
    
    if (searchInput.length > 0) {
        searchInput.val('');
        console.log("✅ Search input cleared");
    }
    
    if (searchSection.length > 0) {
        searchSection.hide();
        console.log("✅ Search results section hidden");
    }
    
    if (defaultSection.length > 0) {
        defaultSection.show();
        console.log("✅ Default content section shown");
    }
    
    if (resultsContainer.length > 0) {
        resultsContainer.html('');
        console.log("✅ Search results container cleared");
    }
    
    console.log("✅ Home search cleared");
}

// Show search suggestions
function showSearchSuggestions(keyword) {
    console.log("=== showSearchSuggestions() called ===");
    console.log("Keyword:", keyword);
    
    if (!keyword || keyword.length === 0) {
        hideSearchSuggestions();
        return;
    }
    
    const suggestionsDiv = $('#search-suggestions');
    const suggestionsList = $('#search-suggestions-list');
    
    if (suggestionsDiv.length === 0 || suggestionsList.length === 0) {
        console.warn("⚠️ Suggestions container not found");
        return;
    }
    
    // Show loading
    suggestionsList.html('<div class="suggestion-item text-center py-2"><small class="text-muted"><i class="mdi mdi-loading mdi-spin"></i> Đang tải...</small></div>');
    suggestionsDiv.show();
    console.log("✅ Suggestions div shown, loading...");
    
    // Call search API to get suggestions
    if (typeof ApiService === 'undefined' || typeof ApiService.searchAll !== 'function') {
        console.error("❌ ApiService.searchAll is not available!");
        suggestionsList.html('<div class="suggestion-item text-center py-2"><small class="text-muted">Lỗi: API không khả dụng</small></div>');
        return;
    }
    
    ApiService.searchAll(keyword)
        .done(function(response) {
            console.log("=== Search Suggestions API Response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.status:", response?.status);
            console.log("Response.data:", response?.data);
            console.log("Response.data type:", typeof response?.data);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data;
            
            console.log("isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData) {
                let suggestions = [];
                const keywordLower = keyword.toLowerCase();
                
                // Get foods from response - check multiple possible paths
                let foods = [];
                if (response.data.foods && Array.isArray(response.data.foods)) {
                    foods = response.data.foods;
                } else if (response.data.food && Array.isArray(response.data.food)) {
                    foods = response.data.food;
                } else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].title) {
                    // If data is directly an array of foods
                    foods = response.data;
                }
                
                foods.forEach(function(food) {
                    if (food && food.title) {
                        const foodTitleLower = food.title.toLowerCase();
                        // Lấy tất cả foods có chứa keyword, ưu tiên những cái bắt đầu bằng keyword
                        if (foodTitleLower.includes(keywordLower)) {
                            const priority = foodTitleLower.startsWith(keywordLower) ? 1 : 2;
                            suggestions.push({
                                type: 'food',
                                title: food.title,
                                id: food.id,
                                price: food.price || 0,
                                priority: priority
                            });
                        }
                    }
                });
                
                // Get restaurants from response - check multiple possible paths
                let restaurants = [];
                if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
                    restaurants = response.data.restaurants;
                } else if (response.data.restaurant && Array.isArray(response.data.restaurant)) {
                    restaurants = response.data.restaurant;
                }
                
                restaurants.forEach(function(restaurant) {
                    if (restaurant && restaurant.title) {
                        const restaurantTitleLower = restaurant.title.toLowerCase();
                        // Lấy tất cả restaurants có chứa keyword, ưu tiên những cái bắt đầu bằng keyword
                        if (restaurantTitleLower.includes(keywordLower)) {
                            const priority = restaurantTitleLower.startsWith(keywordLower) ? 1 : 2;
                            suggestions.push({
                                type: 'restaurant',
                                title: restaurant.title,
                                id: restaurant.id,
                                priority: priority
                            });
                        }
                    }
                });
                
                // Sắp xếp theo priority (bắt đầu bằng keyword trước), sau đó theo tên
                suggestions.sort(function(a, b) {
                    if (a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    return a.title.localeCompare(b.title);
                });
                
                // Limit to 10 suggestions
                suggestions = suggestions.slice(0, 10);
                
                if (suggestions.length > 0) {
                    renderSearchSuggestions(suggestions, keyword);
                } else {
                    suggestionsList.html('<div class="suggestion-item text-center py-2"><small class="text-muted">Không tìm thấy gợi ý</small></div>');
                }
                } else {
                    console.warn("⚠️ Response format invalid:", response);
                    // Fallback: try to get data even without success flag
                    let suggestions = [];
                    const keywordLower = keyword.toLowerCase();
                    
                    if (response && response.data) {
                        // Try to get foods from various possible paths
                        let foods = [];
                        if (response.data.foods && Array.isArray(response.data.foods)) {
                            foods = response.data.foods;
                        } else if (response.data.food && Array.isArray(response.data.food)) {
                            foods = response.data.food;
                        }
                        
                        foods.forEach(function(food) {
                            if (food && food.title && food.title.toLowerCase().includes(keywordLower)) {
                                suggestions.push({
                                    type: 'food',
                                    title: food.title,
                                    id: food.id,
                                    price: food.price || 0
                                });
                            }
                        });
                        
                        // Try to get restaurants from various possible paths
                        let restaurants = [];
                        if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
                            restaurants = response.data.restaurants;
                        } else if (response.data.restaurant && Array.isArray(response.data.restaurant)) {
                            restaurants = response.data.restaurant;
                        }
                        
                        restaurants.forEach(function(restaurant) {
                            if (restaurant && restaurant.title && restaurant.title.toLowerCase().includes(keywordLower)) {
                                suggestions.push({
                                    type: 'restaurant',
                                    title: restaurant.title,
                                    id: restaurant.id
                                });
                            }
                        });
                    }
                    
                    if (suggestions.length > 0) {
                        renderSearchSuggestions(suggestions.slice(0, 10), keyword);
                    } else {
                        suggestionsList.html('<div class="suggestion-item text-center py-2"><small class="text-muted">Không tìm thấy gợi ý</small></div>');
                    }
                }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Search Suggestions API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Status code:", xhr.status);
            console.error("Response text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            
            // Check if it's a network error or server error
            if (xhr.status === 0 || status === 'error') {
                // Network error - hide suggestions
                hideSearchSuggestions();
            } else {
                // Server error - show error message
                suggestionsList.html('<div class="suggestion-item text-center py-2"><small class="text-muted">Không thể tải gợi ý. Vui lòng thử lại.</small></div>');
            }
        });
}

// Render search suggestions
function renderSearchSuggestions(suggestions, keyword) {
    const suggestionsList = $('#search-suggestions-list');
    
    if (suggestionsList.length === 0) return;
    
    let html = '';
    suggestions.forEach(function(suggestion) {
        const icon = suggestion.type === 'food' ? 'mdi-silverware-fork-knife' : 'mdi-store';
        const priceText = suggestion.price ? ` - ${formatPriceForSearch(suggestion.price)}` : '';
        
        html += `
            <div class="suggestion-item" data-type="${suggestion.type}" data-id="${suggestion.id}" data-title="${escapeHtmlForSearch(suggestion.title)}">
                <i class="mdi ${icon} mr-2 text-muted"></i>
                <span class="suggestion-text">${escapeHtmlForSearch(suggestion.title)}</span>
                ${priceText ? `<span class="text-primary ml-2">${priceText}</span>` : ''}
            </div>
        `;
    });
    
    suggestionsList.html(html);
    
    // Attach click handlers
    $('.suggestion-item').off('click').on('click', function() {
        const title = $(this).data('title');
        const type = $(this).data('type');
        const id = $(this).data('id');
        
        // Set search input value
        $('#home-search-input').val(title);
        
        // Hide suggestions
        hideSearchSuggestions();
        
        // Perform search
        performHomeSearch();
    });
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestionsDiv = $('#search-suggestions');
    if (suggestionsDiv.length > 0) {
        suggestionsDiv.hide();
    }
}

