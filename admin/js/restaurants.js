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
            
            let restaurants = [];
            if (response && response.status === 200 && response.data) {
                restaurants = Array.isArray(response.data) ? response.data : [];
            } else if (response && response.isSuccess && response.data) {
                restaurants = Array.isArray(response.data) ? response.data : [];
            }
            
            renderRestaurants(restaurants);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading restaurants:", error);
            showError("Không thể tải danh sách nhà hàng!");
            renderRestaurants([]);
        });
}

let restaurantsDataTable = null;

function renderRestaurants(restaurants) {
    console.log("=== renderRestaurants() called ===", restaurants);
    
    const tbody = $('#restaurants-tbody');
    if (tbody.length === 0) {
        console.warn("Restaurants tbody not found");
        return;
    }
    
    // Destroy existing DataTable if it exists
    if (restaurantsDataTable) {
        restaurantsDataTable.destroy();
        restaurantsDataTable = null;
    }
    
    if (restaurants.length === 0) {
        tbody.html('<tr><td colspan="7" class="text-center text-muted">Không có nhà hàng nào</td></tr>');
        // Initialize DataTable even with empty data
        initializeDataTable();
        return;
    }
    
    let html = '';
    restaurants.forEach(function(restaurant) {
        // Fix image URL - extract filename from path if needed
        let imageUrl = 'img/list/1.png';
        if (restaurant.image) {
            if (restaurant.image.startsWith('http')) {
                imageUrl = restaurant.image;
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
        const freeShip = restaurant.isFreeShip || restaurant.freeShip ? 'Có' : 'Không';
        const rating = restaurant.rating || 0;
        const titleEscaped = (restaurant.title || '').replace(/'/g, "\\'");
        const isApproved = restaurant.isApproved !== false; // Default to true if not set
        const approvalStatus = isApproved 
            ? '<span class="badge badge-success"><i class="feather-check-circle"></i> Đã duyệt</span>'
            : '<span class="badge badge-warning"><i class="feather-clock"></i> Chờ duyệt</span>';
        
        html += `
            <tr>
                <td>
                    <img src="${imageUrl}" alt="${restaurant.title || ''}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"
                         onerror="this.src='img/list/1.png'">
                </td>
                <td>${escapeHtml(restaurant.title || 'N/A')}</td>
                <td>${escapeHtml(restaurant.subtitle || 'N/A')}</td>
                <td>${approvalStatus}</td>
                <td>${freeShip}</td>
                <td>${rating.toFixed(1)} <i class="feather-star text-warning"></i></td>
                <td>
                    ${!isApproved ? `
                        <button class="btn btn-sm btn-success mr-1" onclick="approveRestaurant(${restaurant.id}, '${titleEscaped}')" title="Duyệt nhà hàng">
                            <i class="feather-check"></i> Duyệt
                        </button>
                        <button class="btn btn-sm btn-warning mr-1" onclick="rejectRestaurant(${restaurant.id}, '${titleEscaped}')" title="Từ chối nhà hàng">
                            <i class="feather-x"></i> Hủy
                        </button>
                    ` : ''}
                    <!-- Admin không được sửa nhà hàng -->
                    <!-- <button class="btn btn-sm btn-primary" onclick="editRestaurant(${restaurant.id})">
                        <i class="feather-edit"></i> Sửa
                    </button> -->
                    <button class="btn btn-sm btn-danger ml-1" onclick="deleteRestaurant(${restaurant.id}, '${titleEscaped}')">
                        <i class="feather-trash-2"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.html(html);
    
    // Initialize DataTable after rendering
    initializeDataTable();
}

function initializeDataTable() {
    if ($.fn.DataTable) {
        const table = $('#dataTable');
        if (table.length) {
            restaurantsDataTable = table.DataTable({
                language: {
                    "sProcessing": "Đang xử lý...",
                    "sLengthMenu": "Hiển thị _MENU_ mục",
                    "sZeroRecords": "Không tìm thấy dữ liệu",
                    "sInfo": "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                    "sInfoEmpty": "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                    "sInfoFiltered": "(được lọc từ _MAX_ mục)",
                    "sInfoPostFix": "",
                    "sSearch": "Tìm kiếm:",
                    "sUrl": "",
                    "oPaginate": {
                        "sFirst": "Đầu",
                        "sPrevious": "Trước",
                        "sNext": "Tiếp",
                        "sLast": "Cuối"
                    }
                },
                order: [[1, 'asc']] // Sort by restaurant name
            });
        }
    }
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

