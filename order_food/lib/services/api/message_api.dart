import 'dart:convert';
import 'package:order_food/models/Message.dart';
import 'package:order_food/services/api/user_api.dart';
import 'package:order_food/services/api_service.dart';
import 'package:order_food/utils/constant.dart';
import 'package:order_food/utils/response_helper.dart';
import 'package:http/http.dart' as http;

class MessageApi {
  /// Lấy danh sách conversations - Backend: GET /message
  Future<List<Conversation>> getConversations() async {
    try {
      final headers = await ApiService().getHeaders();
      final user = await UserApi().getCurrentUser();

      if (user == null) throw Exception('User not logged in');

      final response = await http
          .get(Uri.parse('${Constant().baseUrl}/message'), headers: headers)
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);

        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final conversationsData = ResponseHelper.getData(responseData);
        if (conversationsData is List) {
          return conversationsData
              .map((e) => Conversation.fromJson(e))
              .toList();
        }
        return [];
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error getting conversations: $e');
      throw Exception('Error getting conversations: $e');
    }
  }

  /// Lấy tin nhắn với user khác - Backend: GET /message/{otherUserId}
  Future<List<Message>> getConversation(int otherUserId) async {
    try {
      final headers = await ApiService().getHeaders();

      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/message/$otherUserId'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);

        if (!ResponseHelper.isSuccess(responseData)) {
          throw Exception(ResponseHelper.getMessage(responseData));
        }

        final messagesData = ResponseHelper.getData(responseData);
        if (messagesData is List) {
          return messagesData.map((e) => Message.fromJson(e)).toList();
        }
        return [];
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error getting conversation: $e');
      throw Exception('Error getting conversation: $e');
    }
  }

  /// Gửi tin nhắn - Backend: POST /message
  /// User: tự động gửi đến admin (không cần receiverId)
  /// Admin: cần chỉ định receiverId
  Future<bool> sendMessage(String content, {int? receiverId}) async {
    try {
      final headers = await ApiService().getHeaders();

      final body = <String, dynamic>{'content': content};

      if (receiverId != null) {
        body['receiverId'] = receiverId;
      }

      final response = await http
          .post(
            Uri.parse('${Constant().baseUrl}/message'),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);
        return ResponseHelper.isSuccess(responseData);
      } else {
        final responseData = ResponseHelper.parseResponse(response.body);
        throw Exception(ResponseHelper.getMessage(responseData));
      }
    } catch (e) {
      print('Error sending message: $e');
      throw Exception('Error sending message: $e');
    }
  }

  /// Lấy số tin nhắn chưa đọc - Backend: GET /message/unread/count
  Future<int> getUnreadCount() async {
    try {
      final headers = await ApiService().getHeaders();

      final response = await http
          .get(
            Uri.parse('${Constant().baseUrl}/message/unread/count'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final responseData = ResponseHelper.parseResponse(response.body);

        if (ResponseHelper.isSuccess(responseData)) {
          final count = ResponseHelper.getData(responseData);
          return count is int ? count : (count is num ? count.toInt() : 0);
        }
        return 0;
      }
      return 0;
    } catch (e) {
      print('Error getting unread count: $e');
      return 0;
    }
  }
}
