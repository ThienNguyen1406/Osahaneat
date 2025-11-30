/*
 * Rating Component - 5 Star Rating System
 * Allows users to rate restaurants and food items by clicking on stars
 */

console.log("=== RATING.JS LOADED ===");

/**
 * Create a 5-star rating component
 * @param {Object} options - Configuration options
 * @param {number} options.currentRating - Current rating (0-5)
 * @param {boolean} options.editable - Whether the rating can be edited
 * @param {string} options.containerId - ID of container element
 * @param {Function} options.onRatingChange - Callback when rating changes
 * @param {string} options.size - Size: 'sm', 'md', 'lg' (default: 'md')
 */
function createStarRating(options) {
    const {
        currentRating = 0,
        editable = true,
        containerId,
        onRatingChange = null,
        size = 'md'
    } = options;
    
    if (!containerId) {
        console.error("Container ID is required for star rating");
        return;
    }
    
    const container = $(`#${containerId}`);
    if (container.length === 0) {
        console.error(`Container #${containerId} not found`);
        return;
    }
    
    // Size classes
    const sizeClasses = {
        'sm': 'fa-sm',
        'md': 'fa-lg',
        'lg': 'fa-2x'
    };
    const starSize = sizeClasses[size] || sizeClasses['md'];
    
    let selectedRating = currentRating;
    let hoverRating = 0;
    
    // Create star container
    const starContainer = $('<div>').addClass('star-rating-container').attr('data-rating', currentRating);
    
    // Create 5 stars
    for (let i = 1; i <= 5; i++) {
        const star = $('<i>')
            .addClass('fas fa-star star-rating-star')
            .addClass(starSize)
            .attr('data-rating', i)
            .css({
                'cursor': editable ? 'pointer' : 'default',
                'color': i <= currentRating ? '#FFC107' : '#E0E0E0',
                'transition': 'color 0.2s ease',
                'margin-right': '4px'
            });
        
        if (editable) {
            star.on('click', function() {
                const rating = $(this).data('rating');
                selectedRating = rating;
                starContainer.attr('data-rating', rating);
                updateStarDisplay(starContainer, rating, 0);
                if (onRatingChange) {
                    onRatingChange(rating);
                }
            });
            
            star.on('mouseenter', function() {
                hoverRating = $(this).data('rating');
                updateStarDisplay(starContainer, selectedRating, hoverRating);
            });
        }
        
        starContainer.append(star);
    }
    
    // Mouse leave - reset to selected rating
    if (editable) {
        starContainer.on('mouseleave', function() {
            hoverRating = 0;
            updateStarDisplay(starContainer, selectedRating, 0);
        });
    }
    
    // Update display function
    function updateStarDisplay(container, selected, hover) {
        const displayRating = hover > 0 ? hover : selected;
        container.find('.star-rating-star').each(function() {
            const starRating = $(this).data('rating');
            if (starRating <= displayRating) {
                $(this).css('color', '#FFC107');
            } else {
                $(this).css('color', '#E0E0E0');
            }
        });
    }
    
    // Clear container and append
    container.empty().append(starContainer);
    
    // Return object with methods to update rating
    return {
        setRating: function(rating) {
            selectedRating = rating;
            starContainer.attr('data-rating', rating);
            updateStarDisplay(starContainer, rating, 0);
        },
        getRating: function() {
            return selectedRating;
        },
        disable: function() {
            editable = false;
            starContainer.find('.star-rating-star').css('cursor', 'default');
        },
        enable: function() {
            editable = true;
            starContainer.find('.star-rating-star').css('cursor', 'pointer');
        }
    };
}

/**
 * Create rating widget with form (for restaurant or food)
 * @param {Object} options - Configuration
 */
