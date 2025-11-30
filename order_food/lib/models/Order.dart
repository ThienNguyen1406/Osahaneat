class Order {
  final String maDonHang;
  final String maTaiKhoan;
  final DateTime ngayDat;
  final String trangThai;
  final String? diaChiGiaoHang;
  final String? soDienThoai;
  final String? ghiChu;
  final String? phuongThucThanhToan;
  final String trangThaiThanhToan;
  final String id_PhieuGiamGia;
  final String id_Pay;
  final double? totalPrice;
  final int? restaurantId;
  final String? restaurantTitle;
  final List<OrderDetail>? items;
  final double? userLat;
  final double? userLng;
  final double? shipperLat;
  final double? shipperLng;

  Order({
    required this.maDonHang,
    required this.maTaiKhoan,
    required this.ngayDat,
    required this.trangThai,
    this.diaChiGiaoHang,
    this.soDienThoai,
    this.ghiChu,
    this.phuongThucThanhToan,
    required this.trangThaiThanhToan,
    required this.id_PhieuGiamGia,
    required this.id_Pay,
    this.totalPrice,
    this.restaurantId,
    this.restaurantTitle,
    this.items,
    this.userLat,
    this.userLng,
    this.shipperLat,
    this.shipperLng,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    // Backend trả về OrderDTO: { id, userId, userName, restaurantId, restaurantTitle, createDate, status, totalPrice, items }
    return Order(
      maDonHang: json['id']?.toString() ?? json['maDonHang']?.toString() ?? '',
      maTaiKhoan: json['userId']?.toString() ?? json['maTaiKhoan']?.toString() ?? '',
      ngayDat: json['createDate'] != null 
          ? DateTime.parse(json['createDate'])
          : (json['ngayDat'] != null ? DateTime.parse(json['ngayDat']) : DateTime.now()),
      trangThai: json['status']?.toString() ?? json['trangThai']?.toString() ?? '',
      diaChiGiaoHang: json['diaChiGiaoHang'],
      soDienThoai: json['soDienThoai'],
      ghiChu: json['ghiChu'],
      phuongThucThanhToan: json['paymentMethod']?.toString() ?? json['phuongThucThanhToan']?.toString(),
      trangThaiThanhToan: json['paymentStatus']?.toString() ?? json['trangThaiThanhToan']?.toString() ?? 'PENDING',
      id_PhieuGiamGia: json['id_phieugiamgia'] ?? '',
      id_Pay: json['paymentIntentId']?.toString() ?? json['transactionId']?.toString() ?? json['id_Pay'] ?? '',
      totalPrice: json['totalPrice'] != null ? (json['totalPrice'] as num).toDouble() : null,
      restaurantId: json['restaurantId'],
      restaurantTitle: json['restaurantTitle']?.toString(),
      items: json['items'] != null
          ? (json['items'] as List).map((e) => OrderDetail.fromJson(e)).toList()
          : null,
      userLat: json['userLat'] != null ? (json['userLat'] as num).toDouble() : null,
      userLng: json['userLng'] != null ? (json['userLng'] as num).toDouble() : null,
      shipperLat: json['shipperLat'] != null ? (json['shipperLat'] as num).toDouble() : null,
      shipperLng: json['shipperLng'] != null ? (json['shipperLng'] as num).toDouble() : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maDonHang': maDonHang,
      'maTaiKhoan': maTaiKhoan,
      'ngayDat': ngayDat.toIso8601String(),
      'trangThai': trangThai,
      'diaChiGiaoHang': diaChiGiaoHang,
      'soDienThoai': soDienThoai,
      'ghiChu': ghiChu,
      'phuongThucThanhToan': phuongThucThanhToan,
      'trangThaiThanhToan': trangThaiThanhToan,
      'id_PhieuGiamGia': id_PhieuGiamGia,
      'id_Pay': id_Pay,
    };
  }
}

class OrderDetail {
  final String maDonHang;
  final String maSanPham;
  final String tenSanPham;
  final double giaBan;
  final int soLuong;
  final String? anh;

  OrderDetail({
    required this.maDonHang,
    required this.maSanPham,
    required this.tenSanPham,
    required this.giaBan,
    required this.soLuong,
    this.anh,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    // Backend trả về OrderItemDTO: { orderId, foodId, foodTitle, foodImage, foodPrice, quantity, createDate }
    return OrderDetail(
      maDonHang: json['orderId']?.toString() ?? json['maDonHang']?.toString() ?? '',
      maSanPham: json['foodId']?.toString() ?? json['maSanPham']?.toString() ?? '',
      tenSanPham: json['foodTitle']?.toString() ?? json['tenSanPham']?.toString() ?? '',
      giaBan: (json['foodPrice'] ?? json['giaBan'] ?? 0).toDouble(),
      soLuong: json['quantity'] ?? json['soLuong'] ?? 1,
      anh: json['foodImage']?.toString() ?? json['anh']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maDonHang': maDonHang,
      'maSanPham': maSanPham,
      'tenSanPham': tenSanPham,
      'giaBan': giaBan,
      'soLuong': soLuong,
      'anh': anh,
    };
  }
}

