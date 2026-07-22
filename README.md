# React Firebase Expense Tracker

A modern expense tracking application built with React, TypeScript, Firebase, and Tailwind CSS.

## ✅ Project Status

The project has been successfully set up and builds without errors!

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Configure Firebase (Required for Cloud Storage)

The app now **automatically saves all data to Firebase Cloud Firestore** instead of localStorage!

#### ⚡ Quick Setup (5 minutes)

1. Open the **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** file for detailed step-by-step instructions
2. Get your Firebase config from [Firebase Console](https://console.firebase.google.com/)
3. Update the `.env` file with your credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Enable Authentication and Firestore in Firebase Console
5. Copy security rules from `firestore.rules` file to your Firestore Database

**📖 See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete instructions!**

#### Demo Mode Fallback

If Firebase is not configured, the app will automatically use localStorage (demo mode) for testing.

### 3. Run the Development Server

```bash
npm run dev
```

Then open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### 4. Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## 📦 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Firebase** - Backend & Authentication
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **React Toastify** - Notifications

## 🎯 Features

- 📊 Dashboard with expense overview
- 💰 Income and expense tracking **saved to Firebase Cloud**
- 📈 Budget management **with real-time sync**
- 📉 Reports and analytics
- 👤 User authentication (Email/Password & Google Sign-in)
- 🔄 **Real-time data sync across all devices**
- ☁️ **Cloud storage with Firebase Firestore**
- 🔒 Secure data isolation per user
- 🎨 Dark/Light theme support
- 📱 Responsive design
- 📄 Export to PDF/Excel
- 🔐 Protected routes

## ✨ What's New - Firebase Integration

Your app now uses **Firebase Cloud Firestore** for data storage:

- ✅ All expenses, income, budgets, and categories saved to the cloud
- ✅ Real-time synchronization across devices
- ✅ Secure, user-isolated data storage
- ✅ Automatic backup and reliability
- ✅ No more data loss when clearing browser cache
- ✅ Access your data from anywhere

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Charts/      # Chart components
│   ├── Layout/      # Layout components (Navbar, Sidebar)
│   └── UI/          # Common UI elements
├── context/         # React Context providers
│   ├── AuthContext.tsx
│   ├── DataContext.tsx
│   └── ThemeContext.tsx
├── firebase/        # Firebase configuration
├── pages/           # Page components
├── routes/          # Route protection
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── App.tsx         # Main app component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### Firebase Connection Issues
Make sure your `.env` file is properly configured with valid Firebase credentials.

### Module Not Found Errors
Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

## 📝 Notes

- **Firebase Configuration Required**: The app now stores all data in Firebase Firestore by default
- Demo mode (localStorage) is only used as a fallback when Firebase is not configured
- All Firebase security rules are included in the `firestore.rules` file
- Real-time listeners keep your data synchronized automatically
- Each user's data is completely isolated and secure
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete setup instructions

## 🔒 Security

- Never commit your `.env` file to version control
- The `.env.example` file is provided as a template
- Keep your Firebase API keys secure

## 📄 License

This project is private and for personal use.
