# 🗄️ JOEGIE - JUISTE Firebase Database Structuur (ACTUEEL - GEEN SEIZOENEN)

## ✅ HUIDI STRUCTUUR (Zonder Seizoenen)

```
firestore/
│
├── teams/{teamId}
│   ├── teamId: string
│   ├── clubNaam: string
│   ├── teamNaam: string
│   ├── coaches: string[]  (array van coach UIDs)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   │
│   ├── spelers/{spelerId}
│   │   ├── id: number
│   │   ├── naam: string
│   │   ├── type: 'vast' | 'gast'
│   │   ├── team?: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   └── wedstrijden/{wedstrijdId}
│       ├── id: number
│       ├── datum: string (bijv. "2024-10-26")
│       ├── tegenstander: string
│       ├── thuisUit: 'thuis' | 'uit'
│       ├── type?: 'competitie' | 'oefenwedstrijd'
│       ├── formatie: '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8'
│       ├── afwezigeSpelers: number[]
│       ├── notities: string
│       ├── themas: string[]
│       ├── isAfgelast: boolean
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       │
│       └── kwarten/{kwartNum}  (1, 2, 3, 4)
│           ├── nummer: number
│           ├── opstelling: { [positie]: spelerId }
│           │   ├── "Keeper": "12345"
│           │   ├── "Achter": "23456"
│           │   ├── "Links": "34567"
│           │   ├── "Midden": "45678"
│           │   ├── "Rechts": "56789"
│           │   └── "Voor": "67890"
│           ├── wissels: Wissel[]
│           │   ├── id: number
│           │   ├── positie: string
│           │   └── wisselSpelerId: string
│           ├── doelpunten: Doelpunt[]
│           │   ├── id: number
│           │   ├── spelerId?: number
│           │   ├── type: 'eigen' | 'tegenstander'
│           │   └── tijdstip?: string
│           ├── minuten: number
│           ├── aantekeningen: string
│           ├── themaBeoordelingen: { [themaId]: 'goed' | 'beter' | null }
│           ├── observaties: string[]
│           └── updatedAt: timestamp
│
├── coaches/{uid}
│   ├── uid: string
│   ├── email: string
│   ├── naam: string
│   ├── teamIds: string[]  (ARRAY! Coach kan meerdere teams hebben)
│   ├── rol: 'admin' | 'coach' | 'viewer'
│   └── createdAt: timestamp
│
└── invites/{inviteId}
    ├── inviteId: string
    ├── teamId: string
    ├── email: string
    ├── invitedBy: string
    ├── createdAt: timestamp
    └── status: 'pending' | 'accepted' | 'rejected'
```

---

## 🔑 KEY PUNTEN:

### **1. Coach heeft `teamIds` (ARRAY)**
```typescript
// ❌ FOUT (oud):
coach: { teamId: "team_123" }

// ✅ JUIST:
coach: { 
  uid: "uid_coach1",
  email: "coach@example.com",
  naam: "John Doe",
  teamIds: ["team_123", "team_456"],  // Kan meerdere teams hebben!
  rol: "coach"
}
```

### **2. Spelers zijn direct onder team (GEEN seizoenen)**
```
✅ /teams/{teamId}/spelers/  ← Alle spelers van dit team
```

### **3. Wedstrijden zijn direct onder team (GEEN seizoenen)**
```
✅ /teams/{teamId}/wedstrijden/  ← Alle wedstrijden van dit team
```

### **4. Kwarten onder wedstrijden**
```
✅ /teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/1
✅ /teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/2
✅ /teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/3
✅ /teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/4
```

---

## 📝 CONCRETE VOORBEELD:

### Team aanmaken:
```json
{
  "teamId": "team_1725369528123",
  "clubNaam": "Mijn Club",
  "teamNaam": "Team A",
  "coaches": ["uid_coach1", "uid_coach2"],
  "createdAt": "2024-10-26T10:30:00Z",
  "updatedAt": "2024-10-26T10:30:00Z"
}
```

### Speler toevoegen:
```json
{
  "id": 12345,
  "naam": "Jan de Vries",
  "type": "vast",
  "createdAt": "2024-10-26T10:30:00Z",
  "updatedAt": "2024-10-26T10:30:00Z"
}
```

### Wedstrijd aanmaken:
```json
{
  "id": 1725369528123,
  "datum": "2024-10-26",
  "tegenstander": "FC Ajax",
  "thuisUit": "thuis",
  "type": "competitie",
  "formatie": "6x6-vliegtuig",
  "afwezigeSpelers": [],
  "notities": "Goed gespeeld!",
  "themas": ["aanvallen", "compact"],
  "isAfgelast": false,
  "createdAt": "2024-10-26T10:30:00Z",
  "updatedAt": "2024-10-26T10:30:00Z"
}
```

