import 'dart:convert';
import 'package:order_food/models/PaymentMethod.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class PaymentMethodApi {
  /// Lấy tất cả phương thức thanh toán của user hiện tại
  Future<List<PaymentMethod>> getMyPaymentMethods() async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/user/payment-method'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data is List) {
            return data.map((e) => PaymentMethod.fromJson(e)).toList();
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting payment methods: $e');
      return [];
    }
  }

  /// Lấy phương thức thanh toán mặc định
  Future<PaymentMethod?> getDefaultPaymentMethod() async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/user/payment-method/default'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data != null) {
            return PaymentMethod.fromJson(data);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error getting default payment method: $e');
      return null;
    }
  }

  /// Tạo phương thức thanh toán mới
  Future<PaymentMethod?> createPaymentMethod({
    required String type,
    required String cardNumber,
    required String cardHolderName,
    required int expiryMonth,
    required int expiryYear,
    String? cardBrand,
    bool isDefault = false,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .post(
            Uri.parse('${Constant().baseUrl}/user/payment-method'),
            headers: headers,
            body: jsonEncode({
              'type': type,
              'cardNumber': cardNumber,
              'cardHolderName': cardHolderName,
              'expiryMonth': expiryMonth,
              'expiryYear': expiryYear,
              'cardBrand': cardBrand,
              'isDefault': isDefault,
            }),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data != null) {
            return PaymentMethod.fromJson(data);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error creating payment method: $e');
      return null;
    }
  }

  /// Cập nhật phương thức thanh toán
  Future<PaymentMethod?> updatePaymentMethod({
    required int id,
    required String type,
    required String cardNumber,
    required String cardHolderName,
    required int expiryMonth,
    required int expiryYear,
    String? cardBrand,
    bool isDefault = false,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .put(
            Uri.parse('${Constant().baseUrl}/user/payment-method/$id'),
            headers: headers,
            body: jsonEncode({
              'type': type,
              'cardNumber': cardNumber,
              'cardHolderName': cardHolderName,
              'expiryMonth': expiryMonth,
              'expiryYear': expiryYear,
              'cardBrand': cardBrand,
              'isDefault': isDefault,
            }),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data != null) {
            return PaymentMethod.fromJson(data);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error updating payment method: $e');
      return null;
    }
  }

  /// Xóa phương thức thanh toán
  Future<bool> deletePaymentMethod(int id) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .delete(
            Uri.parse('${Constant().baseUrl}/user/payment-method/$id'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      return response.statusCode == 200;
    } catch (e) {
      print('Error deleting payment method: $e');
      return false;
    }
  }

  /// Đặt phương thức thanh toán làm mặc định
  Future<bool> setDefaultPaymentMethod(int id) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .put(
            Uri.parse('${Constant().baseUrl}/user/payment-method/$id/set-default'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      return response.statusCode == 200;
    } catch (e) {
      print('Error setting default payment method: $e');
      return false;
    }
  }
}

