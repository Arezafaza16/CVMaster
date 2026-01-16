# CV Master

Aplikasi mobile untuk scan CV, analisis ATS compatibility, dan CV builder dengan AI.

## Fitur

### Free Plan
- ✅ Scan CV dengan AI (dengan iklan)
- ✅ Lihat ATS Score
- ✅ Buat 1 CV gratis
- ✅ Template gratis

### Premium Plan (Rp 89.000/bulan)
- ✅ Scan CV tanpa iklan
- ✅ Job requirement matching
- ✅ AI CV improvement
- ✅ Template premium unlimited
- ✅ Buat CV unlimited
- ✅ Priority support

## Tech Stack

- **Framework**: React Native with TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini API
- **Ads**: Google AdMob
- **Payment**: Google Play Billing

## Setup

### Prerequisites

1. Node.js 18+
2. Android Studio dengan Android SDK
3. Firebase project
4. Google Cloud account dengan Gemini API enabled

### Installation

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android
```

### Firebase Setup

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password + Google Sign-In)
3. Enable Firestore Database
4. Enable Storage
5. Download `google-services.json` dan letakkan di `android/app/`

### Gemini API Setup

1. Enable Gemini API di [Google Cloud Console](https://console.cloud.google.com)
2. Buat API Key
3. Update API key di `src/services/gemini.ts`

### AdMob Setup (Production)

1. Buat akun di [AdMob](https://admob.google.com)
2. Buat App dan Ad Unit IDs
3. Konfigurasi rewarded video ads

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # App screens
│   ├── auth/         # Login, Register
│   ├── home/         # Home, Profile
│   ├── cv-builder/   # CV Form, Preview
│   ├── cv-scanner/   # Scanner, Score Result
│   ├── job-matching/ # Job Match (Premium)
│   └── subscription/ # Subscription
├── services/         # API services
├── context/          # React Context providers
├── types/            # TypeScript types
├── constants/        # Theme, config
└── navigation/       # Navigation setup
```

## Scripts

```bash
npm start           # Start Metro bundler
npm run android     # Run on Android
npm run lint        # Run ESLint
npm test            # Run tests
```

## License

MIT
