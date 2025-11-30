/*
 * Admin Menus Page - Quản lý món ăn
 */

let currentEditMenuId = null;
let dataTable = null;
let categoriesList = [];

$(document).ready(function() {
    console.log("=== menus.js loaded ===");
    
    // Check if AdminApiService is available
    if (typeof AdminApiService === 'undefined') {
        console.error("AdminApiService is not defined! Make sure api.js is loaded before menus.js");
        alert('Lỗi: Không thể tải AdminApiService. Vui lòng làm mới trang (Ctrl+F5) để xóa cache.');
        return;
    }
    
    // Check if getAllMenus method exists
    if (typeof AdminApiService.getAllMenus !== 'function') {
        console.error("AdminApiService.getAllMenus is not a function!");
        console.log("Available methods:", Object.keys(AdminApiService));
        alert('Lỗi: Method getAllMenus không tồn tại. Vui lòng làm mới trang (Ctrl+F5) để xóa cache.');
        return;
    }
    
    // Check authentication first
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        console.warn("User not authenticated, redirecting to login");
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    // Check admin role
    if (typeof getUserRole === 'function') {
        const userRole = getUserRole();
        console.log("Current user role:", userRole);
        if (userRole !== 'ADMIN') {
            console.warn("User is not ADMIN, current role:", userRole);
        }
    }
    
    // Load categories for dropdowns
    loadCategories();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Set default view to grid (without reloading data yet)
    currentView = 'grid';
    switchView('grid', false);
    
    // Load menus list
    loadMenus();
});

function setupEventHandlers() {
    // Reset form when modal is closed
    $('#create-menu-modal').on('hidden.bs.modal', function() {
        $('#create-menu-form')[0].reset();
    });
    
    $('#edit-menu-modal').on('hidden.bs.modal', function() {
        $('#edit-menu-form')[0].reset();
        currentEditMenuId = null;
        $('#edit-menu-current-image').html('');
    });
}

