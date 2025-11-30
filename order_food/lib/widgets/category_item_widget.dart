import 'package:flutter/material.dart';
import 'package:order_food/models/Category.dart';
import 'package:order_food/utils/responsive.dart';
import 'package:order_food/utils/gradient_theme.dart';

class CategoryItemWidget extends StatelessWidget {
  final Category category;
  final VoidCallback onTap;

  const CategoryItemWidget({
    super.key,
    required this.category,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final iconSize = Responsive.isDesktop(context)
        ? 70.0
        : Responsive.isTablet(context)
            ? 65.0
            : 60.0;
    final containerSize = Responsive.isDesktop(context)
        ? 90.0
        : Responsive.isTablet(context)
            ? 85.0
            : 80.0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: containerSize,
        margin: EdgeInsets.only(right: Responsive.getSpacing(context) * 0.75),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: iconSize,
              height: iconSize,
              decoration: BoxDecoration(
                color: GradientTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.restaurant,
                color: GradientTheme.primaryColor,
                size: iconSize * 0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              category.tenDanhMuc,
              style: TextStyle(
                fontSize: Responsive.isMobile(context) ? 12 : 14,
                color: GradientTheme.textPrimary,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

