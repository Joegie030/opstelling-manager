# 🏆 Coach Beheer Feature - Implementatie Plan

**Status:** 🔄 Gepland voor Versie 3.1  
**Prioriteit:** Medium  
**Complexiteit:** Medium  
**Geschatte tijd:** 4-6 uur development

---

## 📋 Overzicht

Uitbreiding van TeamBeheer met volledig coach management systeem. Coaches kunnen uitgenodigd worden via een unieke invite link (7 dagen geldig). Geregistreerde coaches verschijnen met rollen in een overzicht.

**Voordelen:**
- ✅ Multi-coach samenwerking op een team
- ✅ Invite link kan gedeeld worden (copy + QR code)
- ✅ Geen automatische email nodig (handmatig delen)
- ✅ Duidelijk overzicht van actieve coaches en hun rollen
- ✅ Uitnodigingen kunnen ingetrokken worden
- ✅ Coaches kunnen verwijderd worden uit team

---

## 🎯 User Stories

### **User Story 1: Coach uitnodigen**
```
Als hoofd coach
Wil ik andere coaches uitnodigen voor mijn team
Zodat we samen wedstrijden kunnen inplannen en opstellen maken

Acceptatie criteria:
- Ik vul email in en klik "Uitnodigen"
- App toont unieke invite link (7 dagen geldig)
- Link kan gekopieerd worden
- QR code gegenereerd van link
- Succes feedback: "Uitnodiging aangemaakt - deel deze link"
```

### **User Story 2: Invite link accepteren**
```
Als uitgenodigde coach
Wil ik op de invite link klikken
En me kunnen registreren of inloggen
Zodat ik aan het team word toegevoegd

Acceptatie criteria:
- Link: /accept-invite/invite_ABC123
- Toont team info (club naam, team naam, inviter)
- Kan registreren met email + wachtwoord
- Kan inloggen als al account heb
- Na acceptatie: automatisch in team + redirect naar team page
```

### **User Story 3: Pending invites zien**
```
Als hoofd coach
Wil ik zien welke coaches nog niet geaccepteerd hebben
Zodat ik kan volgen wie nog moet accepteren

Acceptatie criteria:
- Tabel met pending invites
- Toont: email, datum, "X dagen over"
- Button: "Intrekken" (delete invite)
- Link verlopen check (na 7 dagen automatisch expire)
```

### **User Story 4: Actieve coaches overzicht**
```
Als hoofd coach
Wil ik zien welke coaches in mijn team zitten
Met hun rol en contact info
Zodat ik hun rechten kan beheren

Acceptatie criteria:
- Tabel met actieve coaches
- Toont: naam, email, rol (admin/coach/viewer)
- Button: "Verwijderen" (niet jezelf)
- Button: "Rol wijzigen" (voor toekomst)
- Toon jezelf ook in de lijst
```

---

## 🏗️ Architecture

### **Database Schema Updates**

#### **1. /invites/{inviteId} - BESTAAND (UITBREIDEN)**
```typescript
interface CoachInvite {
  inviteId: string              // "invite_1702288211000"
  teamId: string                // Team ID
  email: string                 // Coach email
  invitedBy: string             // UID van inviter
  createdAt: string             // ISO timestamp
  status: 'pending' | 'accepted' // Invite status
  
  // NIEUW toevoegen:
  expiresAt: string             // ISO timestamp (createdAt + 7 days)
  teamNaam: string              // Team naam (voor display)
  clubNaam: string              // Club naam (voor display)
}
```

#### **2. /teams/{teamId} - BESTAAND (GEEN WIJZIGING)**
```typescript
interface Team {
  teamId: string
  clubNaam: string
  teamNaam: string
  coaches: string[]             // Array van coach UIDs (BESTAAND)
  createdAt: string
  updatedAt: string
  
  // Subcollections:
  // - spelers/
  // - wedstrijden/
}
```

#### **3. /coaches/{uid} - BESTAAND (GEEN WIJZIGING)**
```typescript
interface Coach {
  uid: string
  email: string
  naam: string
  teamIds: string[]             // Array van team IDs (BESTAAND)
  rol: 'admin' | 'coach' | 'viewer'  // Per team role (BESTAAND)
  createdAt: string
}
```

---

