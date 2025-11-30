/*
 * Admin Users Management JavaScript
 */

let currentEditUserId = null;
let dataTable = null;

$(document).ready(function() {
    console.log("=== admin-users.js loaded ===");
    
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
    
    // Load users list
    loadUsers();
    
    // Setup event handlers
    setupEventHandlers();
});

function loadUsers(keyword = '') {
    console.log("=== loadUsers() called ===");
    console.log("Keyword:", keyword);
    
    const tbody = $('#dataTable tbody');
    
    // Show loading
    tbody.html('<tr><td colspan="7" class="text-center py-4"><i class="feather-loader"></i> Đang tải...</td></tr>');
    
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
        ? AdminApiService.searchUsers(keyword)
        : AdminApiService.getAllUsers();
    
    apiCall
        .done(function(response) {
            console.log("=== Users API Response ===");
            console.log("Users response:", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            
            // Backend response format: { status, isSuccess, data, desc } (ResponseData)
            // Hoặc format cũ: { code, result, message } (ApiResponse) - để tương thích
            let users = [];
            if (response) {
                // Format mới: ResponseData
                if (response.data && Array.isArray(response.data)) {
                    users = response.data;
                }
                // Format cũ: ApiResponse
                else if (response.result && Array.isArray(response.result)) {
                    users = response.result;
                }
            }
            console.log("Parsed users:", users);
            console.log("Users count:", users ? users.length : 0);
            console.log("Is array:", Array.isArray(users));
            
            if (Array.isArray(users) && users.length > 0) {
                console.log("✅ Users array is valid, count:", users.length);
                console.log("First user:", users[0]);
                console.log("About to call renderUsersTable...");
                
                // Ensure DOM is ready
                if (typeof $ === 'undefined') {
                    console.error("jQuery is not loaded!");
                    alert("Lỗi: jQuery chưa được tải!");
                    return;
                }
                
                const $tbody = $('#dataTable tbody');
                console.log("Table tbody found:", $tbody.length > 0);
                if ($tbody.length === 0) {
                    console.error("❌ Table tbody not found! Waiting 500ms and retrying...");
                    setTimeout(function() {
                        console.log("Retrying renderUsersTable after delay...");
                        try {
                            renderUsersTable(users);
                        } catch (e) {
                            console.error("Error in renderUsersTable (retry):", e);
                            alert("Lỗi khi render bảng người dùng: " + e.message);
                        }
                    }, 500);
                    return;
                }
                
                try {
                    console.log("Calling renderUsersTable now...");
                    renderUsersTable(users);
                    console.log("✅ renderUsersTable called successfully");
                } catch (e) {
                    console.error("❌ Error in renderUsersTable:", e);
                    console.error("Error message:", e.message);
                    console.error("Stack trace:", e.stack);
                    alert("Lỗi khi render bảng người dùng: " + e.message);
                }
            } else {
                console.warn("⚠️ No users found or invalid format");
                console.warn("Users:", users);
                console.warn("Is array:", Array.isArray(users));
                console.warn("Length:", users ? users.length : 'null/undefined');
                console.warn("Full response:", response);
                showNoUsersMessage();
            }
        })
        .fail(function(xhr) {
            console.error('Error loading users:', xhr);
            let errorMsg = "Không thể tải danh sách người dùng!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
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
            showNoUsersMessage();
        });
}

function renderUsersTable(users) {
    console.log("=== renderUsersTable() called ===");
    console.log("Users count:", users ? users.length : 0);
    console.log("Users data:", users);
    
    const tbody = $('#dataTable tbody');
    console.log("Looking for #dataTable tbody...");
    console.log("tbody.length:", tbody.length);
    console.log("tbody element:", tbody[0]);
    
    if (tbody.length === 0) {
        console.error("❌ Users table tbody not found!");
        console.error("Trying to find table...");
        const $table = $('#dataTable');
        console.log("Table found:", $table.length > 0);
        if ($table.length > 0) {
            console.log("Table HTML:", $table[0].outerHTML.substring(0, 200));
        }
        alert("Không tìm thấy bảng dữ liệu! Vui lòng làm mới trang.");
        return;
    }
    
    console.log("✅ Table tbody found, proceeding to render...");
    
    tbody.empty();
    
    if (!users || users.length === 0) {
        console.log("No users to render");
        showNoUsersMessage();
        return;
    }
    
    console.log("Rendering", users.length, "users...");
    
    let html = '';
    users.forEach(function(user) {
        // Format date
        const createDate = user.createDate ? new Date(user.createDate).toLocaleDateString('vi-VN') : 'N/A';
        
        // Role badge
        const roleBadge = user.roleName === 'ADMIN' 
            ? '<span class="badge badge-danger">ADMIN</span>'
            : '<span class="badge badge-primary">USER</span>';
        
        html += `
            <tr>
                <td>${user.id || 'N/A'}</td>
                <td>${user.userName || 'N/A'}</td>
                <td>${user.fullName || 'N/A'}</td>
                <td>${user.phoneNumber || 'N/A'}</td>
                <td>${roleBadge}</td>
                <td>${createDate}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user-btn" data-id="${user.id}" title="Sửa">
                        <i class="feather-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}" title="Xóa">
                        <i class="feather-trash-2"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.html(html);
    
    console.log("=== renderUsersTable: HTML rendered ===");
    console.log("HTML length:", html.length);
    console.log("Number of rows in HTML:", (html.match(/<tr>/g) || []).length);
    console.log("tbody HTML after render:", tbody.html().substring(0, 500));
    console.log("tbody children count:", tbody.children().length);
    
    // Verify rows are in DOM
    const rows = tbody.find('tr');
    console.log("Rows found in tbody:", rows.length);
    if (rows.length > 0) {
        console.log("First row HTML:", rows.first().html().substring(0, 200));
    }
    
    // Initialize DataTable nếu có
    if ($.fn.DataTable) {
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            console.log("DataTable already initialized, destroying...");
            $('#dataTable').DataTable().destroy();
        }
        
        if (dataTable) {
            console.log("Destroying existing dataTable instance...");
            dataTable.destroy();
            dataTable = null;
        }
        
        console.log("Initializing new DataTable...");
        dataTable = $('#dataTable').DataTable({
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
            autoWidth: false, // Tắt auto width để tránh lỗi
            drawCallback: function(settings) {
                // Đảm bảo số lượng hiển thị đúng sau mỗi lần vẽ lại
                const api = this.api();
                const pageLength = api.page.len();
                const totalRows = api.rows().count();
                const visibleRows = api.rows({page: 'current'}).count();
                const allRows = api.rows().nodes().length;
                
                console.log("=== DataTable drawCallback ===");
                console.log("Page length:", pageLength);
                console.log("Total rows:", totalRows);
                console.log("Visible rows on current page:", visibleRows);
                console.log("All rows in DOM:", allRows);
                
                // Kiểm tra xem có rows nào bị ẩn không
                const tbody = $('#dataTable tbody');
                const allTbodyRows = tbody.find('tr');
                console.log("tbody rows count:", allTbodyRows.length);
                allTbodyRows.each(function(index) {
                    const $row = $(this);
                    const isVisible = $row.is(':visible');
                    const display = $row.css('display');
                    console.log(`Row ${index}: visible=${isVisible}, display=${display}`);
                });
            }
        });
        console.log("✅ DataTable initialized successfully");
        console.log("DataTable instance:", dataTable);
        console.log("DataTable rows count:", dataTable.rows().count());
        console.log("DataTable visible rows:", dataTable.rows({search: 'applied'}).count());
        
        // Force redraw
        dataTable.draw();
        console.log("DataTable draw() called");
        
        // Verify after draw
        setTimeout(function() {
            const api = dataTable;
            const totalRows = api.rows().count();
            const visibleRows = api.rows({page: 'current'}).count();
            const allRows = api.rows().nodes();
            
            console.log("=== After draw() ===");
            console.log("Total rows:", totalRows);
            console.log("Visible rows on current page:", visibleRows);
            console.log("All rows nodes length:", allRows.length);
            
            // Check DOM
            const tbody = $('#dataTable tbody');
            const domRows = tbody.find('tr');
            console.log("DOM rows count:", domRows.length);
            
            // Count visible rows in DOM
            let visibleCount = 0;
            domRows.each(function() {
                if ($(this).is(':visible') && $(this).css('display') !== 'none') {
                    visibleCount++;
                }
            });
            console.log("Visible DOM rows:", visibleCount);
            
            // If there's a mismatch, try to fix it
            if (visibleCount !== visibleRows && visibleRows > 0) {
                console.warn("⚠️ Mismatch detected! Expected", visibleRows, "but found", visibleCount, "visible rows");
                console.warn("Attempting to fix by redrawing...");
                dataTable.draw(false); // Redraw without resetting paging
            }
        }, 200);
    } else {
        console.warn("⚠️ DataTable plugin not available");
    }
}

function showNoUsersMessage() {
    const tbody = $('#dataTable tbody');
    if (tbody.length > 0) {
        tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted">Không có người dùng nào</td></tr>');
        
        // Destroy DataTable nếu có
        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }
    }
}

function setupEventHandlers() {
    // Search form
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchInput').val().trim();
        loadUsers(keyword);
    });
    
    $('#searchBtn').on('click', function() {
        const keyword = $('#searchInput').val().trim();
        loadUsers(keyword);
    });
    
    // Mobile search
    $('#mobileSearchBtn').on('click', function() {
        const keyword = $('#mobileSearchInput').val().trim();
        loadUsers(keyword);
    });
    
    // Add user button
    $('#addUserBtn').on('click', function() {
        currentEditUserId = null;
        resetUserForm();
        $('#userModalLabel').text('Thêm người dùng mới');
        $('#userModal').modal('show');
    });
    
    // Save user button
    $('#saveUserBtn').on('click', function() {
        saveUser();
    });
    
    // Edit user button (event delegation)
    $(document).on('click', '.edit-user-btn', function() {
        const userId = $(this).data('id');
        editUser(userId);
    });
    
    // Delete user button (event delegation)
    $(document).on('click', '.delete-user-btn', function() {
        const userId = $(this).data('id');
        deleteUser(userId);
    });
}

function resetUserForm() {
    $('#userForm')[0].reset();
    $('#userName').prop('readonly', false);
    $('#password').prop('required', true);
    $('#password').closest('.form-group').show();
    currentEditUserId = null;
}

function editUser(userId) {
    console.log("Editing user ID:", userId);
    
    AdminApiService.getUserById(userId)
        .done(function(response) {
            console.log("User data:", response);
            // Support both ResponseData and ApiResponse formats
            let user = null;
            if (response) {
                if (response.data) {
                    user = response.data;
                } else if (response.result) {
                    user = response.result;
                }
            }
            if (user) {
                currentEditUserId = user.id;
                $('#userName').val(user.userName || '');
                $('#userName').prop('readonly', true);
                $('#fullname').val(user.fullName || '');
                $('#phoneNumber').val(user.phoneNumber || '');
                $('#password').val('');
                $('#password').prop('required', false);
                $('#password').closest('.form-group').show();
                
                $('#userModalLabel').text('Sửa thông tin người dùng');
                $('#userModal').modal('show');
            } else {
                alert('Không tìm thấy người dùng!');
            }
        })
        .fail(function(xhr) {
            console.error('Error getting user:', xhr);
            let errorMsg = "Không thể lấy thông tin người dùng!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            alert(errorMsg);
        });
}

function saveUser() {
    const userName = $('#userName').val().trim();
    const fullname = $('#fullname').val().trim();
    const password = $('#password').val().trim();
    const phoneNumber = $('#phoneNumber').val().trim();
    
    // Validate
    if (!userName) {
        alert('Username không được để trống!');
        return;
    }
    
    if (!fullname) {
        alert('Họ tên không được để trống!');
        return;
    }
    
    if (currentEditUserId === null) {
        // Create new user
        if (!password) {
            alert('Mật khẩu không được để trống!');
            return;
        }
        
        if (password.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }
        
        const userData = {
            userName: userName,
            fullname: fullname,
            password: password
        };
        
        if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
        }
        
        console.log("Creating user:", userData);
        
        AdminApiService.createUser(userData)
            .done(function(response) {
                console.log("Create user response:", response);
                // Support both ResponseData and ApiResponse formats
                const isSuccess = (response && response.status === 200 && (response.isSuccess || response.success)) ||
                                  (response && response.code === 200);
                if (isSuccess) {
                    alert('Tạo người dùng thành công!');
                    $('#userModal').modal('hide');
                    loadUsers();
                } else {
                    const errorMsg = (response && response.desc) || 
                                    (response && response.message) || 
                                    'Tạo người dùng thất bại!';
                    alert(errorMsg);
                }
            })
            .fail(function(xhr) {
                console.error('Error creating user:', xhr);
                let errorMsg = "Không thể tạo người dùng!";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                }
                alert(errorMsg);
            });
    } else {
        // Update existing user
        const userData = {
            fullname: fullname
        };
        
        if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
        }
        
        if (password) {
            if (password.length < 8) {
                alert('Mật khẩu phải có ít nhất 8 ký tự!');
                return;
            }
            userData.password = password;
        }
        
        console.log("Updating user ID:", currentEditUserId, "Data:", userData);
        
        AdminApiService.updateUser(currentEditUserId, userData)
            .done(function(response) {
                console.log("Update user response:", response);
                // Support both ResponseData and ApiResponse formats
                const isSuccess = (response && response.status === 200 && (response.isSuccess || response.success)) ||
                                  (response && response.code === 200);
                if (isSuccess) {
                    alert('Cập nhật người dùng thành công!');
                    $('#userModal').modal('hide');
                    loadUsers();
                } else {
                    const errorMsg = (response && response.desc) || 
                                    (response && response.message) || 
                                    'Cập nhật người dùng thất bại!';
                    alert(errorMsg);
                }
            })
            .fail(function(xhr) {
                console.error('Error updating user:', xhr);
                let errorMsg = "Không thể cập nhật người dùng!";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                }
                alert(errorMsg);
            });
    }
}

function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
        return;
    }
    
    console.log("Deleting user ID:", userId);
    
    AdminApiService.deleteUser(userId)
        .done(function(response) {
            console.log("Delete user response:", response);
            // Support both ResponseData and ApiResponse formats
            const isSuccess = (response && response.status === 200 && (response.isSuccess || response.success)) ||
                              (response && response.code === 200);
            if (isSuccess) {
                alert('Xóa người dùng thành công!');
                loadUsers();
            } else {
                const errorMsg = (response && response.desc) || 
                                (response && response.message) || 
                                'Xóa người dùng thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error('Error deleting user:', xhr);
            let errorMsg = "Không thể xóa người dùng!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            alert(errorMsg);
        });
}

