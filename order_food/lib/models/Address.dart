class Address {
  final int id;
  final int userId;
  final String title;
  final String address;
  final String type; // HOME, OFFICE, OTHER
  final bool isDefault;
  final DateTime? createDate;

  Address({
    required this.id,
    required this.userId,
    required this.title,
    required this.address,
    required this.type,
    required this.isDefault,
    this.createDate,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'] ?? 0,
      userId: json['userId'] ?? 0,
      title: json['title'] ?? '',
      address: json['address'] ?? '',
      type: json['type'] ?? 'OTHER',
      isDefault: json['isDefault'] ?? false,
      createDate: json['createDate'] != null
          ? DateTime.parse(json['createDate'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'address': address,
      'type': type,
      'isDefault': isDefault,
      'createDate': createDate?.toIso8601String(),
    };
  }
}

