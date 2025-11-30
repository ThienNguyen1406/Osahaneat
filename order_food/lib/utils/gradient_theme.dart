import 'package:flutter/material.dart';

class GradientTheme {
  // Color Palette - Sống động, trẻ trung, dễ nhìn
  static const Color primaryColor = Color(0xFFFF7A00); // Cam tươi
  static const Color primaryDark = Color(0xFFE56700); // Cam đậm
  static const Color secondaryColor = Color(0xFFFFC764); // Vàng nhạt
  static const Color backgroundColor = Color(0xFFFFFFFF); // Trắng
  static const Color surfaceColor = Color(0xFFF5F5F5); // Xám nhạt
  static const Color textPrimary = Color(0xFF1A1A1A); // Đen
  static const Color textSecondary = Color(0xFF4A4A4A); // Đen mờ
  static const Color accentColor = Color(0xFFFF3B30); // Đỏ nhấn

  // Legacy colors for backward compatibility
  static const Color redColor = primaryColor;
  static const Color purpleColor = primaryDark;
  static const Color blueColor = primaryDark;

  // Main gradient - Cam tươi -> Cam đậm
  static const LinearGradient mainGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      primaryColor,
      primaryDark,
    ],
    stops: [0.0, 1.0],
  );

  // AppBar gradient
  static const LinearGradient appBarGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      primaryColor,
      primaryDark,
    ],
  );

  // Button gradient
  static const LinearGradient buttonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      primaryColor,
      primaryDark,
    ],
  );

  // Container with gradient background (fills entire screen)
  static Widget gradientContainer({
    required Widget child,
    AlignmentGeometry begin = Alignment.topCenter,
    AlignmentGeometry end = Alignment.bottomCenter,
  }) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: backgroundColor, // Background trắng thay vì gradient
      child: child,
    );
  }

  // Container với gradient cho AppBar và các phần đặc biệt
  static Widget gradientBackgroundContainer({
    required Widget child,
    AlignmentGeometry begin = Alignment.topCenter,
    AlignmentGeometry end = Alignment.bottomCenter,
  }) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            primaryColor,
            primaryDark,
          ],
          stops: [0.0, 1.0],
        ),
      ),
      child: child,
    );
  }
}
