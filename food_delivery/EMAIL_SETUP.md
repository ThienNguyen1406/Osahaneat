# Hướng dẫn cấu hình Email (Gmail)

## Lỗi hiện tại
```
Authentication failed
535-5.7.8 Username and Password not accepted
```

## Nguyên nhân
- Email/password trong `application.properties` chưa được cấu hình đúng
- Google yêu cầu **App Password** thay vì mật khẩu thông thường

## Cách sửa

### Bước 1: Bật 2-Step Verification cho Gmail
1. Vào https://myaccount.google.com/security
2. Bật **2-Step Verification** (nếu chưa bật)

### Bước 2: Tạo App Password
1. Vào https://myaccount.google.com/apppasswords
2. Chọn **Mail** và **Other (Custom name)**
3. Nhập tên: `OSAHANEAT`
4. Click **Generate**
5. Copy **16 ký tự password** (ví dụ: `abcd efgh ijkl mnop`)

### Bước 3: Cập nhật application.properties
Mở file `food_delivery/src/main/resources/application.properties` và cập nhật:

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com          # ← Thay bằng email của bạn
spring.mail.password=abcd efgh ijkl mnop           # ← Thay bằng App Password (16 ký tự, bỏ dấu cách)
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com

# Email sender info
email.from.address=your-email@gmail.com            # ← Thay bằng email của bạn
email.from.name=OSAHANEAT System
```

**Lưu ý:**
- `spring.mail.password` phải là **App Password** (16 ký tự), KHÔNG phải mật khẩu Gmail thông thường
- Bỏ tất cả dấu cách trong App Password (ví dụ: `abcdefghijklmnop`)

### Bước 4: Restart Backend
Sau khi cập nhật, restart backend để áp dụng cấu hình mới.

## Kiểm tra
Sau khi cấu hình, thử lại chức năng "Duyệt yêu cầu quên mật khẩu". Email sẽ được gửi thành công.

## Lưu ý quan trọng
- **Mật khẩu đã được reset thành công** dù email không gửi được
- Mật khẩu mới được hiển thị trong **console logs** nếu email fail
- Admin có thể xem mật khẩu mới trong logs và thông báo cho user thủ công

## Troubleshooting

### Nếu vẫn lỗi:
1. Kiểm tra App Password đã được tạo đúng chưa
2. Đảm bảo đã bật 2-Step Verification
3. Kiểm tra email có bị chặn bởi firewall không
4. Thử dùng email khác (Outlook, Yahoo, etc.) với cấu hình tương ứng

### Cấu hình cho Outlook:
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

### Cấu hình cho Yahoo:
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=your-email@yahoo.com
spring.mail.password=your-app-password
```

