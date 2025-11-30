import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/screens/account/provider/payment_method_provider.dart';
import 'package:order_food/models/PaymentMethod.dart';
import 'package:order_food/utils/gradient_theme.dart';

class PaymentMethodListScreen extends StatefulWidget {
  const PaymentMethodListScreen({super.key});

  @override
  State<PaymentMethodListScreen> createState() => _PaymentMethodListScreenState();
}

class _PaymentMethodListScreenState extends State<PaymentMethodListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PaymentMethodProvider>().loadPaymentMethods();
    });
  }

  void _showAddPaymentMethodDialog() {
    showDialog(
      context: context,
      builder: (context) => const _AddPaymentMethodDialog(),
    );
  }

  void _showEditPaymentMethodDialog(PaymentMethod method) {
    showDialog(
      context: context,
      builder: (context) => _AddPaymentMethodDialog(paymentMethod: method),
    );
  }

  void _showDeleteConfirmDialog(PaymentMethod method) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa phương thức thanh toán'),
        content: Text('Bạn có chắc chắn muốn xóa thẻ "${method.cardBrand ?? method.type}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await context.read<PaymentMethodProvider>().deletePaymentMethod(method.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Đã xóa phương thức thanh toán' : 'Lỗi khi xóa'),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phương thức thanh toán'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: GradientTheme.gradientContainer(
        child: Consumer<PaymentMethodProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(GradientTheme.primaryColor),
                ),
              );
            }

            if (provider.error.isNotEmpty && provider.paymentMethods.isEmpty) {
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
                      onPressed: () => provider.loadPaymentMethods(),
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              );
            }

            if (provider.paymentMethods.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.credit_card_off,
                      size: 64,
                      color: GradientTheme.textSecondary,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Chưa có phương thức thanh toán',
                      style: TextStyle(
                        fontSize: 18,
                        color: GradientTheme.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Thêm thẻ để thanh toán nhanh hơn',
                      style: TextStyle(
                        fontSize: 14,
                        color: GradientTheme.textSecondary,
                      ),
                    ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _showAddPaymentMethodDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Thêm thẻ'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: GradientTheme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadPaymentMethods(),
            child: ListView.builder(
              itemCount: provider.paymentMethods.length,
              itemBuilder: (context, index) {
                final method = provider.paymentMethods[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: Icon(
                      _getPaymentIcon(method.type),
                      color: const Color(0xFFFF5722),
                      size: 32,
                    ),
                    title: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                method.cardBrand ?? _getTypeLabel(method.type),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '**** **** **** ${method.cardNumber}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                        if (method.isDefault)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Mặc định',
                              style: TextStyle(color: Colors.white, fontSize: 12),
                            ),
                          ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Chủ thẻ: ${method.cardHolderName}'),
                        if (method.expiryMonth != null && method.expiryYear != null)
                          Text(
                            'Hết hạn: ${method.expiryMonth.toString().padLeft(2, '0')}/${method.expiryYear}',
                            style: TextStyle(color: Colors.grey[600], fontSize: 12),
                          ),
                      ],
                    ),
                    trailing: PopupMenuButton(
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          child: const Row(
                            children: [
                              Icon(Icons.edit, size: 20),
                              SizedBox(width: 8),
                              Text('Sửa'),
                            ],
                          ),
                          onTap: () => Future.delayed(
                            const Duration(milliseconds: 100),
                            () => _showEditPaymentMethodDialog(method),
                          ),
                        ),
                        if (!method.isDefault)
                          PopupMenuItem(
                            child: const Row(
                              children: [
                                Icon(Icons.check, size: 20),
                                SizedBox(width: 8),
                                Text('Đặt làm mặc định'),
                              ],
                            ),
                            onTap: () => Future.delayed(
                              const Duration(milliseconds: 100),
                              () async {
                                final success = await provider.setDefaultPaymentMethod(method.id);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(success ? 'Đã đặt làm mặc định' : 'Lỗi'),
                                      backgroundColor: success ? Colors.green : Colors.red,
                                    ),
                                  );
                                }
                              },
                            ),
                          ),
                        PopupMenuItem(
                          child: const Row(
                            children: [
                              Icon(Icons.delete, size: 20, color: Colors.red),
                              SizedBox(width: 8),
                              Text('Xóa', style: TextStyle(color: Colors.red)),
                            ],
                          ),
                          onTap: () => Future.delayed(
                            const Duration(milliseconds: 100),
                            () => _showDeleteConfirmDialog(method),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddPaymentMethodDialog,
        backgroundColor: GradientTheme.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  IconData _getPaymentIcon(String type) {
    switch (type.toUpperCase()) {
      case 'CREDIT_CARD':
        return Icons.credit_card;
      case 'DEBIT_CARD':
        return Icons.credit_card;
      case 'BANK_ACCOUNT':
        return Icons.account_balance;
      case 'COD':
        return Icons.money;
      default:
        return Icons.payment;
    }
  }

  String _getTypeLabel(String type) {
    switch (type.toUpperCase()) {
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      case 'DEBIT_CARD':
        return 'Thẻ ghi nợ';
      case 'BANK_ACCOUNT':
        return 'Tài khoản ngân hàng';
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      default:
        return type;
    }
  }
}

class _AddPaymentMethodDialog extends StatefulWidget {
  final PaymentMethod? paymentMethod;

  const _AddPaymentMethodDialog({this.paymentMethod});

  @override
  State<_AddPaymentMethodDialog> createState() => _AddPaymentMethodDialogState();
}

class _AddPaymentMethodDialogState extends State<_AddPaymentMethodDialog> {
  final _formKey = GlobalKey<FormState>();
  final _cardNumberController = TextEditingController();
  final _cardHolderNameController = TextEditingController();
  final _expiryMonthController = TextEditingController();
  final _expiryYearController = TextEditingController();
  String _selectedType = 'CREDIT_CARD';
  String? _cardBrand;
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    if (widget.paymentMethod != null) {
      final method = widget.paymentMethod!;
      _cardNumberController.text = method.cardNumber;
      _cardHolderNameController.text = method.cardHolderName;
      _expiryMonthController.text = method.expiryMonth?.toString() ?? '';
      _expiryYearController.text = method.expiryYear?.toString() ?? '';
      _selectedType = method.type;
      _cardBrand = method.cardBrand;
      _isDefault = method.isDefault;
    }
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    _cardHolderNameController.dispose();
    _expiryMonthController.dispose();
    _expiryYearController.dispose();
    super.dispose();
  }

  Future<void> _savePaymentMethod() async {
    if (!_formKey.currentState!.validate()) return;

    final provider = context.read<PaymentMethodProvider>();
    bool success;

    final expiryMonth = int.tryParse(_expiryMonthController.text);
    final expiryYear = int.tryParse(_expiryYearController.text);

    if (expiryMonth == null || expiryYear == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập tháng và năm hết hạn hợp lệ')),
      );
      return;
    }

    if (widget.paymentMethod != null) {
      success = await provider.updatePaymentMethod(
        id: widget.paymentMethod!.id,
        type: _selectedType,
        cardNumber: _cardNumberController.text.trim(),
        cardHolderName: _cardHolderNameController.text.trim(),
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cardBrand: _cardBrand,
        isDefault: _isDefault,
      );
    } else {
      success = await provider.createPaymentMethod(
        type: _selectedType,
        cardNumber: _cardNumberController.text.trim(),
        cardHolderName: _cardHolderNameController.text.trim(),
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cardBrand: _cardBrand,
        isDefault: _isDefault,
      );
    }

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Đã lưu phương thức thanh toán' : 'Lỗi khi lưu'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.paymentMethod == null ? 'Thêm thẻ' : 'Sửa thẻ'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: _selectedType,
                decoration: const InputDecoration(
                  labelText: 'Loại thẻ',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'CREDIT_CARD', child: Text('Thẻ tín dụng')),
                  DropdownMenuItem(value: 'DEBIT_CARD', child: Text('Thẻ ghi nợ')),
                  DropdownMenuItem(value: 'BANK_ACCOUNT', child: Text('Tài khoản ngân hàng')),
                  DropdownMenuItem(value: 'COD', child: Text('Thanh toán khi nhận hàng')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedType = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _cardNumberController,
                decoration: InputDecoration(
                  labelText: widget.paymentMethod != null ? '4 số cuối thẻ' : 'Số thẻ',
                  hintText: '1234',
                  border: const OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                maxLength: widget.paymentMethod != null ? 4 : 19,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng nhập số thẻ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _cardHolderNameController,
                decoration: const InputDecoration(
                  labelText: 'Tên chủ thẻ',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng nhập tên chủ thẻ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _expiryMonthController,
                      decoration: const InputDecoration(
                        labelText: 'Tháng',
                        hintText: 'MM',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      maxLength: 2,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'MM';
                        }
                        final month = int.tryParse(value);
                        if (month == null || month < 1 || month > 12) {
                          return '1-12';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _expiryYearController,
                      decoration: const InputDecoration(
                        labelText: 'Năm',
                        hintText: 'YYYY',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'YYYY';
                        }
                        final year = int.tryParse(value);
                        if (year == null || year < 2024) {
                          return 'Năm hợp lệ';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String?>(
                value: _cardBrand,
                decoration: const InputDecoration(
                  labelText: 'Thương hiệu thẻ (tùy chọn)',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: null, child: Text('Không chọn')),
                  DropdownMenuItem(value: 'VISA', child: Text('VISA')),
                  DropdownMenuItem(value: 'MASTERCARD', child: Text('MASTERCARD')),
                  DropdownMenuItem(value: 'AMEX', child: Text('AMEX')),
                ],
                onChanged: (value) {
                  setState(() => _cardBrand = value);
                },
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                title: const Text('Đặt làm phương thức mặc định'),
                value: _isDefault,
                onChanged: (value) {
                  setState(() => _isDefault = value ?? false);
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Hủy'),
        ),
        ElevatedButton(
          onPressed: _savePaymentMethod,
          style: ElevatedButton.styleFrom(
            backgroundColor: GradientTheme.primaryColor,
            foregroundColor: Colors.white,
          ),
          child: const Text('Lưu'),
        ),
      ],
    );
  }
}

