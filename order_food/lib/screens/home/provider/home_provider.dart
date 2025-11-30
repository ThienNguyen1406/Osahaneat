import 'package:flutter/foundation.dart' hide Category;
import 'package:order_food/models/Category.dart';
import 'package:order_food/models/Product.dart';
import 'package:order_food/models/Restaurant.dart';
import 'package:order_food/services/api/category_api.dart';
import 'package:order_food/services/api/product_api.dart';
import 'package:order_food/services/api/restaurant_api.dart';

class HomeProvider with ChangeNotifier {
  final CategoryApi _categoryApi = CategoryApi();
  final ProductApi _productApi = ProductApi();
  final RestaurantApi _restaurantApi = RestaurantApi();

  List<Category> _categories = [];
  List<Product> _products = [];
  List<Restaurant> _restaurants = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _error = '';

  // Getters
  List<Category> get categories => _categories;
  List<Product> get products => _products;
  List<Restaurant> get restaurants => _restaurants;
  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String get error => _error;

  // Load all data
  Future<void> loadData() async {
    _setLoading(true);
    _error = '';
    try {
      final categories = await _categoryApi.getCategories();
      final products = await _productApi.getProducts();
      final restaurants = await _restaurantApi.getRestaurants();

      _categories = categories;
      _products = products;
      _restaurants = restaurants.take(6).toList(); // Hiển thị 6 nhà hàng đầu tiên
      _error = '';
    } catch (e) {
      _error = e.toString();
      _categories = [];
      _products = [];
      _restaurants = [];
    } finally {
      _setLoading(false);
    }
  }

  // Search products
  Future<void> searchProducts(String query) async {
    if (query.isEmpty) {
      await loadData();
      _searchQuery = '';
      return;
    }

    _setLoading(true);
    _error = '';
    _searchQuery = query;
    try {
      _products = await _productApi.searchProducts(query);
      _error = '';
    } catch (e) {
      _error = e.toString();
      _products = [];
    } finally {
      _setLoading(false);
    }
  }

  // Clear search
  void clearSearch() {
    _searchQuery = '';
    loadData();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}

