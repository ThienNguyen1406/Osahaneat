/*
Custom JS - Enhanced with API integration
*/

// Global error handlers to catch unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    // Prevent default browser error handling
    event.preventDefault();
    
    // Log the error safely
    console.warn("⚠️ Unhandled promise rejection caught:", event.reason);
    
    // If it's from onboarding.js or other external scripts, just log and ignore
    if (event.reason === undefined || event.reason === null) {
        console.warn("⚠️ Promise rejection with undefined reason (likely from external script) - ignoring");
        return;
    }
    
    // For other errors, log more details
    if (event.reason && typeof event.reason === 'object') {
        console.warn("Error details:", event.reason);
    } else if (event.reason && typeof event.reason === 'string') {
        console.warn("Error message:", event.reason);
    }
});

// Also catch general errors
window.addEventListener('error', function(event) {
    // Ignore errors from external scripts (onboarding.js, etc.)
    if (event.filename && event.filename.includes('onboarding')) {
        console.warn("⚠️ Error from external script (onboarding.js) - ignoring:", event.message);
        event.preventDefault();
        return false;
    }
    
    // Log other errors but don't break the app
    if (event.message && !event.message.includes('onboarding')) {
        console.warn("⚠️ Global error caught:", event.message, "at", event.filename, "line", event.lineno);
    }
    
    return true; // Allow default error handling for other errors
});

