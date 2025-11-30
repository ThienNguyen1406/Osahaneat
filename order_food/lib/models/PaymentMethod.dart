class PaymentMethod {
  final int id;
  final int userId;
  final String type; // CREDIT_CARD, DEBIT_CARD, BANK_ACCOUNT, COD
  final String cardNumber; // Masked (last 4 digits)
  final String cardHolderName;
  final int? expiryMonth;
  final int? expiryYear;
  final String? cardBrand; // VISA, MASTERCARD, AMEX
  final bool isDefault;
  final DateTime? createDate;

  PaymentMethod({
    required this.id,
    required this.userId,
    required this.type,
    required this.cardNumber,
    required this.cardHolderName,
    this.expiryMonth,
    this.expiryYear,
    this.cardBrand,
    required this.isDefault,
    this.createDate,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] ?? 0,
      userId: json['userId'] ?? 0,
      type: json['type'] ?? 'CREDIT_CARD',
      cardNumber: json['cardNumber'] ?? '',
      cardHolderName: json['cardHolderName'] ?? '',
      expiryMonth: json['expiryMonth'],
      expiryYear: json['expiryYear'],
      cardBrand: json['cardBrand'],
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
      'type': type,
      'cardNumber': cardNumber,
      'cardHolderName': cardHolderName,
      'expiryMonth': expiryMonth,
      'expiryYear': expiryYear,
      'cardBrand': cardBrand,
      'isDefault': isDefault,
      'createDate': createDate?.toIso8601String(),
    };
  }
}

