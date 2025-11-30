import 'package:order_food/utils/constant.dart';

/// Helper class để xử lý URL hình ảnh
class ImageHelper {
  /// Chuyển đổi đường dẫn hình ảnh thành URL đầy đủ
  /// 
  /// Hỗ trợ các format:
  /// - URL đầy đủ (http/https): trả về nguyên bản
  /// - Đường dẫn tuyệt đối (/menu/file/...): thêm baseUrl
  /// - Đường dẫn tương đối (menu/file/...): thêm baseUrl và "/"
  static String getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return '';
    }
    
    // Nếu đã là URL đầy đủ, trả về nguyên bản
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    final baseUrl = Constant().baseUrl;
    
    // Nếu bắt đầu bằng "/", nối trực tiếp
    if (imagePath.startsWith('/')) {
      return '$baseUrl$imagePath';
    }
    
    // Nếu đã có /menu/file/ trong đường dẫn, chỉ cần thêm baseUrl
    if (imagePath.startsWith('menu/file/')) {
      return '$baseUrl/$imagePath';
    }
    
    // Nếu chỉ là tên file (có extension như .jpg, .png, .jpeg) và không có "/"
    // Thì đây là file menu, cần thêm /menu/file/
    if (imagePath.contains('.') && !imagePath.contains('/')) {
      // Kiểm tra xem có phải là file ảnh không
      final extension = imagePath.split('.').last.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].contains(extension)) {
        return '$baseUrl/menu/file/$imagePath';
      }
    }
    
    // Nếu đường dẫn có chứa "menu" hoặc "file" nhưng chưa đúng format
    if (imagePath.contains('menu') || imagePath.contains('file')) {
      // Lấy tên file từ đường dẫn
      final fileName = imagePath.split('/').last;
      return '$baseUrl/menu/file/$fileName';
    }
    
    // Mặc định: nếu chỉ là tên file (không có "/"), thêm /menu/file/
    if (!imagePath.contains('/')) {
      return '$baseUrl/menu/file/$imagePath';
    }
    
    // Nếu không bắt đầu bằng "/", thêm "/" vào giữa
    return '$baseUrl/$imagePath';
  }
  
  /// Kiểm tra xem URL có hợp lệ không
  static bool isValidImageUrl(String? url) {
    if (url == null || url.isEmpty) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }
}

