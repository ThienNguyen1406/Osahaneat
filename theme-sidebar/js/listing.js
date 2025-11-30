/*
 * Listing Page - Load restaurants list from API
 */

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

$(document).ready(function() {
    loadRestaurants();
});

function loadRestaurants() {
    ApiService.getRestaurants()
        .done(function(response) {
            console.log("Restaurants:", response);
            // Backend response format: { status, isSuccess, desc, data }
            // Check cả isSuccess và success (vì Jackson có thể serialize khác nhau)
            if (response && (response.isSuccess || response.success) && response.data && Array.isArray(response.data)) {
                renderRestaurants(response.data);
            } else {
                console.warn("Restaurants response:", response);
                const errorMsg = response.desc || "Không thể tải danh sách nhà hàng!";
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error("Error loading restaurants:", xhr);
            let errorMsg = "Không thể tải danh sách nhà hàng!";
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
        });
}

function renderRestaurants(restaurants) {
    let html = '';
    
    restaurants.forEach(function(restaurant) {
        const imageUrl = getImageUrl(restaurant.image);
        const rating = formatRating(restaurant.rating);
        
        html += `
            <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
                <a href="detail.html?id=${restaurant.id}" class="text-dark text-decoration-none">
                    <div class="card shadow-sm">
                        <img src="${imageUrl}" class="card-img-top" alt="${restaurant.title || 'Restaurant'}" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h6 class="card-title">${restaurant.title || restaurant.name || 'Restaurant'}</h6>
                            <p class="card-text small">
                                <i class="mdi mdi-star text-warning mr-1"></i> 
                                <span class="font-weight-bold">${rating}</span>
                                ${restaurant.subtitle ? ` • ${restaurant.subtitle}` : ''}
                            </p>
                            ${restaurant.freeShip ? 
                                '<span class="badge badge-success"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>' : 
                                ''
                            }
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    
    // Tìm container phù hợp
    const container = $('.row').first();
    
    if (container.length > 0) {
        container.html(html);
    } else {
        // Tạo container mới nếu chưa có
        const mainContainer = $('.container-fluid').first() || $('main').first() || $('body');
        if (mainContainer.length > 0) {
            mainContainer.append(`<div class="row">${html}</div>`);
        } else {
            console.error("Cannot find container for restaurants");
        }
    }
}