function loadCategories() {
    console.log("=== loadCategories() called ===");
    
    AdminApiService.getCategories()
        .done(function(response) {
            console.log("Categories response:", response);
            // Kiểm tra cả response.success và response.isSuccess (ResponseData format)
            const isSuccess = (response && (response.success || response.isSuccess));
            if (isSuccess && response.data) {
                categoriesList = response.data;
                console.log("Categories loaded:", categoriesList);
                populateCategoryDropdowns();
            } else {
                console.error("Failed to load categories:", response);
                alert('Không thể tải danh sách danh mục. Vui lòng thử lại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading categories:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            alert('Lỗi khi tải danh sách danh mục: ' + error);
        });
}

function populateCategoryDropdowns() {
    const createSelect = $('#create-menu-category');
    const editSelect = $('#edit-menu-category');
    
    // Clear existing options except the first one
    createSelect.find('option:not(:first)').remove();
    editSelect.find('option:not(:first)').remove();
    
    // Add categories
    // CategoryDTO có field 'name' (không phải 'nameCate')
    categoriesList.forEach(function(category) {
        const categoryName = category.name || category.nameCate || 'Không có tên';
        const categoryId = category.id;
        if (categoryId) {
            createSelect.append(`<option value="${categoryId}">${categoryName}</option>`);
            editSelect.append(`<option value="${categoryId}">${categoryName}</option>`);
        } else {
            console.warn("Category without ID:", category);
        }
    });
    
    console.log("Category dropdowns populated. Total categories:", categoriesList.length);
}

let currentView = 'grid'; // Default to grid view

function loadMenus() {
    console.log("=== loadMenus() called ===");
    
    const gridContainer = $('#menus-grid-container');
    const tbody = $('#menus-tbody');
    
    // Show loading
    if (currentView === 'grid') {
        gridContainer.html('<div class="col-12 text-center py-4"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải...</div>');
    } else {
        tbody.html('<tr><td colspan="7" class="text-center py-4"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải...</td></tr>');
    }
    
    AdminApiService.getAllMenus()
        .done(function(response) {
            console.log("Menus response:", response);
            if (response && (response.success || response.isSuccess) && response.data) {
                const menus = Array.isArray(response.data) ? response.data : [];
                if (menus.length === 0) {
                    showNoMenusMessage();
                } else {
                    if (currentView === 'grid') {
                        renderMenusGrid(menus);
                    } else {
                        renderMenusTable(menus);
                    }
                }
            } else {
                console.error("Failed to load menus:", response);
                showErrorMessage("Không thể tải danh sách món ăn: " + (response?.desc || "Lỗi không xác định"));
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading menus:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else if (xhr.status === 403) {
                showErrorMessage("Bạn không có quyền truy cập trang này!");
            } else if (xhr.status === 404 || xhr.status === 501) {
                // API endpoint chưa được implement
                showNoMenusMessage("API lấy danh sách món ăn chưa được triển khai. Vui lòng liên hệ quản trị viên.");
            } else {
                showErrorMessage("Lỗi khi tải danh sách món ăn: " + error);
            }
        });
}

function switchView(view, reloadData = true) {
    currentView = view;
    
    if (view === 'grid') {
        $('#menus-grid-view').show();
        $('#menus-table-view').hide();
        $('#grid-view-btn').addClass('active');
        $('#table-view-btn').removeClass('active');
    } else {
        $('#menus-grid-view').hide();
        $('#menus-table-view').show();
        $('#table-view-btn').addClass('active');
        $('#grid-view-btn').removeClass('active');
    }
    
    // Reload menus to render in the selected view (only if requested)
    if (reloadData) {
        loadMenus();
    }
}

function renderMenusGrid(menus) {
    console.log("=== renderMenusGrid() called ===");
    console.log("Menus count:", menus.length);
    
    const gridContainer = $('#menus-grid-container');
    let html = '';
    
    menus.forEach(function(menu) {
        const menuId = menu.id || 0;
        const title = menu.title || 'N/A';
        const price = menu.price || 0;
        const timeShip = menu.time_ship || menu.timeShip || 'N/A';
        const isFreeShip = menu.isFreeShip || menu.is_freeship || false;
        const image = menu.image || '';
        const category = menu.category || {};
        const categoryName = category.nameCate || 'N/A';
        const description = menu.description || '';
        
        // Get image URL
        let imageUrl = 'img/1.jpg'; // Default image
        if (image) {
            imageUrl = AdminApiService.getMenuImage(image);
        }
        
        // Format date (if available)
        const createDate = menu.createDate || menu.createdAt || '';
        const formattedDate = createDate ? formatDate(createDate) : '';
        
        html += `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4">
                <div class="card menu-card h-100 shadow-sm" data-menu-id="${menuId}">
                    <div class="card-img-wrapper" style="position: relative; height: 200px; overflow: hidden; background: #f8f9fa;">
                        <img src="${imageUrl}" alt="${escapeHtml(title)}" 
                             class="card-img-top" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='img/1.jpg'">
                        ${isFreeShip ? '<span class="badge badge-success" style="position: absolute; top: 10px; right: 10px;">Miễn phí ship</span>' : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2" style="font-size: 1.1rem; font-weight: 600; min-height: 2.5rem;">
                            ${escapeHtml(title)}
                        </h5>
                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="feather-tag"></i> ${escapeHtml(categoryName)}
                            </small>
                        </div>
                        ${description ? `<p class="card-text text-muted small mb-2" style="min-height: 3rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${escapeHtml(description)}</p>` : ''}
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <strong class="text-primary" style="font-size: 1.2rem;">${formatVND(price)}</strong>
                                </div>
                                ${formattedDate ? `<small class="text-muted">${formattedDate}</small>` : ''}
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">
                                    <i class="feather-clock"></i> ${escapeHtml(timeShip)}
                                </small>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-primary btn-sm flex-fill" onclick="editMenu(${menuId})" title="Sửa">
                                    <i class="feather-edit"></i> Sửa
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteMenu(${menuId})" title="Xóa">
                                    <i class="feather-trash-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    if (menus.length === 0) {
        html = '<div class="col-12 text-center py-5"><p class="text-muted">Không có món ăn nào</p></div>';
    }
    
    gridContainer.html(html);
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function renderMenusTable(menus) {
    console.log("=== renderMenusTable() called ===");
    console.log("Menus count:", menus.length);
    
    const tbody = $('#menus-tbody');
    let html = '';
    
    menus.forEach(function(menu) {
        const menuId = menu.id || 0;
        const title = menu.title || 'N/A';
        const price = menu.price || 0;
        const timeShip = menu.time_ship || menu.timeShip || 'N/A';
        const isFreeShip = menu.isFreeShip || menu.is_freeship || false;
        const image = menu.image || '';
        const category = menu.category || {};
        const categoryName = category.nameCate || 'N/A';
        
        // Get image URL
        let imageUrl = 'img/1.jpg'; // Default image
        if (image) {
            imageUrl = AdminApiService.getMenuImage(image);
        }
        
        html += `
            <tr data-menu-id="${menuId}">
                <td>
                    <img src="${imageUrl}" alt="${title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.src='img/1.jpg'">
                </td>
                <td>${escapeHtml(title)}</td>
                <td>${escapeHtml(categoryName)}</td>
                <td>${formatVND(price)}</td>
                <td>${escapeHtml(timeShip)}</td>
                <td>
                    ${isFreeShip ? '<span class="badge badge-success">Có</span>' : '<span class="badge badge-secondary">Không</span>'}
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editMenu(${menuId})">
                        <i class="feather-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm ml-1" onclick="deleteMenu(${menuId})">
                        <i class="feather-trash-2"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.html(html);
    
    // Initialize DataTable
    if ($.fn.DataTable) {
        if (dataTable) {
            dataTable.destroy();
        }
        dataTable = $('#dataTable').DataTable({
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
            order: [[1, 'asc']] // Sort by title
        });
    }
}

function showNoMenusMessage(customMessage) {
    const message = customMessage || "Chưa có món ăn nào. Hãy thêm món ăn mới!";
    
    if (currentView === 'grid') {
        $('#menus-grid-container').html(`<div class="col-12 text-center py-5"><p class="text-muted">${message}</p></div>`);
    } else {
        $('#menus-tbody').html(`<tr><td colspan="7" class="text-center py-4 text-muted">${message}</td></tr>`);
    }
}

function showErrorMessage(message) {
    if (currentView === 'grid') {
        $('#menus-grid-container').html(`<div class="col-12 text-center py-5"><p class="text-danger">${message}</p></div>`);
    } else {
        $('#menus-tbody').html(`<tr><td colspan="7" class="text-center py-4 text-danger">${message}</td></tr>`);
    }
}

function createMenu() {
    console.log("=== createMenu() called ===");
    
    const title = $('#create-menu-title').val().trim();
    const categoryId = $('#create-menu-category').val();
    const price = parseFloat($('#create-menu-price').val());
    const shippingFee = parseFloat($('#create-menu-shipping-fee').val()) || 15000;
    const timeShip = $('#create-menu-time-ship').val().trim();
    const isFreeShip = $('#create-menu-is-freeship').val() === 'true';
    const imageFile = $('#create-menu-image')[0].files[0];
    
    // Validation
    if (!title) {
        alert('Vui lòng nhập tên món ăn!');
        return;
    }
    
    if (!categoryId) {
        alert('Vui lòng chọn danh mục!');
        return;
    }
    
    if (!price || price <= 0) {
        alert('Vui lòng nhập giá hợp lệ (lớn hơn 0)!');
        return;
    }
    
    if (!timeShip) {
        alert('Vui lòng nhập thời gian ship!');
        return;
    }
    
    if (!imageFile) {
        alert('Vui lòng chọn ảnh món ăn!');
        return;
    }
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('title', title);
    formData.append('time_ship', timeShip);
    formData.append('is_freeship', isFreeShip ? 'true' : 'false');
    formData.append('price', price);
    formData.append('cate_id', categoryId);
    formData.append('shippingFee', shippingFee);
    
    // Disable button
    const submitBtn = $('#create-menu-modal .btn-primary');
    const originalText = submitBtn.html();
    submitBtn.prop('disabled', true).html('<i class="feather-loader spinner-border spinner-border-sm"></i> Đang tạo...');
    
    AdminApiService.createMenu(formData)
        .done(function(response) {
            console.log("Create menu response:", response);
            if (response && response.success) {
                showToast('success', 'Tạo món ăn thành công!');
                $('#create-menu-modal').modal('hide');
                loadMenus();
            } else {
                showToast('error', response?.desc || 'Tạo món ăn thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error creating menu:", error);
            console.error("Response:", xhr.responseText);
            
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else {
                const errorMsg = xhr.responseJSON?.desc || 'Tạo món ăn thất bại!';
                showToast('error', errorMsg);
            }
        })
        .always(function() {
            submitBtn.prop('disabled', false).html(originalText);
        });
}

function editMenu(menuId) {
    console.log("=== editMenu() called ===");
    console.log("Menu ID:", menuId);
    
    currentEditMenuId = menuId;
    
    // Load menu details
    AdminApiService.getMenuById(menuId)
        .done(function(response) {
            console.log("Menu details response:", response);
            if (response && response.success && response.data) {
                const menu = response.data;
                
                $('#edit-menu-id').val(menu.id);
                $('#edit-menu-title').val(menu.title || '');
                $('#edit-menu-price').val(menu.price || 0);
                $('#edit-menu-shipping-fee').val(menu.shippingFee || 15000);
                $('#edit-menu-time-ship').val(menu.time_ship || menu.timeShip || '');
                $('#edit-menu-is-freeship').val((menu.isFreeShip || menu.is_freeship) ? 'true' : 'false');
                
                // Set category
                const categoryId = menu.category?.id || menu.cate_id || '';
                $('#edit-menu-category').val(categoryId);
                
                // Show current image
                const image = menu.image || '';
                if (image) {
                    const imageUrl = AdminApiService.getMenuImage(image);
                    $('#edit-menu-current-image').html(`
                        <small class="text-muted">Ảnh hiện tại:</small><br>
                        <img src="${imageUrl}" alt="${menu.title}" style="max-width: 200px; max-height: 200px; border-radius: 4px;" onerror="this.src='img/1.jpg'">
                    `);
                }
                
                $('#edit-menu-modal').modal('show');
            } else {
                showToast('error', response?.desc || 'Không thể tải thông tin món ăn!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading menu details:", error);
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else {
                showToast('error', 'Không thể tải thông tin món ăn!');
            }
        });
}

function updateMenu() {
    console.log("=== updateMenu() called ===");
    
    if (!currentEditMenuId) {
        showToast('error', 'Không tìm thấy ID món ăn!');
        return;
    }
    
    const title = $('#edit-menu-title').val().trim();
    const categoryId = $('#edit-menu-category').val();
    const price = parseFloat($('#edit-menu-price').val());
    const shippingFee = parseFloat($('#edit-menu-shipping-fee').val()) || 15000;
    const timeShip = $('#edit-menu-time-ship').val().trim();
    const isFreeShip = $('#edit-menu-is-freeship').val() === 'true';
    const imageFile = $('#edit-menu-image')[0].files[0];
    
    // Validation
    if (!title) {
        alert('Vui lòng nhập tên món ăn!');
        return;
    }
    
    if (!categoryId) {
        alert('Vui lòng chọn danh mục!');
        return;
    }
    
    if (!price || price <= 0) {
        alert('Vui lòng nhập giá hợp lệ (lớn hơn 0)!');
        return;
    }
    
    if (!timeShip) {
        alert('Vui lòng nhập thời gian ship!');
        return;
    }
    
    // Create FormData
    const formData = new FormData();
    if (imageFile) {
        formData.append('file', imageFile);
    }
    formData.append('title', title);
    formData.append('time_ship', timeShip);
    formData.append('is_freeship', isFreeShip ? 'true' : 'false');
    formData.append('price', price);
    formData.append('cate_id', categoryId);
    formData.append('shippingFee', shippingFee);
    
    // Disable button
    const submitBtn = $('#edit-menu-modal .btn-primary');
    const originalText = submitBtn.html();
    submitBtn.prop('disabled', true).html('<i class="feather-loader spinner-border spinner-border-sm"></i> Đang cập nhật...');
    
    AdminApiService.updateMenu(currentEditMenuId, formData)
        .done(function(response) {
            console.log("Update menu response:", response);
            if (response && response.success) {
                showToast('success', 'Cập nhật món ăn thành công!');
                $('#edit-menu-modal').modal('hide');
                loadMenus();
            } else {
                showToast('error', response?.desc || 'Cập nhật món ăn thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error updating menu:", error);
            console.error("Response:", xhr.responseText);
            
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else if (xhr.status === 501) {
                showToast('error', 'Chức năng cập nhật món ăn chưa được triển khai trong backend!');
            } else {
                const errorMsg = xhr.responseJSON?.desc || 'Cập nhật món ăn thất bại!';
                showToast('error', errorMsg);
            }
        })
        .always(function() {
            submitBtn.prop('disabled', false).html(originalText);
        });
}

function deleteMenu(menuId) {
    console.log("=== deleteMenu() called ===");
    console.log("Menu ID:", menuId);
    
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
        return;
    }
    
    AdminApiService.deleteMenu(menuId)
        .done(function(response) {
            console.log("Delete menu response:", response);
            if (response && response.success) {
                showToast('success', 'Xóa món ăn thành công!');
                loadMenus();
            } else {
                showToast('error', response?.desc || 'Xóa món ăn thất bại!');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error deleting menu:", error);
            console.error("Response:", xhr.responseText);
            
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = 'login.html';
            } else if (xhr.status === 501) {
                showToast('error', 'Chức năng xóa món ăn chưa được triển khai trong backend!');
            } else {
                const errorMsg = xhr.responseJSON?.desc || 'Xóa món ăn thất bại!';
                showToast('error', errorMsg);
            }
        });
}

// Helper functions
function formatVND(amount) {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
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

function showToast(type, message) {
    // Simple toast notification
    const toastClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const toast = $(`
        <div class="alert ${toastClass} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(function() {
        toast.alert('close');
    }, 3000);
}

