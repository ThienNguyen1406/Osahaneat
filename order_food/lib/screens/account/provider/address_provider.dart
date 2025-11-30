import 'package:flutter/foundation.dart';
import 'package:order_food/models/Address.dart';
import 'package:order_food/services/api/address_api.dart';

class AddressProvider with ChangeNotifier {
  final AddressApi _addressApi = AddressApi();

  List<Address> _addresses = [];
  bool _isLoading = true;
  String _error = '';

  // Getters
  List<Address> get addresses => _addresses;
  bool get isLoading => _isLoading;
  String get error => _error;
  List<Address> get homeAddresses =>
      _addresses.where((a) => a.type.toUpperCase() == 'HOME').toList();
  List<Address> get officeAddresses =>
      _addresses.where((a) => a.type.toUpperCase() == 'OFFICE' || a.type.toUpperCase() == 'WORK').toList();

  // Load addresses
  Future<void> loadAddresses() async {
    _setLoading(true);
    _error = '';
    try {
      _addresses = await _addressApi.getMyAddresses();
      _error = '';
    } catch (e) {
      _error = e.toString();
      _addresses = [];
    } finally {
      _setLoading(false);
    }
  }

  // Create address
  Future<bool> createAddress({
    required String title,
    required String address,
    required String type,
    bool isDefault = false,
  }) async {
    _error = '';
    try {
      final newAddress = await _addressApi.createAddress(
        title: title,
        address: address,
        type: type,
        isDefault: isDefault,
      );
      if (newAddress != null) {
        await loadAddresses();
        return true;
      }
      _error = 'Không thể tạo địa chỉ';
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Update address
  Future<bool> updateAddress({
    required int id,
    required String title,
    required String address,
    required String type,
    bool isDefault = false,
  }) async {
    _error = '';
    try {
      final updatedAddress = await _addressApi.updateAddress(
        id: id,
        title: title,
        address: address,
        type: type,
        isDefault: isDefault,
      );
      if (updatedAddress != null) {
        await loadAddresses();
        return true;
      }
      _error = 'Không thể cập nhật địa chỉ';
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Delete address
  Future<bool> deleteAddress(int id) async {
    _error = '';
    try {
      final success = await _addressApi.deleteAddress(id);
      if (success) {
        await loadAddresses();
      }
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Set default address
  Future<bool> setDefaultAddress(int id) async {
    _error = '';
    try {
      final success = await _addressApi.setDefaultAddress(id);
      if (success) {
        await loadAddresses();
      }
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}

