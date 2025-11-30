import 'package:flutter/foundation.dart';
import 'package:order_food/models/Product.dart';
import 'package:order_food/services/api/product_api.dart';

class SearchProvider with ChangeNotifier {
  final ProductApi _productApi = ProductApi();

  List<Product> _searchResults = [];
  bool _isSearching = false;
  bool _hasSearched = false;
  String _currentQuery = '';
  String _error = '';

  // Getters
  List<Product> get searchResults => _searchResults;
  bool get isSearching => _isSearching;
  bool get hasSearched => _hasSearched;
  String get currentQuery => _currentQuery;
  String get error => _error;

  // Search products
  Future<void> searchProducts(String query) async {
    if (query.trim().isEmpty) {
      _searchResults = [];
      _hasSearched = false;
      _currentQuery = '';
      _error = '';
      notifyListeners();
      return;
    }

    _isSearching = true;
    _error = '';
    _hasSearched = true;
    _currentQuery = query.trim();
    notifyListeners();

    try {
      _searchResults = await _productApi.searchProducts(query.trim());
      _error = '';
    } catch (e) {
      _error = e.toString();
      _searchResults = [];
    } finally {
      _isSearching = false;
      notifyListeners();
    }
  }

  // Clear search
  void clearSearch() {
    _searchResults = [];
    _hasSearched = false;
    _currentQuery = '';
    _error = '';
    notifyListeners();
  }
}

