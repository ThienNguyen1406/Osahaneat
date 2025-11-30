import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/screens/product/product_detail/provider/product_detail_provider.dart';
import 'package:order_food/utils/image_helper.dart';
import 'package:order_food/utils/gradient_theme.dart';

class ProductDetailPage extends StatefulWidget {
  final String productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductDetailProvider>().loadProduct(widget.productId);
    });
  }

  String _getImageUrl(String imagePath) {
    final url = ImageHelper.getImageUrl(imagePath);
    // Debug: In ra để kiểm tra
    debugPrint('Original image path: $imagePath');
    debugPrint('Generated image URL: $url');
    return url;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết sản phẩm'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: GradientTheme.gradientContainer(
        child: Consumer<ProductDetailProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              );
            }

            if (provider.product == null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: GradientTheme.textSecondary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        provider.error.isNotEmpty
                            ? provider.error
                            : 'Không tìm thấy sản phẩm',
                        style: const TextStyle(
                          fontSize: 16,
                          color: GradientTheme.textPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (provider.error.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          'ID sản phẩm: ${widget.productId}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: GradientTheme.textSecondary,
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => provider.loadProduct(widget.productId),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: GradientTheme.buttonGradient,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.refresh),
                              SizedBox(width: 8),
                              Text('Thử lại'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }

            final product = provider.product!;

            return SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Image
                  product.anh.isNotEmpty
                      ? Image.network(
                        _getImageUrl(product.anh),
                        width: double.infinity,
                        height: 300,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            height: 300,
                            color: Colors.grey[200],
                            child: Center(
                              child: CircularProgressIndicator(
                                value:
                                    loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress
                                                .cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  GradientTheme.redColor,
                                ),
                              ),
                            ),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) {
                          // Debug: In ra URL để kiểm tra
                          debugPrint(
                            'Image load error: ${_getImageUrl(product.anh)}',
                          );
                          debugPrint('Error: $error');
                          return Container(
                            height: 300,
                            color: Colors.grey[200],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.image_not_supported,
                                  size: 64,
                                  color: Colors.grey,
                                ),
                                const SizedBox(height: 8),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                  ),
                                  child: Text(
                                    'Không thể tải hình ảnh',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 12,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      )
                      : Container(
                        height: 300,
                        color: Colors.grey[200],
                        child: const Icon(
                          Icons.image_not_supported,
                          size: 64,
                          color: Colors.grey,
                        ),
                      ),
                  // Product Info
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.tenSanPham,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: GradientTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text(
                              '${product.giaBan.toStringAsFixed(0)} đ',
                              style: const TextStyle(
                                fontSize: 28,
                                color: GradientTheme.primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (product.isFreeShip == true) ...[
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'Miễn phí vận chuyển',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Product Info Cards
                        Row(
                          children: [
                            if (product.timeShip != null &&
                                product.timeShip!.isNotEmpty)
                              Expanded(
                                child: _buildInfoCard(
                                  Icons.access_time,
                                  'Thời gian',
                                  product.timeShip!,
                                ),
                              ),
                            if (product.timeShip != null &&
                                product.timeShip!.isNotEmpty)
                              const SizedBox(width: 8),
                            if (product.soLuongTon > 0)
                              Expanded(
                                child: _buildInfoCard(
                                  Icons.inventory,
                                  'Còn lại',
                                  '${product.soLuongTon} ${product.donViTinh}',
                                ),
                              ),
                          ],
                        ),
                        if (product.xuatXu.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          _buildInfoCard(
                            Icons.location_on,
                            'Xuất xứ',
                            product.xuatXu,
                            fullWidth: true,
                          ),
                        ],
                        const SizedBox(height: 16),
                        if (product.moTa.isNotEmpty) ...[
                          const Text(
                            'Mô tả',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: GradientTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            product.moTa,
                            style: const TextStyle(
                              fontSize: 16,
                              color: GradientTheme.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        // Quantity Selector
                        Row(
                          children: [
                            const Text(
                              'Số lượng:',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: GradientTheme.textPrimary,
                              ),
                            ),
                            const Spacer(),
                            IconButton(
                              icon: const Icon(
                                Icons.remove_circle_outline,
                                color: GradientTheme.primaryColor,
                              ),
                              onPressed: () => provider.decreaseQuantity(),
                            ),
                            Text(
                              '${provider.quantity}',
                              style: const TextStyle(
                                fontSize: 18,
                                color: GradientTheme.textPrimary,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.add_circle_outline,
                                color: GradientTheme.primaryColor,
                              ),
                              onPressed: () => provider.increaseQuantity(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        // Add to Cart Button
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed:
                                provider.isAddingToCart
                                    ? null
                                    : () async {
                                      final success =
                                          await provider.addToCart();
                                      if (success && mounted) {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Row(
                                              children: [
                                                Icon(
                                                  Icons.check_circle,
                                                  color: Colors.white,
                                                ),
                                                SizedBox(width: 8),
                                                Text('Đã thêm vào giỏ hàng'),
                                              ],
                                            ),
                                            backgroundColor:
                                                GradientTheme.redColor,
                                            duration: const Duration(
                                              seconds: 2,
                                            ),
                                          ),
                                        );
                                      } else if (mounted &&
                                          provider.error.isNotEmpty) {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Text(provider.error),
                                            backgroundColor: Colors.red,
                                          ),
                                        );
                                      }
                                    },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              foregroundColor: Colors.white,
                              disabledBackgroundColor: GradientTheme.redColor
                                  .withOpacity(0.6),
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Container(
                              decoration: BoxDecoration(
                                gradient:
                                    provider.isAddingToCart
                                        ? LinearGradient(
                                          colors: [
                                            GradientTheme.redColor.withOpacity(
                                              0.6,
                                            ),
                                            GradientTheme.purpleColor
                                                .withOpacity(0.6),
                                          ],
                                        )
                                        : GradientTheme.buttonGradient,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: GradientTheme.redColor.withOpacity(
                                      0.3,
                                    ),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (provider.isAddingToCart)
                                    const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                              Colors.white,
                                            ),
                                      ),
                                    )
                                  else
                                    const Icon(Icons.shopping_cart),
                                  const SizedBox(width: 8),
                                  Text(
                                    provider.isAddingToCart
                                        ? 'Đang thêm...'
                                        : 'Thêm vào giỏ hàng',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildInfoCard(
    IconData icon,
    String label,
    String value, {
    bool fullWidth = false,
  }) {
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: GradientTheme.surfaceColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.withOpacity(0.2), width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: GradientTheme.primaryColor),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: GradientTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: GradientTheme.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
