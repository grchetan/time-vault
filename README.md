# Time Vault 🔐

> Lock your passwords behind a timer. Unlock only when you're ready.
> 
> Apne passwords ko timer ke peeche lock karo — tab tak koi nahi dekh sakta, aap bhi nahi.

---

## What is Time Vault?

Time Vault is a self-discipline tool that helps you stay away from distracting apps (Snapchat, Instagram, etc.) by locking their passwords for a set duration — 1 minute, 30 days, or even 1 year.

Once locked, **no one can see the password** until the timer expires — not even you.

---

## Features

- **Timer Lock** — lock passwords for minutes, days, months, or years
- **AES-256 Encryption** — passwords are encrypted on your device before being saved
- **Multiple Passwords** — lock up to 5 passwords in one vault
- **Reason Field** — write why you're locking (for motivation)
- **Dark Mode** — easy on the eyes
- **Cross-device sync** — access your vaults from any device via Firebase
- **Email Notification** — get notified when a vault unlocks (optional)
- **Privacy Policy & Terms** — included

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Encryption | Web Crypto API (AES-256-GCM) |
| Hosting | Vercel |

---

## Screenshots

> Coming soon

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/grchetan/time-vault.git
cd time-vault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Email/Password Authentication**
4. Create a **Firestore Database** (production mode, asia-south1)
5. Set Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /vaults/{vaultId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

6. Get your Firebase config keys from **Project Settings → Your Apps → Web**

### 4. Create `.env.local`

Copy `.env.example` to `.env.local` and fill in your Firebase keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Email notifications via EmailJS
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_NOTIFICATION_EMAIL=your@email.com
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add all environment variables from `.env.local`
4. Click **Deploy**

Done! Your site is live. 🚀

---

## Firestore Index

Add a composite index in Firestore for the vaults query:

| Collection | Field 1 | Field 2 |
|-----------|---------|---------|
| vaults | uid (Ascending) | createdAt (Descending) |

---

## How It Works

```
User enters password
        ↓
AES-256-GCM encryption (on device)
        ↓
Encrypted data saved to Firestore
        ↓
Timer starts counting down
        ↓
Timer expires → "Show password" button appears
        ↓
Password decrypted on device → shown to user
```

The **encryption key is stored with the data** — only accessible when the timer condition is met on the client side. Server never sees the plain password.

---

## Security Notes

- Passwords are encrypted **before** leaving your device
- Firebase stores only encrypted ciphertext
- No server-side decryption is possible
- This is a **self-discipline tool** — it relies on honest use

---

## Contributing

Pull requests welcome! Open an issue first to discuss what you'd like to change.

---

## License

MIT License — free to use and modify.

---

## Author

Built by [@grchetan](https://github.com/grchetan)

---

> *"The best way to avoid distraction is to make it hard to access."*
