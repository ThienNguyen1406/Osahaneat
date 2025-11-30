import 'package:flutter/material.dart';
import 'package:order_food/routes/app_route.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Function(String) onSearch;

  const HomeAppBar({
    super.key,
    required this.onSearch,
  });

  @override
  Size get preferredSize => const Size.fromHeight(100);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: const Color(0xFFFF5722),
      foregroundColor: Colors.white,
      elevation: 0,
      title: const Text(
        'OrderFood',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm sản phẩm...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onSubmitted: onSearch,
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.search, size: 28),
                onPressed: () {
                  Navigator.pushNamed(context, AppRoute.search);
                },
                tooltip: 'Mở màn hình tìm kiếm',
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFFFF5722),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

