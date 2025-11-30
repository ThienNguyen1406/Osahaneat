# Food Delivery Backend - Hướng dẫn chạy Local

## Yêu cầu hệ thống

- Java 17 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+ 
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## Cài đặt và chạy

### 1. Cài đặt Database

Tạo database MySQL:
```sql
CREATE DATABASE osahaneat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình Database

Cập nhật thông tin database trong `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/osahaneat
spring.datasource.username=root
spring.datasource.password=1234  # Thay đổi theo password MySQL của bạn
```

### 3. Cấu hình Admin Account

Admin account mặc định (có thể thay đổi trong `application.properties`):
- Email: `admin@gmail.com`
- Password: `123456`

### 4. Chạy ứng dụng

#### Cách 1: Sử dụng Maven
```bash
cd food_delivery
mvn clean install
mvn spring-boot:run
```

#### Cách 2: Sử dụng IDE
1. Mở project trong IntelliJ IDEA hoặc Eclipse
2. Chạy class `FoodDeliveryApplication.java`

#### Cách 3: Sử dụng JAR
```bash
cd food_delivery
mvn clean package
java -jar target/food_delivery-0.0.1-SNAPSHOT.jar
```

### 5. Kiểm tra

Ứng dụng sẽ chạy tại: `http://localhost:82`

Test API:
```bash
# Test login
curl -X POST http://localhost:82/login/signin \
  -d "username=admin@gmail.com&password=123456"

# Test get restaurants (public)
curl http://localhost:82/restaurant

# Test get categories (public)
curl http://localhost:82/category
```

## API Endpoints

### Public Endpoints (Không cần token)
- `POST /login/signin` - Đăng nhập
- `POST /auth/signup` - Đăng ký
- `POST /auth/introspect` - Kiểm tra token
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh` - Refresh token
- `GET /restaurant` - Lấy danh sách restaurants
- `GET /restaurant/detail?id={id}` - Lấy chi tiết restaurant
- `GET /restaurant/file/{filename}` - Lấy ảnh restaurant
- `GET /category` - Lấy danh sách categories
- `GET /menu/file/{filename}` - Lấy ảnh menu
- `POST /order` - Tạo đơn hàng

### Admin Only Endpoints (Cần token với role ADMIN)
- `GET /user` - Lấy danh sách users
- `GET /user/{id}` - Lấy user theo ID
- `PUT /user/{id}` - Cập nhật user
- `DELETE /user/{id}` - Xóa user
- `POST /restaurant` - Tạo restaurant
- `PUT /restaurant/{id}` - Cập nhật restaurant
- `DELETE /restaurant/{id}` - Xóa restaurant
- `POST /menu` - Tạo menu
- `PUT /menu/{id}` - Cập nhật menu
- `DELETE /menu/{id}` - Xóa menu
- `POST /category` - Tạo category
- `PUT /category/{id}` - Cập nhật category
- `DELETE /category/{id}` - Xóa category

## Authentication

### Lấy Token
```bash
POST /login/signin
Body: username=admin@gmail.com&password=123456
Response: { "data": "JWT_TOKEN_STRING" }
```

### Sử dụng Token
Thêm header vào mỗi request:
```
Authorization: Bearer JWT_TOKEN_STRING
```

## Database Schema

Hibernate sẽ tự động tạo tables khi chạy ứng dụng lần đầu (do `spring.jpa.hibernate.ddl-auto=update`).

Các tables chính:
- `users` - Người dùng
- `roles` - Vai trò (ADMIN, USER)
- `permissions` - Quyền
- `restaurant` - Nhà hàng
- `food` - Món ăn
- `category` - Danh mục
- `orders` - Đơn hàng
- `order_item` - Chi tiết đơn hàng
- `cart` - Giỏ hàng
- `cart_item` - Chi tiết giỏ hàng
- `rating_food` - Đánh giá món ăn
- `rating_restaurant` - Đánh giá nhà hàng
- `menu_restaurant` - Menu nhà hàng

## File Upload

Files được lưu tại: `../uploads` (relative to project root)

## Troubleshooting

### Lỗi kết nối Database
- Kiểm tra MySQL đang chạy
- Kiểm tra username/password trong `application.properties`
- Đảm bảo database `osahaneat` đã được tạo

### Lỗi Port 82 đã được sử dụng
- Thay đổi port trong `application.properties`: `server.port=8080`

### Lỗi JWT
- Kiểm tra `jwt.privateKey` trong `application.properties`
- Đảm bảo key có đủ 32 bytes (Base64)

### Lỗi Admin không có quyền
- Kiểm tra admin user đã được tạo và có role ADMIN
- Xem logs khi ứng dụng khởi động: `Admin user initialized: admin@gmail.com`

## Development

### Hot Reload
Ứng dụng đã có Spring DevTools, tự động reload khi code thay đổi.

### Logging
Logs được ghi ra console. Để xem SQL queries:
```properties
spring.jpa.show-sql=true
```

## Notes

- Admin user tự động được tạo khi ứng dụng khởi động lần đầu
- Roles (ADMIN, USER) tự động được tạo nếu chưa tồn tại
- Database schema tự động update khi có thay đổi entity

