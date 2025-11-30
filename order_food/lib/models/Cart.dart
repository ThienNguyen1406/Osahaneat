class CartItem {
  final String maGioHang;
  final String maSanPham;
  final int soLuong;
  final String tenSanPham;
  final double giaBan;
  final String anh;
  final int soLuongTon;
  final String tenDanhMuc;
  final String maTaiKhoan;
  final double thanhTien;
  bool isSelected;

  CartItem({
    required this.maGioHang,
    required this.maSanPham,
    required this.soLuong,
    required this.tenSanPham,
    required this.giaBan,
    required this.anh,
    required this.soLuongTon,
    required this.tenDanhMuc,
    required this.maTaiKhoan,
    required this.thanhTien,
    this.isSelected = false,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    // Backend trả về CartItemDTO: { id, foodId, foodTitle, foodImage, foodPrice, quantity, totalPrice, isFreeShip }
    return CartItem(
      maGioHang: json['id']?.toString() ?? json['maGioHang']?.toString() ?? '',
      maSanPham: json['foodId']?.toString() ?? json['maSanPham']?.toString() ?? '',
      soLuong: json['quantity'] ?? json['soLuong'] ?? 0,
      tenSanPham: json['foodTitle']?.toString() ?? json['tenSanPham']?.toString() ?? '',
      giaBan: (json['foodPrice'] ?? json['giaBan'] ?? 0).toDouble(),
      anh: json['foodImage']?.toString() ?? json['anh']?.toString() ?? '',
      soLuongTon: json['soLuongTon'] ?? 0,
      tenDanhMuc: json['tenDanhMuc']?.toString() ?? '',
      maTaiKhoan: json['maTaiKhoan']?.toString() ?? '',
      thanhTien: (json['totalPrice'] ?? json['thanhTien'] ?? 0).toDouble(),
      isSelected: json['isSelected'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maGioHang': maGioHang,
      'maSanPham': maSanPham,
      'soLuong': soLuong,
      'tenSanPham': tenSanPham,
      'giaBan': giaBan,
      'anh': anh,
      'soLuongTon': soLuongTon,
      'tenDanhMuc': tenDanhMuc,
      'maTaiKhoan': maTaiKhoan,
      'thanhTien': thanhTien,
      'isSelected': isSelected,
    };
  }
}

class CartResponse {
  final String maTaiKhoan;
  final double tongTien;
  final int tongSoLuong;
  final List<CartItem> sanPham;

  CartResponse({
    required this.maTaiKhoan,
    required this.tongTien,
    required this.tongSoLuong,
    required this.sanPham,
  });

  factory CartResponse.fromJson(Map<String, dynamic> json) {
    final List<dynamic> itemsData = json['items'] ?? json['sanPham'] ?? [];
    return CartResponse(
      maTaiKhoan: json['userId']?.toString() ?? json['maTaiKhoan']?.toString() ?? '',
      tongTien: (json['total'] ?? json['tongTien'] ?? 0).toDouble(),
      tongSoLuong: json['itemCount'] ?? json['tongSoLuong'] ?? 0,
      sanPham: itemsData.map((item) => CartItem.fromJson(item)).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maTaiKhoan': maTaiKhoan,
      'tongTien': tongTien,
      'tongSoLuong': tongSoLuong,
      'sanPham': sanPham.map((item) => item.toJson()).toList(),
    };
  }
}