// Signin
$(document).ready(function () {
    // Log để đảm bảo file mới được load
    console.log("=== CUSTOM.JS LOADED - VERSION 2.1 ===");
    
    // Clear any pre-filled values in login form
    $('#email').val('');
    $('#password').val('');
    
    // Login handler
    $("#btn-signin").click(function (e) {
        e.preventDefault();
        const username = $("#email").val();
        const password = $("#password").val();

        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        ApiService.login(username, password)
            .done(function (response) {
                console.log("=== LOGIN DEBUG START ===");
                console.log("Full response:", response);
                console.log("Response type:", typeof response);
                console.log("response.isSuccess:", response?.isSuccess);
                console.log("response.success:", response?.success);
                console.log("response.data:", response?.data);
                console.log("response.status:", response?.status);
                console.log("response.desc:", response?.desc);
                
                // Response format: { status, isSuccess/success, desc, data }
                // Logic đơn giản: nếu có data (JWT token) và (success=true hoặc status=200) thì thành công
                // Không cần check quá phức tạp, chỉ cần có token là đủ
                const hasToken = response && response.data && typeof response.data === 'string' && response.data.length > 10;
                const hasSuccess = response && (response.success === true || response.success === "true" || response.isSuccess === true || response.isSuccess === "true");
                const hasStatusOk = response && (response.status === 200 || response.status === "200" || response.status === 200);
                
                // Nếu có token VÀ (success=true HOẶC status=200) thì proceed
                const shouldProceed = hasToken && (hasSuccess || hasStatusOk);
                
                console.log("=== RESPONSE CHECK ===");
                console.log("hasToken:", hasToken, "(" + (response?.data?.length || 0) + " chars)");
                console.log("hasSuccess:", hasSuccess, "(success=" + response?.success + ", isSuccess=" + response?.isSuccess + ")");
                console.log("hasStatusOk:", hasStatusOk, "(status=" + response?.status + ")");
                console.log("shouldProceed:", shouldProceed);
                
                if (shouldProceed) {
                    console.log("=== LOGIN SUCCESS - PROCEEDING ===");
                    // Lưu token
                    const token = response.data;
                    console.log("Token to save:", token ? "EXISTS (" + token.length + " chars)" : "NULL");
                    setToken(token);
                    
                    // Verify token was saved
                    const savedToken = getToken();
                    console.log("Token saved successfully:", savedToken ? "YES" : "NO");
                    console.log("Saved token length:", savedToken ? savedToken.length : 0);
                    
                    // Determine redirect URL
                    let redirectUrl = "./index.html"; // Default user homepage
                    
                    // Decode token để check role
                    try {
                        const decoded = decodeToken(savedToken);
                        console.log("Decoded token:", decoded);
                        if (decoded) {
                            const scope = decoded.scope || decoded.scopes || '';
                            console.log("Token scope:", scope);
                            const scopes = scope.split(' ').filter(s => s.trim() !== '');
                            console.log("Token scopes array:", scopes);
                            
                            const hasAdminRole = scopes.includes('ROLE_ADMIN') || scopes.includes('ADMIN');
                            console.log("Has ADMIN role:", hasAdminRole);
                            
                            if (hasAdminRole) {
                                redirectUrl = "../admin/index.html";
                                console.log("=== REDIRECTING TO ADMIN DASHBOARD ===");
                            } else {
                                console.log("=== REDIRECTING TO USER HOMEPAGE ===");
                            }
                        }
                    } catch (e) {
                        console.error("Error decoding token:", e);
                        console.log("=== REDIRECTING TO USER HOMEPAGE (fallback) ===");
                    }
                    
                    // Redirect ngay lập tức - KHÔNG dùng alert vì nó sẽ chặn redirect
                    console.log("=== PREPARING REDIRECT ===");
                    console.log("Redirect URL:", redirectUrl);
                    console.log("Current URL:", window.location.href);
                    
                    // Đảm bảo redirect URL là relative path đúng
                    let finalRedirectUrl = redirectUrl;
                    
                    console.log("Final redirect URL:", finalRedirectUrl);
                    console.log("=== EXECUTING REDIRECT NOW ===");
                    
                    // Redirect ngay - KHÔNG có delay, KHÔNG có alert
                    // Dùng location.href (standard redirect)
                    window.location.href = finalRedirectUrl;
                    
                    // Thêm một backup redirect sau 100ms để đảm bảo
                    setTimeout(function() {
                        const currentUrl = window.location.href;
                        const currentPath = window.location.pathname;
                        console.log("Backup check - Current URL:", currentUrl);
                        console.log("Backup check - Current path:", currentPath);
                        
                        if (currentUrl.includes('signin.html') || currentPath.includes('signin.html')) {
                            console.log("Backup redirect triggered - still on signin page, forcing redirect...");
                            window.location.replace(finalRedirectUrl);
                        } else {
                            console.log("Redirect successful - no longer on signin page");
                        }
                    }, 100);
                } else {
                    // Nếu không proceed, log chi tiết để debug
                    console.error("=== LOGIN CHECK FAILED ===");
                    console.error("hasToken:", hasToken);
                    console.error("hasSuccess:", hasSuccess);
                    console.error("hasStatusOk:", hasStatusOk);
                    console.error("Full response:", response);
                    alert("Đăng nhập thất bại: " + (response.desc || "Không thể xác thực"));
                    
                    // Hiển thị message từ backend hoặc message mặc định
                    const errorMsg = response?.desc || response?.description || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
                    console.error("Error message:", errorMsg);
                    
                    // Nhưng nếu có token thì vẫn redirect (fallback)
                    if (hasToken && response.data) {
                        console.log("=== FALLBACK: REDIRECTING WITH TOKEN ===");
                        setToken(response.data);
                        window.location.href = "./index.html";
                    } else {
                        alert(errorMsg);
                    }
                }
                console.log("=== LOGIN DEBUG END ===");
            })
            .fail(function (xhr) {
                console.error("Login error:", xhr);
                let errorMsg = "Không thể kết nối đến server!";
                
                // Parse error response nếu có
                if (xhr.responseJSON) {
                    const errorResponse = xhr.responseJSON;
                    errorMsg = errorResponse.desc || errorResponse.description || errorResponse.message || errorMsg;
                } else if (xhr.status === 400 || xhr.status === 401) {
                    errorMsg = "Sai tên đăng nhập hoặc mật khẩu!";
                } else if (xhr.status === 403) {
                    errorMsg = "Không có quyền truy cập!";
                } else if (xhr.status === 500) {
                    errorMsg = "Lỗi server! Vui lòng thử lại sau.";
                }
                
                alert(errorMsg);
            });
    });

    // Clear any pre-filled values in signup form
    $('#signup-fullname').val('');
    $('#signup-email').val('');
    $('#signup-password').val('');
    
    // Signup handler (if exists on signup page)
    $("#btn-signup").click(function (e) {
        e.preventDefault();
        
        // Lấy các input fields theo ID hoặc fallback
        const fullname = $("#signup-fullname").val() || $("input[placeholder*='Name']").val();
        const username = $("#signup-email").val() || $("input[type='email']").val();
        const password = $("#signup-password").val() || $("input[type='password']").first().val();

        if (!fullname || !username || !password) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        ApiService.signup({
            userName: username,
            fullname: fullname,
            password: password
        })
            .done(function (response) {
                console.log("Signup response:", response);
                // Response format: { status, isSuccess, desc, data }
                if (response && response.isSuccess && response.data === true) {
                    alert("Đăng ký thành công! Vui lòng đăng nhập.");
                    window.location.href = "./signin.html";
                } else {
                    const errorMsg = response.desc || response.description || "Đăng ký thất bại!";
                    alert(errorMsg);
                    console.error("Signup failed:", response);
                }
            })
            .fail(function (xhr) {
                console.error("Signup error:", xhr);
                let errorMsg = "Có lỗi xảy ra khi đăng ký!";
                
                // Parse error response if available
                if (xhr.responseJSON) {
                    const errorResponse = xhr.responseJSON;
                    errorMsg = errorResponse.desc || errorResponse.description || errorResponse.message || errorMsg;
                } else if (xhr.status === 403) {
                    errorMsg = "Không có quyền thực hiện thao tác này!";
                } else if (xhr.status === 400) {
                    errorMsg = "Thông tin đăng ký không hợp lệ!";
                } else if (xhr.status === 500) {
                    errorMsg = "Lỗi server! Vui lòng thử lại sau.";
                }
                
                alert(errorMsg);
            });
    });

    // Check authentication on page load
    if (!isAuthenticated() && window.location.pathname !== '/signin.html' && window.location.pathname !== '/signup.html') {
        // Redirect to login if not authenticated
        // window.location.href = "./signin.html";
    }
});

 