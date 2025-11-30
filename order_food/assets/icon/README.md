# App Icon Setup

## Icon Design
- **Shape**: Spoon/Keyhole shape (white)
- **Background**: Red gradient (#E91E63)
- **Style**: Minimalist, clean design

## Required Files

1. **app_icon.png** (1024x1024px)
   - Main app icon with red background and white spoon/keyhole shape
   - Used for iOS and Android adaptive icons

2. **app_icon_foreground.png** (1024x1024px)
   - White spoon/keyhole shape on transparent background
   - Used for Android adaptive icon foreground

## How to Generate Icons

After placing the icon files in this directory, run:
```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

This will automatically generate all required icon sizes for:
- Android (mipmap folders)
- iOS (Assets.xcassets)
- Web (icons folder)

## Icon Specifications

- **Format**: PNG
- **Size**: 1024x1024px minimum
- **Background**: Transparent or solid red (#E91E63)
- **Shape**: White spoon/keyhole silhouette
- **Style**: Clean, minimalist, recognizable at small sizes

