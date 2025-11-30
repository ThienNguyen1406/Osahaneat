import 'package:flutter/material.dart';
import 'dart:ui' as ui;
import 'dart:io';

/// Custom painter để vẽ app icon (hình thìa/keyhole màu trắng trên nền đỏ)
class AppIconPainter extends CustomPainter {
  final Color backgroundColor;
  final Color iconColor;

  AppIconPainter({
    this.backgroundColor = const Color(0xFFE91E63), // Red
    this.iconColor = Colors.white,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..style = PaintingStyle.fill
          ..color = backgroundColor;

    // Vẽ nền đỏ
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);

    // Vẽ hình thìa/keyhole màu trắng
    final iconPaint =
        Paint()
          ..style = PaintingStyle.fill
          ..color = iconColor;

    final centerX = size.width / 2;
    final centerY = size.height / 2;
    final iconWidth = size.width * 0.4;
    final iconHeight = size.height * 0.6;

    // Vẽ phần trên (oval/bowl của thìa)
    final topRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(centerX, centerY - iconHeight * 0.2),
        width: iconWidth * 0.7,
        height: iconHeight * 0.4,
      ),
      const Radius.circular(20),
    );
    canvas.drawRRect(topRect, iconPaint);

    // Vẽ phần thân (handle của thìa)
    final handleRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(centerX, centerY + iconHeight * 0.15),
        width: iconWidth * 0.25,
        height: iconHeight * 0.5,
      ),
      const Radius.circular(10),
    );
    canvas.drawRRect(handleRect, iconPaint);

    // Vẽ phần nối giữa bowl và handle
    final connectorRect = Rect.fromCenter(
      center: Offset(centerX, centerY + iconHeight * 0.05),
      width: iconWidth * 0.3,
      height: iconHeight * 0.15,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(connectorRect, const Radius.circular(8)),
      iconPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Helper class để export icon thành file PNG
class AppIconExporter {
  /// Export icon thành file PNG
  static Future<void> exportIcon({
    required String outputPath,
    int size = 1024,
    Color backgroundColor = const Color(0xFFE91E63),
    Color iconColor = Colors.white,
  }) async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    final painter = AppIconPainter(
      backgroundColor: backgroundColor,
      iconColor: iconColor,
    );

    painter.paint(canvas, Size(size.toDouble(), size.toDouble()));

    final picture = recorder.endRecording();
    final image = await picture.toImage(size, size);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final pngBytes = byteData!.buffer.asUint8List();

    final file = File(outputPath);
    await file.writeAsBytes(pngBytes);
  }

  /// Export foreground icon (transparent background)
  static Future<void> exportForegroundIcon({
    required String outputPath,
    int size = 1024,
    Color iconColor = Colors.white,
  }) async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);

    // Vẽ trên nền trong suốt
    final painter = AppIconPainter(
      backgroundColor: Colors.transparent,
      iconColor: iconColor,
    );

    painter.paint(canvas, Size(size.toDouble(), size.toDouble()));

    final picture = recorder.endRecording();
    final image = await picture.toImage(size, size);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final pngBytes = byteData!.buffer.asUint8List();

    final file = File(outputPath);
    await file.writeAsBytes(pngBytes);
  }
}
