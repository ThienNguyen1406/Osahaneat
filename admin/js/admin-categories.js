/*
 * Admin Categories Page - Quản lý danh mục
 */

let currentEditCategoryId = null;
let dataTable = null;

$(document).ready(function() {
    console.log("=== admin-categories.js v1.1 loaded ===");
    console.log("Current timestamp:", new Date().toISOString());
    
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
            // Still try to load, backend will handle authorization
        }
    }
    
    // Load categories list
    loadCategories();
    
    // Setup event handlers
    setupEventHandlers();
});

function loadCategories(keyword = '') {
    console.log("=== loadCategories() called ===");
    console.log("Keyword:", keyword);
    
    const tbody = $('#categories-tbody');
    
    // Show loading
    tbody.html('<tr><td colspan="3" class="text-center py-4"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải...</td></tr>');
    
    // Check token before making API call
    if (typeof getToken === 'function') {
        const token = getToken();
        console.log("Token exists:", token ? "Yes" : "No");
        if (token) {
            console.log("Token length:", token.length);
            const decoded = typeof decodeToken === 'function' ? decodeToken(token) : null;
            if (decoded) {
                console.log("Token decoded successfully");
                console.log("Token scope:", decoded.scope || decoded.scopes);
                console.log("Token sub:", decoded.sub);
            } else {
                console.warn("Failed to decode token");
            }
        } else {
            console.error("No token found!");
            alert('Vui lòng đăng nhập để truy cập trang này!');
            window.location.href = 'login.html';
            return;
        }
    }
    
    const apiCall = keyword 
        ? AdminApiService.searchCategories(keyword)
        : AdminApiService.getAllCategories();
    
    apiCall
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
                if (response.data.length > 0) {
                    console.log("First category:", response.data[0]);
                    console.log("First category keys:", Object.keys(response.data[0]));
                }
            }
            
            // Backend response format: { status, success/isSuccess, data, desc }
            const isSuccess = response && (response.success || response.isSuccess || response.status === 200);
            const hasData = response && response.data && Array.isArray(response.data);
            
            console.log("Categories check - isSuccess:", isSuccess, "hasData:", hasData);
            
            if (isSuccess && hasData && response.data.length > 0) {
                console.log("✅ Categories data is valid, rendering " + response.data.length + " categories...");
                renderCategoriesTable(response.data);
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
                    renderCategoriesTable(response.data);
                } else {
                    console.error("❌ No categories data to render!");
                    showNoCategoriesMessage();
                }
            }
        })
        .fail(function(xhr) {
            console.error('Error loading categories:', xhr);
            let errorMsg = "Không thể tải danh sách danh mục!";
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            if (xhr.status === 403) {
                console.error("403 Forbidden - Access denied");
                console.error("Response:", xhr.responseJSON);
                console.error("Status:", xhr.status);
                console.error("Status text:", xhr.statusText);
                
                // Check token and role
                if (typeof getToken === 'function') {
                    const token = getToken();
                    if (token) {
                        const decoded = typeof decodeToken === 'function' ? decodeToken(token) : null;
                        if (decoded) {
                            console.error("Token scope:", decoded.scope || decoded.scopes);
                            console.error("Token sub:", decoded.sub);
                        }
                    }
                }
                
                const confirmMsg = 'Bạn không có quyền truy cập trang này!\n\n' +
                    'Vui lòng đăng nhập với tài khoản admin.\n\n' +
                    'Bạn có muốn chuyển đến trang đăng nhập không?';
                
                if (confirm(confirmMsg)) {
                    if (typeof removeToken === 'function') {
                        removeToken();
                    }
                    window.location.href = 'login.html';
                }
            } else {
                alert(errorMsg);
            }
            showNoCategoriesMessage();
        });
}

