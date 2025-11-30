import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/screens/account/provider/address_provider.dart';
import 'package:order_food/models/Address.dart';
import 'package:order_food/utils/gradient_theme.dart';

class AddressListScreen extends StatefulWidget {
  const AddressListScreen({super.key});

  @override
  State<AddressListScreen> createState() => _AddressListScreenState();
}

class _AddressListScreenState extends State<AddressListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AddressProvider>().loadAddresses();
    });
  }

  void _showAddAddressDialog() {
    showDialog(
      context: context,
      builder: (context) => _AddAddressDialog(),
    );
  }

  void _showEditAddressDialog(Address address) {
    showDialog(
      context: context,
      builder: (context) => _AddAddressDialog(address: address),
    );
  }

  void _showDeleteConfirmDialog(Address address) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa địa chỉ'),
        content: Text('Bạn có chắc chắn muốn xóa địa chỉ "${address.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await context.read<AddressProvider>().deleteAddress(address.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Đã xóa địa chỉ' : 'Lỗi khi xóa địa chỉ'),
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
        title: const Text('Địa chỉ'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: GradientTheme.gradientContainer(
        child: Consumer<AddressProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(GradientTheme.primaryColor),
                ),
              );
            }

            if (provider.error.isNotEmpty && provider.addresses.isEmpty) {
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
                      onPressed: () => provider.loadAddresses(),
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              );
            }

            if (provider.addresses.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.location_off,
                      size: 64,
                      color: GradientTheme.textSecondary,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Chưa có địa chỉ nào',
                      style: TextStyle(
                        fontSize: 18,
                        color: GradientTheme.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Thêm địa chỉ để nhận hàng',
                      style: TextStyle(
                        fontSize: 14,
                        color: GradientTheme.textSecondary,
                      ),
                    ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _showAddAddressDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Thêm địa chỉ'),
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
            onRefresh: () => provider.loadAddresses(),
            child: ListView.builder(
              itemCount: provider.addresses.length,
              itemBuilder: (context, index) {
                final address = provider.addresses[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: Icon(
                      address.type == 'HOME' ? Icons.home : 
                      address.type == 'OFFICE' || address.type == 'WORK' ? Icons.work : 
                      Icons.location_on,
                      color: const Color(0xFFFF5722),
                    ),
                    title: Row(
                      children: [
                        Expanded(
                          child: Text(
                            address.title,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                        if (address.isDefault)
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
                        Text(address.address),
                        const SizedBox(height: 4),
                        Text(
                          'Loại: ${_getTypeLabel(address.type)}',
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
                            () => _showEditAddressDialog(address),
                          ),
                        ),
                        if (!address.isDefault)
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
                                final success = await provider.setDefaultAddress(address.id);
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
                            () => _showDeleteConfirmDialog(address),
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
        onPressed: _showAddAddressDialog,
        backgroundColor: GradientTheme.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  String _getTypeLabel(String type) {
    switch (type.toUpperCase()) {
      case 'HOME':
        return 'Nhà';
      case 'OFFICE':
      case 'WORK':
        return 'Cơ quan';
      default:
        return 'Khác';
    }
  }
}

class _AddAddressDialog extends StatefulWidget {
  final Address? address;

  const _AddAddressDialog({this.address});

  @override
  State<_AddAddressDialog> createState() => _AddAddressDialogState();
}

class _AddAddressDialogState extends State<_AddAddressDialog> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _addressController = TextEditingController();
  String _selectedType = 'HOME';
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    if (widget.address != null) {
      _titleController.text = widget.address!.title;
      _addressController.text = widget.address!.address;
      _selectedType = widget.address!.type;
      _isDefault = widget.address!.isDefault;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    final provider = context.read<AddressProvider>();
    bool success;

    if (widget.address != null) {
      success = await provider.updateAddress(
        id: widget.address!.id,
        title: _titleController.text.trim(),
        address: _addressController.text.trim(),
        type: _selectedType,
        isDefault: _isDefault,
      );
    } else {
      success = await provider.createAddress(
        title: _titleController.text.trim(),
        address: _addressController.text.trim(),
        type: _selectedType,
        isDefault: _isDefault,
      );
    }

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Đã lưu địa chỉ' : 'Lỗi khi lưu địa chỉ'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.address == null ? 'Thêm địa chỉ' : 'Sửa địa chỉ'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Tên địa chỉ',
                  hintText: 'Ví dụ: Nhà riêng, Cơ quan',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng nhập tên địa chỉ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Địa chỉ',
                  hintText: 'Nhập địa chỉ chi tiết',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng nhập địa chỉ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedType,
                decoration: const InputDecoration(
                  labelText: 'Loại địa chỉ',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'HOME', child: Text('Nhà')),
                  DropdownMenuItem(value: 'OFFICE', child: Text('Cơ quan')),
                  DropdownMenuItem(value: 'OTHER', child: Text('Khác')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedType = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                title: const Text('Đặt làm địa chỉ mặc định'),
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
          onPressed: _saveAddress,
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

