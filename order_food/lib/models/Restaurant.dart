class Restaurant {
  final int id;
  final String title;
  final String subtitle;
  final String? description;
  final String? image;
  final double? rating;
  final bool? freeShip;
  final String? openDate;

  Restaurant({
    required this.id,
    required this.title,
    required this.subtitle,
    this.description,
    this.image,
    this.rating,
    this.freeShip,
    this.openDate,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? '',
      description: json['description'],
      image: json['image'],
      rating: json['rating'] != null ? (json['rating'] as num).toDouble() : null,
      freeShip: json['freeship'],
      openDate: json['openDate'],
    );
  }
}

