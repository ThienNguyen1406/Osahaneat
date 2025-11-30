/*
 * Search Page - Search restaurants and foods
 */

// API_BASE_URL is defined in api.js

// Helper function to get image URL
function getImageUrl(image, defaultImage = 'img/burgerking.png') {
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
    if (typeof ApiService !== 'undefined' && ApiService.getRestaurantImage) {
        return ApiService.getRestaurantImage(image);
    }
    return 'http://localhost:82/restaurant/file/' + image;
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

$(document).ready(function() {
    // Setup search handlers
    setupSearchHandlers();
    
    // Load categories for advanced search
    loadCategories();
    
    // Load categories for filter modal
    loadCategoriesForFilter();
    
    // Setup filter handlers
    setupFilterHandlers();
});

function setupSearchHandlers() {
    // Search on Enter key only (no auto-search on input)
    $('#search-input').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            performSearch();
        }
    });
    
    // Remove any auto-search on input (if exists)
    $('#search-input').off('input keyup keydown');
    
    // Search button click
    $('#search-btn').on('click', function() {
        performSearch();
    });
    
    // Advanced search toggle
    $('#advanced-search-toggle').on('click', function() {
        $('#advanced-search-panel').toggle();
    });
    
    // Advanced search button
    $('#advanced-search-btn').on('click', function() {
        performAdvancedSearch();
    });
    
    // Toggle filters based on search type
    $('#search-type').on('change', function() {
        const searchType = $(this).val();
        if (searchType === 'restaurant') {
            $('#restaurant-filters').show();
            $('#food-filters').hide();
        } else {
            $('#restaurant-filters').hide();
            $('#food-filters').show();
        }
    });
}

