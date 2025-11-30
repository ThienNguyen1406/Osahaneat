import 'package:order_food/models/Restaurant.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class RestaurantApi {
  /// Lấy danh sách nhà hàng - Backend: GET /restaurant
  Future<List<Restaurant>> getRestaurants() async {
    try {
      final res = await http
          .get(
            Uri.parse('${Constant().baseUrl}/restaurant'),
            headers: await ApiService().getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final restaurantsData = ResponseHelper.getData(responseData);
          if (restaurantsData is List) {
            return restaurantsData
                .map((item) => Restaurant.fromJson(item as Map<String, dynamic>))
                .toList();
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting restaurants: $e');
      return [];
    }
  }

  /// Lấy chi tiết nhà hàng - Backend: GET /restaurant/detail?id={id}
  Future<Restaurant?> getRestaurantDetail(int id) async {
    try {
      final uri = Uri.parse('${Constant().baseUrl}/restaurant/detail')
          .replace(queryParameters: {'id': id.toString()});
      
      final res = await http
          .get(uri, headers: await ApiService().getHeaders())
          .timeout(const Duration(seconds: 30));

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final restaurantData = ResponseHelper.getData(responseData);
          if (restaurantData is Map<String, dynamic>) {
            return Restaurant.fromJson(restaurantData);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error getting restaurant detail: $e');
      return null;
    }
  }
}

