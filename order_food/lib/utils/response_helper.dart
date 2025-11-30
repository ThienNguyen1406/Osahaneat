import 'dart:convert';

/// Helper class để parse ResponseData từ backend
/// Backend trả về format: { status, isSuccess/success, desc, data }
class ResponseHelper {
  /// Parse ResponseData từ JSON
  static Map<String, dynamic> parseResponse(String responseBody) {
    try {
      final data = jsonDecode(responseBody);
      return data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Lỗi parse response: $e');
    }
  }

  /// Kiểm tra response có thành công không
  static bool isSuccess(Map<String, dynamic> response) {
    final isSuccess = response['isSuccess'] ?? response['success'] ?? false;
    final status = response['status'] ?? 0;
    return (isSuccess == true || isSuccess == 'true') && status == 200;
  }

  /// Lấy data từ response
  static dynamic getData(Map<String, dynamic> response) {
    return response['data'];
  }

  /// Lấy message/desc từ response
  static String getMessage(Map<String, dynamic> response) {
    return response['desc']?.toString() ?? 
           response['message']?.toString() ?? 
           'Không có thông báo';
  }

  /// Lấy status code từ response
  static int getStatus(Map<String, dynamic> response) {
    return response['status'] ?? 0;
  }
}

