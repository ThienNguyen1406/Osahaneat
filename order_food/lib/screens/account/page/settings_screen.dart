import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:order_food/utils/gradient_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _soundEnabled = prefs.getBool('sound_enabled') ?? true;
      _vibrationEnabled = prefs.getBool('vibration_enabled') ?? true;
    });
  }

  Future<void> _saveSetting(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài đặt'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: GradientTheme.appBarGradient,
          ),
        ),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        children: [
          // Thông báo
          _buildSectionHeader('Thông báo'),
          SwitchListTile(
            title: const Text('Bật thông báo'),
            subtitle: const Text('Nhận thông báo về đơn hàng'),
            value: _notificationsEnabled,
            onChanged: (value) {
              setState(() => _notificationsEnabled = value);
              _saveSetting('notifications_enabled', value);
            },
            activeColor: const Color(0xFFFF5722),
          ),
          SwitchListTile(
            title: const Text('Âm thanh'),
            subtitle: const Text('Phát âm thanh khi có thông báo'),
            value: _soundEnabled,
            onChanged: _notificationsEnabled
                ? (value) {
                    setState(() => _soundEnabled = value);
                    _saveSetting('sound_enabled', value);
                  }
                : null,
            activeColor: const Color(0xFFFF5722),
          ),
          SwitchListTile(
            title: const Text('Rung'),
            subtitle: const Text('Rung khi có thông báo'),
            value: _vibrationEnabled,
            onChanged: _notificationsEnabled
                ? (value) {
                    setState(() => _vibrationEnabled = value);
                    _saveSetting('vibration_enabled', value);
                  }
                : null,
            activeColor: const Color(0xFFFF5722),
          ),
          const Divider(),

          // Ứng dụng
          _buildSectionHeader('Ứng dụng'),
          ListTile(
            leading: const Icon(Icons.info_outline, color: Color(0xFFFF5722)),
            title: const Text('Về ứng dụng'),
            subtitle: const Text('Phiên bản 1.0.0'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Về ứng dụng'),
                  content: const Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Ứng dụng đặt đồ ăn'),
                      SizedBox(height: 8),
                      Text('Phiên bản: 1.0.0'),
                      SizedBox(height: 8),
                      Text('© 2025 Osahaneat'),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ],
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.help_outline, color: Color(0xFFFF5722)),
            title: const Text('Trợ giúp'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Trợ giúp'),
                  content: const Text(
                    'Nếu bạn cần hỗ trợ, vui lòng liên hệ:\n\n'
                    'Email: support@osahaneat.com\n'
                    'Hotline: 1900-xxxx',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ],
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined, color: Color(0xFFFF5722)),
            title: const Text('Chính sách bảo mật'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Chính sách bảo mật'),
                  content: const SingleChildScrollView(
                    child: Text(
                      'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. '
                      'Tất cả dữ liệu được mã hóa và bảo mật theo tiêu chuẩn quốc tế.',
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ],
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined, color: Color(0xFFFF5722)),
            title: const Text('Điều khoản sử dụng'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Điều khoản sử dụng'),
                  content: const SingleChildScrollView(
                    child: Text(
                      'Bằng việc sử dụng ứng dụng này, bạn đồng ý với các điều khoản và điều kiện sử dụng.',
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ],
                ),
              );
            },
          ),
          const Divider(),

          // Khác
          _buildSectionHeader('Khác'),
          ListTile(
            leading: const Icon(Icons.delete_outline, color: Colors.red),
            title: const Text('Xóa dữ liệu cache'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Xóa cache'),
                  content: const Text('Bạn có chắc chắn muốn xóa dữ liệu cache?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Hủy'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đã xóa cache')),
                        );
                      },
                      child: const Text('Xóa', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.grey[600],
        ),
      ),
    );
  }
}

