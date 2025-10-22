# 🚀 Firebase Integratie Setup Guide

## 📋 Bestanden die je hebt

1. **firebaseService.ts** - Firebase connection + functies
2. **AuthScreen.tsx** - Login/Register scherm
3. **InviteCoaches.tsx** - Coaches uitnodigen component
4. **App-firebase.tsx** - Geupdate App.tsx met Firebase

---

## 🔧 Installatie Stappen

### Stap 1: Firebase pakket installeren
```bash
npm install firebase
```

### Stap 2: Bestanden plaatsen

1. **firebaseService.ts** → `src/firebase/firebaseService.ts` (maak folder `firebase`)
2. **AuthScreen.tsx** → `src/components/AuthScreen.tsx`
3. **InviteCoaches.tsx** → `src/components/InviteCoaches.tsx`
4. **App-firebase.tsx** → Vervang je `src/App.tsx` ermee (rename naar App.tsx)

### Stap 3: Dependencies update

Zorg dat je deze imports hebt in je `package.json`:
```json
"dependencies": {
  "firebase": "^10.x.x",
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "lucide-react": "latest"
}
```

---

## 🔐 Firebase Console Setup (al gedaan!)

Je hebt al:
- ✅ Firebase project aangemaakt
- ✅ Authentication (Email/Password) ingeschakeld
- ✅ Firestore Database aangemaakt

**Nu alleen nog:**
1. Ga naar Firebase Console → Firestore Database
2. Voeg deze **Firestore Rules** toe (Security tab):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coaches kunnen hun eigen profiel lezen
    match /coaches/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Teams - coaches van team kunnen lezen/schrijven
    match /teams/{teamId} {
      allow read: if request.auth.uid in resource.data.coaches;
      allow write: if request.auth.uid in resource.data.coaches;
    }

    // Invites - coaches kunnen hun invites zien
    match /invites/{inviteId} {
      allow read: if request.auth.token.email == resource.data.email;
      allow write: if request.auth.uid == request.resource.data.invitedBy;
    }
  }
}
```

---

## ✨ Hoe werkt het?

### Registration Flow:
1. Coach klikt "Registreer"
2. Voer email, wachtwoord, naam in
3. Account wordt aangemaakt
4. Coach krijgt **nieuw team** met random teamId
5. Coach is nu **admin** van dit team

### Login Flow:
1. Coach klikt "Inloggen"
2. Voer email + password in
3. App laadt team data van Firestore
4. Everything syncs real-time

### Invite Flow:
1. Eerste coach gaat naar "Team" scherm
2. Vult email van andere coach in
3. Andere coach registreert (met die email)
4. Andere coach accepteert uitnodiging
5. Beiden zien hetzelfde team + data in real-time!

---

## 🎯 Key Features

### ✅ Multi-Coach Support
- Meerdere coaches kunnen inloggen
- Iedereen ziet dezelfde data
- Real-time sync (geen refresh nodig!)

### ✅ Auto-Save
- Alle wijzigingen worden automatic naar Firestore gestuurd
- Geen "Save" knop nodig
- 1 seconde delay (prevents too many writes)

### ✅ Accounts
- Coaches hebben login accounts
- Password recovery (via Firebase)
- Session persist (blijft ingelogd)

### ✅ Rollen (basis)
- Nu allemaal "admin"
- Later kan je rollen toevoegen

---

## 🚀 Testen

1. **Start app**: `npm run dev`
2. **Eerste coach**:
   - Registreer (email: coach1@test.com)
   - Voeg spelers toe
   - Maak wedstrijd aan
3. **Tweede coach** (nieuw browser/incognito):
   - Registreer (email: coach2@test.com)
4. **Eerste coach** gaat naar "Team":
   - Voegt coach2@test.com uit
5. **Tweede coach**:
   - Ziet invite accepteren
   - Logt in
   - **ZIE JE DEZELFDE DATA!** ✨

---

## ⚙️ Environment Variables (optioneel)

Als je env vars wilt gebruiken (veiliger):

1. Maak `.env.local` in root:
```
VITE_FIREBASE_API_KEY=AIzaSyDOsTcZJr-8zfHd09adRKIw0GSe4YWj3zg
VITE_FIREBASE_AUTH_DOMAIN=opstelling-manager.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=opstelling-manager
```

2. Update `firebaseService.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... rest
};
```

---

## 🐛 Troubleshooting

### "Firebase not initialized"
- Zorg dat `firebaseService.ts` in `src/firebase/` staat
- Import path checken in App.tsx

### Login werkt niet
- Check email/password
- Check Firestore database in Firebase console
- Controleer Authentication settings

### Data synct niet
- Open DevTools → Network
- Check of Firestore calls lukken
- Check Firestore Rules (moet niet "denied")

### Meerdere coaches zien data niet
- Beide coaches moeten **hetzelfde team** hebben
- Check Firestore → teams collection → coaches array

---

## 📞 Volgende Stappen

1. **Test dit goed**
2. **Feedback geven wat niet werkt**
3. **Dan kunnen we nog toevoegen:**
   - Rollen system (read-only coaches)
   - Real-time notifications
   - Meerdere teams per coach
   - Data export/backup

---

## 💡 Belangrijke Files

| File | Purpose |
|------|---------|
| firebaseService.ts | Alle Firebase functies |
| AuthScreen.tsx | Login/Register UI |
| InviteCoaches.tsx | Coaches uitnodigen |
| App-firebase.tsx | Main app met auth |

---

Veel succes! 🚀
