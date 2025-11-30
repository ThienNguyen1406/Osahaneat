import 'package:flutter/material.dart';
import 'package:order_food/models/Cart.dart';
import 'package:order_food/services/api/cart_api.dart';
import 'package:order_food/services/api/order_api.dart';
import 'package:order_food/services/api/payment_api.dart';
import 'package:order_food/routes/app_route.dart';

class PaymentScreen extends StatefulWidget {
  final CartResponse? cart;
  final double? totalAmount;

  const PaymentScreen({super.key, this.cart, this.totalAmount});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final CartApi _cartApi = CartApi();
  final OrderApi _orderApi = OrderApi();
  final PaymentApi _paymentApi = PaymentApi();

  String _selectedPaymentMethod = 'COD'; // COD, CREDIT_CARD, BANK_TRANSFER
  bool _isProcessing = false;
  CartResponse? _cart;

  // For bank transfer
  final TextEditingController _bankNameController = TextEditingController();
  final TextEditingController _accountNumberController =
      TextEditingController();
  final TextEditingController _transactionIdController =
      TextEditingController();

  // For credit card (Stripe)
  final TextEditingController _cardNumberController = TextEditingController();
  final TextEditingController _expiryDateController = TextEditingController();
  final TextEditingController _cvvController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  @override
  void dispose() {
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _transactionIdController.dispose();
    _cardNumberController.dispose();
    _expiryDateController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  Future<void> _loadCart() async {
    if (widget.cart != null) {
      setState(() => _cart = widget.cart);
      return;
    }

    try {
      final cart = await _cartApi.getCart();
      if (mounted) {
        setState(() => _cart = cart);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải giỏ hàng: $e')));
      }
    }
  }

  Future<void> _processPayment() async {
    if (_cart == null || _cart!.sanPham.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Giỏ hàng trống')));
      return;
    }

    // Validate payment method specific fields
    if (_selectedPaymentMethod == 'BANK_TRANSFER') {
      if (_transactionIdController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng nhập mã giao dịch')),
        );
        return;
      }
    }

    if (_selectedPaymentMethod == 'CREDIT_CARD') {
      if (_cardNumberController.text.trim().isEmpty ||
          _expiryDateController.text.trim().isEmpty ||
          _cvvController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng nhập đầy đủ thông tin thẻ')),
        );
        return;
      }
    }

    setState(() => _isProcessing = true);

