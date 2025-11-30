import 'package:flutter/material.dart';
import 'package:order_food/utils/app_icon_painter.dart';
import 'dart:io';

/// Script để generate app icon
/// Chạy: flutter run lib/utils/generate_icon.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    // Tạo thư mục assets/icon nếu chưa có
    final assetsDir = Directory('assets/icon');
    if (!await assetsDir.exists()) {
      await assetsDir.create(recursive: true);
    }

    print('🎨 Đang tạo app icon...');

    // Generate main icon (với nền đỏ)
    await AppIconExporter.exportIcon(
      outputPath: 'assets/icon/app_icon.png',
      size: 1024,
      backgroundColor: const Color(0xFFE91E63),
      iconColor: Colors.white,
    );
    print('✅ Đã tạo: assets/icon/app_icon.png');

    // Generate foreground icon (nền trong suốt)
    await AppIconExporter.exportForegroundIcon(
      outputPath: 'assets/icon/app_icon_foreground.png',
      size: 1024,
      iconColor: Colors.white,
    );
    print('✅ Đã tạo: assets/icon/app_icon_foreground.png');

    print('\n✨ Hoàn thành! Bây giờ chạy:');
    print('   flutter pub get');
    print('   flutter pub run flutter_launcher_icons');
  } catch (e) {
    print('❌ Lỗi: $e');
  }
}