## 📁 Bestandsstructuur (NIEUW + UPDATES)

### **NIEUW Bestanden:**
```
src/
├── components/
│   ├── CoachInviteForm.tsx          ← NIEUW (refactored uit InviteCoaches)
│   ├── PendingInvitesList.tsx        ← NIEUW (pending uitnodigingen)
│   ├── ActiveCoachesList.tsx         ← NIEUW (actieve coaches met rollen)
│   └── InviteCoaches.tsx             ← UPDATE (wrapper)
│
└── screens/
    └── AcceptInviteScreen.tsx        ← NIEUW (invite accepteren)
```

### **UPDATE Bestanden:**
```
src/
├── firebase/
│   └── firebaseService.ts            ← ADD 5 nieuwe functies
│
├── screens/
│   └── TeamBeheer.tsx                ← ADD Coaches tab
│
├── App.tsx                            ← ADD route + state
│
├── types/
│   └── index.ts                      ← ADD CoachInvite interface
│
└── package.json                       ← ADD qrcode.react
```

---

## 🔧 Firebase Service Functies (NIEUW)

### **Functie 1: getInviteById**
```typescript
export const getInviteById = async (inviteId: string): Promise<CoachInvite | null> => {
  // Haalt invite details op
  // Checks: is invite verlopen? (expiresAt < now)
  // Returns: invite data of null als verlopen
}
```

### **Functie 2: acceptInvite**
```typescript
export const acceptInvite = async (
  inviteId: string, 
  userUid: string, 
  teamId: string
): Promise<void> => {
  // 1. Updates: /invites/{inviteId} → status = "accepted"
  // 2. Updates: /coaches/{userUid} → add teamId to teamIds[]
  // 3. Updates: /teams/{teamId} → add userUid to coaches[]
  // Error handling: team bestaat niet, user bestaat niet, etc
}
```

### **Functie 3: revokeInvite**
```typescript
export const revokeInvite = async (inviteId: string): Promise<void> => {
  // Deletes: /invites/{inviteId}
  // Voor hoofd coach die uitnodiging in wil trekken
}
```

### **Functie 4: getTeamCoaches**
```typescript
export const getTeamCoaches = async (teamId: string): Promise<Coach[]> => {
  // 1. Haalt team.coaches[] array op (UIDs)
  // 2. Voor elk UID: haalt coach details op
  // Returns: Array van Coach objecten met volledige info
}
```

### **Functie 5: removeCoachFromTeam**
```typescript
export const removeCoachFromTeam = async (
  teamId: string, 
  coachUid: string
): Promise<void> => {
  // 1. Updates: /teams/{teamId} → remove coachUid from coaches[]
  // 2. Updates: /coaches/{coachUid} → remove teamId from teamIds[]
  // Safety: hoofd coach kan zichzelf niet verwijderen
}
```

### **Functie 6: getPendingInvitesByTeam** (Bonus)
```typescript
export const getPendingInvitesByTeam = async (teamId: string): Promise<CoachInvite[]> => {
  // Query: /invites
  // Filter: teamId === param AND status === 'pending'
  // Returns: array van pending invites
}
```

---

## 🖼️ UI Components

### **Component 1: CoachInviteForm**
**Props:**
```typescript
interface Props {
  teamId: string
  teamNaam: string
  clubNaam: string
  currentCoachUid: string
  onInviteSent: (inviteId: string, link: string) => void
}
```

**Functionaliteit:**
- Email input veld
- "Uitnodigen" button
- Genereert invite link
- Genereeert QR code van link
- Copy button voor link
- Copy button voor QR code
- Success feedback: "Link geldig voor 7 dagen"

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Coach Uitnodigen

Voer email in: [coach@example.com] [Uitnodigen]

✅ Uitnodiging aangemaakt!

Link (geldig 7 dagen):
https://joegie.nl/accept-invite/invite_abc123
[📋 Kopieëren]

QR Code:
[QR CODE IMAGE]
[📱 Kopieëren als QR]

💡 Tip: Deel deze link met de coach
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **Component 2: PendingInvitesList**
**Props:**
```typescript
interface Props {
  teamId: string
  pendingInvites: CoachInvite[]
  onRevoke: (inviteId: string) => Promise<void>
}
```

