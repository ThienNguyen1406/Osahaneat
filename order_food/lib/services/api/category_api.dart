import 'package:order_food/models/Category.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class CategoryApi {
  /// Lấy danh sách categories - Backend: GET /category
  Future<List<Category>> getCategories() async {
    try {
      final res = await http
          .get(
            Uri.parse('${Constant().baseUrl}/category'),
            headers: await ApiService().getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final categoriesData = ResponseHelper.getData(responseData);
          if (categoriesData is List) {
            return categoriesData.map((e) => Category.fromJson(e)).toList();
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting categories: $e');
      return [];
    }
  }
}

