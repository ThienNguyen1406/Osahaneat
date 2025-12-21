/*
 * Admin Restaurants Management JavaScript
 * CRUD operations for restaurants
 */

console.log("=== RESTAURANTS.JS LOADED ===");

$(document).ready(function() {
    console.log("=== Restaurants page ready ===");
    
    // Load restaurants list
    loadRestaurants();
    
    // Setup create restaurant form
    setupCreateRestaurantForm();
    
    // Reset form when modal is closed
    $('#create-restaurant-modal').on('hidden.bs.modal', function() {
        $('#create-restaurant-form')[0].reset();
    });
    
    $('#edit-restaurant-modal').on('hidden.bs.modal', function() {
        $('#edit-restaurant-form')[0].reset();
        $('#edit-restaurant-current-image').html('');
    });
});

function loadRestaurants() {
    console.log("=== loadRestaurants() called ===");
    
    AdminApiService.getRestaurants()
        .done(function(response) {
            console.log("=== Restaurants API Response ===", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            
            let restaurants = [];
            if (response && response.status === 200 && response.data) {
                restaurants = Array.isArray(response.data) ? response.data : [];
            } else if (response && response.isSuccess && response.data) {
                restaurants = Array.isArray(response.data) ? response.data : [];
            } else if (response && response.success && response.data) {
                restaurants = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                // Response is directly an array
                restaurants = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                restaurants = response.data;
            }
            
            console.log("Parsed restaurants:", restaurants);
            console.log("Number of restaurants:", restaurants.length);
            if (restaurants.length > 0) {
                console.log("First restaurant sample:", restaurants[0]);
                console.log("First restaurant keys:", Object.keys(restaurants[0]));
            }
            
            renderRestaurants(restaurants);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading restaurants:", error);
            console.error("XHR status:", xhr.status);
            console.error("XHR response:", xhr.responseText);
            showError("Không thể tải danh sách nhà hàng!");
            renderRestaurants([]);
        });
}

let restaurantsDataTable = null;

function renderRestaurants(restaurants) {
    console.log("=== renderRestaurants() called ===", restaurants);
    
    const gridContainer = $('#restaurants-grid-container');
    if (gridContainer.length === 0) {
        console.warn("Restaurants grid container not found");
        return;
    }
    
    if (restaurants.length === 0) {
        gridContainer.html('<div class="col-12 text-center text-muted py-5">Không có nhà hàng nào</div>');
        return;
    }
    
    // Build HTML cards for grid layout
    let html = '';
    restaurants.forEach(function(restaurant) {
        console.log("Processing restaurant:", restaurant);
        console.log("Restaurant ID:", restaurant.id);
        console.log("Restaurant title:", restaurant.title);
        console.log("Restaurant subtitle:", restaurant.subtitle);
        console.log("Restaurant keys:", Object.keys(restaurant));
        
        // Fix image URL - extract filename from path if needed
        let imageUrl = 'img/list/1.png';
        if (restaurant.image) {
            if (restaurant.image.startsWith('http')) {
                imageUrl = restaurant.image;
            } else if (restaurant.image.startsWith('/')) {
                // Already a full path
                imageUrl = `http://localhost:82${restaurant.image}`;
            } else {
                // Extract filename from path like "/restaurant/file/restaurant1.jpg" -> "restaurant1.jpg"
                let filename = restaurant.image;
                if (filename.includes('/')) {
                    filename = filename.substring(filename.lastIndexOf('/') + 1);
                }
                // Build correct URL
                imageUrl = `http://localhost:82/restaurant/file/${filename}`;
            }
        }
        
        // Check both isFreeShip and freeShip (Jackson might serialize differently)
        const isFreeShip = (restaurant.isFreeShip === true || restaurant.freeShip === true);
        const rating = restaurant.rating || 0;
        
        // Get display values - check multiple possible field names
        const displayTitle = restaurant.title || restaurant.name || restaurant.restaurantName || 'N/A';
        const displaySubtitle = restaurant.subtitle || restaurant.shortDescription || restaurant.description || 'N/A';
        const address = restaurant.address || 'N/A';
        const titleEscaped = displayTitle.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        console.log(`Rendering restaurant ID ${restaurant.id}:`);
        console.log(`  - Title: "${displayTitle}" (from restaurant.title: "${restaurant.title}", restaurant.name: "${restaurant.name}")`);
        console.log(`  - Subtitle: "${displaySubtitle}" (from restaurant.subtitle: "${restaurant.subtitle}")`);
        
        // Kiểm tra trạng thái duyệt: null/undefined = chờ duyệt, true = đã duyệt, false = bị từ chối
        const isApproved = restaurant.isApproved;
        let approvalStatus = '';
        let approvalStatusClass = '';
        if (isApproved === true) {
            approvalStatus = '<i class="feather-check-circle"></i> Đã duyệt';
            approvalStatusClass = 'badge-success';
        } else if (isApproved === false) {
            approvalStatus = '<i class="feather-x-circle"></i> Bị từ chối';
            approvalStatusClass = 'badge-danger';
        } else {
            // null hoặc undefined = chờ duyệt
            approvalStatus = '<i class="feather-clock"></i> Chờ duyệt';
            approvalStatusClass = 'badge-warning';
        }
        
        // Hiển thị button Duyệt/Từ chối chỉ khi chưa được duyệt (null/undefined) hoặc bị từ chối (false)
        const showApproveButtons = (isApproved === null || isApproved === undefined || isApproved === false);
        
        html += `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4">
                <div class="card restaurant-card h-100 shadow-sm">
                    <div class="card-img-wrapper" style="position: relative;">
                        <img src="${imageUrl}" alt="${escapeHtml(displayTitle)}" 
                             class="card-img-top" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='img/list/1.png'">
                        ${isFreeShip ? '<span class="badge badge-success" style="position: absolute; top: 10px; right: 10px;"><i class="feather-truck"></i> Miễn phí ship</span>' : ''}
                        <span class="badge ${approvalStatusClass}" style="position: absolute; top: 10px; left: 10px;">
                            ${approvalStatus}
                        </span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2">
                            ${escapeHtml(displayTitle)}
                        </h5>
                        <p class="card-text text-muted small mb-2" style="min-height: 3rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${escapeHtml(displaySubtitle)}
                        </p>
                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="feather-map-pin"></i> ${escapeHtml(address)}
                            </small>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="feather-star text-warning"></i> <strong>${rating.toFixed(1)}</strong>
                            </small>
                        </div>
                        <div class="mt-auto pt-2 border-top">
                            <div class="d-flex flex-wrap gap-2">
                                ${showApproveButtons ? `
                                    <button class="btn btn-sm btn-success flex-fill" onclick="approveRestaurant(${restaurant.id}, '${titleEscaped}')" title="Duyệt nhà hàng">
                                        <i class="feather-check"></i> Duyệt
                                    </button>
                                    <button class="btn btn-sm btn-warning flex-fill" onclick="rejectRestaurant(${restaurant.id}, '${titleEscaped}')" title="Từ chối nhà hàng">
                                        <i class="feather-x"></i> Từ chối
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-danger ${showApproveButtons ? 'flex-fill' : 'w-100'}" onclick="deleteRestaurant(${restaurant.id}, '${titleEscaped}')">
                                    <i class="feather-trash-2"></i> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    console.log("HTML generated, length:", html.length);
    console.log("First 500 chars of HTML:", html.substring(0, 500));
    
    // Insert HTML vào grid container
    gridContainer.html(html);
    
    console.log("✅ Restaurants HTML inserted into grid container");
    console.log("Grid container children count:", gridContainer.children().length);
}

// No longer need DataTable for grid view
function initializeDataTable() {
    // Grid view doesn't need DataTable
    console.log("Grid view - DataTable not needed");
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
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

function setupCreateRestaurantForm() {
    $('#create-restaurant-form').on('submit', function(e) {
        e.preventDefault();
        
        const title = $('#restaurant-title').val().trim();
        const subtitle = $('#restaurant-subtitle').val().trim();
        const description = $('#restaurant-description').val().trim();
        const address = $('#restaurant-address').val().trim();
        const openDate = $('#restaurant-open-date').val();
        const fileInput = $('#restaurant-image')[0];
        
        // Validation
        if (!title) {
            showError('Vui lòng nhập tên nhà hàng!');
            return;
        }
        
        if (!subtitle) {
            showError('Vui lòng nhập mô tả ngắn!');
            return;
        }
        
        if (!address) {
            showError('Vui lòng nhập địa chỉ!');
            return;
        }
        
        if (!openDate) {
            showError('Vui lòng chọn ngày mở cửa!');
            return;
        }
        
        if (!fileInput.files || !fileInput.files[0]) {
            showError('Vui lòng chọn ảnh nhà hàng!');
            return;
        }
        
        // Format open_date for backend (yyyy-MM-dd HH:mm)
        const formattedOpenDate = openDate.replace('T', ' ');
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('description', description);
        formData.append('is_freeship', $('#restaurant-freeship').is(':checked'));
        formData.append('address', address);
        formData.append('open_date', formattedOpenDate);
        
        // Disable submit button
        const submitBtn = $('#create-restaurant-submit');
        submitBtn.prop('disabled', true).html('<i class="feather-loader spinner-border spinner-border-sm"></i> Đang tạo...');
        
        AdminApiService.createRestaurant(formData)
            .done(function(response) {
                console.log("=== Create Restaurant Response ===", response);
                if (response && response.status === 200 && response.success) {
                    showSuccess('Tạo nhà hàng thành công!');
                    $('#create-restaurant-modal').modal('hide');
                    $('#create-restaurant-form')[0].reset();
                    loadRestaurants();
                } else {
                    showError(response?.desc || 'Tạo nhà hàng thất bại!');
                }
            })
            .fail(function(xhr, status, error) {
                console.error("Error creating restaurant:", error);
                const errorMsg = xhr.responseJSON?.desc || 'Tạo nhà hàng thất bại!';
                showError(errorMsg);
            })
            .always(function() {
                submitBtn.prop('disabled', false).html('Tạo nhà hàng');
            });
    });
}

function editRestaurant(id) {
    console.log("=== editRestaurant() called ===", id);
    
    // Load restaurant details - try admin endpoint first, fallback to public endpoint
    const apiCall = AdminApiService.getRestaurantById ? 
        AdminApiService.getRestaurantById(id) : 
        AdminApiService.getRestaurantDetail(id);
    
    apiCall
        .done(function(response) {
            console.log("Restaurant details response:", response);
            // Support both ResponseData and direct response formats
            let restaurant = null;
            if (response) {
                if (response.data) {
                    restaurant = response.data;
                } else if (response.id) {
                    // Direct restaurant object
                    restaurant = response;
                }
            }
            
            if (restaurant) {
                
                // Populate edit form (you'll need to create an edit modal)
                $('#edit-restaurant-id').val(restaurant.id || id);
                $('#edit-restaurant-title').val(restaurant.title || '');
                $('#edit-restaurant-subtitle').val(restaurant.subtitle || '');
                $('#edit-restaurant-description').val(restaurant.description || '');
                $('#edit-restaurant-freeship').prop('checked', restaurant.isFreeship || restaurant.freeShip || false);
                $('#edit-restaurant-address').val(restaurant.address || '');
                
                // Format open date if available
                if (restaurant.openDate) {
                    const openDate = new Date(restaurant.openDate);
                    // Format as datetime-local input format: YYYY-MM-DDTHH:mm
                    const year = openDate.getFullYear();
                    const month = String(openDate.getMonth() + 1).padStart(2, '0');
                    const day = String(openDate.getDate()).padStart(2, '0');
                    const hours = String(openDate.getHours()).padStart(2, '0');
                    const minutes = String(openDate.getMinutes()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                    $('#edit-restaurant-open-date').val(formattedDate);
                }
                
                // Show current image
                if (restaurant.image) {
                    let imageUrl = 'img/list/1.png';
                    if (restaurant.image.startsWith('http')) {
                        imageUrl = restaurant.image;
                    } else if (restaurant.image.startsWith('/restaurant/file/')) {
                        imageUrl = `http://localhost:82${restaurant.image}`;
                    } else {
                        imageUrl = `http://localhost:82/restaurant/file/${restaurant.image}`;
                    }
                    $('#edit-restaurant-current-image').html(`
                        <small class="text-muted">Ảnh hiện tại:</small><br>
                        <img src="${imageUrl}" alt="${restaurant.title}" style="max-width: 200px; max-height: 200px; border-radius: 4px;" onerror="this.src='img/list/1.png'">
                    `);
                }
                
                $('#edit-restaurant-modal').modal('show');
            } else {
                showError('Không thể tải thông tin nhà hàng!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading restaurant details:", error);
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else {
                showError('Không thể tải thông tin nhà hàng!');
            }
        });
}

function updateRestaurant() {
    const id = $('#edit-restaurant-id').val();
    if (!id) {
        showError('Không tìm thấy ID nhà hàng!');
        return;
    }
    
    const formData = new FormData();
    const fileInput = $('#edit-restaurant-image')[0];
    
    // Add file only if a new one is selected
    if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    }
    
    const title = $('#edit-restaurant-title').val().trim();
    const subtitle = $('#edit-restaurant-subtitle').val().trim();
    const description = $('#edit-restaurant-description').val().trim();
    const address = $('#edit-restaurant-address').val().trim();
    const openDate = $('#edit-restaurant-open-date').val();
    
    // Validation
    if (!title) {
        showError('Vui lòng nhập tên nhà hàng!');
        return;
    }
    
    if (!subtitle) {
        showError('Vui lòng nhập mô tả ngắn!');
        return;
    }
    
    if (!address) {
        showError('Vui lòng nhập địa chỉ!');
        return;
    }
    
    if (!openDate) {
        showError('Vui lòng chọn ngày mở cửa!');
        return;
    }
    
    // Format open_date for backend (yyyy-MM-dd HH:mm)
    const formattedOpenDate = openDate.replace('T', ' ');
    
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('description', description);
    formData.append('is_freeship', $('#edit-restaurant-freeship').is(':checked'));
    formData.append('address', address);
    formData.append('open_date', formattedOpenDate);
    
    // Disable submit button
    const submitBtn = $('#edit-restaurant-modal .btn-primary');
    const originalText = submitBtn.html();
    submitBtn.prop('disabled', true).html('<i class="feather-loader spinner-border spinner-border-sm"></i> Đang cập nhật...');
    
    AdminApiService.updateRestaurant(id, formData)
        .done(function(response) {
            console.log("=== Update Restaurant Response ===", response);
            if (response && response.status === 200 && response.success) {
                showSuccess('Cập nhật nhà hàng thành công!');
                $('#edit-restaurant-modal').modal('hide');
                $('#edit-restaurant-form')[0].reset();
                $('#edit-restaurant-current-image').html('');
                loadRestaurants();
            } else {
                showError(response?.desc || 'Cập nhật nhà hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error updating restaurant:", error);
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else if (xhr.status === 501) {
                showError('Chức năng cập nhật nhà hàng chưa được triển khai trong backend!');
            } else {
                const errorMsg = xhr.responseJSON?.desc || 'Cập nhật nhà hàng thất bại!';
                showError(errorMsg);
            }
        })
        .always(function() {
            submitBtn.prop('disabled', false).html(originalText);
        });
}

function deleteRestaurant(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhà hàng "${name}"?`)) {
        return;
    }
    
    AdminApiService.deleteRestaurant(id)
        .done(function(response) {
            console.log("=== Delete Restaurant Response ===", response);
            if (response && response.status === 200 && response.success) {
                showSuccess('Xóa nhà hàng thành công!');
                loadRestaurants();
            } else {
                showError(response?.desc || 'Xóa nhà hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error deleting restaurant:", error);
            const errorMsg = xhr.responseJSON?.desc || 'Xóa nhà hàng thất bại!';
            showError(errorMsg);
        });
}

function showSuccess(message) {
    // You can use toastr, sweetalert, or custom notification
    alert(message); // Simple alert for now
}

function showError(message) {
    alert(message); // Simple alert for now
}

function approveRestaurant(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn duyệt nhà hàng "${name}"?`)) {
        return;
    }
    
    AdminApiService.approveRestaurant(id)
        .done(function(response) {
            console.log("=== Approve Restaurant Response ===", response);
            if (response && response.status === 200 && response.success) {
                showSuccess('Duyệt nhà hàng thành công!');
                loadRestaurants();
            } else {
                showError(response?.desc || 'Duyệt nhà hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error approving restaurant:", error);
            const errorMsg = xhr.responseJSON?.desc || 'Duyệt nhà hàng thất bại!';
            showError(errorMsg);
        });
}

function rejectRestaurant(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn từ chối nhà hàng "${name}"?`)) {
        return;
    }
    
    AdminApiService.rejectRestaurant(id)
        .done(function(response) {
            console.log("=== Reject Restaurant Response ===", response);
            if (response && response.status === 200 && response.success) {
                showSuccess('Từ chối nhà hàng thành công!');
                loadRestaurants();
            } else {
                showError(response?.desc || 'Từ chối nhà hàng thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error rejecting restaurant:", error);
            const errorMsg = xhr.responseJSON?.desc || 'Từ chối nhà hàng thất bại!';
            showError(errorMsg);
        });
}

