# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

Admin: admin@nsync.com / admin123
User: john@nsync.com / user123

## Google Sign-In on mobile

Google OAuth may be blocked when running inside Expo Go. To test Google Sign-In on a mobile device or emulator, run a development build or install the dev client instead of using Expo Go.

- Quick dev-run (Android emulator or connected device):

```bash
npx expo run:android
```

- Alternative (EAS development client):

```bash
eas build --profile development --platform android
eas client:install --platform android
```

Notes:

- Make sure you created platform-specific OAuth client IDs in Google Cloud Console (Android: package name + SHA-1; iOS: bundle id) and added the correct redirect URIs for your dev client.
- In code, use platform-specific client IDs (`androidClientId`, `iosClientId`, `webClientId`) and avoid relying on the Expo Go proxy for OAuth during testing.
