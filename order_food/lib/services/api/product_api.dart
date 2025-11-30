import 'package:order_food/models/Product.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class ProductApi {
  /// Lấy tất cả products từ category
  Future<List<Product>> getProducts({int? restaurantId}) async {
    try {
      if (restaurantId != null) {
        return await getProductsByRestaurant(restaurantId);
      }

      final res = await http
          .get(
            Uri.parse('${Constant().baseUrl}/category'),
            headers: await ApiService().getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final categoriesData = ResponseHelper.getData(responseData);
          if (categoriesData is List) {
            List<Product> products = [];
            for (var category in categoriesData) {
              if (category is Map<String, dynamic> && category['menus'] != null) {
                final menus = category['menus'] as List;
                for (var menu in menus) {
                  if (menu is Map<String, dynamic>) {
                    products.add(Product.fromJson(menu));
                  }
                }
              }
            }
            return products;
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting products: $e');
      return [];
    }
  }

  /// Lấy products từ restaurant detail
  Future<List<Product>> getProductsByRestaurant(int restaurantId) async {
    try {
      final uri = Uri.parse('${Constant().baseUrl}/restaurant/detail')
          .replace(queryParameters: {'id': restaurantId.toString()});
      
      final res = await http
          .get(uri, headers: await ApiService().getHeaders())
          .timeout(const Duration(seconds: 30));

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final restaurantData = ResponseHelper.getData(responseData);
          if (restaurantData is Map<String, dynamic> && restaurantData['categories'] != null) {
            final categories = restaurantData['categories'] as List;
            List<Product> products = [];
            for (var category in categories) {
              if (category is Map<String, dynamic> && category['menus'] != null) {
                final menus = category['menus'] as List;
                for (var menu in menus) {
                  if (menu is Map<String, dynamic>) {
                    products.add(Product.fromJson(menu));
                  }
                }
              }
            }
            return products;
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting products by restaurant: $e');
      return [];
    }
  }

  /// Lấy product theo ID - Backend: GET /menu/{id}
  Future<Product?> getProductById(String id) async {
    try {
      final url = '${Constant().baseUrl}/menu/$id';
      print('Fetching product from: $url');
      
      final res = await http
          .get(
            Uri.parse(url),
            headers: await ApiService().getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      print('Response status: ${res.statusCode}');
      print('Response body: ${res.body}');

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final menuData = ResponseHelper.getData(responseData);
          if (menuData is Map<String, dynamic>) {
            return Product.fromJson(menuData);
          } else {
            print('Menu data is not a Map: $menuData');
            throw Exception('Dữ liệu sản phẩm không hợp lệ');
          }
        } else {
          final message = ResponseHelper.getMessage(responseData);
          print('API returned error: $message');
          throw Exception(message);
        }
      } else {
        throw Exception('HTTP ${res.statusCode}: ${res.body}');
      }
    } catch (e) {
      print('Error fetching product $id: $e');
      rethrow;
    }
  }

  /// Search products by name - Backend: GET /search/food?keyword={name}
  Future<List<Product>> searchProducts(String name) async {
    try {
      final uri = Uri.parse('${Constant().baseUrl}/search/food')
          .replace(queryParameters: {'keyword': name});
      
      final response = await http.get(
        uri,
        headers: await ApiService().getHeaders(),
      ).timeout(const Duration(seconds: 30));
      
      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final foodsData = ResponseHelper.getData(responseData);
          if (foodsData is List) {
            return foodsData.map((item) {
              if (item is Map<String, dynamic>) {
                return Product.fromJson(item);
              }
              return null;
            }).whereType<Product>().toList();
          }
        }
      }
      return [];
    } catch (e) {
      print('Error searching products: $e');
      return [];
    }
  }

  /// Lấy products theo category ID
  Future<List<Product>> getProductsByCategory(int categoryId) async {
    try {
      final res = await http
          .get(
            Uri.parse('${Constant().baseUrl}/category'),
            headers: await ApiService().getHeaders(),
          )
          .timeout(const Duration(seconds: 30));

      if (res.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(res.body);
        if (ResponseHelper.isSuccess(responseData)) {
          final categoriesData = ResponseHelper.getData(responseData);
          if (categoriesData is List) {
            List<Product> products = [];
            for (var category in categoriesData) {
              if (category is Map<String, dynamic>) {
                final catId = category['id'] ?? 0;
                if (catId == categoryId && category['menus'] != null) {
                  final menus = category['menus'] as List;
                  for (var menu in menus) {
                    if (menu is Map<String, dynamic>) {
                      products.add(Product.fromJson(menu));
                    }
                  }
                  break;
                }
              }
            }
            return products;
          }
        }
      }
      return [];
    } catch (e) {
      print('Error getting products by category: $e');
      return [];
    }
  }
}

