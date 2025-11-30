import 'package:flutter/foundation.dart';
import 'package:order_food/models/PaymentMethod.dart';
import 'package:order_food/services/api/payment_method_api.dart';

class PaymentMethodProvider with ChangeNotifier {
  final PaymentMethodApi _paymentMethodApi = PaymentMethodApi();

  List<PaymentMethod> _paymentMethods = [];
  bool _isLoading = true;
  String _error = '';

  // Getters
  List<PaymentMethod> get paymentMethods => _paymentMethods;
  bool get isLoading => _isLoading;
  String get error => _error;

  // Load payment methods
  Future<void> loadPaymentMethods() async {
    _setLoading(true);
    _error = '';
    try {
      _paymentMethods = await _paymentMethodApi.getMyPaymentMethods();
      _error = '';
    } catch (e) {
      _error = e.toString();
      _paymentMethods = [];
    } finally {
      _setLoading(false);
    }
  }

  // Create payment method
  Future<bool> createPaymentMethod({
    required String type,
    required String cardNumber,
    required String cardHolderName,
    required int expiryMonth,
    required int expiryYear,
    String? cardBrand,
    bool isDefault = false,
  }) async {
    _error = '';
    try {
      final newMethod = await _paymentMethodApi.createPaymentMethod(
        type: type,
        cardNumber: cardNumber,
        cardHolderName: cardHolderName,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cardBrand: cardBrand,
        isDefault: isDefault,
      );
      if (newMethod != null) {
        await loadPaymentMethods();
        return true;
      }
      _error = 'Không thể tạo phương thức thanh toán';
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Update payment method
  Future<bool> updatePaymentMethod({
    required int id,
    required String type,
    required String cardNumber,
    required String cardHolderName,
    required int expiryMonth,
    required int expiryYear,
    String? cardBrand,
    bool isDefault = false,
  }) async {
    _error = '';
    try {
      final updatedMethod = await _paymentMethodApi.updatePaymentMethod(
        id: id,
        type: type,
        cardNumber: cardNumber,
        cardHolderName: cardHolderName,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cardBrand: cardBrand,
        isDefault: isDefault,
      );
      if (updatedMethod != null) {
        await loadPaymentMethods();
        return true;
      }
      _error = 'Không thể cập nhật phương thức thanh toán';
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Delete payment method
  Future<bool> deletePaymentMethod(int id) async {
    _error = '';
    try {
      final success = await _paymentMethodApi.deletePaymentMethod(id);
      if (success) {
        await loadPaymentMethods();
      }
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  // Set default payment method
  Future<bool> setDefaultPaymentMethod(int id) async {
    _error = '';
    try {
      final success = await _paymentMethodApi.setDefaultPaymentMethod(id);
      if (success) {
        await loadPaymentMethods();
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

