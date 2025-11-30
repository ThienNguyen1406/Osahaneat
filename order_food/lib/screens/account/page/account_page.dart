import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:order_food/screens/account/provider/account_provider.dart';
import 'package:order_food/routes/app_route.dart';
import 'package:order_food/utils/gradient_theme.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AccountProvider>().loadUserInfo();
    });
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Đăng xuất'),
            content: const Text('Bạn có chắc chắn muốn đăng xuất?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Hủy'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text(
                  'Đăng xuất',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
    );

    if (confirm == true) {
      await context.read<AccountProvider>().logout();
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          AppRoute.login,
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài khoản'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: GradientTheme.gradientContainer(
        child: Consumer<AccountProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    GradientTheme.primaryColor,
                  ),
                ),
              );
            }

            if (provider.userInfo == null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.person_outline,
                      size: 64,
                      color: GradientTheme.textSecondary,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Chưa đăng nhập',
                      style: TextStyle(
                        color: GradientTheme.textPrimary,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoute.login);
                      },
                      child: const Text('Đăng nhập'),
                    ),
                  ],
                ),
              );
            }

            final user = provider.userInfo!;

            return SingleChildScrollView(
              child: Column(
                children: [
                  // User Info Card
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          spreadRadius: 1,
                          blurRadius: 5,
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: GradientTheme.redColor.withOpacity(
                            0.1,
                          ),
                          child: const Icon(
                            Icons.person,
                            size: 40,
                            color: GradientTheme.redColor,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          user.hoTen.isNotEmpty ? user.hoTen : 'Người dùng',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (user.email.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            user.email,
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ],
                    ),
                  ),
                  // Menu Items
                  _buildMenuItem(
                    icon: Icons.edit,
                    title: 'Chỉnh sửa thông tin',
                    onTap: () {
                      Navigator.pushNamed(
                        context,
                        AppRoute.editProfile,
                        arguments: user,
                      );
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildMenuItem(
                    icon: Icons.receipt_long,
                    title: 'Đơn hàng của tôi',
                    onTap: () {
                      Navigator.pushNamed(context, AppRoute.orderList);
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildMenuItem(
                    icon: Icons.location_on,
                    title: 'Địa chỉ',
                    onTap: () {
                      Navigator.pushNamed(context, AppRoute.addressList);
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildMenuItem(
                    icon: Icons.credit_card,
                    title: 'Phương thức thanh toán',
                    onTap: () {
                      Navigator.pushNamed(context, AppRoute.paymentMethodList);
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildMenuItem(
                    icon: Icons.settings,
                    title: 'Cài đặt',
                    onTap: () {
                      Navigator.pushNamed(context, AppRoute.settings);
                    },
                  ),
                  const SizedBox(height: 16),
                  // Logout Button
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: OutlinedButton.icon(
                        onPressed: _handleLogout,
                        icon: const Icon(Icons.logout, color: Colors.red),
                        label: const Text(
                          'Đăng xuất',
                          style: TextStyle(color: Colors.red),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ListTile(
        leading: Icon(icon, color: GradientTheme.primaryColor),
        title: Text(
          title,
          style: const TextStyle(color: GradientTheme.textPrimary),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
