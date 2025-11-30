import 'package:order_food/utils/shared_preferences_helper.dart';

class ApiService {
  Future<Map<String, String>> getHeaders() async {
    final token = await SharedPreferencesHelper().getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }
}

