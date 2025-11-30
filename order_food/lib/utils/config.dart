/// Cấu hình cho ứng dụng
/// Thay đổi baseUrl khi deploy lên server
class AppConfig {
  // Development URL (localhost)
  // Backend chạy trên port 82
  static const String devBaseUrl = "http://10.0.2.2:82";

  // Production URL - THAY ĐỔI KHI DEPLOY LÊN SERVER
  static const String prodBaseUrl = "https://your-domain.com";

  // Chế độ hiện tại: true = Production, false = Development
  static const bool isProduction = false;

  // Base URL được sử dụng
  static String get baseUrl => isProduction ? prodBaseUrl : devBaseUrl;

  // URL công khai để hiển thị trong QR code
  static String get publicBaseUrl {
    if (isProduction) {
      return prodBaseUrl;
    }
    return "http://localhost:82";
  }
}

