import 'Product.dart';

class Category {
  final String maDanhMuc;
  final String tenDanhMuc;
  final List<Product>? menus;

  Category({
    required this.maDanhMuc,
    required this.tenDanhMuc,
    this.menus,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      maDanhMuc: json['id']?.toString() ?? json['maDanhMuc']?.toString() ?? '',
      tenDanhMuc: json['name']?.toString() ?? json['tenDanhMuc']?.toString() ?? '',
      menus: json['menus'] != null
          ? (json['menus'] as List).map((e) => Product.fromJson(e)).toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maDanhMuc': maDanhMuc,
      'tenDanhMuc': tenDanhMuc,
      'menus': menus?.map((e) => e.toJson()).toList(),
    };
  }
}