    try {
      // Step 1: Checkout từ cart (tạo order) để lấy orderId
      final orderId = await _orderApi.checkoutFromCart();

      if (!mounted) return;

      if (orderId == null || orderId <= 0) {
        throw Exception('Tạo đơn hàng thất bại');
      }

      // Step 2: Xử lý thanh toán theo phương thức đã chọn
      dynamic paymentResponse;

      switch (_selectedPaymentMethod) {
        case 'COD':
          paymentResponse = await _paymentApi.processCOD(orderId);
          break;
        case 'CREDIT_CARD':
          // Note: Trong thực tế, cần tích hợp Stripe SDK để tạo payment method token
          // Ở đây chỉ là ví dụ, cần thay thế bằng token thật từ Stripe
          paymentResponse = await _paymentApi.processCreditCard(
            orderId,
            'pm_card_visa', // Placeholder - cần thay bằng token thật
          );
          break;
        case 'BANK_TRANSFER':
          paymentResponse = await _paymentApi.processBankTransfer(
            orderId: orderId,
            bankName:
                _bankNameController.text.trim().isEmpty
                    ? null
                    : _bankNameController.text.trim(),
            accountNumber:
                _accountNumberController.text.trim().isEmpty
                    ? null
                    : _accountNumberController.text.trim(),
            transactionId: _transactionIdController.text.trim(),
          );
          break;
        default:
          throw Exception('Phương thức thanh toán không hợp lệ');
      }

      if (!mounted) return;

      // Hiển thị dialog xác nhận thanh toán
      await showDialog(
        context: context,
        builder:
            (context) => AlertDialog(
              title: Text(
                paymentResponse.paymentStatus == 'PAID' ||
                        paymentResponse.paymentStatus == 'PENDING'
                    ? 'Thanh toán thành công'
                    : 'Thanh toán thất bại',
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    paymentResponse.paymentStatus == 'PAID' ||
                            paymentResponse.paymentStatus == 'PENDING'
                        ? Icons.check_circle
                        : Icons.error,
                    color:
                        paymentResponse.paymentStatus == 'PAID' ||
                                paymentResponse.paymentStatus == 'PENDING'
                            ? Color(0xFFFF5722)
                            : Colors.red,
                    size: 64,
                  ),
                  const SizedBox(height: 16),
                  Text(paymentResponse.message, textAlign: TextAlign.center),
                  const SizedBox(height: 8),
                  Text(
                    'Tổng tiền: ${paymentResponse.amount.toStringAsFixed(0)} đ',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Color(0xFFFF5722),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Phương thức: ${_getPaymentMethodName(_selectedPaymentMethod)}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  if (paymentResponse.paymentStatus == 'PENDING')
                    const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: Text(
                        'Đơn hàng đang chờ xác nhận',
                        style: TextStyle(fontSize: 12, color: Colors.orange),
                      ),
                    ),
                ],
              ),
              actions: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pop(); // Pop payment screen
                    Navigator.pushReplacementNamed(context, AppRoute.main);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF5722),
                  ),
                  child: const Text('Về trang chủ'),
                ),
              ],
            ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi thanh toán: $e')));
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  String _getPaymentMethodName(String method) {
    switch (method.toUpperCase()) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      default:
        return method;
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount = widget.totalAmount ?? _cart?.tongTien ?? 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán'),
        backgroundColor: const Color(0xFFFF5722),
        foregroundColor: Colors.white,
      ),
      body:
          _cart == null
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Order Summary
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Tóm tắt đơn hàng',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ..._cart!.sanPham.map(
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
                                      '${item.thanhTien.toStringAsFixed(0)} đ',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const Divider(),
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
                                  '${totalAmount.toStringAsFixed(0)} đ',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFFF5722),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Payment Method
                    const Text(
                      'Phương thức thanh toán',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildPaymentMethodOption(
                      'COD',
                      'Thanh toán khi nhận hàng (COD)',
                      Icons.money,
                    ),
                    _buildPaymentMethodOption(
                      'CREDIT_CARD',
                      'Thẻ tín dụng/Ghi nợ',
                      Icons.credit_card,
                    ),
                    _buildPaymentMethodOption(
                      'BANK_TRANSFER',
                      'Chuyển khoản ngân hàng',
                      Icons.account_balance,
                    ),
                    // Payment method specific fields
                    if (_selectedPaymentMethod == 'BANK_TRANSFER') ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Thông tin chuyển khoản',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _bankNameController,
                        decoration: InputDecoration(
                          labelText: 'Tên ngân hàng',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _accountNumberController,
                        decoration: InputDecoration(
                          labelText: 'Số tài khoản',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _transactionIdController,
                        decoration: InputDecoration(
                          labelText: 'Mã giao dịch *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          helperText: 'Nhập mã giao dịch từ ngân hàng',
                        ),
                      ),
                    ],
                    if (_selectedPaymentMethod == 'CREDIT_CARD') ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Thông tin thẻ',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _cardNumberController,
                        decoration: InputDecoration(
                          labelText: 'Số thẻ',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _expiryDateController,
                              decoration: InputDecoration(
                                labelText: 'MM/YY',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _cvvController,
                              decoration: InputDecoration(
                                labelText: 'CVV',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              keyboardType: TextInputType.number,
                              obscureText: true,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Lưu ý: Trong môi trường production, cần tích hợp Stripe SDK để xử lý thanh toán an toàn',
                        style: TextStyle(fontSize: 12, color: Colors.orange),
                      ),
                    ],
                    const SizedBox(height: 32),
                    // Payment Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isProcessing ? null : _processPayment,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF5722),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child:
                            _isProcessing
                                ? const CircularProgressIndicator(
                                  color: Colors.white,
                                )
                                : const Text(
                                  'Xác nhận thanh toán',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                      ),
                    ),
                  ],
                ),
              ),
    );
  }

  Widget _buildPaymentMethodOption(String value, String label, IconData icon) {
    final isSelected = _selectedPaymentMethod == value;
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color:
          isSelected ? const Color(0xFFFF5722).withOpacity(0.1) : Colors.white,
      child: RadioListTile<String>(
        value: value,
        groupValue: _selectedPaymentMethod,
        onChanged: (newValue) {
          setState(() => _selectedPaymentMethod = newValue!);
        },
        title: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFFFF5722) : Colors.grey,
            ),
            const SizedBox(width: 12),
            Text(label),
          ],
        ),
        activeColor: const Color(0xFFFF5722),
      ),
    );
  }
}
