# 🚀 Complete Deployment Guide - CareerNexus AI

## Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Gemini AI Configuration](#gemini-ai-configuration)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Cloud Functions (Advanced)](#cloud-functions)
6. [Troubleshooting](#troubleshooting)

---

## 1. Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `career-nexus-ai`
4. Disable Google Analytics (or enable if needed)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**
4. Enable **Google** provider
   - Add your email as authorized domain
   - Click Save

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Choose **Start in production mode**
3. Select location: `asia-south1` (India)
4. Click **Enable**

### Step 4: Set Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Career Twins collection
    match /careerTwins/{twinId} {
      allow read, write: if request.auth != null && request.auth.uid == twinId;
    }
    
    // Market data (public read)
    match /marketData/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Step 5: Get Firebase Config

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to "Your apps" → Click **Web icon** (</> )
3. Register app name: `career-nexus-web`
4. Copy the `firebaseConfig` object
5. Paste values in your `.env` file

---

## 2. Gemini AI Configuration

### Step 1: Get API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select project or create new one
4. Copy the API key
5. Add to `.env`:
   ```
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

### Step 2: Enable APIs (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. Search and enable:
   - Generative Language API
   - Cloud Firestore API

---

## 3. Local Development

### Complete Setup Steps

```bash
# 1. Navigate to React project
cd career-nexus-react

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your actual keys
# Use any text editor to fill in:
# - VITE_GEMINI_API_KEY
# - VITE_FIREBASE_* (all 7 values from Firebase)

# 5. Start development server
npm run dev
```

### Verify Installation

1. Open browser to `http://localhost:3000`
2. You should see the landing page
3. Try logging in with Google OAuth
4. Navigate to dashboard features

### Common Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 4. Production Deployment

### Option A: Firebase Hosting (Recommended)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in your project
firebase init

# Select:
# - Hosting
# - Use existing project → career-nexus-ai
# - Public directory: dist
# - Single-page app: Yes
# - GitHub actions: No

# 4. Build the project
npm run build

# 5. Deploy to Firebase
firebase deploy --only hosting

# Your app will be live at:
# https://career-nexus-ai.web.app
```

### Option B: Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Build project
npm run build

# 3. Deploy
vercel --prod

# Follow prompts, your app will be live
```

### Option C: Netlify

```bash
# 1. Build project
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist

# Follow prompts to link/create site
```

### Environment Variables in Production

**Firebase Hosting:**
- Create `.env.production` file
- Add same variables as `.env`
- They'll be bundled during build

**Vercel/Netlify:**
1. Go to dashboard → Project Settings → Environment Variables
2. Add each `VITE_*` variable
3. Redeploy

---

## 5. Cloud Functions (Advanced)

For production-grade AI features, deploy Cloud Functions:

### Setup Cloud Functions

```bash
# 1. Install Firebase Functions
firebase init functions

# Select:
# - JavaScript
# - ESLint: Yes
# - Install dependencies: Yes

# 2. Create function file
# functions/index.js
```

### Example Cloud Function

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

exports.generateCareerTwin = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { skills, experience, goals } = data;
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Create career twin for: ${JSON.stringify({ skills, experience, goals })}`;
  
  const result = await model.generateContent(prompt);
  const twinData = JSON.parse(result.response.text());

  // Save to Firestore
  await admin.firestore().collection("careerTwins").doc(context.auth.uid).set({
    ...twinData,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, twin: twinData };
});
```

### Deploy Functions

```bash
# Set Gemini API key
firebase functions:config:set gemini.key="YOUR_GEMINI_KEY"

# Deploy
firebase deploy --only functions

# Your function will be available at:
# https://us-central1-career-nexus-ai.cloudfunctions.net/generateCareerTwin
```

---

## 6. Troubleshooting

### Issue: "Firebase not configured"

**Solution:**
```bash
# Verify .env file exists
cat .env

# Check all VITE_ variables are set
# Restart dev server
npm run dev
```

### Issue: "Gemini API quota exceeded"

**Solution:**
- Free tier: 60 requests/minute
- Add delay between requests
- Or upgrade to paid tier

### Issue: "CORS error on API calls"

**Solution:**
```javascript
// In firebase.js, ensure proper initialization
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
// Must export initialized app
export default app;
```

### Issue: "Build fails with module errors"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use:
npm ci
```

### Issue: "Dark mode not working"

**Solution:**
```javascript
// In tailwind.config.js, ensure:
module.exports = {
  darkMode: 'class', // Not 'media'
  // ...
}
```

### Issue: "Charts not rendering"

**Solution:**
```bash
# Ensure Recharts is installed
npm install recharts

# Check import statements
import { LineChart, Line } from 'recharts';
```

---

## Performance Optimization

### 1. Code Splitting
```javascript
// Use React.lazy for route-based splitting
const CareerTwin = lazy(() => import('./components/Dashboard/CareerTwin'));
```

### 2. Image Optimization
- Use WebP format
- Lazy load images
- Compress with tools like TinyPNG

### 3. Bundle Analysis
```bash
npm run build -- --analyze
```

### 4. Firebase Optimization
- Use Firestore queries with limits
- Enable persistence for offline support
- Implement pagination for large datasets

---

## Security Best Practices

1. **Never commit `.env` files**
   - Add to `.gitignore`
   - Use environment variables in CI/CD

2. **Firestore Rules**
   - Validate user authentication
   - Limit read/write permissions

3. **API Key Protection**
   - Restrict Gemini API key to specific domains
   - Set up Firebase App Check

4. **HTTPS Only**
   - All deployments use HTTPS
   - Firebase Hosting enforces this by default

---

## Monitoring & Analytics

### Firebase Analytics
```javascript
// In firebase.js
import { getAnalytics } from "firebase/analytics";
export const analytics = getAnalytics(app);
```

### Performance Monitoring
```javascript
import { getPerformance } from "firebase/performance";
export const perf = getPerformance(app);
```

### Error Tracking
- Use Firebase Crashlytics
- Or integrate Sentry:
```bash
npm install @sentry/react
```

---

## Demo Data Setup

For hackathon demos, seed Firestore with sample data:

```javascript
// scripts/seedData.js
const admin = require('firebase-admin');
admin.initializeApp();

const seedMarketData = async () => {
  const marketData = {
    heatmap: [
      { domain: 'AI/ML', demand: 8500, salary: 45, scarcity: 90 },
      // ... more domains
    ]
  };

  await admin.firestore().collection('marketData').doc('heatmap').set(marketData);
  console.log('Market data seeded!');
};

seedMarketData();
```

Run:
```bash
node scripts/seedData.js
```

---

## Next Steps After Deployment

1. ✅ Test all 8 features in production
2. ✅ Share demo link with judges
3. ✅ Prepare presentation deck
4. ✅ Record video walkthrough
5. ✅ Create GitHub repository with documentation

---

## Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Gemini AI Docs**: https://ai.google.dev/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

---

**Deployment Checklist:**

- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Authentication enabled (Google + Email)
- [ ] Gemini API key obtained
- [ ] `.env` file configured
- [ ] Local dev server running
- [ ] All 8 features tested
- [ ] Production build successful
- [ ] Deployed to hosting
- [ ] Demo data loaded
- [ ] Performance optimized
- [ ] Security rules set

**You're ready to win! 🏆**
