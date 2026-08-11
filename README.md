# NSync Mobile Application

NSync is a mobile-first team workspace app built with Expo and React Native. It helps users collaborate through role-based dashboards, boards, tasks, and workspace management.

## What this app does

This application is designed for team collaboration and task tracking. Users can:

- sign up or log in securely
- view a personal dashboard with task summaries
- access boards and assigned tasks
- manage workspace members and settings
- use an admin dashboard for higher-level oversight

The app uses Firebase for authentication and Firestore data storage, and it is structured around Expo Router with role-based screens for users and admins.

## Tech stack

- React Native
- Expo
- Expo Router
- TypeScript
- Firebase Authentication
- Firestore
- Async Storage

## Features

- Authentication flow for sign in and sign up
- User dashboard with quick actions
- Board and task management screens
- Workspace member and settings views
- Admin dashboard and management screens
- Responsive mobile experience for Expo web, Android, and iOS

## Prerequisites

Before running the app, make sure you have:

- Node.js 18 or newer
- npm
- Expo CLI (or use `npx expo`)
- Android Studio / emulator for Android testing (optional)
- Xcode for iOS testing (optional)

## Getting started

1. Clone the repository

   ```bash
   git clone <your-repository-url>
   cd NysncMobileApplication
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ### Web preview

   ```bash
   npm run web
   ```

   ### Android

   ```bash
   npm run android
   ```

   ### iOS

   ```bash
   npm run ios
   ```

If Expo asks to use a different port because one is already in use, choose the suggested alternative.

## Firebase setup

This project uses Firebase for authentication and data storage.

1. Create a Firebase project in the Firebase console.
2. Enable Authentication and Firestore.
3. Update the configuration values in `firebase.ts` with your own project credentials.
4. If you want to create an admin account during development, use the registration code `INITADMIN`.

## Project structure

- `app/` – screens and routes for auth, user, and admin flows
- `components/` – reusable UI components
- `contexts/` – authentication and workspace state
- `services/` – Firebase and API service integrations
- `types/` – TypeScript models
- `constants/` – shared theme, colors, and mock data

## Notes

This project is currently a development app and may continue to evolve as additional features are added.

## License

This project is for educational and development purposes.
