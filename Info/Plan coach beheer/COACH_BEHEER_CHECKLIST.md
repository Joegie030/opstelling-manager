# 🏆 Coach Beheer Implementation Checklist

**Version:** 3.1 (Planned)  
**Status:** Ready for Implementation

---

## Phase 1: Firebase Setup 📋

### Database Schema
- [ ] Update `/invites` collection schema documentation
- [ ] Add `expiresAt` field definition
- [ ] Add `teamNaam`, `clubNaam` field definition
- [ ] Document `CoachInvite` interface

### Security Rules
- [ ] Add public read access to `/invites`
- [ ] Test security rules locally
- [ ] Deploy to Firebase

### Type Definitions (types/index.ts)
- [ ] Add `CoachInvite` interface
- [ ] Update `Coach` interface (if needed)
- [ ] Update `Team` interface (if needed)

---

## Phase 2: Firebase Service Functions 🔧

### firebaseService.ts Functions

#### getInviteById
- [ ] Implement function
- [ ] Add expiration check (expiresAt < now)
- [ ] Return null if expired
- [ ] Test locally

#### acceptInvite
- [ ] Update `/invites/{id}` status to "accepted"
- [ ] Add user UID to `/teams/{teamId}.coaches[]`
- [ ] Add team ID to `/coaches/{uid}.teamIds[]`
- [ ] Error handling (team not found, user not found, etc)
- [ ] Test with Firebase emulator

#### revokeInvite
- [ ] Delete `/invites/{id}` document
- [ ] Error handling
- [ ] Test locally

#### getTeamCoaches
- [ ] Fetch team.coaches[] array (UIDs)
- [ ] For each UID: fetch coach document
- [ ] Combine into array
- [ ] Test locally

#### removeCoachFromTeam
- [ ] Remove UID from `/teams/{teamId}.coaches[]`
- [ ] Remove team ID from `/coaches/{uid}.teamIds[]`
- [ ] Prevent self-removal (check if current user)
- [ ] Error handling
- [ ] Test locally

#### getPendingInvitesByTeam
- [ ] Query `/invites` with filters (teamId, status='pending')
- [ ] Return array of pending invites
- [ ] Test locally

---

## Phase 3: Frontend Components 🎨

### New Components

#### CoachInviteForm.tsx
- [ ] Create component file
- [ ] Email input field
- [ ] "Uitnodigen" button
- [ ] Call `inviteCoach()` from firebaseService
- [ ] On success: generate invite link
- [ ] Display invite link
- [ ] Generate QR code (qrcode.react)
- [ ] Copy button for link
- [ ] Copy button for QR
- [ ] Success/error messages
- [ ] Loading states
- [ ] Test form submission
- [ ] Test validation
- [ ] Mobile responsive

#### PendingInvitesList.tsx
- [ ] Create component file
- [ ] Render table with columns: email, date, days left, actions
- [ ] Call `getPendingInvitesByTeam()`
- [ ] Calculate "days left" (expiresAt - now)
- [ ] Revoke button → calls `revokeInvite()`
- [ ] Loading states
- [ ] Error handling
- [ ] Empty state if no pending
- [ ] Mobile responsive table

#### ActiveCoachesList.tsx
- [ ] Create component file
- [ ] Render table with columns: name, email, role, actions
- [ ] Call `getTeamCoaches()`
- [ ] Fetch full coach details
- [ ] Show "This is you" badge for current coach
- [ ] Remove button → calls `removeCoachFromTeam()`
- [ ] Prevent self-removal
- [ ] Loading states
- [ ] Error handling
- [ ] Empty state if no coaches
- [ ] Mobile responsive table

#### InviteCoaches.tsx
- [ ] Refactor/simplify existing component
- [ ] Import new sub-components
- [ ] Arrange components (form, pending list, active list)
- [ ] Pass props correctly
- [ ] Test integration

#### AcceptInviteScreen.tsx
- [ ] Create component file
- [ ] Get inviteId from URL params
- [ ] Fetch invite using `getInviteById()`
- [ ] Check if expired → show error
- [ ] Display team info (club name, team name)
- [ ] Display invite info (invited by, date)
- [ ] "Registreren" button → navigate to register
- [ ] "Inloggen" button → navigate to login
- [ ] "Annuleren" button → navigate to home
- [ ] After successful login/register: call `acceptInvite()`
- [ ] Redirect to team page on success
- [ ] Error handling + messages
- [ ] Loading states
- [ ] Mobile friendly layout

---

## Phase 4: App Integration 🔗

### App.tsx Updates

