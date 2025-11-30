import 'package:flutter/material.dart';
import 'package:order_food/models/Restaurant.dart';
import 'package:order_food/services/api/restaurant_api.dart';
import 'package:order_food/utils/image_helper.dart';
import 'package:order_food/routes/app_route.dart';
import 'package:order_food/utils/responsive.dart';

class RestaurantListScreen extends StatefulWidget {
  const RestaurantListScreen({super.key});

  @override
  State<RestaurantListScreen> createState() => _RestaurantListScreenState();
}

class _RestaurantListScreenState extends State<RestaurantListScreen> {
  final RestaurantApi _restaurantApi = RestaurantApi();
  List<Restaurant> _restaurants = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRestaurants();
  }

  Future<void> _loadRestaurants() async {
    setState(() => _isLoading = true);
    try {
      final restaurants = await _restaurantApi.getRestaurants();
      if (mounted) {
        setState(() {
          _restaurants = restaurants;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi tải danh sách nhà hàng: $e')),
        );
      }
    }
  }

  String _getImageUrl(String? imagePath) {
    return ImageHelper.getImageUrl(imagePath);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhà hàng'),
        backgroundColor: const Color(0xFFFF5722),
        foregroundColor: Colors.white,
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _restaurants.isEmpty
              ? const Center(child: Text('Không có nhà hàng nào'))
              : RefreshIndicator(
                onRefresh: _loadRestaurants,
                child:
                    Responsive.isMobile(context)
                        ? ListView.builder(
                          padding: EdgeInsets.all(
                            Responsive.getPadding(context),
                          ),
                          itemCount: _restaurants.length,
                          itemBuilder: (context, index) {
                            final restaurant = _restaurants[index];
                            return _buildRestaurantCard(context, restaurant);
                          },
                        )
                        : GridView.builder(
                          padding: EdgeInsets.all(
                            Responsive.getPadding(context),
                          ),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: Responsive.getGridColumns(
                                  context,
                                ),
                                childAspectRatio:
                                    Responsive.isDesktop(context) ? 1.4 : 1.2,
                                crossAxisSpacing: Responsive.getSpacing(
                                  context,
                                ),
                                mainAxisSpacing: Responsive.getSpacing(context),
                              ),
                          itemCount: _restaurants.length,
                          itemBuilder: (context, index) {
                            final restaurant = _restaurants[index];
                            return _buildRestaurantCard(context, restaurant);
                          },
                        ),
              ),
    );
  }

  Widget _buildRestaurantCard(BuildContext context, Restaurant restaurant) {
    final imageHeight =
        Responsive.isDesktop(context)
            ? 160.0
            : Responsive.isTablet(context)
            ? 140.0
            : 120.0;

    return Card(
      margin: EdgeInsets.zero,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoute.restaurantDetail,
            arguments: restaurant.id,
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
              child:
                  restaurant.image != null && restaurant.image!.isNotEmpty
                      ? Image.network(
                        _getImageUrl(restaurant.image),
                        width: double.infinity,
                        height: imageHeight,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: imageHeight,
                            color: Colors.grey[300],
                            child: const Icon(
                              Icons.restaurant,
                              size: 64,
                              color: Colors.grey,
                            ),
                          );
                        },
                      )
                      : Container(
                        height: imageHeight,
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.restaurant,
                          size: 64,
                          color: Colors.grey,
                        ),
                      ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          restaurant.title,
                          style: TextStyle(
                            fontSize: Responsive.isMobile(context) ? 13 : 15,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (restaurant.rating != null) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 2),
                        Text(
                          restaurant.rating!.toStringAsFixed(1),
                          style: TextStyle(
                            fontSize: Responsive.isMobile(context) ? 11 : 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (restaurant.freeShip == true) ...[
                    const SizedBox(height: 6),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF5722).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: const Text(
                          'Freeship',
                          style: TextStyle(
                            fontSize: 9,
                            color: Color(0xFFFF5722),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
