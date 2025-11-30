import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/screens/order/provider/order_list_provider.dart';
import 'package:order_food/screens/order/page/order_map_screen.dart';
import 'package:order_food/utils/price_formatter.dart';
import 'package:order_food/utils/gradient_theme.dart';
import 'package:intl/intl.dart';

class OrderListPage extends StatefulWidget {
  const OrderListPage({super.key});

  @override
  State<OrderListPage> createState() => _OrderListPageState();
}

class _OrderListPageState extends State<OrderListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderListProvider>().loadOrders();
    });
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'CREATED':
      case 'PENDING':
        return 'Chờ xử lý';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'CANCELLED':
      case 'CANCELED':
        return 'Đã hủy';
      default:
        return status.isNotEmpty ? status : 'Chưa xác định';
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CREATED':
      case 'PENDING':
        return Colors.orange;
      case 'PROCESSING':
        return Colors.blue;
      case 'SHIPPING':
        return Colors.purple;
      case 'DELIVERED':
        return Colors.green;
      case 'CANCELLED':
      case 'CANCELED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đơn hàng của tôi'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: GradientTheme.gradientContainer(
        child: Consumer<OrderListProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(GradientTheme.primaryColor),
              ),
            );
          }

          if (provider.error.isNotEmpty && provider.orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Lỗi: ${provider.error}',
                    style: const TextStyle(
                      color: GradientTheme.textPrimary,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.loadOrders(),
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }

          if (provider.orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 64,
                    color: GradientTheme.textSecondary,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Chưa có đơn hàng nào',
                    style: TextStyle(
                      fontSize: 18,
                      color: GradientTheme.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Đặt hàng ngay để xem đơn hàng ở đây',
                    style: TextStyle(
                      fontSize: 14,
                      color: GradientTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: provider.loadOrders,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.orders.length,
              itemBuilder: (context, index) {
                final order = provider.orders[index];
                
                // Tính tổng tiền từ items nếu totalPrice null hoặc bằng 0
                double calculatedTotal = order.totalPrice ?? 0;
                if (calculatedTotal == 0 && order.items != null && order.items!.isNotEmpty) {
                  calculatedTotal = order.items!.fold<double>(
                    0,
                    (sum, item) => sum + (item.giaBan * item.soLuong),
                  );
                }
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ExpansionTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _getStatusColor(
                          order.trangThai,
                        ).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.receipt,
                        color: _getStatusColor(order.trangThai),
                      ),
                    ),
                    title: Text(
                      'Đơn hàng #${order.maDonHang}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(_formatDate(order.ngayDat)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(
                              order.trangThai,
                            ).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            _getStatusText(order.trangThai),
                            style: TextStyle(
                              color: _getStatusColor(order.trangThai),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    trailing: Text(
                      PriceFormatter.formatPrice(calculatedTotal),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: GradientTheme.redColor,
                      ),
                    ),
                    children: [
                      if (order.items != null && order.items!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Chi tiết đơn hàng:',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              ...order.items!.map(
                                (item) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${item.tenSanPham} x ${item.soLuong}',
                                        ),
                                      ),
                                      Text(
                                        PriceFormatter.formatPrice(item.giaBan * item.soLuong),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const Divider(height: 24),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Tổng tiền:',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    PriceFormatter.formatPrice(calculatedTotal),
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: GradientTheme.redColor,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  gradient: GradientTheme.buttonGradient,
                                  borderRadius: BorderRadius.circular(8),
                                  boxShadow: [
                                    BoxShadow(
                                      color: GradientTheme.redColor.withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => OrderMapScreen(
                                          orderId: order.maDonHang,
                                          userLat: order.userLat,
                                          userLng: order.userLng,
                                          shipperLat: order.shipperLat,
                                          shipperLng: order.shipperLng,
                                          userAddress: order.diaChiGiaoHang,
                                        ),
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.map),
                                  label: const Text('Xem vị trí trên bản đồ'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
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
          );
        },
        ),
      ),
    );
  }
}