### Kwart 1 data:
```json
{
  "nummer": 1,
  "opstelling": {
    "Keeper": "12345",
    "Achter": "23456",
    "Links": "34567",
    "Midden": "45678",
    "Rechts": "56789",
    "Voor": "67890"
  },
  "wissels": [
    {
      "id": 1,
      "positie": "Keeper",
      "wisselSpelerId": "78901"
    }
  ],
  "doelpunten": [
    {
      "id": 1,
      "spelerId": 12345,
      "type": "eigen"
    },
    {
      "id": 2,
      "type": "tegenstander"
    }
  ],
  "minuten": 12.5,
  "aantekeningen": "Goed aanvallen",
  "themaBeoordelingen": {
    "aanvallen": "goed",
    "compact": "beter"
  },
  "observaties": ["sterk kwart"],
  "updatedAt": "2024-10-26T10:45:00Z"
}
```

### Coach profiel:
```json
{
  "uid": "uid_coach1",
  "email": "coach@example.com",
  "naam": "John Doe",
  "teamIds": ["team_1725369528123", "team_1725369528124"],
  "rol": "coach",
  "createdAt": "2024-10-26T10:30:00Z"
}
```

---

## 🔒 FIRESTORE SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Teams: alleen coaches kunnen hun team zien en wijzigen
    match /teams/{teamId} {
      allow read, write: if request.auth.uid in resource.data.coaches;
      
      // Spelers onder team
      match /spelers/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
      
      // Wedstrijden onder team
      match /wedstrijden/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
    }
    
    // Coaches: coaches kunnen hun eigen profiel zien
    match /coaches/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }
    
    // Invites: via email of invitedBy
    match /invites/{inviteId} {
      allow read, write: if request.auth.email == resource.data.email || request.auth.uid == resource.data.invitedBy;
    }
  }
}
```

---

## 🚀 APP FLOW:

### **1. Coach logt in:**
```
- Firebase Auth: email + wachtwoord
- Coach document ophalen: /coaches/{uid}
- teamIds array zien: ["team_123", "team_456"]
```

### **2. Coach selecteert team:**
```
- App.tsx: setSelectedTeamId("team_123")
- Team data laden: /teams/team_123
  - clubNaam
  - teamNaam
  - coaches array
```

### **3. Coach laadt spelers:**
```
getSpelers("team_123")
→ query collection(db, 'teams', 'team_123', 'spelers')
→ getDoc() alle spelers
```

### **4. Coach laadt wedstrijden:**
```
getWedstrijden("team_123")
→ query collection(db, 'teams', 'team_123', 'wedstrijden')
→ getDocs() alle wedstrijden met kwarten
```

### **5. Coach maakt wedstrijd aan:**
```
- Kiest formatie
- addWedstrijd("team_123", wedstrijdData)
→ setDoc(/teams/team_123/wedstrijden/{id})
→ Creëert 4 kwarten subcollections
```

### **6. Coach vult opstelling in:**
```
- Per kwart spelers toevoegen
- updateKwart("team_123", wedstrijdId, kwartNum, data)
→ setDoc(/teams/team_123/wedstrijden/{id}/kwarten/1)
```

---

## 📋 CHECKLIST:

- [ ] Firebase database volgt DEZE structuur
- [ ] Coach object heeft `teamIds` (array)
- [ ] Spelers direct onder `/teams/{teamId}/spelers/`
- [ ] Wedstrijden direct onder `/teams/{teamId}/wedstrijden/`
- [ ] Kwarten onder `/teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/`
- [ ] firebaseService.ts gebruokt juiste paths (ZONDER seizoenId)
- [ ] App.tsx geeft `selectedTeamId` door
- [ ] Security Rules kopieërd naar Firebase Console

---

## 🔧 firebaseService.ts FUNCTIONS:

Moeten deze paths gebruiken (GEEN seizoenId):

```typescript
getTeam(teamId)                                          // /teams/{teamId}
getSpelers(teamId)                                       // /teams/{teamId}/spelers/
getWedstrijden(teamId)                                   // /teams/{teamId}/wedstrijden/
addWedstrijd(teamId, wedstrijd)                          // /teams/{teamId}/wedstrijden/
updateKwart(teamId, wedstrijdId, kwartNum, data)        // /teams/{teamId}/wedstrijden/{id}/kwarten/{num}
```

---

## ✅ ALS JE DIT VOLGT:

✅ Alle functions werken
✅ Multi-team support werkt
✅ Synchronisatie werkt
✅ Security rules werken
✅ Geen seizoenen verwarring!

**KLAAR!** 🚀

