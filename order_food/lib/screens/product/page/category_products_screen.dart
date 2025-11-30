import 'package:flutter/material.dart';
import 'package:order_food/models/Category.dart';
import 'package:order_food/models/Product.dart';
import 'package:order_food/services/api/product_api.dart';
import 'package:order_food/widgets/product_card_widget.dart';
import 'package:order_food/routes/app_route.dart';
import 'package:order_food/utils/responsive.dart';
import 'package:order_food/utils/gradient_theme.dart';

class CategoryProductsScreen extends StatefulWidget {
  final Category category;

  const CategoryProductsScreen({super.key, required this.category});

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  final ProductApi _productApi = ProductApi();
  List<Product> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final categoryId = int.tryParse(widget.category.maDanhMuc) ?? 0;
      if (categoryId > 0) {
        final products = await _productApi.getProductsByCategory(categoryId);
        if (mounted) {
          setState(() {
            _products = products;
            _isLoading = false;
          });
        }
      } else {
        // Fallback: use products from category if available
        if (widget.category.menus != null) {
          setState(() {
            _products = widget.category.menus!;
            _isLoading = false;
          });
        } else {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải sản phẩm: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.category.tenDanhMuc),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: GradientTheme.gradientContainer(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(GradientTheme.primaryColor),
                ),
              )
            : RefreshIndicator(
                onRefresh: _loadProducts,
                child: _products.isEmpty
                    ? Center(
                        child: Text(
                          'Không có sản phẩm nào',
                          style: TextStyle(
                            color: GradientTheme.textSecondary,
                            fontSize: 16,
                          ),
                        ),
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
                                    Responsive.isMobile(context) ? 0.75 : 0.8,
                                crossAxisSpacing: Responsive.getSpacing(
                                  context,
                                ),
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
              ),
      ),
    );
  }
}
