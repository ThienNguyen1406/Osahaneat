/*
 * Food Modal - Global handler for food item modal
 * Allows adding food items to cart from any page
 */

console.log("=== FOOD-MODAL.JS LOADED ===");

// Global food modal handler
const FoodModal = {
    currentFood: null,
    
    /**
     * Open modal with food data
     * @param {Object} food - Food item data (id, title, image, price, description, timeShip, isFreeShip)
     */
    open: function(food) {
        console.log("=== FoodModal.open() called ===");
        console.log("Food data:", food);
        console.log("Food keys:", food ? Object.keys(food) : 'null');
        console.log("Food.id:", food?.id, "Type:", typeof food?.id);
        console.log("Food.id == null:", food?.id == null);
        console.log("Food.id === undefined:", food?.id === undefined);
        console.log("Food.id === '':", food?.id === '');
        
        // Check if food exists
        if (!food) {
            console.error("❌ Food object is null or undefined");
            alert("Không thể hiển thị thông tin món ăn!");
            return;
        }
        
        // Check if food has id property
        if (!('id' in food)) {
            console.error("❌ Food object does not have 'id' property");
            console.error("Food object:", JSON.stringify(food, null, 2));
            alert("Món ăn không có ID!");
            return;
        }
        
        // Check if id is null/undefined/empty string
        if (food.id == null || food.id === undefined || food.id === '') {
            console.error("❌ Food ID is null/undefined/empty:", food.id);
            console.error("Food object:", JSON.stringify(food, null, 2));
            alert("ID món ăn không hợp lệ!");
            return;
        }
        
        // Ensure ID is a number
        const parsedId = parseInt(food.id);
        if (isNaN(parsedId) || parsedId <= 0) {
            console.error("❌ Invalid food ID after parsing:", parsedId, "Original:", food.id);
            alert("ID món ăn không hợp lệ!");
            return;
        }
        
        food.id = parsedId;
        
        this.currentFood = food;
        
        // Get modal element
        const modal = $('#myitemsModal');
        if (modal.length === 0) {
            console.error("❌ Modal #myitemsModal not found!");
            alert("Modal không tồn tại!");
            return;
        }
        
        // Fill modal with food data
        this.fillModal(food);
        
        // Show modal
        modal.modal('show');
        console.log("✅ Modal opened");
    },
    
    /**
     * Fill modal with food data
     */
    fillModal: function(food) {
        console.log("=== fillModal() called ===");
        console.log("Food:", food);
        
        const modal = $('#myitemsModal');
        
        // Get image URL
        let imageUrl = 'img/food1.jpg';
        if (food.image) {
            if (food.image.startsWith('http://') || food.image.startsWith('https://')) {
                imageUrl = food.image;
            } else if (food.image.startsWith('/')) {
                imageUrl = 'http://localhost:82' + food.image;
            } else {
                if (typeof ApiService !== 'undefined' && ApiService.getMenuImage) {
                    imageUrl = ApiService.getMenuImage(food.image);
                } else {
                    imageUrl = 'http://localhost:82/menu/file/' + food.image;
                }
            }
        }
        
        // Format price
        const price = food.price || 0;
        const priceFormatted = this.formatPrice(price);
        
        // Update modal content
        modal.find('.modal-title').text(food.title || 'Food Item');
        modal.find('.food-title').text(food.title || 'Food Item');
        modal.find('.food-image').attr('src', imageUrl).attr('alt', food.title || 'Food Item');
        modal.find('.food-description').text(food.description || '');
        modal.find('.food-price').text('Thêm vào giỏ - ' + priceFormatted);
        
        // Update time ship if available
        if (food.timeShip) {
            modal.find('.food-time-ship').html(`<i class="mdi mdi-clock-outline"></i> ${food.timeShip}`).show();
        } else {
            modal.find('.food-time-ship').hide();
        }
        
        // Update free ship badge
        if (food.isFreeShip || food.freeShip) {
            modal.find('.food-free-ship').html('<span class="badge badge-success"><i class="mdi mdi-truck-fast-outline"></i> Free delivery</span>').show();
        } else {
            modal.find('.food-free-ship').hide();
        }
        
        // Set food ID for add to cart button
        const addToCartBtn = modal.find('.add-to-cart-modal-btn');
        addToCartBtn.attr('data-food-id', food.id)
            .attr('data-food-title', food.title || 'Food Item')
            .attr('data-food-price', price);
        
        // Remove any cached data to force fresh read from attributes
        addToCartBtn.removeData('food-id');
        addToCartBtn.removeData('food-title');
        addToCartBtn.removeData('food-price');
        
        // Reset quantity to 1
        modal.find('.food-quantity').val(1);
        
        console.log("✅ Modal filled with food data");
        console.log("Button data-food-id set to:", food.id, "Type:", typeof food.id);
        console.log("Button attr('data-food-id'):", addToCartBtn.attr('data-food-id'));
    },
    
    /**
     * Format price in VND
     */
    formatPrice: function(price) {
        if (price == null || price === undefined) {
            return '0 ₫';
        }
        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            return '0 ₫';
        }
        return priceNum.toLocaleString('vi-VN') + ' ₫';
    },
    
    /**
     * Initialize event handlers
     */
    init: function() {
        console.log("=== FoodModal.init() called ===");
        
        // Handle add to cart button in modal
        $(document).on('click', '.add-to-cart-modal-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const button = $(this);
            // Use attr() instead of data() to get current value (data() caches values)
            let foodId = button.attr('data-food-id');
            if (foodId === undefined || foodId === null) {
                foodId = button.data('food-id');
            }
            foodId = parseInt(foodId);
            
            const foodTitle = button.attr('data-food-title') || button.data('food-title') || '';
            const foodPrice = parseFloat(button.attr('data-food-price') || button.data('food-price') || 0);
            const quantity = parseInt($('#myitemsModal .food-quantity').val()) || 1;
            
            console.log("Add to cart from modal - Food ID:", foodId, "Type:", typeof foodId, "Title:", foodTitle, "Price:", foodPrice, "Quantity:", quantity);
            console.log("Button data attributes - attr('data-food-id'):", button.attr('data-food-id'), "data('food-id'):", button.data('food-id'));
            
            if (!foodId || isNaN(foodId) || foodId <= 0) {
                console.error("❌ Invalid food ID:", foodId, "Type:", typeof foodId);
                console.error("Button HTML:", button[0]?.outerHTML);
                alert('Không thể thêm món này vào giỏ hàng! Món ăn không có ID hợp lệ.');
                return;
            }
            
            // Disable button
            button.prop('disabled', true);
            button.html('<i class="mdi mdi-loading mdi-spin mr-1"></i> Đang thêm...');
            
            // Get user ID from API (async) - use same function from detail.js
            if (typeof getUserIdFromAPI === 'function') {
                getUserIdFromAPI(function(userId) {
                    FoodModal.addToCart(userId, foodId, quantity, button);
                });
            } else {
                // Fallback: try to get from localStorage
                const cachedId = localStorage.getItem('userId');
                if (cachedId && !isNaN(parseInt(cachedId))) {
                    const userId = parseInt(cachedId);
                    FoodModal.addToCart(userId, foodId, quantity, button);
                } else {
                    // Try to get from API
                    if (typeof ApiService !== 'undefined' && typeof ApiService.getMyInfo === 'function') {
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
                                    if (isNaN(userId) || userId <= 0) {
                                        console.error("❌ Invalid user ID from API:", userData.id);
                                        console.error("User data:", JSON.stringify(userData, null, 2));
                                        FoodModal.handleAddToCartError(null, button);
                                        return;
                                    }
                                    console.log("✅ Valid user ID:", userId, "Type:", typeof userId);
                                    localStorage.setItem('userId', userId.toString());
                                    FoodModal.addToCart(userId, foodId, quantity, button);
                                } else {
                                    console.error("❌ User ID not found in response");
                                    console.error("User data:", JSON.stringify(userData, null, 2));
                                    FoodModal.handleAddToCartError(null, button);
                                }
                            })
                            .fail(function() {
                                FoodModal.handleAddToCartError(null, button);
                            });
                    } else {
                        FoodModal.handleAddToCartError(null, button);
                    }
                }
            }
        });
        
        // Handle food item clicks - open modal with food data
        $(document).on('click', '.food-item-card[data-food-id]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = $(this);
            
            // Get data attributes - use attr() for raw values, then parse
            let foodId = card.attr('data-food-id');
            if (foodId === undefined || foodId === null) {
                foodId = card.data('food-id');
            }
            foodId = parseInt(foodId);
            
            const foodTitle = card.attr('data-food-title') || card.data('food-title') || '';
            const foodPrice = parseFloat(card.attr('data-food-price') || card.data('food-price') || 0);
            const foodImage = card.attr('data-food-image') || card.data('food-image') || '';
            const foodDescription = card.attr('data-food-description') || card.data('food-description') || '';
            const foodTimeShip = card.attr('data-food-time-ship') || card.data('food-time-ship') || '';
            const foodFreeShip = card.attr('data-food-free-ship') || card.data('food-free-ship') || false;
            
            console.log("=== Food item clicked ===");
            console.log("Raw data attributes:");
            console.log("  data-food-id (attr):", card.attr('data-food-id'));
            console.log("  data-food-id (data):", card.data('food-id'));
            console.log("  foodId (parsed):", foodId);
            console.log("  foodTitle:", foodTitle);
            console.log("  foodPrice:", foodPrice);
            console.log("  foodImage:", foodImage);
            console.log("  foodDescription:", foodDescription);
            console.log("  foodTimeShip:", foodTimeShip);
            console.log("  foodFreeShip:", foodFreeShip);
            
            // Check if foodId is valid
            if (isNaN(foodId)) {
                console.error("❌ Food ID is NaN. Raw value:", card.attr('data-food-id'));
                console.error("Card HTML:", card[0]?.outerHTML?.substring(0, 200));
                alert("Không thể mở modal: ID món ăn không hợp lệ!");
                return;
            }
            
            if (foodId <= 0) {
                console.error("❌ Food ID is <= 0:", foodId);
                console.error("Raw value:", card.attr('data-food-id'));
                alert("Không thể mở modal: ID món ăn phải lớn hơn 0!");
                return;
            }
            
            const food = {
                id: foodId,
                title: foodTitle || 'Food Item',
                price: foodPrice || 0,
                image: foodImage || '',
                description: foodDescription || '',
                timeShip: foodTimeShip || '',
                isFreeShip: foodFreeShip === true || foodFreeShip === 'true' || foodFreeShip === '1'
            };
            
            console.log("Food object created:", food);
            console.log("Food object JSON:", JSON.stringify(food, null, 2));
            FoodModal.open(food);
        });
        
        console.log("✅ FoodModal initialized");
    },
    
    /**
     * Add to cart
     */
    addToCart: function(userId, foodId, quantity, button) {
        if (!userId) {
            console.warn("⚠️ No user ID found, redirecting to login...");
            alert('Vui lòng đăng nhập để thêm món vào giỏ hàng!');
            button.prop('disabled', false);
            button.html('Thêm vào giỏ');
            $('#myitemsModal').modal('hide');
            window.location.href = 'signin.html';
            return;
        }
        
        if (typeof ApiService === 'undefined') {
            console.error("❌ ApiService is not defined!");
            alert('Lỗi: API service chưa được load!');
            button.prop('disabled', false);
            button.html('Thêm vào giỏ');
            return;
        }
        
        console.log("Calling ApiService.addToCart()...");
        ApiService.addToCart(userId, foodId, quantity)
            .done(function(response) {
                console.log("=== Add to Cart API Response ===");
                console.log("Full response:", response);
                
                const isSuccess = response && (response.isSuccess === true || response.success === true || response.status === 200);
                
                if (isSuccess) {
                    console.log("✅ Item added to cart successfully");
                    
                    // Show success message
                    button.html('<i class="mdi mdi-check mr-1"></i> Đã thêm!');
                    button.removeClass('btn-primary').addClass('btn-success');
                    
                    // Close modal after 1 second
                    setTimeout(function() {
                        $('#myitemsModal').modal('hide');
                        button.prop('disabled', false);
                        button.html('Thêm vào giỏ');
                        button.removeClass('btn-success').addClass('btn-primary');
                    }, 1000);
                    
                    // Update cart badge
                    if (typeof CartSync !== 'undefined' && CartSync.loadCartCount) {
                        CartSync.loadCartCount();
                    }
                    
                    // Reload cart if modal is open (with debounce check)
                    if (typeof CartService !== 'undefined' && CartService.loadCart) {
                        setTimeout(function() {
                            // Check if cart is already loading
                            if (typeof window.isLoadingCart === 'undefined' || !window.isLoadingCart) {
                                CartService.loadCart();
                            }
                        }, 500);
                    }
                } else {
                    console.warn("⚠️ Add to cart failed:", response);
                    const errorMsg = response?.desc || 'Thêm món vào giỏ hàng thất bại!';
                    alert(errorMsg);
                    
                    button.prop('disabled', false);
                    button.html('Thêm vào giỏ');
                }
            })
            .fail(function(xhr, status, error) {
                FoodModal.handleAddToCartError(xhr, button);
            });
    },
    
    /**
     * Handle add to cart error
     */
    handleAddToCartError: function(xhr, button) {
        console.error("=== Add to Cart API Error ===");
        if (xhr) {
            console.error("XHR:", xhr);
            console.error("Status:", xhr.status);
            console.error("Response:", xhr.responseJSON);
        }
        
        let errorMsg = 'Thêm món vào giỏ hàng thất bại!';
        
        if (xhr) {
            if (xhr.status === 401) {
                errorMsg = 'Vui lòng đăng nhập để thêm món vào giỏ hàng!';
                alert(errorMsg);
                $('#myitemsModal').modal('hide');
                window.location.href = 'signin.html';
                return;
            } else if (xhr.status === 403) {
                errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                alert(errorMsg);
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                $('#myitemsModal').modal('hide');
                window.location.href = 'signin.html';
                return;
            } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
        } else {
            errorMsg = 'Vui lòng đăng nhập để thêm món vào giỏ hàng!';
            alert(errorMsg);
            $('#myitemsModal').modal('hide');
            window.location.href = 'signin.html';
            return;
        }
        
        alert(errorMsg);
        button.prop('disabled', false);
        button.html('Thêm vào giỏ');
    }
};

// Initialize on document ready
$(document).ready(function() {
    FoodModal.init();
});