function createRatingWidget(options) {
    const {
        targetId, // restaurantId or foodId
        targetType, // 'restaurant' or 'food'
        containerId,
        currentRating = null,
        onRatingSubmit = null
    } = options;
    
    if (!containerId || !targetId || !targetType) {
        console.error("Missing required parameters for rating widget");
        return;
    }
    
    const container = $(`#${containerId}`);
    if (container.length === 0) {
        console.error(`Container #${containerId} not found`);
        return;
    }
    
    let userRating = currentRating;
    let ratingValue = currentRating ? currentRating.ratePoint : 0;
    
    // Create widget HTML
    const widgetHtml = `
        <div class="rating-widget">
            <div class="rating-header mb-3">
                <h6 class="mb-2">
                    <i class="fas fa-star text-warning mr-2"></i>
                    ${userRating ? 'Cập nhật đánh giá của bạn' : 'Đánh giá của bạn'}
                </h6>
            </div>
            <div class="star-rating-wrapper mb-3">
                <div id="star-rating-${targetType}-${targetId}"></div>
                <span class="ml-2 rating-text">
                    ${ratingValue > 0 ? `${ratingValue} sao` : 'Chọn số sao'}
                </span>
            </div>
            <div class="rating-comment mb-3">
                <textarea 
                    class="form-control" 
                    id="rating-comment-${targetType}-${targetId}" 
                    rows="3" 
                    placeholder="Nhập nhận xét của bạn (tùy chọn)..."
                >${userRating && userRating.content ? userRating.content : ''}</textarea>
            </div>
            <div class="rating-actions">
                <button class="btn btn-warning btn-sm" id="submit-rating-${targetType}-${targetId}">
                    <i class="fas fa-check mr-1"></i>${userRating ? 'Cập nhật' : 'Gửi đánh giá'}
                </button>
                ${userRating ? `
                    <button class="btn btn-outline-danger btn-sm ml-2" id="delete-rating-${targetType}-${targetId}">
                        <i class="fas fa-trash mr-1"></i>Xóa đánh giá
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    container.html(widgetHtml);
    
    // Create star rating component
    const starRating = createStarRating({
        currentRating: ratingValue,
        editable: true,
        containerId: `star-rating-${targetType}-${targetId}`,
        size: 'lg',
        onRatingChange: function(rating) {
            $(`.rating-text`).text(`${rating} sao`);
        }
    });
    
    // Submit rating
    $(`#submit-rating-${targetType}-${targetId}`).on('click', function() {
        const rating = starRating.getRating();
        const content = $(`#rating-comment-${targetType}-${targetId}`).val().trim();
        
        if (rating === 0) {
            alert('Vui lòng chọn số sao đánh giá!');
            return;
        }
        
        const btn = $(this);
        const originalText = btn.html();
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang gửi...');
        
        const apiMethod = targetType === 'restaurant' ? 'rateRestaurant' : 'rateFood';
        ApiService[apiMethod](targetId, rating, content)
            .done(function(response) {
                if (response && (response.success || response.isSuccess)) {
                    if (onRatingSubmit) {
                        onRatingSubmit(response.data);
                    }
                    showToast('success', userRating ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!');
                    // Reload rating widget
                    loadRatingWidget(targetId, targetType, containerId);
                } else {
                    showToast('error', response?.desc || 'Gửi đánh giá thất bại!');
                }
            })
            .fail(function(xhr) {
                console.error('Error submitting rating:', xhr);
                let errorMsg = 'Gửi đánh giá thất bại!';
                if (xhr.status === 401) {
                    errorMsg = 'Vui lòng đăng nhập để đánh giá!';
                } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                    errorMsg = xhr.responseJSON.desc;
                }
                showToast('error', errorMsg);
            })
            .always(function() {
                btn.prop('disabled', false).html(originalText);
            });
    });
    
    // Delete rating
    if (userRating) {
        $(`#delete-rating-${targetType}-${targetId}`).on('click', function() {
            if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                return;
            }
            
            const btn = $(this);
            const originalText = btn.html();
            btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang xóa...');
            
            ApiService[`delete${targetType.charAt(0).toUpperCase() + targetType.slice(1)}Rating`](userRating.id)
                .done(function(response) {
                    if (response && (response.success || response.isSuccess)) {
                        showToast('success', 'Xóa đánh giá thành công!');
                        // Reload rating widget
                        loadRatingWidget(targetId, targetType, containerId);
                    } else {
                        showToast('error', response?.desc || 'Xóa đánh giá thất bại!');
                    }
                })
                .fail(function(xhr) {
                    console.error('Error deleting rating:', xhr);
                    showToast('error', 'Xóa đánh giá thất bại!');
                })
                .always(function() {
                    btn.prop('disabled', false).html(originalText);
                });
        });
    }
}

/**
 * Load rating widget (check if user has rated, then show widget)
 */