#### Route
- [ ] Add `/accept-invite/:inviteId` route
- [ ] Import AcceptInviteScreen
- [ ] Add case in huidigScherm router
- [ ] Test route navigation

#### State
- [ ] Add `pendingInvites` state
- [ ] Add `teamCoaches` state
- [ ] Type correctly with TypeScript

#### Effects
- [ ] Add effect: load pending invites when team selected
- [ ] Add effect: load team coaches when team selected
- [ ] Proper dependency arrays
- [ ] Error handling

#### Handlers
- [ ] `handleAcceptInvite()` - auto-called after login/register
- [ ] `handleRevokeInvite()` - revoke invite
- [ ] `handleRemoveCoach()` - remove coach from team
- [ ] Pass to child components

### TeamBeheer.tsx Updates

#### Coaches Tab
- [ ] Add new tab: "🏆 Coaches"
- [ ] Tab selector for "Vaste Spelers", "Gast Spelers", "Coaches"
- [ ] Import CoachInviteForm
- [ ] Import PendingInvitesList
- [ ] Import ActiveCoachesList
- [ ] Arrange components with proper sections
- [ ] Pass props from parent
- [ ] Styling consistent with other tabs
- [ ] Test tab switching
- [ ] Mobile responsive

### Authentication Flow

#### Register Screen
- [ ] Check for `inviteId` in state
- [ ] After registration: auto-call `acceptInvite()`
- [ ] Redirect to team page

#### Login Screen
- [ ] Check for `inviteId` in state
- [ ] After login: auto-call `acceptInvite()`
- [ ] Redirect to team page

---

## Phase 5: Testing 🧪

### Unit Tests
- [ ] Firebase functions return correct data
- [ ] Expiration logic works
- [ ] Component rendering without errors
- [ ] Props passed correctly

### Integration Tests
- [ ] Invite flow end-to-end
  - [ ] Create invite
  - [ ] Copy link
  - [ ] Open link
  - [ ] Register new coach
  - [ ] Auto-accept invite
  - [ ] Coach appears in active list
  
- [ ] Revoke flow
  - [ ] Create invite
  - [ ] Click revoke
  - [ ] Invite removed from pending list
  
- [ ] Remove coach flow
  - [ ] Remove coach from active list
  - [ ] Coach removed from Firebase
  - [ ] Coach no longer sees team
  
- [ ] Expiration logic
  - [ ] Create invite
  - [ ] Manipulate time (7+ days)
  - [ ] Open expired link
  - [ ] Show error message

### User Acceptance Tests
- [ ] UI looks good on mobile
- [ ] UI looks good on desktop
- [ ] All buttons clickable
- [ ] All inputs functional
- [ ] Error messages clear
- [ ] Success messages show
- [ ] Loading states visible

### Edge Cases
- [ ] Duplicate coach invite (same email)
- [ ] Self-removal prevention
- [ ] Invalid invite ID
- [ ] Already accepted invite
- [ ] Database offline
- [ ] Network errors

---

## Phase 6: Documentation & Deployment 📚

### Code Documentation
- [ ] JSDoc comments on all functions
- [ ] Component prop documentation
- [ ] Type definitions clear
- [ ] Error handling documented

### README Updates
- [ ] Add feature to features list
- [ ] Update roadmap
- [ ] Add workflow diagram (optional)
- [ ] Add security rules section
- [ ] Add troubleshooting tips

### Firebase Documentation
- [ ] Security rules documented
- [ ] Database schema documented
- [ ] Function signatures documented

### Deployment
- [ ] Test on staging (if applicable)
- [ ] Deploy Firebase functions
- [ ] Deploy updated frontend
- [ ] Verify all features work in production

---

## Definition of Done ✅

- [ ] All functions implemented and tested
- [ ] All components render correctly
- [ ] Route working with URL params
- [ ] Invite flow works end-to-end
- [ ] Pending invites display correctly
- [ ] Active coaches display correctly
- [ ] Expiration logic working
- [ ] Security rules correct
- [ ] No console errors
- [ ] Mobile responsive
- [ ] README updated
- [ ] Code committed to git

---

## Known Issues / Blockers 🚨

(To be filled during implementation)

- [ ] Issue: ...
- [ ] Solution: ...

---

## Notes 📝

- Blaze plan required for Cloud Functions (outbound calls)
- Consider rate limiting on invite creation
- Consider email whitelisting (later version)
- Consider invite history (later version)

---

**Start Date:** _____________  
**Completion Date:** _____________  
**Developer:** _____________  
**Reviewed By:** _____________

