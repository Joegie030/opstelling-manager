# 🗄️ Coach Beheer - Database Schema Updates

**Feature:** Coach Management System v3.1  
**Database:** Firestore  
**Last Updated:** November 2025

---

## 📋 Overview

Dit document beschrijft alle Firestore schema updates nodig voor de Coach Beheer feature.

---

## 🔄 Collection: /invites (BESTAAND → UITGEBREID)

### Before (v3.0)
```typescript
interface CoachInvite {
  inviteId: string
  teamId: string
  email: string
  invitedBy: string
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected'
}
```

### After (v3.1) ✅ UPDATED
```typescript
interface CoachInvite {
  // Bestaand
  inviteId: string              // "invite_1702288211000"
  teamId: string                // Team ID
  email: string                 // Coach email
  invitedBy: string             // UID van uitnodigder
  createdAt: string             // ISO timestamp "2025-11-07T10:30:00Z"
  status: 'pending' | 'accepted' | 'rejected'
  
  // NIEUW FIELDS
  expiresAt: string             // ISO timestamp (createdAt + 7 days)
  teamNaam: string              // Team naam bijv. "Team A"
  clubNaam: string              // Club naam bijv. "Ajax Amsterdam"
}
```

### Example Document
```json
{
  "inviteId": "invite_1702288211000",
  "teamId": "team_1725369528123",
  "email": "coach@example.com",
  "invitedBy": "uid_coach1",
  "createdAt": "2025-11-07T10:30:00Z",
  "expiresAt": "2025-11-14T10:30:00Z",
  "status": "pending",
  "teamNaam": "Team A",
  "clubNaam": "Ajax Amsterdam"
}
```

### Firestore Rules
- [x] Public read access (no auth required)
- [x] Create: Only after invite clicked
- [x] Update: Only by document creator (invitedBy)
- [x] Delete: Only by document creator

---

## ✅ Collection: /coaches/{uid} (BESTAAND → GEEN WIJZIGING)

### Schema (No Changes - Already Supports Multi-Team)
```typescript
interface Coach {
  uid: string                   // Firebase Auth UID
  email: string                 // Coach email
  naam: string                  // Coach name
  teamIds: string[]             // Array van team IDs (BESTAAND)
  rol: 'admin' | 'coach' | 'viewer'  // Role per team (BESTAAND)
  createdAt: string             // ISO timestamp
}
```

### Example Document
```json
{
  "uid": "uid_coach1",
  "email": "coach1@example.com",
  "naam": "John Doe",
  "teamIds": ["team_123", "team_456"],
  "rol": "admin",
  "createdAt": "2025-10-20T09:15:00Z"
}
```

### What Happens
- ✅ When invite accepted: `teamIds` array gets new team ID added
- ✅ When coach removed: `teamIds` array gets team ID removed

---

## 🏆 Collection: /teams/{teamId} (BESTAAND → GEEN WIJZIGING)

### Schema (No Changes - Already Supports Multi-Coach)
```typescript
interface Team {
  teamId: string                // "team_1725369528123"
  clubNaam: string              // Club name
  teamNaam: string              // Team name
  coaches: string[]             // Array van coach UIDs (BESTAAND)
  createdAt: string             // ISO timestamp
  updatedAt: string             // ISO timestamp
  
  // Subcollections (not shown here):
  // spelers/
  // wedstrijden/
}
```

### Example Document
```json
{
  "teamId": "team_1725369528123",
  "clubNaam": "Ajax Amsterdam",
  "teamNaam": "Team A",
  "coaches": ["uid_coach1", "uid_coach2"],
  "createdAt": "2025-10-20T09:00:00Z",
  "updatedAt": "2025-11-07T10:30:00Z"
}
```

### What Happens
- ✅ When invite accepted: `coaches` array gets new coach UID added
- ✅ When coach removed: `coaches` array gets coach UID removed

---

## 📊 Data Flow Examples

### Example 1: Create Invite
```
User clicks "Uitnodigen" with coach@example.com

→ inviteCoach(teamId, "coach@example.com", currentCoachUid)

→ Creates document in /invites:
{
  "inviteId": "invite_1702288211000",
  "teamId": "team_123",
  "email": "coach@example.com",
  "invitedBy": "uid_coach1",
  "createdAt": "2025-11-07T10:30:00Z",
  "expiresAt": "2025-11-14T10:30:00Z",   ← 7 days later
  "status": "pending",
  "teamNaam": "Team A",
  "clubNaam": "Ajax"
}
```

### Example 2: Accept Invite
```
Coach opens link /accept-invite/invite_ABC123

→ getInviteById("invite_ABC123")
→ acceptInvite("invite_ABC123", "uid_coach2", "team_123")

→ Updates /invites/invite_ABC123:
{
  ...
  "status": "accepted"  ← Changed from "pending"
}

→ Updates /coaches/uid_coach2:
{
  ...
  "teamIds": ["team_123"]  ← Added new team
}

→ Updates /teams/team_123:
{
  ...
  "coaches": ["uid_coach1", "uid_coach2"]  ← Added new coach
}
```

