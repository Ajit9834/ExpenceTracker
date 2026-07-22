# 🔥 Firebase Setup Guide

This guide will help you configure Firebase to store all your expense tracker data in the cloud instead of localStorage.

## ✅ What's Already Done

Your app has been updated to use Firebase Firestore for data storage! The code now:
- ✅ Saves expenses to Firebase Cloud Firestore
- ✅ Saves income records to Firebase
- ✅ Saves budgets to Firebase
- ✅ Saves custom categories to Firebase
- ✅ Real-time sync across devices
- ✅ Automatic user data isolation (each user only sees their own data)

## 📋 Step-by-Step Setup

### Step 1: Get Your Firebase Configuration

1. Open your **Firebase Console**: https://console.firebase.google.com/
2. Select your project (or create a new one if needed)
3. Click the **⚙️ gear icon** next to "Project Overview"
4. Select **"Project settings"**
5. Scroll down to **"Your apps"** section
6. If you haven't added a web app:
   - Click **"Add app"** > Select **Web icon (</>)**
   - Give it a nickname (e.g., "Expense Tracker Web")
   - Click **"Register app"**
7. Copy the **firebaseConfig** object

### Step 2: Configure Environment Variables

1. Open the `.env` file in your project root (already created)
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...your-actual-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### Step 3: Enable Firebase Services

#### A. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Enable **"Email/Password"** provider
4. (Optional) Enable **"Google"** provider for Google Sign-in

#### B. Enable Cloud Firestore

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your preferred location
5. Click **"Enable"**

### Step 4: Set Up Firestore Security Rules

To secure your data, add these rules in **Firestore Database > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Incomes collection
    match /incomes/{incomeId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Budgets collection
    match /budgets/{budgetId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
  }
}
```

Click **"Publish"** to save the rules.

### Step 5: Restart Your Development Server

1. Stop the current server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Your app will now use Firebase! 🎉

## 🔍 How to Verify It's Working

1. Open your app at `http://localhost:5173`
2. Sign up with a new account or log in
3. Add an expense or income
4. Go to Firebase Console > Firestore Database
5. You should see your data in the collections: `expenses`, `incomes`, `budgets`, `categories`

## 📊 Firestore Data Structure

Your data will be organized like this:

```
expenses/
  ├── {expenseId}
  │   ├── userId: "abc123"
  │   ├── title: "Grocery Shopping"
  │   ├── amount: 45.99
  │   ├── category: "Food"
  │   ├── date: "2026-07-22"
  │   ├── description: "Weekly groceries"
  │   └── ... other fields

incomes/
  ├── {incomeId}
  │   ├── userId: "abc123"
  │   ├── source: "Salary"
  │   ├── amount: 5000
  │   └── ... other fields

budgets/
  ├── {budgetId}
  │   ├── userId: "abc123"
  │   ├── category: "Food"
  │   ├── amount: 800
  │   └── ... other fields

categories/
  ├── {categoryId}
  │   ├── userId: "abc123"
  │   ├── name: "Custom Category"
  │   ├── type: "expense"
  │   └── ... other fields
```

## 🔄 Demo Mode vs Firebase Mode

The app automatically detects which mode to use:

- **Demo Mode** (localStorage): When `.env` is not configured or Firebase credentials are missing
- **Firebase Mode** (cloud storage): When valid Firebase credentials are provided in `.env`

## ⚠️ Important Notes

1. **Security**: Never commit your `.env` file to version control (it's already in `.gitignore`)
2. **Test Mode**: The "test mode" security rules allow anyone to read/write for 30 days. Update to production rules before going live!
3. **Data Migration**: Existing localStorage data won't automatically transfer to Firebase. You'll need to re-enter data or write a migration script.
4. **Costs**: Firebase has a generous free tier, but monitor your usage in the Firebase Console

## 💰 Firebase Free Tier Limits

- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited
- **Storage**: 5GB (for file uploads)

Perfect for personal use and small projects!

## 🐛 Troubleshooting

### Issue: "Permission denied" errors
**Solution**: Make sure:
1. User is logged in
2. Firestore security rules are published
3. User ID matches in the data

### Issue: Data not showing up
**Solution**: Check:
1. Firebase Console > Firestore Database for data
2. Browser console for errors
3. `.env` file has correct credentials

### Issue: App still uses demo mode
**Solution**: 
1. Verify `.env` file is in project root
2. Restart dev server after changing `.env`
3. Check that all VITE_FIREBASE_* variables are set

## 🎓 Next Steps

- Add **Firestore indexes** for better query performance
- Set up **Firebase Storage** for receipt uploads
- Enable **offline persistence** for offline access
- Add **Cloud Functions** for automated tasks

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Firebase Guide](https://firebase.google.com/docs/web/setup)

---

Need help? Check the console logs or Firebase Console for detailed error messages!
