/*
 * Favourites Page - Load favorite restaurants and dishes from API
 * Version: 2.0 - Full API integration
 * Note: Backend doesn't have favorites API yet, so we load all restaurants/dishes
 *       Can be filtered by localStorage favorites in the future
 */

console.log("=== FAVOURITIES.JS LOADED - VERSION 2.0 ===");

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
    if (typeof ApiService !== 'undefined' && ApiService.getMenuImage) {
        return ApiService.getMenuImage(image);
    }
    return 'http://localhost:82/menu/file/' + image;
}

$(document).ready(function() {
    console.log("=== $(document).ready() fired in favourities.js ===");
    
    // Check dependencies
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        setTimeout(function() {
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService still not loaded after 500ms!");
                return;
            }
            loadFavouritesData();
        }, 500);
        return;
    }
    
    loadFavouritesData();
    
    // Setup tab switching
    setupTabs();
});

function setupTabs() {
    // Update tab counts when data is loaded
    $('#myTab').on('shown.bs.tab', function(e) {
        const target = $(e.target).attr('href');
        console.log("Tab switched to:", target);
        
        if (target === '#home') {
            // Restaurants tab
            loadRestaurants();
        } else if (target === '#profile') {
            // Dishes tab
            loadDishes();
        }
    });
}

function loadFavouritesData() {
    console.log("=== loadFavouritesData() called ===");
    
    // Load restaurants for first tab
    loadRestaurants();
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
                updateRestaurantTabCount(response.data.length);
            } else {
                console.warn("⚠️ Restaurants response format invalid or empty:", response);
                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    console.log("⚠️ Fallback: Rendering restaurants even without success flag");
                    renderRestaurants(response.data);
                    updateRestaurantTabCount(response.data.length);
                } else {
                    console.error("❌ No restaurants data to render!");
                    updateRestaurantTabCount(0);
                }
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Restaurants API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            updateRestaurantTabCount(0);
        });
}

function renderRestaurants(restaurants) {
    console.log("=== renderRestaurants() called ===");
    console.log("Restaurants count:", restaurants.length);
    
    if (!restaurants || restaurants.length === 0) {
        console.warn("⚠️ No restaurants to render");
        const restaurantsContainer = $('#home .row').first();
        if (restaurantsContainer.length > 0) {
            restaurantsContainer.html('<div class="col-12"><p class="text-center text-muted">Không có nhà hàng yêu thích nào.</p></div>');
        }
        return;
    }
    
    // Find restaurants container in #home tab
    const restaurantsContainer = $('#home .row').first();
    
    if (restaurantsContainer.length === 0) {
        console.error("❌ Restaurants container not found!");
        return;
    }
    
    console.log("✅ Restaurants container found, rendering restaurants...");
    
    let html = '';
    restaurants.forEach(function(restaurant, index) {
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
    
    // Replace content in container
    restaurantsContainer.html(html);
    console.log("✅ Restaurants rendered successfully, count:", restaurants.length);
}

function updateRestaurantTabCount(count) {
    const tab = $('#home-tab');
    if (tab.length > 0) {
        tab.html(`<i class="mdi mdi-home-variant-outline mr-2"></i>Restaurants (${count})`);
        console.log("✅ Restaurant tab count updated to:", count);
    }
}

function loadDishes() {
    console.log("=== loadDishes() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getCategories !== 'function') {
        console.error("❌ ApiService.getCategories is not available!");
        return;
    }
    
    console.log("Calling ApiService.getCategories()...");
    
    ApiService.getCategories()
        .done(function(response) {
            console.log("=== Categories API Response (for Dishes) ===");
            console.log("Full response:", response);
            
            const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
            const hasData = response && response.data && Array.isArray(response.data);
            
            console.log("Categories check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData && response.data.length > 0) {
                console.log("✅ Categories data is valid, extracting food items...");
                // Extract all food items from categories
                const foodItems = [];
                response.data.forEach(function(category) {
                    if (category.menus && Array.isArray(category.menus)) {
                        category.menus.forEach(function(menu) {
                            foodItems.push(menu);
                        });
                    }
                });
                console.log("Total food items extracted:", foodItems.length);
                if (foodItems.length > 0) {
                    renderDishes(foodItems);
                    updateDishesTabCount(foodItems.length);
                } else {
                    console.warn("⚠️ No food items found in categories");
                    updateDishesTabCount(0);
                }
            } else {
                console.warn("⚠️ Categories response format invalid or empty:", response);
                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const foodItems = [];
                    response.data.forEach(function(category) {
                        if (category.menus && Array.isArray(category.menus)) {
                            category.menus.forEach(function(menu) {
                                foodItems.push(menu);
                            });
                        }
                    });
                    if (foodItems.length > 0) {
                        renderDishes(foodItems);
                        updateDishesTabCount(foodItems.length);
                    } else {
                        updateDishesTabCount(0);
                    }
                } else {
                    updateDishesTabCount(0);
                }
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Categories API Error (for Dishes) ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            updateDishesTabCount(0);
        });
}

function renderDishes(foodItems) {
    console.log("=== renderDishes() called ===");
    console.log("Food items count:", foodItems.length);
    
    if (!foodItems || foodItems.length === 0) {
        console.warn("⚠️ No food items to render");
        const dishesContainer = $('#profile .row').first();
        if (dishesContainer.length > 0) {
            dishesContainer.html('<div class="col-12"><p class="text-center text-muted">Không có món ăn yêu thích nào.</p></div>');
        }
        return;
    }
    
    // Find dishes container in #profile tab
    const dishesContainer = $('#profile .row').first();
    
    if (dishesContainer.length === 0) {
        console.error("❌ Dishes container not found!");
        return;
    }
    
    console.log("✅ Dishes container found, rendering dishes...");
    
    let html = '';
    foodItems.forEach(function(food, index) {
        const imageUrl = getMenuImageUrl(food.image);
        const freeShipBadge = (food.isFreeShip || food.freeShip) 
            ? '<span class="badge badge-light ml-auto"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' 
            : '';
        
        html += `
            <a href="#" class="text-decoration-none text-dark col-xl-4 col-md-12 mb-4" data-toggle="modal" data-target="#myitemsModal">
                <img src="${imageUrl}" class="img-fluid rounded" alt="${food.title || 'Food Item'}" onerror="this.src='img/food1.jpg'">
                <div class="d-flex align-items-center mt-3 mb-2">
                    <p class="text-black h6 m-0">${food.title || 'Food Item'}</p>
                    ${freeShipBadge}
                </div>
                <p class="small mb-2">
                    <i class="mdi mdi-star text-warning"></i> <span class="font-weight-bold text-dark ml-1">4.8</span>(1,873) 
                    <i class="mdi mdi-silverware-fork-knife ml-2 mr-1"></i> Food 
                    <i class="mdi mdi-motorbike ml-2 mr-2"></i>45 - 55 min
                </p>
            </a>
        `;
    });
    
    console.log("Dishes HTML generated, length:", html.length);
    
    // Replace content in container
    dishesContainer.html(html);
    console.log("✅ Dishes rendered successfully, count:", foodItems.length);
}

function updateDishesTabCount(count) {
    const tab = $('#profile-tab');
    if (tab.length > 0) {
        tab.html(`<i class="mdi mdi-silverware-fork-knife mr-2"></i>Dishes (${count})`);
        console.log("✅ Dishes tab count updated to:", count);
    }
}