**Functionaliteit:**
- Tabel met pending invites
- Toont: email, datum uitgenodigd, "X dagen over"
- Button: "Intrekken" (verwijdert invite)
- Loading state bij intrekken
- Empty state als geen pending

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Wachtende Uitnodigingen

Email                | Uitgenodigd | Over   | Acties
────────────────────┼─────────────┼────────┼─────────
coach1@example.com   | 2 dagen    | 5 d.  | [Intrekken]
coach2@example.com   | 1 dag      | 6 d.  | [Intrekken]

Geen wachtende uitnodigingen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **Component 3: ActiveCoachesList**
**Props:**
```typescript
interface Props {
  teamId: string
  coaches: Coach[]
  currentCoachUid: string
  onRemoveCoach: (coachUid: string) => Promise<void>
}
```

**Functionaliteit:**
- Tabel met actieve coaches
- Toont: naam, email, rol (admin/coach/viewer)
- Button: "Verwijderen" (niet jezelf)
- Loading state bij verwijderen
- Toon jezelf met badge "Dit ben jij"

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Actieve Coaches

Naam          | Email            | Rol    | Acties
──────────────┼──────────────────┼────────┼──────────
Jan Janssen   | jan@example.com  | admin  | Dit ben jij
Marie Pieterse| marie@example.com| coach  | [Verwijder]

Tot: 2 coaches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **Component 4: AcceptInviteScreen**
**Props:** (Route parameter)
```typescript
// URL: /accept-invite/invite_ABC123
interface RouteParams {
  inviteId: string
}
```

**Flow:**
1. Load invite details
2. Check: geldig? (expiresAt > now)
3. Check: al geaccepteerd?
4. Display:
   - Team info (club + naam)
   - Invite info (van wie, wanneer)
   - Message: "Je bent uitgenodigd voor Team X"
5. Buttons:
   - "Inloggen" → route naar login (invite in state)
   - "Registreren" → route naar register (invite in state)
   - "Annuleren" → terug naar home

**After login/register:**
- Auto acceptInvite() call
- Success: redirect naar team page
- Error: show error message

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Je bent uitgenodigd!

Club: Ajax Amsterdam
Team: E2

Uitgenodigd door: John Coach
Datum: 3 dagen geleden
Geldig tot: 4 dagen

━ Kies wat je wil doen ━

[Inloggen] [Registreren] [Annuleren]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **Component 5: TeamBeheer - Coaches Tab (UPDATE)**

**Layout:**
```
TeamBeheer
├── [Dropdown team selector]
├── Team info editor
└── Tabs:
    ├── 👥 Vaste Spelers
    ├── 👤 Gast Spelers
    └── 🏆 Coaches ← NIEUW TAB
        ├── CoachInviteForm
        ├── PendingInvitesList
        └── ActiveCoachesList
```

---

## 🔄 App.tsx Changes

### **Route Addition:**
```typescript
// In huidigScherm router:
case 'accept-invite':
  return <AcceptInviteScreen />
```

### **State Addition:**
```typescript
const [pendingInvites, setPendingInvites] = useState<CoachInvite[]>([])
const [teamCoaches, setTeamCoaches] = useState<Coach[]>([])
```

### **Effects Addition:**
```typescript
// Load pending invites when team selected
useEffect(() => {
  if (selectedTeamId) {
    getPendingInvitesByTeam(selectedTeamId)
      .then(setPendingInvites)
  }
}, [selectedTeamId])

// Load team coaches when team selected
useEffect(() => {
  if (selectedTeamId) {
    getTeamCoaches(selectedTeamId)
      .then(setTeamCoaches)
  }
}, [selectedTeamId])
```

### **Handlers Addition:**
```typescript
const handleAcceptInvite = async (inviteId: string) => {
  if (!currentCoach) return
  await acceptInvite(inviteId, currentCoach.uid, selectedTeamId!)
  // Reload coaches + invites
}

const handleRevokeInvite = async (inviteId: string) => {
  await revokeInvite(inviteId)
  // Reload invites
}

const handleRemoveCoach = async (coachUid: string) => {
  await removeCoachFromTeam(selectedTeamId!, coachUid)
  // Reload coaches
}
```

---

## 📦 Dependencies (npm)

