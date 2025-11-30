class PaymentResponse {
  final int orderId;
  final String paymentMethod;
  final String paymentStatus;
  final String? paymentIntentId;
  final String? transactionId;
  final double amount;
  final DateTime? paymentDate;
  final String message;

  PaymentResponse({
    required this.orderId,
    required this.paymentMethod,
    required this.paymentStatus,
    this.paymentIntentId,
    this.transactionId,
    required this.amount,
    this.paymentDate,
    required this.message,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      orderId: json['orderId'] ?? 0,
      paymentMethod: json['paymentMethod']?.toString() ?? '',
      paymentStatus: json['paymentStatus']?.toString() ?? '',
      paymentIntentId: json['paymentIntentId']?.toString(),
      transactionId: json['transactionId']?.toString(),
      amount: (json['amount'] ?? 0).toDouble(),
      paymentDate: json['paymentDate'] != null
          ? DateTime.parse(json['paymentDate'])
          : null,
      message: json['message']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'paymentIntentId': paymentIntentId,
      'transactionId': transactionId,
      'amount': amount,
      'paymentDate': paymentDate?.toIso8601String(),
      'message': message,
    };
  }
}

