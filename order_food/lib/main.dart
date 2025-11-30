import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/routes/app_route.dart';
import 'package:order_food/screens/home/provider/home_provider.dart';
import 'package:order_food/screens/product/product_detail/provider/product_detail_provider.dart';
import 'package:order_food/screens/product/search/provider/search_provider.dart';
import 'package:order_food/screens/cart/provider/cart_provider.dart';
import 'package:order_food/screens/account/provider/account_provider.dart';
import 'package:order_food/screens/account/provider/address_provider.dart';
import 'package:order_food/screens/account/provider/payment_method_provider.dart';
import 'package:order_food/screens/order/provider/order_list_provider.dart';
import 'package:order_food/utils/gradient_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => HomeProvider()),
        ChangeNotifierProvider(create: (_) => ProductDetailProvider()),
        ChangeNotifierProvider(create: (_) => SearchProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => AccountProvider()),
        ChangeNotifierProvider(create: (_) => AddressProvider()),
        ChangeNotifierProvider(create: (_) => PaymentMethodProvider()),
        ChangeNotifierProvider(create: (_) => OrderListProvider()),
      ],
      child: MaterialApp(
        title: 'Order Food',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: GradientTheme.primaryColor,
            brightness: Brightness.light,
            primary: GradientTheme.primaryColor,
            secondary: GradientTheme.secondaryColor,
            surface: GradientTheme.surfaceColor,
            background: GradientTheme.backgroundColor,
            error: GradientTheme.accentColor,
          ),
          primaryColor: GradientTheme.primaryColor,
          scaffoldBackgroundColor: GradientTheme.backgroundColor,
          useMaterial3: true,
          appBarTheme: AppBarTheme(
            backgroundColor: GradientTheme.primaryColor,
            elevation: 0,
            foregroundColor: Colors.white,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: GradientTheme.primaryColor,
              foregroundColor: Colors.white,
              elevation: 2,
            ),
          ),
          textTheme: const TextTheme(
            bodyLarge: TextStyle(color: GradientTheme.textPrimary),
            bodyMedium: TextStyle(color: GradientTheme.textPrimary),
            bodySmall: TextStyle(color: GradientTheme.textSecondary),
            titleLarge: TextStyle(color: GradientTheme.textPrimary),
            titleMedium: TextStyle(color: GradientTheme.textPrimary),
            titleSmall: TextStyle(color: GradientTheme.textPrimary),
          ),
        ),
        initialRoute: AppRoute.splash,
        onGenerateRoute: AppRoute.generateRoute,
      ),
    );
  }
}
