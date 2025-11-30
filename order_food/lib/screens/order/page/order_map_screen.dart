import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class OrderMapScreen extends StatefulWidget {
  final String orderId;
  final double? userLat;
  final double? userLng;
  final double? shipperLat;
  final double? shipperLng;
  final String? userAddress;
  final String? shipperAddress;

  const OrderMapScreen({
    super.key,
    required this.orderId,
    this.userLat,
    this.userLng,
    this.shipperLat,
    this.shipperLng,
    this.userAddress,
    this.shipperAddress,
  });

  @override
  State<OrderMapScreen> createState() => _OrderMapScreenState();
}

class _OrderMapScreenState extends State<OrderMapScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            _loadMap();
          },
        ),
      )
      ..loadRequest(Uri.parse('about:blank'));
  }

  void _loadMap() {
    // Default location: Ho Chi Minh City
    double defaultLat = 10.8231;
    double defaultLng = 106.6297;

    // Use provided coordinates or defaults
    double userLat = widget.userLat ?? defaultLat;
    double userLng = widget.userLng ?? defaultLng;
    double shipperLat = widget.shipperLat ?? defaultLat;
    double shipperLng = widget.shipperLng ?? defaultLng;

    String htmlContent = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VietMap - Đơn hàng ${widget.orderId}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        #map {
            width: 100%;
            height: 100vh;
        }
        .info-panel {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 400px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-item:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-weight: bold;
            color: #333;
            font-size: 12px;
        }
        .info-value {
            color: #666;
            font-size: 14px;
        }
        .marker-user {
            background-color: #4CAF50;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .marker-shipper {
            background-color: #FF5722;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="info-panel">
        <div class="info-item">
            <div class="info-label">Đơn hàng #${widget.orderId}</div>
        </div>
        <div class="info-item">
            <div class="info-label">📍 Vị trí khách hàng:</div>
            <div class="info-value">${widget.userAddress ?? '${userLat}, ${userLng}'}</div>
        </div>
        ${widget.shipperLat != null && widget.shipperLng != null ? '''
        <div class="info-item">
            <div class="info-label">🚚 Vị trí shipper:</div>
            <div class="info-value">${widget.shipperAddress ?? '${shipperLat}, ${shipperLng}'}</div>
        </div>
        ''' : ''}
    </div>

    <script>
        // Initialize map with VietMap tiles
        const vietMapApiKey = 'aa2f6b8b5aa074db4aeedae1c422d41bd6a6dd9af87dc54c';
        const vietMapTileUrl = 'https://maps.vietmap.vn/api/tm/{z}/{x}/{y}@2x.png?apikey=' + vietMapApiKey;
        
        // Center point (average of user and shipper if both exist, otherwise user location)
        let centerLat = ${userLat};
        let centerLng = ${userLng};
        
        ${widget.shipperLat != null && widget.shipperLng != null ? '''
        centerLat = (${userLat} + ${shipperLat}) / 2;
        centerLng = (${userLng} + ${shipperLng}) / 2;
        ''' : ''}
        
        const map = L.map('map').setView([centerLat, centerLng], 13);
        
        // Add VietMap tile layer
        L.tileLayer(vietMapTileUrl, {
            attribution: '© VietMap',
            maxZoom: 18,
        }).addTo(map);
        
        // Add user marker
        const userIcon = L.divIcon({
            className: 'marker-user',
            html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
        
        const userMarker = L.marker([${userLat}, ${userLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>📍 Vị trí khách hàng</b><br>${widget.userAddress ?? '${userLat}, ${userLng}'}');
        
        ${widget.shipperLat != null && widget.shipperLng != null ? '''
        // Add shipper marker
        const shipperIcon = L.divIcon({
            className: 'marker-shipper',
            html: '<div style="background-color: #FF5722; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
        
        const shipperMarker = L.marker([${shipperLat}, ${shipperLng}], { icon: shipperIcon })
            .addTo(map)
            .bindPopup('<b>🚚 Vị trí shipper</b><br>${widget.shipperAddress ?? '${shipperLat}, ${shipperLng}'}');
        
        // Draw line between user and shipper
        const polyline = L.polyline([
            [${userLat}, ${userLng}],
            [${shipperLat}, ${shipperLng}]
        ], {
            color: '#2196F3',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);
        
        // Fit bounds to show both markers
        const group = new L.featureGroup([userMarker, shipperMarker]);
        map.fitBounds(group.getBounds().pad(0.1));
        ''' : ''}
    </script>
</body>
</html>
    ''';

    _controller.loadHtmlString(
      htmlContent,
      baseUrl: 'https://maps.vietmap.vn',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Vị trí đơn hàng #${widget.orderId}'),
        backgroundColor: const Color(0xFFFF5722),
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}

