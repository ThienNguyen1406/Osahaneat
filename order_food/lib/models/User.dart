class User {
  final String maTaiKhoan;
  final String tenNguoiDung;
  final String matKhau;
  final String email;
  final String hoTen;
  final String sdt;
  final String diaChi;
  final String vaiTro;
  final String? avatar;

  User({
    required this.maTaiKhoan,
    required this.tenNguoiDung,
    required this.matKhau,
    required this.email,
    required this.hoTen,
    required this.sdt,
    required this.diaChi,
    required this.vaiTro,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      maTaiKhoan: json['id']?.toString() ?? json['maTaiKhoan']?.toString() ?? '',
      tenNguoiDung: json['userName']?.toString() ?? json['tenNguoiDung']?.toString() ?? '',
      matKhau: json['matKhau']?.toString() ?? '',
      email: json['email']?.toString() ?? json['userName']?.toString() ?? '',
      hoTen: json['fullName']?.toString() ?? json['hoTen']?.toString() ?? '',
      sdt: json['phoneNumber']?.toString() ?? json['sdt']?.toString() ?? '',
      diaChi: json['address']?.toString() ?? json['diaChi']?.toString() ?? '',
      vaiTro: json['roleName']?.toString() ?? json['vaiTro']?.toString() ?? 'USER',
      avatar: json['avatar']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maTaiKhoan': maTaiKhoan,
      'tenNguoiDung': tenNguoiDung,
      'matKhau': matKhau,
      'email': email,
      'hoTen': hoTen,
      'sdt': sdt,
      'diaChi': diaChi,
      'vaiTro': vaiTro,
      'avatar': avatar,
    };
  }
}

