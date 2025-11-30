import 'dart:convert';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:order_food/utils/shared_preferences_helper.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/User.dart';

class UserApi {
  /// Đăng nhập - Backend: POST /login/signin
  Future<User?> login(String username, String password) async {
    try {
      final uri = Uri.parse('${Constant().baseUrl}/login/signin')
          .replace(queryParameters: {
        'username': username,
        'password': password,
      });

      final response = await http
          .post(uri, headers: {'Content-Type': 'application/json'})
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final token = ResponseHelper.getData(responseData);
        if (token == null || token.toString().isEmpty) {
          throw Exception('Không nhận được token từ server');
        }

        // Lưu token
        await SharedPreferencesHelper().setToken(token.toString());
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('isLoggedIn', true);

        // Lấy thông tin user
        try {
          final user = await getMyInfo();
          if (user != null) {
            await _saveUserInfo(user);
            return user;
          }
        } catch (e) {
          print('Warning: Could not get user info after login: $e');
        }

        return null;
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      throw Exception('Lỗi đăng nhập: $e');
    }
  }

  /// Đăng ký - Backend: POST /login/signup
  Future<bool> register(String userName, String password, String fullname, {String? phoneNumber}) async {
    try {
      final response = await http
          .post(
            Uri.parse('${Constant().baseUrl}/login/signup'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'userName': userName,
              'password': password,
              'fullname': fullname,
              if (phoneNumber != null) 'phoneNumber': phoneNumber,
            }),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        return ResponseHelper.isSuccess(responseData);
      }
      return false;
    } catch (e) {
      throw Exception('Lỗi đăng ký: $e');
    }
  }

  /// Lấy thông tin user hiện tại - Backend: GET /user/me
  Future<User?> getMyInfo() async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .get(Uri.parse('${Constant().baseUrl}/user/me'), headers: headers)
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        dynamic userData;
        if (responseData.containsKey('result')) {
          userData = responseData['result'];
        } else if (responseData.containsKey('data')) {
          userData = responseData['data'];
        } else {
          userData = responseData;
        }

        if (userData == null) {
          throw Exception('Không nhận được thông tin user');
        }

        return User.fromJson(userData);
      } else {
        throw Exception('Lỗi lấy thông tin user: ${response.statusCode}');
      }
    } catch (e) {
      print('Error getting user info: $e');
      throw Exception('Lỗi lấy thông tin user: $e');
    }
  }

  Future<void> _saveUserInfo(User user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('maTaiKhoan', user.maTaiKhoan);
      await prefs.setString('tenNguoiDung', user.tenNguoiDung);
      await prefs.setString('email', user.email);
      await prefs.setString('hoTen', user.hoTen);
      await prefs.setString('sdt', user.sdt);
      await prefs.setString('diaChi', user.diaChi);
      await prefs.setString('vaiTro', user.vaiTro);
      if (user.avatar != null) {
        await prefs.setString('avatar', user.avatar!);
      }
    } catch (e) {
      print('Error saving user info: $e');
    }
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

    if (!isLoggedIn) return null;

    return User(
      maTaiKhoan: prefs.getString('maTaiKhoan') ?? '',
      tenNguoiDung: prefs.getString('tenNguoiDung') ?? '',
      matKhau: '',
      email: prefs.getString('email') ?? '',
      hoTen: prefs.getString('hoTen') ?? '',
      sdt: prefs.getString('sdt') ?? '',
      diaChi: prefs.getString('diaChi') ?? '',
      vaiTro: prefs.getString('vaiTro') ?? 'USER',
      avatar: prefs.getString('avatar'),
    );
  }

  Future<bool> logout() async {
    try {
      await SharedPreferencesHelper().clear();
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      return true;
    } catch (e) {
      print('Error during logout: $e');
      return false;
    }
  }

  /// Cập nhật thông tin profile - Backend: PUT /user/profile
  Future<User?> updateProfile({
    String? fullname,
    String? phoneNumber,
    String? email,
    String? address,
    String? password,
    String? avatarPath,
  }) async {
    try {
      final headers = await ApiService().getHeaders();
      
      // Create multipart request
      final uri = Uri.parse('${Constant().baseUrl}/user/profile');
      var request = http.MultipartRequest('PUT', uri);
      
      // Add headers (except Content-Type, which will be set automatically)
      request.headers.addAll({
        'Authorization': headers['Authorization'] ?? '',
      });
      
      // Add fields
      if (fullname != null) request.fields['fullname'] = fullname;
      if (phoneNumber != null) request.fields['phoneNumber'] = phoneNumber;
      if (email != null) request.fields['email'] = email;
      if (address != null) request.fields['address'] = address;
      if (password != null && password.isNotEmpty) {
        request.fields['password'] = password;
      }
      
      // Add avatar file if provided
      if (avatarPath != null && avatarPath.isNotEmpty) {
        try {
          final file = await http.MultipartFile.fromPath('avatar', avatarPath);
          request.files.add(file);
        } catch (e) {
          print('Error adding avatar file: $e');
        }
      }
      
      final streamedResponse = await request.send().timeout(const Duration(seconds: 30));
      final response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        
        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }
        
        dynamic userData = ResponseHelper.getData(responseData);
        if (userData == null) {
          throw Exception('Không nhận được thông tin user sau khi cập nhật');
        }
        
        final updatedUser = User.fromJson(userData);
        await _saveUserInfo(updatedUser);
        return updatedUser;
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error updating profile: $e');
      throw Exception('Lỗi cập nhật thông tin: $e');
    }
  }

  /// Xóa ảnh đại diện - Backend: DELETE /user/avatar
  Future<bool> deleteAvatar() async {
    try {
      final headers = await ApiService().getHeaders();
      final response = await http
          .delete(Uri.parse('${Constant().baseUrl}/user/avatar'), headers: headers)
          .timeout(const Duration(seconds: 30));
      
      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          // Reload user info
          final user = await getMyInfo();
          if (user != null) {
            await _saveUserInfo(user);
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      print('Error deleting avatar: $e');
      return false;
    }
  }
}

