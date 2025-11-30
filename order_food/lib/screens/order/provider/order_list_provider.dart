import 'package:flutter/foundation.dart';
import 'package:order_food/models/Order.dart';
import 'package:order_food/services/api/order_api.dart';
import 'package:order_food/services/api/user_api.dart';

class OrderListProvider with ChangeNotifier {
  final OrderApi _orderApi = OrderApi();

  List<Order> _orders = [];
  bool _isLoading = true;
  String _error = '';

  // Getters
  List<Order> get orders => _orders;
  bool get isLoading => _isLoading;
  String get error => _error;

  // Load orders
  Future<void> loadOrders() async {
    final user = await UserApi().getCurrentUser();
    if (user == null) {
      _setLoading(false);
      _error = 'Vui lòng đăng nhập';
      return;
    }

    _setLoading(true);
    _error = '';
    try {
      _orders = await _orderApi.getOrdersByUser();
      _error = '';
    } catch (e) {
      _error = e.toString();
      _orders = [];
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}

