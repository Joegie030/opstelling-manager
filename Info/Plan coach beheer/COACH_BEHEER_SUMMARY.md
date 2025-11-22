# Coach Beheer Feature - Quick Summary

**Version:** 3.1 (Planned)  
**Created:** November 2025

---

## What's New? 🎯

Coach management system met manual invite links. Coaches kunnen elkaar uitnodigen via een 7-dagen geldige link.

## Key Features ✅

1. **Invite Link System**
   - Unieke links (7 dagen geldig)
   - QR code gegenereerd
   - Copy buttons (link + QR)

2. **Pending Invites**
   - Tabel met wachtende uitnodigingen
   - Days remaining counter
   - Revoke button

3. **Active Coaches**
   - Tabel met geaccepteerde coaches
   - Naam, email, rol
   - Remove button (niet jezelf)

4. **Accept Flow**
   - URL: `/accept-invite/:inviteId`
   - Kan registreren OF inloggen
   - Auto add to team

## Files to Create 📁

```
src/components/
├── CoachInviteForm.tsx
├── PendingInvitesList.tsx
├── ActiveCoachesList.tsx
└── InviteCoaches.tsx (update)

src/screens/
└── AcceptInviteScreen.tsx
```

## Firebase Functions to Add 🔥

```
1. getInviteById(inviteId) - Fetch invite
2. acceptInvite(inviteId, userUid, teamId) - Accept invite
3. revokeInvite(inviteId) - Delete invite
4. getTeamCoaches(teamId) - Get coaches list
5. removeCoachFromTeam(teamId, coachUid) - Remove coach
6. getPendingInvitesByTeam(teamId) - Get pending list
```

## Database Updates 💾

**Firestore:**
- `/invites/{inviteId}` - Add `expiresAt`, `teamNaam`, `clubNaam`
- `/teams/{teamId}.coaches[]` - Update with new coaches
- `/coaches/{uid}.teamIds[]` - Update with new teams

## App Integration 🔗

**App.tsx:**
- New route: `/accept-invite/:inviteId`
- New state: `pendingInvites`, `teamCoaches`
- New effects: load coaches + invites per team

**TeamBeheer.tsx:**
- New "Coaches" tab
- CoachInviteForm
- PendingInvitesList
- ActiveCoachesList

## Dependencies 📦

```json
{
  "qrcode.react": "^1.0.1"
}
```

## Timeline ⏱️

- Phase 1: Firebase functions (30 min)
- Phase 2: Components (2 hours)
- Phase 3: Integration (1.5 hours)
- Phase 4: Testing (1 hour)
- Phase 5: Documentation (30 min)

**Total: 5-6 hours**

## Test Scenarios 🧪

- [x] Invite aanmaken
- [x] Link validatie
- [x] QR code generation
- [x] Invite accepteren (register)
- [x] Invite accepteren (login)
- [x] Invite intrekken
- [x] Coach verwijderen
- [x] Expiration check

## Notes 📝

- Manual invite (no auto email)
- 7 days expiration
- Public accept (no email verify)
- Coach roles prep (for v3.2)
- Blaze plan needed (outbound calls)

---

See full plan: [COACH_BEHEER_PLAN.md](./COACH_BEHEER_PLAN.md)
