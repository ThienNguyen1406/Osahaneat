import 'package:flutter/material.dart';
import 'package:order_food/screens/auth/splash_screen.dart';
import 'package:order_food/screens/auth/login_screen.dart';
import 'package:order_food/screens/auth/register_screen.dart';
import 'package:order_food/screens/main_screen.dart';
import 'package:order_food/screens/chat/page/chat_list_screen.dart';
import 'package:order_food/screens/chat/page/chat_screen.dart';
import 'package:order_food/screens/payment/page/payment_screen.dart';
import 'package:order_food/screens/restaurant/page/restaurant_list_screen.dart';
import 'package:order_food/screens/restaurant/page/restaurant_detail_screen.dart';
import 'package:order_food/screens/product/page/category_products_screen.dart';
import 'package:order_food/screens/account/page/edit_profile_screen.dart';
import 'package:order_food/screens/product/product_detail/page/product_detail_page.dart';
import 'package:order_food/screens/product/search/page/search_page.dart';
import 'package:order_food/screens/order/page/order_list_page.dart';
import 'package:order_food/screens/account/page/address_list_screen.dart';
import 'package:order_food/screens/account/page/payment_method_list_screen.dart';
import 'package:order_food/screens/account/page/settings_screen.dart';
import 'package:order_food/models/Category.dart';
import 'package:order_food/models/User.dart';

class AppRoute {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String main = '/main';
  static const String productDetail = '/product-detail';
  static const String chatList = '/chat-list';
  static const String chat = '/chat';
  static const String payment = '/payment';
  static const String restaurantList = '/restaurant-list';
  static const String restaurantDetail = '/restaurant-detail';
  static const String categoryProducts = '/category-products';
  static const String editProfile = '/edit-profile';
  static const String search = '/search';
  static const String orderList = '/order-list';
  static const String addressList = '/address-list';
  static const String paymentMethodList = '/payment-method-list';
  static const String settings = '/settings';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case register:
        return MaterialPageRoute(builder: (_) => const RegisterScreen());
      case main:
        return MaterialPageRoute(builder: (_) => const MainScreen());
      case productDetail:
        final productId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => ProductDetailPage(productId: productId),
        );
      case chatList:
        return MaterialPageRoute(builder: (_) => const ChatListScreen());
      case chat:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder:
              (_) => ChatScreen(
                otherUserId: args?['otherUserId'] as int?,
                otherUserName: args?['otherUserName'] as String?,
              ),
        );
      case payment:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder:
              (_) => PaymentScreen(
                cart: args?['cart'],
                totalAmount: args?['totalAmount'] as double?,
              ),
        );
      case restaurantList:
        return MaterialPageRoute(builder: (_) => const RestaurantListScreen());
      case restaurantDetail:
        final restaurantId = settings.arguments as int;
        return MaterialPageRoute(
          builder: (_) => RestaurantDetailScreen(restaurantId: restaurantId),
        );
      case categoryProducts:
        final category = settings.arguments as Category;
        return MaterialPageRoute(
          builder: (_) => CategoryProductsScreen(category: category),
        );
      case editProfile:
        final user = settings.arguments as User;
        return MaterialPageRoute(builder: (_) => EditProfileScreen(user: user));
      case search:
        return MaterialPageRoute(builder: (_) => const SearchPage());
      case orderList:
        return MaterialPageRoute(builder: (_) => const OrderListPage());
      case addressList:
        return MaterialPageRoute(builder: (_) => const AddressListScreen());
      case paymentMethodList:
        return MaterialPageRoute(
          builder: (_) => const PaymentMethodListScreen(),
        );
      case AppRoute.settings:
        return MaterialPageRoute(builder: (_) => const SettingsScreen());
      default:
        return MaterialPageRoute(
          builder:
              (_) => Scaffold(
                body: Center(
                  child: Text('No route defined for ${settings.name}'),
                ),
              ),
        );
    }
  }
}
