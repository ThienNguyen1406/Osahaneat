class Message {
  final int id;
  final int senderId;
  final String senderName;
  final String senderUserName;
  final int receiverId;
  final String receiverName;
  final String receiverUserName;
  final String content;
  final bool isRead;
  final DateTime createDate;

  Message({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderUserName,
    required this.receiverId,
    required this.receiverName,
    required this.receiverUserName,
    required this.content,
    required this.isRead,
    required this.createDate,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? 0,
      senderId: json['senderId'] ?? 0,
      senderName: json['senderName']?.toString() ?? '',
      senderUserName: json['senderUserName']?.toString() ?? '',
      receiverId: json['receiverId'] ?? 0,
      receiverName: json['receiverName']?.toString() ?? '',
      receiverUserName: json['receiverUserName']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      isRead: json['isRead'] ?? json['read'] ?? false,
      createDate:
          json['createDate'] != null
              ? DateTime.parse(json['createDate'])
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'senderUserName': senderUserName,
      'receiverId': receiverId,
      'receiverName': receiverName,
      'receiverUserName': receiverUserName,
      'content': content,
      'isRead': isRead,
      'createDate': createDate.toIso8601String(),
    };
  }
}

class Conversation {
  final int userId;
  final String userName;
  final String fullName;
  final String lastMessage;
  final DateTime? lastMessageDate;
  final int unreadCount;

  Conversation({
    required this.userId,
    required this.userName,
    required this.fullName,
    required this.lastMessage,
    this.lastMessageDate,
    required this.unreadCount,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      userId: json['userId'] ?? 0,
      userName: json['userName']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      lastMessage: json['lastMessage']?.toString() ?? '',
      lastMessageDate:
          json['lastMessageDate'] != null
              ? DateTime.parse(json['lastMessageDate'])
              : null,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userName': userName,
      'fullName': fullName,
      'lastMessage': lastMessage,
      'lastMessageDate': lastMessageDate?.toIso8601String(),
      'unreadCount': unreadCount,
    };
  }
}