function performSearch() {
    const keyword = $('#search-input').val().trim();
    
    if (!keyword) {
        alert('Vui lòng nhập từ khóa tìm kiếm!');
        return;
    }
    
    // Show loading
    showLoading();
    
    console.log("=== performSearch() called ===");
    console.log("Keyword:", keyword);
    
    // Search all
    ApiService.searchAll(keyword)
        .done(function(response) {
            console.log("=== Search API Response ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.status:", response?.status);
            console.log("Response.data:", response?.data);
            
            // Check cả isSuccess, success, và status === 200
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data;
            
            console.log("isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData) {
                // Check if data has restaurants and foods keys
                if (typeof response.data === 'object' && (response.data.restaurants || response.data.foods)) {
                    console.log("✅ Rendering search results...");
                    console.log("Restaurants:", response.data.restaurants?.length || 0);
                    console.log("Foods:", response.data.foods?.length || 0);
                    renderSearchResults(response.data);
                } else if (Array.isArray(response.data)) {
                    // If data is array, treat as restaurants
                    console.log("⚠️ Data is array, treating as restaurants...");
                    renderRestaurants(response.data);
                } else {
                    console.warn("⚠️ Data format not recognized:", response.data);
                    showNoResults();
                }
            } else {
                console.warn("⚠️ Response not successful or no data");
                showNoResults();
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Search API Error ===");
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("XHR:", xhr);
            console.error("Response text:", xhr.responseText);
            showNoResults();
        });
}

function performAdvancedSearch() {
    const keyword = $('#advanced-keyword').val().trim();
    const searchType = $('#search-type').val();
    
    showLoading();
    
    if (searchType === 'restaurant') {
        const address = $('#filter-address').val().trim();
        const isFreeship = $('#filter-freeship').is(':checked');
        
        ApiService.searchRestaurantsAdvanced(keyword, address, isFreeship)
            .done(function(response) {
                // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
                if (response && (response.isSuccess || response.success) && response.data) {
                    renderRestaurants(response.data);
                } else {
                    showNoResults();
                }
            })
            .fail(function(xhr) {
                console.error('Error in advanced restaurant search:', xhr);
                showNoResults();
            });
    } else if (searchType === 'food') {
        const categoryId = $('#filter-category').val();
        const minPrice = $('#filter-min-price').val();
        const maxPrice = $('#filter-max-price').val();
        
        ApiService.searchFoodsAdvanced(keyword, categoryId, minPrice, maxPrice)
            .done(function(response) {
                // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
                if (response && (response.isSuccess || response.success) && response.data) {
                    renderFoods(response.data);
                } else {
                    showNoResults();
                }
            })
            .fail(function(xhr) {
                console.error('Error in advanced food search:', xhr);
                showNoResults();
            });
    }
}

function renderSearchResults(results) {
    const container = $('#search-results');
    
    if (container.length === 0) {
        console.error("Search results container not found");
        return;
    }
    
    console.log("=== renderSearchResults() called ===");
    console.log("Results:", results);
    console.log("Results type:", typeof results);
    console.log("Results.restaurants:", results?.restaurants);
    console.log("Results.foods:", results?.foods);
    
    let html = '';
    let hasResults = false;
    
    // Restaurants section
    if (results && results.restaurants && Array.isArray(results.restaurants) && results.restaurants.length > 0) {
        console.log("✅ Rendering", results.restaurants.length, "restaurants");
        html += '<h5 class="mt-4 mb-3">Nhà hàng</h5>';
        html += '<div class="row">';
        results.restaurants.forEach(function(restaurant) {
            html += renderRestaurantCard(restaurant);
        });
        html += '</div>';
        hasResults = true;
    } else {
        console.log("⚠️ No restaurants found or invalid format");
    }
    
    // Foods section
    if (results && results.foods && Array.isArray(results.foods) && results.foods.length > 0) {
        console.log("✅ Rendering", results.foods.length, "foods");
        html += '<h5 class="mt-4 mb-3">Món ăn</h5>';
        html += '<div class="row">';
        results.foods.forEach(function(food) {
            html += renderFoodCard(food);
        });
        html += '</div>';
        hasResults = true;
    } else {
        console.log("⚠️ No foods found or invalid format");
    }
    
    if (!hasResults || !html) {
        console.warn("⚠️ No results to display");
        showNoResults();
        return;
    }
    
    console.log("✅ Rendering HTML, length:", html.length);
    container.html(html);
}

function renderRestaurants(restaurants) {
    const container = $('#search-results');
    if (container.length === 0) return;
    
    if (!restaurants || restaurants.length === 0) {
        showNoResults();
        return;
    }
    
    let html = '<h5 class="mt-4 mb-3">Nhà hàng</h5><div class="row">';
    restaurants.forEach(function(restaurant) {
        html += renderRestaurantCard(restaurant);
    });
    html += '</div>';
    
    container.html(html);
}

function renderFoods(foods) {
    const container = $('#search-results');
    if (container.length === 0) return;
    
    if (!foods || foods.length === 0) {
        showNoResults();
        return;
    }
    
    let html = '<h5 class="mt-4 mb-3">Món ăn</h5><div class="row">';
    foods.forEach(function(food) {
        html += renderFoodCard(food);
    });
    html += '</div>';
    
    container.html(html);
}

function renderRestaurantCard(restaurant) {
    const imageUrl = getImageUrl(restaurant.image, 'img/food-banner.jpg');
    const rating = formatRating(restaurant.rating);
    
    // Free delivery badge - luôn dành chỗ để đảm bảo chiều cao đều
    const freeDeliveryBadge = (restaurant.freeShip || restaurant.isFreeShip) ?
        '<span class="badge badge-success"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' :
        '<span class="badge badge-success" style="visibility: hidden;"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>';
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 d-flex flex-column">
                <img src="${imageUrl}" class="card-img-top" alt="${escapeHtml(restaurant.title || '')}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtml(restaurant.title || 'Nhà hàng')}</h5>
                    ${restaurant.subtitle ? `<p class="card-text text-muted">${escapeHtml(restaurant.subtitle)}</p>` : '<p class="card-text text-muted" style="visibility: hidden;">&nbsp;</p>'}
                    <div class="mb-2">
                        ${restaurant.rating != null ? `<p class="card-text small mb-1"><i class="mdi mdi-star text-warning"></i> <span class="font-weight-bold">${rating}</span></p>` : '<p class="card-text small mb-1" style="visibility: hidden;">&nbsp;</p>'}
                        ${restaurant.address ? `<p class="card-text mb-1"><small class="text-muted"><i class="mdi mdi-map-marker"></i> ${escapeHtml(restaurant.address)}</small></p>` : '<p class="card-text mb-1" style="visibility: hidden;">&nbsp;</p>'}
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

function renderFoodCard(food) {
    const imageUrl = getMenuImageUrl(food.image);
    
    // Free delivery badge - luôn dành chỗ để đảm bảo chiều cao đều
    const freeDeliveryBadge = (food.freeShip || food.isFreeShip) ?
        '<span class="badge badge-success"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' :
        '<span class="badge badge-success" style="visibility: hidden;"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>';
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 d-flex flex-column">
                <img src="${imageUrl}" class="card-img-top" alt="${escapeHtml(food.title || '')}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtml(food.title || 'Món ăn')}</h5>
                    ${food.desc ? `<p class="card-text">${escapeHtml(food.desc)}</p>` : '<p class="card-text" style="visibility: hidden;">&nbsp;</p>'}
                    <div class="mb-2">
                        <p class="card-text">
                            <strong class="text-primary">${formatPrice(food.price || 0)}</strong>
                            ${food.time_ship ? `<small class="text-muted ml-2"><i class="mdi mdi-clock"></i> ${food.time_ship}</small>` : ''}
                        </p>
                        <div style="min-height: 24px;">
                            ${freeDeliveryBadge}
                        </div>
                    </div>
                    <div class="mt-auto">
                        <a href="#" class="btn btn-primary btn-sm">Thêm vào giỏ</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadCategories() {
    ApiService.getCategories()
        .done(function(response) {
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                const select = $('#filter-category');
                select.append('<option value="">Tất cả danh mục</option>');
                response.data.forEach(function(category) {
                    select.append(`<option value="${category.id}">${escapeHtml(category.nameCate || '')}</option>`);
                });
            }
        })
        .fail(function(xhr) {
            console.error('Error loading categories:', xhr);
        });
}

function showLoading() {
    const container = $('#search-results');
    if (container.length > 0) {
        container.html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="sr-only">Đang tải...</span></div></div>');
    }
}

function showNoResults() {
    const container = $('#search-results');
    if (container.length > 0) {
        container.html(`
            <div class="alert alert-info text-center py-5">
                <i class="mdi mdi-magnify mb-3" style="font-size: 48px;"></i>
                <h5>Không tìm thấy kết quả</h5>
                <p class="text-muted">Vui lòng thử lại với từ khóa khác hoặc sử dụng tìm kiếm nâng cao.</p>
            </div>
        `);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// FILTER FUNCTIONS
// ============================================

let currentFilters = {
    sort: 'popular',
    priceRange: null,
    categoryIds: []
};

function setupFilterHandlers() {
    // Sort buttons
    $('.filter-sort-btn').on('click', function() {
        $('.filter-sort-btn').removeClass('active');
        $(this).addClass('active');
        currentFilters.sort = $(this).data('sort');
    });
    
    // Price range buttons
    $('.filter-price-btn').on('click', function() {
        $('.filter-price-btn').removeClass('active');
        $(this).addClass('active');
        currentFilters.priceRange = $(this).data('price');
    });
    
    // Apply filters button
    $('#applyFiltersBtn').on('click', function() {
        applyFilters();
    });
    
    // Load filter modal - load categories
    $('#filtersModal').on('show.bs.modal', function() {
        loadCategoriesForFilter();
    });
}

function loadCategoriesForFilter() {
    if (typeof ApiService === 'undefined' || typeof ApiService.getCategories !== 'function') {
        console.error("ApiService.getCategories is not available!");
        return;
    }
    
    ApiService.getCategories()
        .done(function(response) {
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                const container = $('#filterCategoriesContainer');
                container.empty();
                
                response.data.forEach(function(category) {
                    const categoryBtn = $(`
                        <label class="btn filter-category-btn btn-sm rounded mr-2 mb-2" data-category-id="${category.id}">
                            <input type="checkbox" class="category-checkbox" value="${category.id}">
                            ${escapeHtml(category.nameCate || '')}
                        </label>
                    `);
                    container.append(categoryBtn);
                });
                
                // Setup category checkbox handlers
                $('.category-checkbox').on('change', function() {
                    updateSelectedCategories();
                });
            }
        })
        .fail(function(xhr) {
            console.error('Error loading categories for filter:', xhr);
        });
}

function updateSelectedCategories() {
    currentFilters.categoryIds = [];
    $('.category-checkbox:checked').each(function() {
        currentFilters.categoryIds.push(parseInt($(this).val()));
    });
    
    // Update button active state
    $('.filter-category-btn').each(function() {
        const checkbox = $(this).find('.category-checkbox');
        if (checkbox.is(':checked')) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });
}

function applyFilters() {
    const keyword = $('#search-input').val().trim();
    const searchType = $('#search-type').val() || 'food'; // Default to food
    
    // Update selected categories
    updateSelectedCategories();
    
    // Close modal
    $('#filtersModal').modal('hide');
    
    // Show loading
    showLoading();
    
    console.log("=== applyFilters() called ===");
    console.log("Filters:", currentFilters);
    console.log("Keyword:", keyword);
    console.log("Search type:", searchType);
    
    // Build query params
    const params = {
        keyword: keyword || null,
        sort: currentFilters.sort || 'popular',
        priceRange: currentFilters.priceRange || null,
        categoryIds: currentFilters.categoryIds.length > 0 ? currentFilters.categoryIds : null
    };
    
    // Remove null values
    Object.keys(params).forEach(key => {
        if (params[key] === null) {
            delete params[key];
        }
    });
    
    // Call filtered search API
    if (searchType === 'restaurant') {
        if (typeof ApiService.searchRestaurantsFiltered === 'function') {
            ApiService.searchRestaurantsFiltered(params.keyword, params.sort, params.priceRange, params.categoryIds)
                .done(function(response) {
                    if (response && (response.isSuccess || response.success) && response.data) {
                        renderRestaurants(response.data);
                    } else {
                        showNoResults();
                    }
                })
                .fail(function(xhr) {
                    console.error('Error in filtered restaurant search:', xhr);
                    showNoResults();
                });
        } else {
            // Fallback to regular search
            performSearch();
        }
    } else {
        if (typeof ApiService.searchFoodsFiltered === 'function') {
            ApiService.searchFoodsFiltered(params.keyword, params.sort, params.priceRange, params.categoryIds)
                .done(function(response) {
                    if (response && (response.isSuccess || response.success) && response.data) {
                        renderFoods(response.data);
                    } else {
                        showNoResults();
                    }
                })
                .fail(function(xhr) {
                    console.error('Error in filtered food search:', xhr);
                    showNoResults();
                });
        } else {
            // Fallback to regular search
            performSearch();
        }
    }
}

