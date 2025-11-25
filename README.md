# Netflix Clone - React Native

A feature-rich streaming app built with React Native that provides access to content from Netflix, Prime Video, and Hotstar platforms. Browse, search, and stream your favorite movies and TV shows across multiple platforms in one unified experience.

## ✨ Features

- 🎬 **Multi-Platform Support**: Access content from Netflix, Prime Video, and Hotstar
- 🔍 **Smart Search**: Search across all platforms with platform-specific results
- 🎯 **Browse Categories**: Explore curated content sections and categories
- 📱 **Native Experience**: Smooth animations and native video playback
- 🎨 **Beautiful UI**: Clean, modern interface inspired by popular streaming services
- 🎥 **Video Player**: Built-in video player with playback controls
- 📺 **TV Shows & Episodes**: Browse seasons and episodes with detailed information
- 🎭 **Movie Details**: Rich metadata including cast, genre, ratings, and descriptions

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment).

Required tools:
- Node.js (v16 or higher)
- npm or Yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd netflix
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **iOS Setup** (macOS only)
   ```sh
   # Install Ruby bundler
   bundle install
   
   # Install CocoaPods dependencies
   cd ios
   bundle exec pod install
   cd ..
   ```

### Running the App

1. **Start Metro Bundler**
   ```sh
   npm start
   # or
   yarn start
   ```

2. **Run on Android**
   ```sh
   npm run android
   # or
   yarn android
   ```

3. **Run on iOS**
   ```sh
   npm run ios
   # or
   yarn ios
   ```

## 📁 Project Structure

```
netflix/
├── src/
│   ├── assets/          # Images, animations, and static files
│   ├── components/      # React components
│   │   ├── DetailsPage.tsx    # Movie/show details screen
│   │   ├── MovieItem.tsx      # Individual movie card
│   │   ├── Row.tsx            # Horizontal movie row
│   │   ├── Search.tsx         # Search interface
│   │   ├── SplashScreen.tsx   # App splash screen
│   │   └── VideoPlayer.tsx    # Video playback component
│   ├── services/        # API and external services
│   │   └── api.ts             # API integration layer
│   └── types/           # TypeScript type definitions
│       └── index.ts
├── android/             # Android native code
├── ios/                 # iOS native code
└── App.tsx             # Main application component
```

## 🔧 Configuration

### API Endpoints

The app uses the following API endpoints (configured in `src/services/api.ts`):

- **Home Data**: Content catalog and categories
- **Search APIs**: Platform-specific search functionality
- **Movie Details**: Detailed information for titles
- **Streaming URLs**: Video playback endpoints

### Platform Support

- **Netflix**: Browse and stream Netflix content
- **Prime Video**: Access Prime Video library
- **Hotstar**: Stream Hotstar shows and movies

## 🎯 Key Components

### DetailsPage
Displays comprehensive information about movies and TV shows including:
- Title, year, rating, and runtime
- Cast and crew information
- Episode lists for TV shows
- Suggested similar content

### VideoPlayer
Custom video player with:
- Play/pause controls
- Progress tracking
- Fullscreen support
- Error handling

### Search
Multi-platform search interface:
- Platform selection (Netflix/Prime Video/Hotstar)
- Real-time search results
- Platform-specific content cards

## 🛠️ Development

### Testing
```sh
npm test
# or
yarn test
```

### Building for Production

**Android**
```sh
cd android
./gradlew assembleRelease
```

**iOS**
```sh
# Open Xcode and archive for distribution
open ios/netflix.xcworkspace
```

## 📱 Platform-Specific Notes

### Android
- Minimum SDK: API 21 (Android 5.0)
- Target SDK: API 33 (Android 13)
- Uses Gradle build system

### iOS
- Minimum iOS version: 13.0
- Uses CocoaPods for dependency management
- Swift-based native modules

## 🔄 Fast Refresh

This project supports React Native Fast Refresh for instant feedback during development:
- Edit components and see changes immediately
- Preserves component state during edits
- Press `R` twice on Android or `R` in iOS Simulator to manually reload

## 📚 Learn More

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Community](https://github.com/react-native-community)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🐛 Troubleshooting

**Metro Bundler Issues**
```sh
npm start -- --reset-cache
```

**Android Build Failures**
```sh
cd android
./gradlew clean
cd ..
```

**iOS Build Issues**
```sh
cd ios
pod deintegrate
pod install
cd ..
```

For more help, visit the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).

## 📄 License

This project is for educational purposes only.

---

Built with ❤️ using React Native
