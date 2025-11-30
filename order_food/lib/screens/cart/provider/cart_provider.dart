import 'package:flutter/foundation.dart';
import 'package:order_food/models/Cart.dart';
import 'package:order_food/services/api/cart_api.dart';
import 'package:order_food/services/api/user_api.dart';

class CartProvider with ChangeNotifier {
  final CartApi _cartApi = CartApi();

  CartResponse? _cart;
  bool _isLoading = true;
  String _error = '';

  // Getters
  CartResponse? get cart => _cart;
  bool get isLoading => _isLoading;
  String get error => _error;
  int get itemCount => _cart?.sanPham.length ?? 0;
  double get totalAmount => _cart?.tongTien ?? 0.0;

  // Load cart
  Future<void> loadCart() async {
    final user = await UserApi().getCurrentUser();
    if (user == null) {
      _setLoading(false);
      _error = 'Vui lòng đăng nhập';
      return;
    }

    _setLoading(true);
    _error = '';
    try {
      _cart = await _cartApi.getCart();
      _error = '';
    } catch (e) {
      _error = e.toString();
      _cart = null;
    } finally {
      _setLoading(false);
    }
  }

  // Update cart item quantity
  Future<bool> updateQuantity(int itemId, int newQuantity) async {
    _error = '';
    try {
      final success = await _cartApi.updateCartItem(itemId, newQuantity);
      if (success) {
        await loadCart();
      }
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Remove item from cart
  Future<bool> removeItem(int itemId) async {
    _error = '';
    try {
      final success = await _cartApi.removeFromCart(itemId);
      if (success) {
        await loadCart();
      }
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Clear cart
  Future<bool> clearCart() async {
    final user = await UserApi().getCurrentUser();
    if (user == null) return false;

    _error = '';
    try {
      final success = await _cartApi.clearCart();
      if (success) {
        _cart = null;
        notifyListeners();
      }
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}

