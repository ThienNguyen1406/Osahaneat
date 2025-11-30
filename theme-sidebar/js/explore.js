/*
 * Explore Page - Load restaurants and food items from API
 * Version: 2.0 - Full API integration
 */

console.log("=== EXPLORE.JS LOADED - VERSION 2.0 ===");

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

$(document).ready(function() {
    console.log("=== $(document).ready() fired in explore.js ===");
    
    // Check dependencies
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        setTimeout(function() {
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService still not loaded after 500ms!");
                return;
            }
            loadExploreData();
        }, 500);
        return;
    }
    
    loadExploreData();
});

function loadExploreData() {
    console.log("=== loadExploreData() called ===");
    
    // Load restaurants
    loadRestaurants();
    
    // Load popular food items (from categories)
    loadPopularFood();
}

function loadRestaurants() {
    console.log("=== loadRestaurants() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getRestaurants !== 'function') {
        console.error("❌ ApiService.getRestaurants is not available!");
        return;
    }
    
    console.log("Calling ApiService.getRestaurants()...");
    
    ApiService.getRestaurants()
        .done(function(response) {
            console.log("=== Restaurants API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data && Array.isArray(response.data);
            
            console.log("Restaurants check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData && response.data.length > 0) {
                console.log("✅ Restaurants data is valid, rendering " + response.data.length + " restaurants...");
                renderRestaurants(response.data);
            } else {
                console.warn("⚠️ Restaurants response format invalid or empty:", response);
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
            console.error("Response text:", xhr.responseText);
        });
}

function renderRestaurants(restaurants) {
    console.log("=== renderRestaurants() called ===");
    console.log("Restaurants count:", restaurants.length);
    
    if (!restaurants || restaurants.length === 0) {
        console.warn("⚠️ No restaurants to render");
        return;
    }
    
    // Tìm container "Restaurants nearby" section
    let restaurantsSection = null;
    $('.d-flex.align-items-center.justify-content-between').each(function() {
        const h5 = $(this).find('h5');
        if (h5.length > 0) {
            const h5Text = h5.text().trim();
            console.log("Checking h5 text:", h5Text);
            if (h5Text.includes('Restaurants nearby') || h5Text.includes('Restaurants')) {
                restaurantsSection = $(this);
                console.log("✅ Found restaurants section");
                return false; // Break loop
            }
        }
    });
    
    console.log("Restaurants section found:", restaurantsSection ? "YES" : "NO");
    
    // Tìm row container ngay sau restaurantsSection
    let restaurantRow = restaurantsSection ? restaurantsSection.next('.row') : null;
    
    // Strategy 2: Find first row in container-fluid
    if (!restaurantRow || restaurantRow.length === 0) {
        restaurantRow = $('.container-fluid .row').first();
        console.log("Restaurant row (first in container-fluid):", restaurantRow.length);
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
    
    // Strategy 4: Find any empty row
    if (!restaurantRow || restaurantRow.length === 0) {
        $('.container-fluid .row').each(function() {
            const content = $(this).html().trim();
            if (content === '' || content.includes('Restaurants will be rendered')) {
                restaurantRow = $(this);
                console.log("✅ Found empty row for restaurants");
                return false;
            }
        });
    }
    
    // Strategy 5: Create new row if section found
    if (!restaurantRow || restaurantRow.length === 0) {
        if (restaurantsSection && restaurantsSection.length > 0) {
            console.log("Creating new restaurant row...");
            restaurantRow = $('<div class="row"></div>');
            restaurantsSection.after(restaurantRow);
            console.log("✅ Created new restaurant row");
        } else {
            const container = $('.container-fluid');
            if (container.length > 0) {
                restaurantRow = $('<div class="row"></div>');
                container.append(restaurantRow);
                console.log("✅ Created new restaurant row in container-fluid");
            }
        }
    }
    
    if (!restaurantRow || restaurantRow.length === 0) {
        console.error("❌ Could not find or create restaurant row container");
        return;
    }
    
    console.log("✅ Restaurant row container found, rendering restaurants...");
    
    // Render restaurants to first row
    renderRestaurantsToContainer(restaurants, restaurantRow);
    
    // If there are more restaurants, create second row
    if (restaurants.length > 6) {
        const secondRow = $('<div class="row"></div>');
        restaurantRow.after(secondRow);
        renderRestaurantsToContainer(restaurants.slice(6), secondRow);
        console.log("✅ Created second row for additional restaurants");
    }
}

function renderRestaurantsToContainer(restaurants, container) {
    console.log("renderRestaurantsToContainer() called, container:", container.length > 0);
    
    if (!container || container.length === 0) {
        console.error("❌ Container is empty or invalid!");
        return;
    }
    
    let html = '';
    restaurants.forEach(function(restaurant, index) {
        if (index >= 6) return; // Limit to 6 per row
        
        // Get image URL
        let imageUrl = 'img/burgerking.png';
        if (restaurant.image) {
            if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
                imageUrl = restaurant.image;
            } else if (restaurant.image.startsWith('/')) {
                imageUrl = 'http://localhost:82' + restaurant.image;
            } else {
                if (typeof ApiService !== 'undefined' && ApiService.getRestaurantImage) {
                    imageUrl = ApiService.getRestaurantImage(restaurant.image);
                } else {
                    imageUrl = 'http://localhost:82/restaurant/file/' + restaurant.image;
                }
            }
        }
        
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
    
    // Append to container (don't replace, append to allow multiple rows)
    container.html(html);
    console.log("✅ Restaurants rendered successfully, count:", Math.min(restaurants.length, 6));
}

function loadPopularFood() {
    console.log("=== loadPopularFood() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getCategories !== 'function') {
        console.error("❌ ApiService.getCategories is not available!");
        return;
    }
    
    console.log("Calling ApiService.getCategories()...");
    
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
                    renderPopularFood(selectedCategory.menus, selectedCategory.name || selectedCategory.name_cate);
                } else {
                    console.warn("⚠️ No category with food items found");
                    // Fallback: lấy tất cả món ăn từ tất cả categories
                    const foodItems = [];
                    response.data.forEach(function(category) {
                        if (category.menus && Array.isArray(category.menus)) {
                            category.menus.forEach(function(menu) {
                                foodItems.push(menu);
                            });
                        }
                    });
                    if (foodItems.length > 0) {
                        console.log("⚠️ Fallback: Rendering all food items from all categories");
                        renderPopularFood(foodItems.slice(0, 6), "Popular food");
                    }
                }
            } else {
                console.warn("⚠️ Categories response format invalid or empty:", response);
                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    // Tương tự như trên
                    let selectedCategory = response.data.find(function(cat) {
                        return cat.menus && Array.isArray(cat.menus) && cat.menus.length > 0;
                    });
                    if (selectedCategory && selectedCategory.menus && selectedCategory.menus.length > 0) {
                        renderPopularFood(selectedCategory.menus, selectedCategory.name || selectedCategory.name_cate);
                    }
                }
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
    
    // Tìm container "Popular food" section
    let popularFoodSection = null;
    $('.d-flex.align-items-center.justify-content-between').each(function() {
        const h5 = $(this).find('h5');
        if (h5.length > 0) {
            const h5Text = h5.text().trim();
            console.log("Checking h5 text:", h5Text);
            if (h5Text.includes('Popular food') || h5Text.includes('Popular')) {
                popularFoodSection = $(this);
                // Cập nhật title nếu có category name
                if (categoryName) {
                    h5.text(`${categoryName} - Popular food`);
                    console.log(`✅ Updated section title to "${categoryName} - Popular food"`);
                }
                console.log("✅ Found popular food section");
                return false; // Break loop
            }
        }
    });
    
    console.log("Popular food section found:", popularFoodSection ? "YES" : "NO");
    
    // Tìm row container ngay sau popularFoodSection
    let foodRow = popularFoodSection ? popularFoodSection.next('.row') : null;
    
    // Strategy 2: Find rows after first restaurant row
    if (!foodRow || foodRow.length === 0) {
        const allRows = $('.container-fluid .row');
        // Find row after "Popular food" section
        if (popularFoodSection && popularFoodSection.length > 0) {
            popularFoodSection.nextAll('.row').each(function() {
                if ($(this).find('a[href*="detail.html"]').length === 0) {
                    foodRow = $(this);
                    console.log("✅ Found food row after popular food section");
                    return false;
                }
            });
        }
    }
    
    // Strategy 3: Find row with comment "Popular food items will be rendered here"
    if (!foodRow || foodRow.length === 0) {
        $('.container-fluid .row').each(function() {
            const comment = $(this).html();
            if (comment && comment.includes('Popular food items will be rendered')) {
                foodRow = $(this);
                console.log("✅ Found food row by comment");
                return false;
            }
        });
    }
    
    // Strategy 4: Create new row if section found
    if (!foodRow || foodRow.length === 0) {
        if (popularFoodSection && popularFoodSection.length > 0) {
            console.log("Creating new food row...");
            foodRow = $('<div class="row"></div>');
            popularFoodSection.after(foodRow);
            console.log("✅ Created new food row");
        } else {
            const container = $('.container-fluid');
            if (container.length > 0) {
                foodRow = $('<div class="row"></div>');
                container.append(foodRow);
                console.log("✅ Created new food row in container-fluid");
            }
        }
    }
    
    if (!foodRow || foodRow.length === 0) {
        console.error("❌ Could not find or create food row container");
        return;
    }
    
    console.log("✅ Food row container found, rendering food items...");
    
    // Render food items (limit to 6 items để không trống trải)
    const limitedFoodItems = foodItems.slice(0, 6);
    renderFoodItemsToContainer(limitedFoodItems, foodRow, categoryName);
    
    // If there are more food items, create second row
    if (foodItems.length > 6) {
        const secondRow = $('<div class="row"></div>');
        foodRow.after(secondRow);
        renderFoodItemsToContainer(foodItems.slice(6, 12), secondRow, categoryName);
        console.log("✅ Created second row for additional food items");
    }
}

function renderFoodItemsToContainer(foodItems, container, categoryName) {
    console.log("renderFoodItemsToContainer() called, container:", container.length > 0);
    console.log("Category name:", categoryName);
    
    if (!container || container.length === 0) {
        console.error("❌ Container is empty or invalid!");
        return;
    }
    
    let html = '';
    foodItems.forEach(function(food, index) {
        if (index >= 6) return; // Limit to 6 per row
        
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

