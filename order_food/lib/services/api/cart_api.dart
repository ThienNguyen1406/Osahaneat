import 'dart:convert';
import 'package:order_food/models/Cart.dart';
import 'package:order_food/services/api/user_api.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class CartApi {
  /// Lấy giỏ hàng - Backend: GET /cart?userId={id}
  Future<CartResponse> getCart() async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();
      
      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final uri = Uri.parse('${Constant().baseUrl}/cart')
          .replace(queryParameters: {'userId': userId.toString()});
      
      final response = await http.get(uri, headers: headers)
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final cartData = ResponseHelper.getData(responseData);
        if (cartData == null) {
          return CartResponse(
            maTaiKhoan: user.maTaiKhoan,
            tongTien: 0,
            tongSoLuong: 0,
            sanPham: [],
          );
        }

        final cartMap = cartData is Map<String, dynamic> 
            ? cartData 
            : jsonDecode(jsonEncode(cartData)) as Map<String, dynamic>;
        
        return CartResponse.fromJson(cartMap);
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error getting cart: $e');
      throw Exception('Error getting cart: $e');
    }
  }

  /// Thêm món vào giỏ hàng - Backend: POST /cart/item
  Future<bool> addToCart(int foodId, int quantity) async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();
      
      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final response = await http.post(
        Uri.parse('${Constant().baseUrl}/cart/item'),
        headers: headers,
        body: jsonEncode({
          'userId': userId,
          'foodId': foodId,
          'quantity': quantity,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        return ResponseHelper.isSuccess(responseData);
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      throw Exception('Error adding to cart: $e');
    }
  }

  /// Xóa món khỏi giỏ hàng - Backend: DELETE /cart/item/{itemId}
  Future<bool> removeFromCart(int itemId) async {
    try {
      final headers = await ApiService().getHeaders();

      final response = await http.delete(
        Uri.parse('${Constant().baseUrl}/cart/item/$itemId'),
        headers: headers,
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        return ResponseHelper.isSuccess(responseData);
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      throw Exception('Error removing from cart: $e');
    }
  }

  /// Cập nhật số lượng - Backend: PUT /cart/item/{itemId}
  Future<bool> updateCartItem(int itemId, int quantity) async {
    try {
      final headers = await ApiService().getHeaders();

      final response = await http.put(
        Uri.parse('${Constant().baseUrl}/cart/item/$itemId'),
        headers: headers,
        body: jsonEncode({'quantity': quantity}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        return ResponseHelper.isSuccess(responseData);
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      throw Exception('Error updating cart item: $e');
    }
  }

  /// Xóa toàn bộ giỏ hàng - Backend: DELETE /cart?userId={id}
  Future<bool> clearCart() async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();
      
      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final uri = Uri.parse('${Constant().baseUrl}/cart')
          .replace(queryParameters: {'userId': userId.toString()});

      final response = await http.delete(uri, headers: headers)
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        return ResponseHelper.isSuccess(responseData);
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      throw Exception('Error clearing cart: $e');
    }
  }
}

