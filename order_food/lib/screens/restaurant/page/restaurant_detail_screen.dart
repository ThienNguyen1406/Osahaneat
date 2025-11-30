import 'package:flutter/material.dart';
import 'package:order_food/models/Restaurant.dart';
import 'package:order_food/models/Product.dart';
import 'package:order_food/services/api/restaurant_api.dart';
import 'package:order_food/services/api/product_api.dart';
import 'package:order_food/utils/image_helper.dart';
import 'package:order_food/widgets/product_card_widget.dart';
import 'package:order_food/routes/app_route.dart';
import 'package:order_food/utils/responsive.dart';

class RestaurantDetailScreen extends StatefulWidget {
  final int restaurantId;

  const RestaurantDetailScreen({
    super.key,
    required this.restaurantId,
  });

  @override
  State<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends State<RestaurantDetailScreen> {
  final RestaurantApi _restaurantApi = RestaurantApi();
  final ProductApi _productApi = ProductApi();
  
  Restaurant? _restaurant;
  List<Product> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final restaurant = await _restaurantApi.getRestaurantDetail(widget.restaurantId);
      final products = await _productApi.getProductsByRestaurant(widget.restaurantId);
      
      if (mounted) {
        setState(() {
          _restaurant = restaurant;
          _products = products;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi tải dữ liệu: $e')),
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
        title: Text(_restaurant?.title ?? 'Chi tiết nhà hàng'),
        backgroundColor: const Color(0xFFFF5722),
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _restaurant == null
              ? const Center(child: Text('Không tìm thấy nhà hàng'))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Restaurant Image
                        _restaurant!.image != null &&
                                _restaurant!.image!.isNotEmpty
                            ? Image.network(
                                _getImageUrl(_restaurant!.image),
                                width: double.infinity,
                                height: 250,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    height: 250,
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
                                height: 250,
                                color: Colors.grey[300],
                                child: const Icon(
                                  Icons.restaurant,
                                  size: 64,
                                  color: Colors.grey,
                                ),
                              ),
                        // Restaurant Info
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _restaurant!.title,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (_restaurant!.subtitle.isNotEmpty)
                                Text(
                                  _restaurant!.subtitle,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  if (_restaurant!.rating != null) ...[
                                    const Icon(
                                      Icons.star,
                                      color: Colors.amber,
                                      size: 24,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      _restaurant!.rating!.toStringAsFixed(1),
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                  ],
                                  if (_restaurant!.freeShip == true)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFF5722)
                                            .withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        'Miễn phí ship',
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Color(0xFFFF5722),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              if (_restaurant!.description != null &&
                                  _restaurant!.description!.isNotEmpty) ...[
                                const SizedBox(height: 16),
                                const Text(
                                  'Mô tả',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _restaurant!.description!,
                                  style: const TextStyle(fontSize: 16),
                                ),
                              ],
                            ],
                          ),
                        ),
                        // Products Section
                        Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: Responsive.getPadding(context),
                          ),
                          child: Text(
                            'Thực đơn',
                            style: TextStyle(
                              fontSize: Responsive.getTitleFontSize(context),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        SizedBox(height: Responsive.getSpacing(context)),
                        if (_products.isEmpty)
                          Padding(
                            padding: EdgeInsets.all(Responsive.getPadding(context) * 2),
                            child: const Center(
                              child: Text('Chưa có món ăn nào'),
                            ),
                          )
                        else
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            padding: EdgeInsets.all(Responsive.getPadding(context)),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: Responsive.getGridColumns(context),
                              childAspectRatio: Responsive.isMobile(context) ? 0.75 : 0.8,
                              crossAxisSpacing: Responsive.getSpacing(context),
                              mainAxisSpacing: Responsive.getSpacing(context),
                            ),
                            itemCount: _products.length,
                            itemBuilder: (context, index) {
                              return ProductCardWidget(
                                product: _products[index],
                                onTap: () {
                                  Navigator.pushNamed(
                                    context,
                                    AppRoute.productDetail,
                                    arguments: _products[index].maSanPham,
                                  );
                                },
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ),
    );
  }
}

