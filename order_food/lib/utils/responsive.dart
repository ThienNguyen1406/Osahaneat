import 'package:flutter/material.dart';

class Responsive {
  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  static bool isMobile(BuildContext context) {
    return screenWidth(context) < 600;
  }

  static bool isTablet(BuildContext context) {
    return screenWidth(context) >= 600 && screenWidth(context) < 1200;
  }

  static bool isDesktop(BuildContext context) {
    return screenWidth(context) >= 1200;
  }

  // Responsive grid columns
  static int getGridColumns(BuildContext context) {
    if (isDesktop(context)) {
      return 4;
    } else if (isTablet(context)) {
      return 3;
    } else {
      return 2;
    }
  }

  // Responsive padding
  static double getPadding(BuildContext context) {
    if (isDesktop(context)) {
      return 24;
    } else if (isTablet(context)) {
      return 20;
    } else {
      return 16;
    }
  }

  // Responsive font size
  static double getTitleFontSize(BuildContext context) {
    if (isDesktop(context)) {
      return 28;
    } else if (isTablet(context)) {
      return 24;
    } else {
      return 20;
    }
  }

  // Responsive spacing
  static double getSpacing(BuildContext context) {
    if (isDesktop(context)) {
      return 24;
    } else if (isTablet(context)) {
      return 20;
    } else {
      return 16;
    }
  }

  // Responsive card height
  static double getCardHeight(BuildContext context) {
    if (isDesktop(context)) {
      return 220;
    } else if (isTablet(context)) {
      return 200;
    } else {
      return 180;
    }
  }

  // Responsive category height
  static double getCategoryHeight(BuildContext context) {
    if (isDesktop(context)) {
      return 120;
    } else if (isTablet(context)) {
      return 110;
    } else {
      return 100;
    }
  }
}

