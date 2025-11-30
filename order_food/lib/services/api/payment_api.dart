import 'dart:convert';
import 'package:order_food/models/Payment.dart';
import 'package:order_food/services/api/user_api.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class PaymentApi {
  /// Xử lý thanh toán - Backend: POST /payment/process
  Future<PaymentResponse> processPayment({
    required int orderId,
    required String paymentMethod,
    String? stripeToken,
    String? bankName,
    String? accountNumber,
    String? transactionId,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final body = <String, dynamic>{
        'userId': userId,
        'orderId': orderId,
        'paymentMethod': paymentMethod,
      };

      if (paymentMethod == 'CREDIT_CARD' && stripeToken != null) {
        body['stripeToken'] = stripeToken;
      }

      if (paymentMethod == 'BANK_TRANSFER') {
        if (bankName != null) body['bankName'] = bankName;
        if (accountNumber != null) body['accountNumber'] = accountNumber;
        if (transactionId != null) body['transactionId'] = transactionId;
      }

      final response = await http.post(
        Uri.parse('${Constant().baseUrl}/payment/process'),
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final paymentData = ResponseHelper.getData(responseData);
        if (paymentData is Map<String, dynamic>) {
          return PaymentResponse.fromJson(paymentData);
        }
        throw Exception('Invalid payment response format');
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error processing payment: $e');
      throw Exception('Error processing payment: $e');
    }
  }

  /// Thanh toán COD - Backend: POST /payment/cod
  Future<PaymentResponse> processCOD(int orderId) async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final response = await http.post(
        Uri.parse('${Constant().baseUrl}/payment/cod'),
        headers: headers,
        body: jsonEncode({
          'userId': userId,
          'orderId': orderId,
          'paymentMethod': 'COD',
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final paymentData = ResponseHelper.getData(responseData);
        if (paymentData is Map<String, dynamic>) {
          return PaymentResponse.fromJson(paymentData);
        }
        throw Exception('Invalid payment response format');
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error processing COD: $e');
      throw Exception('Error processing COD: $e');
    }
  }

  /// Thanh toán thẻ tín dụng - Backend: POST /payment/credit-card
  Future<PaymentResponse> processCreditCard(int orderId, String stripeToken) async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final response = await http.post(
        Uri.parse('${Constant().baseUrl}/payment/credit-card'),
        headers: headers,
        body: jsonEncode({
          'userId': userId,
          'orderId': orderId,
          'paymentMethod': 'CREDIT_CARD',
          'stripeToken': stripeToken,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final paymentData = ResponseHelper.getData(responseData);
        if (paymentData is Map<String, dynamic>) {
          return PaymentResponse.fromJson(paymentData);
        }
        throw Exception('Invalid payment response format');
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error processing credit card: $e');
      throw Exception('Error processing credit card: $e');
    }
  }

  /// Thanh toán chuyển khoản - Backend: POST /payment/bank-transfer
  Future<PaymentResponse> processBankTransfer({
    required int orderId,
    String? bankName,
    String? accountNumber,
    required String transactionId,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final userId = int.tryParse(user.maTaiKhoan) ?? 0;
      if (userId <= 0) throw Exception('Invalid user ID');

      final body = <String, dynamic>{
        'userId': userId,
        'orderId': orderId,
        'paymentMethod': 'BANK_TRANSFER',
        'transactionId': transactionId,
      };

      if (bankName != null) body['bankName'] = bankName;
      if (accountNumber != null) body['accountNumber'] = accountNumber;

      final response = await http.post(
        Uri.parse('${Constant().baseUrl}/payment/bank-transfer'),
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final paymentData = ResponseHelper.getData(responseData);
        if (paymentData is Map<String, dynamic>) {
          return PaymentResponse.fromJson(paymentData);
        }
        throw Exception('Invalid payment response format');
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error processing bank transfer: $e');
      throw Exception('Error processing bank transfer: $e');
    }
  }
}

