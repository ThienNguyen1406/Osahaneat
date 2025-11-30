class Product {
  final String maSanPham;
  final String tenSanPham;
  final String moTa;
  final double giaBan;
  final String anh;
  final int soLuongTon;
  final String donViTinh;
  final String xuatXu;
  final String maDanhMuc;
  final bool? isFreeShip;
  final String? timeShip;

  Product({
    required this.maSanPham,
    required this.tenSanPham,
    required this.moTa,
    required this.giaBan,
    required this.anh,
    required this.soLuongTon,
    required this.donViTinh,
    required this.xuatXu,
    required this.maDanhMuc,
    this.isFreeShip,
    this.timeShip,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Backend trả về MenuDTO/Food: { id, title, image, price, isFreeShip, timeShip, description }
    return Product(
      maSanPham: json['id']?.toString() ?? json['maSanPham']?.toString() ?? '',
      tenSanPham: json['title']?.toString() ?? json['tenSanPham']?.toString() ?? '',
      moTa: json['description']?.toString() ?? json['desc']?.toString() ?? json['moTa']?.toString() ?? '',
      giaBan: (json['price'] ?? json['giaBan'] ?? 0).toDouble(),
      anh: json['image']?.toString() ?? json['anh']?.toString() ?? '',
      soLuongTon: (json['soLuongTon'] is num) ? (json['soLuongTon'] as num).toInt() : 0,
      donViTinh: json['donViTinh']?.toString() ?? 'phần',
      xuatXu: json['xuatXu']?.toString() ?? '',
      maDanhMuc: json['category']?['id']?.toString() ?? 
                 json['categoryId']?.toString() ?? 
                 json['cate_id']?.toString() ?? 
                 json['maDanhMuc']?.toString() ?? '',
      isFreeShip: json['isFreeShip'] ?? json['is_freeship'] ?? false,
      timeShip: json['timeShip']?.toString() ?? json['time_ship']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maSanPham': maSanPham,
      'tenSanPham': tenSanPham,
      'moTa': moTa,
      'giaBan': giaBan,
      'anh': anh,
      'soLuongTon': soLuongTon,
      'donViTinh': donViTinh,
      'xuatXu': xuatXu,
      'maDanhMuc': maDanhMuc,
      'isFreeShip': isFreeShip,
      'timeShip': timeShip,
    };
  }
}

