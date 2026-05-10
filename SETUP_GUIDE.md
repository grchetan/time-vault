# Time Vault — Complete Setup Guide
# Firebase + Vercel pe Live Website Kaise Banayein

---

## STEP 1 — Zaruri Software Install Karo

1. **Node.js** download karo:
   - https://nodejs.org pe jao
   - "LTS" wala button dabaao aur install karo
   - Install hone ke baad terminal/command prompt kholo
   - Type karo: `node --version`
   - Agar kuch aisa dikhे: `v20.x.x` — ho gaya

2. **VS Code** (code editor) download karo:
   - https://code.visualstudio.com

---

## STEP 2 — Firebase Project Banao (Free)

1. https://console.firebase.google.com pe jao
2. Google account se login karo
3. **"Add project"** click karo
4. Project name do: `timevault` → Continue
5. Google Analytics OFF karo → **"Create project"** click karo

### Authentication Enable Karo:
1. Left sidebar mein **"Build"** → **"Authentication"** click karo
2. **"Get started"** click karo
3. **"Email/Password"** pe click karo
4. Pehla toggle **ON** karo → **Save**

### Firestore Database Banao:
1. Left sidebar mein **"Build"** → **"Firestore Database"** click karo
2. **"Create database"** click karo
3. **"Start in production mode"** select karo → Next
4. Location: `asia-south1 (Mumbai)` select karo → **"Enable"**

### Firestore Security Rules Set Karo:
1. Firestore mein **"Rules"** tab click karo
2. Sab kuch delete karo aur yeh paste karo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /vaults/{vaultId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

3. **"Publish"** click karo

### Firebase Config Keys Lo:
1. Firebase console mein upar **gear icon** → **"Project settings"**
2. Neeche scroll karo **"Your apps"** section mein
3. **"</>"** (Web) icon click karo
4. App nickname: `timevault-web` → **"Register app"**
5. Tumhe ek config milega aisa:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "timevault-xxx.firebaseapp.com",
  projectId: "timevault-xxx",
  storageBucket: "timevault-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

6. Yeh values copy karke rakh lo — agle step mein chahiye hongi

---

## STEP 3 — Project Setup Karo

1. **Timevault folder** apne computer mein kisi jagah rakho
   (jaise: Desktop pe `timevault` folder)

2. `.env.example` file ko copy karo aur naam do `.env.local`

3. `.env.local` file kholo aur Firebase ki values daalo:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=timevault-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=timevault-xxx
VITE_FIREBASE_STORAGE_BUCKET=timevault-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

4. **Terminal/Command Prompt** kholo, project folder mein jao:
```
cd Desktop/timevault
```

5. Dependencies install karo:
```
npm install
```

6. Local test karo:
```
npm run dev
```

7. Browser mein kholo: http://localhost:5173
   — Agar website dikh rahi hai, sab theek hai!

---

## STEP 4 — GitHub pe Upload Karo

1. **GitHub** account banao: https://github.com (free)

2. **GitHub Desktop** download karo: https://desktop.github.com
   (Coding ke bina kaam hoga)

3. GitHub Desktop mein:
   - **"Add an Existing Repository"** click karo
   - Apna `timevault` folder select karo
   - **"create a repository"** link click karo
   - Name: `timevault` → **"Create Repository"**

4. **"Publish repository"** click karo
   - "Keep this code private" checked rakho (recommended)
   - **"Publish Repository"**

---

## STEP 5 — Vercel pe Deploy Karo (Live Website)

1. https://vercel.com pe jao
2. **"Sign up with GitHub"** — same GitHub account use karo
3. **"Add New Project"** click karo
4. `timevault` repository select karo → **"Import"**

5. **Environment Variables** add karo (IMPORTANT):
   - `.env.local` ki har line yahan add karni hai
   - "Environment Variables" section mein:
     - `VITE_FIREBASE_API_KEY` → value paste karo → Add
     - `VITE_FIREBASE_AUTH_DOMAIN` → value paste karo → Add
     - Baaki sab isi tarah add karo (6 variables total)

6. **"Deploy"** click karo

7. 2-3 minute wait karo...

8. **Congratulations!** Tumhari website live hai!
   - Vercel tumhe ek link dega: `https://timevault-xxx.vercel.app`
   - Yeh link share kar sakte ho doosron ke saath

---

## STEP 6 — Future mein Changes Kaise Kare

Jab bhi code mein kuch change karo:
1. GitHub Desktop mein changes dikhenge
2. **"Commit to main"** click karo
3. **"Push origin"** click karo
4. Vercel automatically 1-2 minute mein update kar dega

---

## Common Problems aur Solutions

**Problem: `npm install` kaam nahi kar raha**
Solution: Node.js dobara install karo from nodejs.org

**Problem: Firebase permission error**
Solution: Firestore Rules check karo — Step 2 mein jo rules diye the woh sahi se paste hue hain?

**Problem: Vercel deploy failed**
Solution: Environment variables check karo — sab 6 variables add hue hain?

**Problem: Login nahi ho raha**
Solution: Firebase Authentication mein Email/Password enable hua hai?

---

## Security Notes

- Passwords AES-256 se encrypt hote hain — Firebase mein encrypted form mein store hota hai
- Har user sirf apne vaults dekh sakta hai
- `.env.local` file kabhi bhi GitHub pe upload mat karo (already `.gitignore` mein hai)
- Firebase free tier mein 50,000 reads/day aur 20,000 writes/day milte hain — kaafi hai

---

## Support

Koi problem aye toh Claude se poochho — code ki file aur error message share karo.