function loadRatingWidget(targetId, targetType, containerId) {
    const apiMethod = targetType === 'restaurant' ? 'getMyRestaurantRating' : 'getMyFoodRating';
    
    ApiService[apiMethod](targetId)
        .done(function(response) {
            if (response && (response.success || response.isSuccess)) {
                createRatingWidget({
                    targetId: targetId,
                    targetType: targetType,
                    containerId: containerId,
                    currentRating: response.data,
                    onRatingSubmit: function(rating) {
                        // Reload ratings list if exists
                        if (targetType === 'restaurant') {
                            loadRestaurantRatings(targetId);
                        } else {
                            loadFoodRatings(targetId);
                        }
                    }
                });
            } else {
                // User hasn't rated yet
                createRatingWidget({
                    targetId: targetId,
                    targetType: targetType,
                    containerId: containerId,
                    currentRating: null,
                    onRatingSubmit: function(rating) {
                        if (targetType === 'restaurant') {
                            loadRestaurantRatings(targetId);
                        } else {
                            loadFoodRatings(targetId);
                        }
                    }
                });
            }
        })
        .fail(function(xhr) {
            // If 401, user not logged in - show message
            if (xhr.status === 401) {
                $(`#${containerId}`).html(`
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle mr-2"></i>
                        Vui lòng <a href="signin.html">đăng nhập</a> để đánh giá
                    </div>
                `);
            } else {
                // User hasn't rated - show widget
                createRatingWidget({
                    targetId: targetId,
                    targetType: targetType,
                    containerId: containerId,
                    currentRating: null
                });
            }
        });
}

/**
 * Load and display restaurant ratings list
 */
function loadRestaurantRatings(restaurantId) {
    if (!restaurantId) return;
    
    ApiService.getRestaurantRatings(restaurantId)
        .done(function(response) {
            if (response && (response.success || response.isSuccess) && response.data) {
                renderRatingsList(response.data.ratings || [], 'restaurant-ratings-list');
            }
        })
        .fail(function(xhr) {
            console.error('Error loading restaurant ratings:', xhr);
            $('#restaurant-ratings-list').html('<p class="text-muted text-center py-3">Không thể tải đánh giá</p>');
        });
}

/**
 * Load and display food ratings list
 */
function loadFoodRatings(foodId) {
    if (!foodId) return;
    
    ApiService.getFoodRatings(foodId)
        .done(function(response) {
            if (response && (response.success || response.isSuccess) && response.data) {
                const containerId = $('#food-ratings-list-container').length > 0 ? 'food-ratings-list-container' : 'food-ratings-list';
                renderRatingsList(response.data.ratings || [], containerId);
            }
        })
        .fail(function(xhr) {
            console.error('Error loading food ratings:', xhr);
            const containerId = $('#food-ratings-list-container').length > 0 ? 'food-ratings-list-container' : 'food-ratings-list';
            $(`#${containerId}`).html('<p class="text-muted text-center py-3">Không thể tải đánh giá</p>');
        });
}

/**
 * Render ratings list
 */
function renderRatingsList(ratings, containerId) {
    const container = $(`#${containerId}`);
    if (container.length === 0) {
        console.warn(`Container #${containerId} not found for ratings list`);
        return;
    }
    
    if (!ratings || ratings.length === 0) {
        container.html('<p class="text-muted text-center py-3"><i class="fas fa-star mr-2"></i>Chưa có đánh giá nào</p>');
        return;
    }
    
    let html = '<div class="ratings-list">';
    ratings.forEach(function(rating) {
        const stars = renderStars(rating.ratePoint || 0, false);
        const userName = rating.userFullName || rating.userName || 'Người dùng';
        const userInitial = userName.charAt(0).toUpperCase();
        html += `
            <div class="rating-item border-bottom pb-3 mb-3">
                <div class="d-flex align-items-start mb-2">
                    <div class="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center mr-3" 
                         style="width: 40px; height: 40px; font-weight: bold; flex-shrink: 0;">
                        ${userInitial}
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <strong>${escapeHtml(userName)}</strong>
                            <small class="text-muted">${formatDate(rating.createDate || new Date())}</small>
                        </div>
                        <div class="mb-2">${stars}</div>
                        ${rating.content ? `<p class="mb-0 text-muted">${escapeHtml(rating.content)}</p>` : '<p class="mb-0 text-muted"><em>Không có nhận xét</em></p>'}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.html(html);
}

/**
 * Render stars (read-only)
 */
function renderStars(rating, editable = false) {
    let html = '<span class="star-display">';
    for (let i = 1; i <= 5; i++) {
        const color = i <= rating ? '#FFC107' : '#E0E0E0';
        html += `<i class="fas fa-star" style="color: ${color}; font-size: 14px;"></i>`;
    }
    html += '</span>';
    return html;
}

/**
 * Helper functions
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showToast(type, message) {
    // Use existing toast function if available, otherwise use alert
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else if (typeof showToast === 'function') {
        showToast(type, message);
    } else {
        alert(message);
    }
}

