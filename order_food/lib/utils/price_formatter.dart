import 'package:intl/intl.dart';

class PriceFormatter {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'vi_VN',
    symbol: '',
    decimalDigits: 0,
  );

  /// Format giá tiền thành chuỗi với dấu phẩy ngăn cách hàng nghìn
  /// Ví dụ: 50000 -> "50,000 đ"
  static String formatPrice(double? price) {
    if (price == null || price < 0) return '0 đ';
    return '${_currencyFormat.format(price)} đ';
  }

  /// Format giá tiền không có đơn vị
  /// Ví dụ: 50000 -> "50,000"
  static String formatPriceWithoutUnit(double? price) {
    if (price == null || price < 0) return '0';
    return _currencyFormat.format(price);
  }
}