### Example 3: Revoke Invite
```
Coach clicks "Intrekken" on pending invite

→ revokeInvite("invite_ABC123")

→ Deletes /invites/invite_ABC123 completely
```

### Example 4: Remove Coach
```
Coach clicks "Verwijder" on active coach

→ removeCoachFromTeam("team_123", "uid_coach2")

→ Updates /teams/team_123:
{
  ...
  "coaches": ["uid_coach1"]  ← Removed coach UID
}

→ Updates /coaches/uid_coach2:
{
  ...
  "teamIds": []  ← Removed team ID
}
```

---

## 🔒 Firestore Security Rules

### Current Rules (Keep Existing)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Teams: csak coaches az olvasni/írni
    match /teams/{teamId} {
      allow read, write: if request.auth.uid in resource.data.coaches;
      
      // Spelers under team
      match /spelers/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
      
      // Wedstrijden under team
      match /wedstrijden/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
    }
    
    // Coaches: coach can read own profile
    match /coaches/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }
  }
}
```

### New Rules (Add for Invites)
```javascript
// Add to existing rules:

// Invites: Public read, creator can manage
match /invites/{inviteId} {
  allow read: if true;  // Public - anyone can see (for accept flow)
  allow write: if request.auth.uid == resource.data.invitedBy;  // Only creator
  allow create: if request.auth.uid != null;  // Authenticated users can create
}
```

### Full Updated Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Teams
    match /teams/{teamId} {
      allow read, write: if request.auth.uid in resource.data.coaches;
      
      match /spelers/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
      
      match /wedstrijden/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
    }
    
    // Coaches
    match /coaches/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }
    
    // Invites ← NEW
    match /invites/{inviteId} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow write, delete: if request.auth.uid == resource.data.invitedBy;
    }
  }
}
```

---

## 📝 Implementation Checklist

### Before Deployment
- [ ] Review security rules with team
- [ ] Test security rules locally with emulator
- [ ] Confirm all new fields documented
- [ ] Backup existing Firestore data
- [ ] Test migration on staging

### Deployment Steps
1. [ ] Update Firestore security rules in Firebase Console
2. [ ] No migration needed (new fields, not modifying existing)
3. [ ] Deploy updated app code
4. [ ] Monitor logs for errors
5. [ ] Confirm invites working end-to-end

---

## 🧪 Test Cases for Schema

### Test 1: Create Invite with New Fields
```
CREATE /invites/invite_123
├── inviteId: "invite_123" ✓
├── teamId: "team_123" ✓
├── email: "coach@test.com" ✓
├── invitedBy: "uid_creator" ✓
├── createdAt: "2025-11-07T10:00:00Z" ✓
├── expiresAt: "2025-11-14T10:00:00Z" ✓ (7 days later)
├── status: "pending" ✓
├── teamNaam: "Team A" ✓
└── clubNaam: "Ajax" ✓
```

### Test 2: Accept Invite Updates Multiple Collections
```
BEFORE:
/teams/team_123/coaches: ["uid_coach1"]
/coaches/uid_coach2/teamIds: []
/invites/invite_123/status: "pending"

AFTER acceptInvite():
/teams/team_123/coaches: ["uid_coach1", "uid_coach2"] ✓
/coaches/uid_coach2/teamIds: ["team_123"] ✓
/invites/invite_123/status: "accepted" ✓
```

### Test 3: Expiration Check
```
CREATE invite with createdAt = "2025-11-07"
→ expiresAt = "2025-11-14"

When fetching on "2025-11-15":
→ Invite is EXPIRED (expiresAt < now) ✓
→ Show error to user ✓
```

### Test 4: Security Rules Enforcement
```
Anonymous user tries to:
- READ /invites/invite_123 ✓ ALLOWED
- CREATE new invite ✗ DENIED (not auth)
- UPDATE someone else's invite ✗ DENIED

Authenticated user tries to:
- READ /invites/invite_123 ✓ ALLOWED
- CREATE new invite ✓ ALLOWED
- UPDATE own invite ✓ ALLOWED
- UPDATE someone else's invite ✗ DENIED
```

---

## 📞 Migration Notes

### No Data Migration Needed ✅
- New collection (`/invites`) created from scratch
- Existing collections (`/teams`, `/coaches`) already support multi-team/multi-coach
- Existing data remains unchanged
- Backward compatible

### Rollback Plan
- If issues: Delete new `/invites` collection
- Remove new security rules
- Revert app code
- No data loss

---

## 🔍 Monitoring

### Firestore Metrics to Watch
- Read/write operations on `/invites`
- Query performance for pending invites
- Expiration cleanup (manual or via Cloud Scheduler - future)

### Logging
- Log all invite creations
- Log all accept actions
- Log all revoke actions
- Log all remove coach actions

---

**Status:** Ready for Implementation  
**Last Updated:** November 2025

