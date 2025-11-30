import 'dart:convert';
import 'package:order_food/models/Order.dart';
import 'package:order_food/services/api/user_api.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class OrderApi {
  /// Lấy danh sách đơn hàng của user - Backend: GET /order/user/{userId}
  Future<List<Order>> getOrdersByUser() async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/order/user/$userId'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final ordersData = ResponseHelper.getData(responseData);
        if (ordersData is List) {
          return ordersData.map((e) => Order.fromJson(e)).toList();
        }
        return [];
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error getting orders: $e');
      throw Exception('Error getting orders: $e');
    }
  }

  /// Checkout from cart - Backend: POST /order/checkout
  /// Trả về orderId để có thể gọi payment API
  Future<int?> checkoutFromCart() async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final response = await http
          .post(
            Uri.parse('${Constant().baseUrl}/order/checkout'),
            headers: headers,
            body: jsonEncode({'userId': userId}),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final orderId = ResponseHelper.getData(responseData);
        if (orderId is int) {
          return orderId;
        } else if (orderId is num) {
          return orderId.toInt();
        }
        return null;
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error checkout from cart: $e');
      throw Exception('Error checkout from cart: $e');
    }
  }
}

