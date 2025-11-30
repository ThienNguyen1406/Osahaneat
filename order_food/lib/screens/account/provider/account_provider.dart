import 'package:flutter/foundation.dart';
import 'package:order_food/services/api/user_api.dart';
import 'package:order_food/models/User.dart';

class AccountProvider with ChangeNotifier {
  final UserApi _userApi = UserApi();

  User? _userInfo;
  bool _isLoading = true;
  String _error = '';

  // Getters
  User? get userInfo => _userInfo;
  bool get isLoading => _isLoading;
  String get error => _error;

  // Load user info
  Future<void> loadUserInfo() async {
    _setLoading(true);
    _error = '';
    try {
      _userInfo = await _userApi.getCurrentUser();
      _error = '';
    } catch (e) {
      _error = e.toString();
      _userInfo = null;
    } finally {
      _setLoading(false);
    }
  }

  // Logout
  Future<void> logout() async {
    await _userApi.logout();
    _userInfo = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}

