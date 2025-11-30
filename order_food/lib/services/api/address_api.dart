import 'dart:convert';
import 'package:order_food/models/Address.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class AddressApi {
  /// Lấy tất cả địa chỉ của user hiện tại
  Future<List<Address>> getMyAddresses() async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/user/address'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data is List) {
            return data.map((e) => Address.fromJson(e)).toList();
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting addresses: $e');
      return [];
    }
  }

  /// Lấy địa chỉ theo loại
  Future<List<Address>> getAddressesByType(String type) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/user/address/type/$type'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data is List) {
            return data.map((e) => Address.fromJson(e)).toList();
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting addresses by type: $e');
      return [];
    }
  }

  /// Lấy địa chỉ mặc định
  Future<Address?> getDefaultAddress() async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/user/address/default'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data != null) {
            return Address.fromJson(data);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error getting default address: $e');
      return null;
    }
  }

  /// Tạo địa chỉ mới
  Future<Address?> createAddress({
    required String title,
    required String address,
    required String type,
    bool isDefault = false,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .post(
            Uri.parse('${Constant().baseUrl}/user/address'),
            headers: headers,
            body: jsonEncode({
              'title': title,
              'address': address,
              'type': type,
              'isDefault': isDefault,
            }),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data != null) {
            return Address.fromJson(data);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error creating address: $e');
      return null;
    }
  }

  /// Cập nhật địa chỉ
  Future<Address?> updateAddress({
    required int id,
    required String title,
    required String address,
    required String type,
    bool isDefault = false,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .put(
            Uri.parse('${Constant().baseUrl}/user/address/$id'),
            headers: headers,
            body: jsonEncode({
              'title': title,
              'address': address,
              'type': type,
              'isDefault': isDefault,
            }),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final data = ResponseHelper.getData(responseData);
          if (data != null) {
            return Address.fromJson(data);
          }
        }
      }
      return null;
    } catch (e) {
      print('Error updating address: $e');
      return null;
    }
  }

  /// Xóa địa chỉ
  Future<bool> deleteAddress(int id) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .delete(
            Uri.parse('${Constant().baseUrl}/user/address/$id'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      return response.statusCode == 200;
    } catch (e) {
      print('Error deleting address: $e');
      return false;
    }
  }

  /// Đặt địa chỉ làm mặc định
  Future<bool> setDefaultAddress(int id) async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .put(
            Uri.parse('${Constant().baseUrl}/user/address/$id/default'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      return response.statusCode == 200;
    } catch (e) {
      print('Error setting default address: $e');
      return false;
    }
  }
}