function renderCategoriesTable(categories) {
    console.log("=== renderCategoriesTable() called ===");
    console.log("Categories count:", categories.length);
    console.log("Categories data:", categories);
    
    const tbody = $('#categories-tbody');
    
    if (tbody.length === 0) {
        console.error("❌ Categories table tbody not found");
        return;
    }
    
    if (!categories || categories.length === 0) {
        console.warn("⚠️ No categories to render");
        showNoCategoriesMessage();
        return;
    }
    
    console.log("✅ Rendering " + categories.length + " categories...");
    
    let html = '';
    categories.forEach(function(category, index) {
        // Hỗ trợ cả name và nameCate (từ entity Category có field nameCate)
        const categoryId = category.id || category.categoryId || 'N/A';
        const categoryName = category.name || category.nameCate || 'N/A';
        
        console.log(`Category ${index + 1}:`, { id: categoryId, name: categoryName, full: category });
        
        html += `
            <tr>
                <td>${categoryId}</td>
                <td>${escapeHtml(categoryName)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary edit-category-btn" data-id="${categoryId}" data-name="${escapeHtml(categoryName)}">
                        <i class="feather-edit"></i> Sửa
                    </button>
                    <button type="button" class="btn btn-sm btn-danger delete-category-btn" data-id="${categoryId}" data-name="${escapeHtml(categoryName)}">
                        <i class="feather-trash-2"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    });
    
    console.log("HTML generated, length:", html.length);
    console.log("First 500 chars of HTML:", html.substring(0, 500));
    
    // Insert HTML vào tbody trước
    tbody.html(html);
    
    console.log("✅ Categories HTML inserted into tbody");
    console.log("tbody children count:", tbody.children().length);
    
    // Destroy và khởi tạo lại DataTable
    // Sử dụng setTimeout để đảm bảo DOM đã được cập nhật
    setTimeout(function() {
        const table = $('#categoriesDataTable');
        if ($.fn.DataTable && table.length > 0) {
            // Check if DataTable is already initialized
            if ($.fn.DataTable.isDataTable('#categoriesDataTable')) {
                console.log("DataTable already initialized, destroying...");
                try {
                    $('#categoriesDataTable').DataTable().destroy();
                } catch (e) {
                    console.warn("Error destroying DataTable:", e);
                }
            }
            
            // Destroy instance nếu có
            if (dataTable) {
                console.log("Destroying existing dataTable instance...");
                try {
                    dataTable.destroy();
                } catch (e) {
                    console.warn("Error destroying dataTable instance:", e);
                }
                dataTable = null;
            }
            
            console.log("Initializing new DataTable...");
            try {
                dataTable = $('#categoriesDataTable').DataTable({
                    pageLength: 10, // Số mục mặc định hiển thị trên mỗi trang
                    lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Tất cả"]], // Tùy chọn số lượng hiển thị
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
                    order: [[0, 'asc']],
                    paging: true, // Bật phân trang
                    searching: true, // Bật tìm kiếm
                    info: true, // Hiển thị thông tin
                    autoWidth: false // Tắt auto width để tránh lỗi
                });
                console.log("✅ DataTable initialized successfully");
            } catch (e) {
                console.error("❌ Error initializing DataTable:", e);
                console.error("Error message:", e.message);
                console.error("Error stack:", e.stack);
            }
        } else {
            console.warn("⚠️ DataTable plugin not available");
        }
    }, 100); // Delay 100ms để đảm bảo DOM đã được cập nhật
}

function showNoCategoriesMessage() {
    const tbody = $('#categories-tbody');
    if (tbody.length > 0) {
        tbody.html(`
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        <i class="feather-info"></i>
                        Chưa có danh mục nào.
                    </div>
                </td>
            </tr>
        `);
        
        // Destroy DataTable nếu có
        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }
    }
}

function setupEventHandlers() {
    // Add category button
    $('#addCategoryBtn').on('click', function() {
        currentEditCategoryId = null;
        $('#categoryModalLabel').text('Thêm danh mục mới');
        $('#categoryForm')[0].reset();
        $('#categoryName').val('');
        $('#categoryModal').modal('show');
    });
    
    // Save category button
    $('#saveCategoryBtn').on('click', function() {
        saveCategory();
    });
    
    // Search form submit
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchInput').val().trim();
        loadCategories(keyword);
    });
    
    // Search button click
    $('#searchBtn').on('click', function() {
        const keyword = $('#searchInput').val().trim();
        loadCategories(keyword);
    });
    
    // Mobile search button click
    $('#mobileSearchBtn').on('click', function() {
        const keyword = $('#mobileSearchInput').val().trim();
        loadCategories(keyword);
    });
    
    // Search input enter key
    $('#searchInput, #mobileSearchInput').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            const keyword = $(this).val().trim();
            loadCategories(keyword);
        }
    });
    
    // Edit category button (using event delegation)
    $(document).on('click', '.edit-category-btn', function() {
        const categoryId = $(this).data('id');
        const categoryName = $(this).data('name');
        
        currentEditCategoryId = categoryId;
        $('#categoryModalLabel').text('Sửa danh mục');
        $('#categoryName').val(categoryName);
        $('#categoryModal').modal('show');
    });
    
    // Delete category button (using event delegation)
    $(document).on('click', '.delete-category-btn', function() {
        const categoryId = $(this).data('id');
        const categoryName = $(this).data('name');
        
        if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryName}" không?`)) {
            deleteCategory(categoryId);
        }
    });
}

function saveCategory() {
    const nameCate = $('#categoryName').val().trim();
    
    if (!nameCate) {
        alert('Vui lòng nhập tên danh mục!');
        return;
    }
    
    $('#saveCategoryBtn').prop('disabled', true).html('<i class="feather-loader"></i> Đang lưu...');
    
    const apiCall = currentEditCategoryId
        ? AdminApiService.updateCategory(currentEditCategoryId, nameCate)
        : AdminApiService.createCategory(nameCate);
    
    apiCall
        .done(function(response) {
            console.log("Save category response:", response);
            const isSuccess = response && (response.success || response.isSuccess);
            if (isSuccess) {
                alert(currentEditCategoryId ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
                $('#categoryModal').modal('hide');
                loadCategories(); // Reload categories list
            } else {
                const errorMsg = (response && response.desc) || 'Lưu danh mục thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error('Error saving category:', xhr);
            let errorMsg = 'Không thể lưu danh mục!';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
        })
        .always(function() {
            $('#saveCategoryBtn').prop('disabled', false).html('Lưu');
        });
}

function deleteCategory(categoryId) {
    AdminApiService.deleteCategory(categoryId)
        .done(function(response) {
            console.log("Delete category response:", response);
            const isSuccess = response && (response.success || response.isSuccess);
            if (isSuccess) {
                alert('Xóa danh mục thành công!');
                loadCategories(); // Reload categories list
            } else {
                const errorMsg = (response && response.desc) || 'Xóa danh mục thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error('Error deleting category:', xhr);
            let errorMsg = 'Không thể xóa danh mục!';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            alert(errorMsg);
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

