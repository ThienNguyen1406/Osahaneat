import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/screens/home/provider/home_provider.dart';
import 'package:order_food/screens/home/page/widgets/home_app_bar.dart';
import 'package:order_food/screens/home/page/widgets/category_item_widget.dart';
import 'package:order_food/screens/home/page/widgets/product_card_widget.dart';
import 'package:order_food/routes/app_route.dart';
import 'package:order_food/utils/responsive.dart';
import 'package:order_food/utils/image_helper.dart';
import 'package:order_food/utils/gradient_theme.dart';
import 'package:order_food/models/Restaurant.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeProvider>().loadData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: HomeAppBar(
        onSearch: (query) {
          context.read<HomeProvider>().searchProducts(query);
        },
      ),
      body: GradientTheme.gradientContainer(
        child: Consumer<HomeProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.products.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error.isNotEmpty && provider.products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Lỗi: ${provider.error}',
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.loadData(),
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: provider.loadData,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Categories Section
                  if (provider.categories.isNotEmpty) ...[
                    Padding(
                      padding: EdgeInsets.all(Responsive.getPadding(context)),
                      child: Text(
                        'Danh mục',
                        style: TextStyle(
                          fontSize: Responsive.getTitleFontSize(context),
                          fontWeight: FontWeight.bold,
                          color: GradientTheme.textPrimary,
                        ),
                      ),
                    ),
                    SizedBox(
                      height: Responsive.getCategoryHeight(context),
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: EdgeInsets.symmetric(
                          horizontal: Responsive.getPadding(context),
                        ),
                        itemCount: provider.categories.length,
                        itemBuilder: (context, index) {
                          return CategoryItemWidget(
                            category: provider.categories[index],
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                AppRoute.categoryProducts,
                                arguments: provider.categories[index],
                              );
                            },
                          );
                        },
                      ),
                    ),
                    SizedBox(height: Responsive.getSpacing(context)),
                  ],
                  // Restaurants Section
                  if (provider.restaurants.isNotEmpty) ...[
                    Padding(
                      padding: EdgeInsets.all(Responsive.getPadding(context)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Nhà hàng',
                            style: TextStyle(
                              fontSize: Responsive.getTitleFontSize(context),
                              fontWeight: FontWeight.bold,
                              color: GradientTheme.textPrimary,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pushNamed(context, AppRoute.restaurantList);
                            },
                            child: Text(
                              'Xem tất cả',
                              style: TextStyle(color: GradientTheme.primaryColor),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 180,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: EdgeInsets.symmetric(
                          horizontal: Responsive.getPadding(context),
                        ),
                        itemCount: provider.restaurants.length,
                        itemBuilder: (context, index) {
                          final restaurant = provider.restaurants[index];
                          return _buildRestaurantCard(context, restaurant);
                        },
                      ),
                    ),
                    SizedBox(height: Responsive.getSpacing(context)),
                  ],
                  // Products Section
                  Padding(
                    padding: EdgeInsets.all(Responsive.getPadding(context)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Sản phẩm',
                          style: TextStyle(
                            fontSize: Responsive.getTitleFontSize(context),
                            fontWeight: FontWeight.bold,
                            color: GradientTheme.textPrimary,
                          ),
                        ),
                        if (provider.searchQuery.isNotEmpty)
                          TextButton(
                            onPressed: () => provider.clearSearch(),
                            child: Text(
                              'Xóa bộ lọc',
                              style: TextStyle(color: GradientTheme.primaryColor),
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (provider.products.isEmpty)
                    Padding(
                      padding: EdgeInsets.all(Responsive.getPadding(context) * 2),
                      child: Center(
                        child: Text(
                          'Không có sản phẩm nào',
                          style: TextStyle(color: GradientTheme.textSecondary),
                        ),
                      ),
                    )
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.all(Responsive.getPadding(context)),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: Responsive.getGridColumns(context),
                        childAspectRatio: Responsive.isMobile(context) ? 0.75 : 0.8,
                        crossAxisSpacing: Responsive.getSpacing(context),
                        mainAxisSpacing: Responsive.getSpacing(context),
                      ),
                      itemCount: provider.products.length,
                      itemBuilder: (context, index) {
                        return ProductCardWidget(
                          product: provider.products[index],
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              AppRoute.productDetail,
                              arguments: provider.products[index].maSanPham,
                            );
                          },
                        );
                      },
                    ),
                ],
              ),
            ),
          );
        },
        ),
      ),
    );
  }

  Widget _buildRestaurantCard(BuildContext context, Restaurant restaurant) {
    String _getImageUrl(String? imagePath) {
      return ImageHelper.getImageUrl(imagePath);
    }

    final cardWidth = Responsive.isDesktop(context)
        ? 320.0
        : Responsive.isTablet(context)
            ? 300.0
            : 280.0;

    return Container(
      width: cardWidth,
      margin: EdgeInsets.only(right: Responsive.getSpacing(context) * 0.75),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
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
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: restaurant.image != null && restaurant.image!.isNotEmpty
                    ? Image.network(
                        _getImageUrl(restaurant.image),
                        width: double.infinity,
                        height: 100,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: 100,
                            color: Colors.grey[300],
                            child: const Icon(Icons.restaurant, size: 48),
                          );
                        },
                      )
                    : Container(
                        height: 100,
                        color: Colors.grey[300],
                        child: const Icon(Icons.restaurant, size: 48),
                      ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      restaurant.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (restaurant.rating != null) ...[
                          const Icon(Icons.star, color: Colors.amber, size: 14),
                          const SizedBox(width: 2),
                          Text(
                            restaurant.rating!.toStringAsFixed(1),
                            style: const TextStyle(fontSize: 11),
                          ),
                        ],
                        if (restaurant.freeShip == true) ...[
                          const SizedBox(width: 6),
                          Flexible(
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
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

