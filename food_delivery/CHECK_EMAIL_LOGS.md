# Hướng dẫn kiểm tra lỗi Email

## Vấn đề hiện tại
Email không gửi được khi duyệt yêu cầu quên mật khẩu.

## Cách kiểm tra lỗi

### 1. Xem logs backend console
Sau khi duyệt yêu cầu quên mật khẩu, xem **console logs** của backend và tìm:

```
⚠️ EMAIL SENDING FAILED ⚠️
═══════════════════════════════════════════════════════════
Error: ...
Exception: ...
═══════════════════════════════════════════════════════════
```

### 2. Các lỗi thường gặp

#### Lỗi: `Authentication failed` hoặc `535-5.7.8 Username and Password not accepted`
**Nguyên nhân:** App Password không đúng hoặc đã hết hạn

**Giải pháp:**
1. Kiểm tra App Password phải là **16 ký tự** (không có dấu cách)
2. Hiện tại trong config: `otikpfdzzbstafds` (15 ký tự) - **THIẾU 1 KÝ TỰ**
3. Tạo App Password mới:
   - Vào: https://myaccount.google.com/apppasswords
   - Đảm bảo **2-Step Verification** đã bật
   - Chọn: **Mail** → **Other (Custom name)** → Nhập: `OSAHANEAT`
   - Copy **16 ký tự** (ví dụ: `abcd efgh ijkl mnop`)
   - **Bỏ tất cả dấu cách** → `abcdefghijklmnop`
   - Cập nhật vào `application.properties`:
     ```properties
     spring.mail.password=abcdefghijklmnop
     ```
4. **Restart backend**

#### Lỗi: `Could not convert socket to TLS`
**Nguyên nhân:** Firewall hoặc network chặn port 587

**Giải pháp:** Kiểm tra firewall, cho phép port 587

#### Lỗi: `Connection timeout`
**Nguyên nhân:** Không kết nối được đến smtp.gmail.com

**Giải pháp:** Kiểm tra internet connection

### 3. Test email (sau khi sửa)
Sử dụng endpoint test:
```bash
POST http://localhost:82/user/test-email
Headers:
  Authorization: Bearer <admin-token>
Body:
  {
    "toEmail": "your-email@gmail.com"
  }
```

Hoặc trong browser console (khi đã đăng nhập admin):
```javascript
$.ajax({
    method: 'POST',
    url: 'http://localhost:82/user/test-email',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    contentType: 'application/json',
    data: JSON.stringify({ toEmail: 'your-email@gmail.com' })
})
.done(function(response) {
    console.log('✅ Test email response:', response);
})
.fail(function(xhr) {
    console.error('❌ Test email failed:', xhr.responseJSON);
});
```

### 4. Kiểm tra cấu hình hiện tại
Trong `application.properties`:
```properties
spring.mail.username=viettien200222@gmail.com
spring.mail.password=otikpfdzzbstafds  # ← 15 ký tự (THIẾU 1 KÝ TỰ!)
email.from.address=viettien200222@gmail.com
```

**Cần sửa:** App Password phải là **16 ký tự**

## Lưu ý
- **Mật khẩu vẫn được reset thành công** dù email không gửi được
- Mật khẩu mới hiển thị trong modal cho admin
- Admin cần thông báo mật khẩu cho user thủ công nếu email không gửi được