### **Toevoegen aan package.json:**
```json
{
  "qrcode.react": "^1.0.1"
}
```

### **Install:**
```bash
npm install qrcode.react
```

---

## 🛡️ Security Considerations

### **Firestore Security Rules:**
```javascript
// BESTAAND - ondersteuning voor coaches array
match /teams/{teamId} {
  allow read, write: if request.auth.uid in resource.data.coaches;
  
  match /spelers/{doc=**} {
    allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
  }
  
  match /wedstrijden/{doc=**} {
    allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
  }
}

// NIEUW - public access tot invites (voor accept flow)
match /invites/{inviteId} {
  allow read: if true  // Iedereen kan invite details zien
  allow write: if request.auth.uid == resource.data.invitedBy  // Alleen creator kan wijzigen
}
```

### **Validations (Frontend + Backend):**
- ✅ Invite link verlopen check
- ✅ Duplicate coaches check (email kan maar 1x per team)
- ✅ Self-removal prevention (hoofd coach kan zichzelf niet verwijderen)
- ✅ Coach exists check (voordat team update)

---

## 🧪 Test Scenarios

### **Test 1: Invite aanmaken**
```
1. Hoofd coach vult email in
2. Klikt "Uitnodigen"
3. Link wordt gegenereerd en getoond
4. Invite staat in pending list
5. Expires at = createdAt + 7 days
```

### **Test 2: Invite accepteren**
```
1. Nieuwe coach opent link
2. Ziet team info
3. Klikt "Registreren"
4. Vult email + wachtwoord in
5. Klikt "Accepteer uitnodiging"
6. Status changed to "accepted"
7. Coach appears in active coaches list
```

### **Test 3: Invite intrekken**
```
1. Hoofd coach ziet pending invite
2. Klikt "Intrekken"
3. Invite verwijderd uit Firestore
4. Invite verdwijnt uit pending list
```

### **Test 4: Invite verlopen**
```
1. Invite aangemaakt 7+ dagen geleden
2. Nieuwe coach opent link
3. Error: "Link verlopen"
4. Moet nieuwe uitnodiging vragen
```

### **Test 5: Coach verwijderen**
```
1. Hoofd coach ziet actieve coach
2. Klikt "Verwijder"
3. Coach verwijderd uit team.coaches[]
4. Coach verwijderd uit coach.teamIds[]
5. Coach verdwijnt uit active list
```

---

## 📚 Documentatie Updates (README)

- [ ] Add Coach Beheer feature description
- [ ] Add "Planned for v3.1" section
- [ ] Add workflow diagram
- [ ] Add security rules
- [ ] Update feature list
- [ ] Add troubleshooting section

---

## 🚀 Implementation Order

### **Phase 1: Backend Setup** (30 min)
1. Firestore Security Rules update
2. Add CoachInvite interface
3. Implement 6 firebase service functions

### **Phase 2: Components** (2 hours)
1. CoachInviteForm.tsx
2. PendingInvitesList.tsx
3. ActiveCoachesList.tsx
4. AcceptInviteScreen.tsx

### **Phase 3: Integration** (1.5 hours)
1. Update TeamBeheer.tsx (add Coaches tab)
2. Update App.tsx (add route + state)
3. Update firebaseService.ts (exports)

### **Phase 4: Testing & Polish** (1 hour)
1. Test all scenarios
2. Error handling
3. Loading states
4. Success feedback

### **Phase 5: Documentation** (30 min)
1. README update
2. Inline comments
3. Troubleshooting guide

**Total: ~5-6 hours**

---

## 📝 Notes

- Manual invite link (geen email automatisatie)
- QR code voor gemakkelijk delen
- 7 dagen expiration
- Public invite accept (geen email verification nodig)
- Coach rollen voorbereiding (admin/coach/viewer) - implementation later

---

## ✅ Definition of Done

- [ ] Alle firebase functies getest
- [ ] Alle components functioned
- [ ] AcceptInviteScreen route werkt
- [ ] Pending invites zichtbaar
- [ ] Active coaches zichtbaar
- [ ] Invite expiration werkt
- [ ] Security rules correct
- [ ] README updated
- [ ] No console errors
- [ ] Mobile responsive

---

**Created:** November 2025  
**Version:** 1.0  
**Status:** Ready for Implementation
