import 'package:flutter/foundation.dart';
import 'package:order_food/models/Product.dart';
import 'package:order_food/services/api/product_api.dart';
import 'package:order_food/services/api/cart_api.dart';
import 'package:order_food/services/api/user_api.dart';

class ProductDetailProvider with ChangeNotifier {
  final ProductApi _productApi = ProductApi();
  final CartApi _cartApi = CartApi();

  Product? _product;
  bool _isLoading = true;
  bool _isAddingToCart = false;
  int _quantity = 1;
  String _error = '';

  // Getters
  Product? get product => _product;
  bool get isLoading => _isLoading;
  bool get isAddingToCart => _isAddingToCart;
  int get quantity => _quantity;
  String get error => _error;

  // Load product by ID
  Future<void> loadProduct(String productId) async {
    _setLoading(true);
    _error = '';
    try {
      print('Loading product with ID: $productId');
      _product = await _productApi.getProductById(productId);
      if (_product == null) {
        _error = 'Không tìm thấy sản phẩm với ID: $productId';
        print('Product not found: $productId');
      } else {
        _error = '';
        print('Product loaded successfully: ${_product!.tenSanPham}');
      }
    } catch (e) {
      _error = 'Lỗi khi tải sản phẩm: ${e.toString()}';
      _product = null;
      print('Error loading product: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Increase quantity
  void increaseQuantity() {
    _quantity++;
    notifyListeners();
  }

  // Decrease quantity
  void decreaseQuantity() {
    if (_quantity > 1) {
      _quantity--;
      notifyListeners();
    }
  }

  // Add to cart
  Future<bool> addToCart() async {
    if (_isAddingToCart || _product == null) return false;

    final user = await UserApi().getCurrentUser();
    if (user == null) {
      _error = 'Vui lòng đăng nhập để thêm vào giỏ hàng';
      notifyListeners();
      return false;
    }

    _isAddingToCart = true;
    _error = '';
    notifyListeners();

    try {
      final foodId = int.tryParse(_product!.maSanPham) ?? 0;
      if (foodId <= 0) {
        throw Exception('Invalid product ID');
      }

      final success = await _cartApi.addToCart(foodId, _quantity);
      _isAddingToCart = false;

      if (success) {
        _error = '';
        notifyListeners();
        return true;
      } else {
        _error = 'Thêm vào giỏ hàng thất bại';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isAddingToCart = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}

