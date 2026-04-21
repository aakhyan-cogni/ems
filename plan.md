# EMS Sprint 2 — Task Plan

> **Stack recap:** React 19 + Vite + TypeScript + Zustand (frontend) · Express 5 + Prisma + MongoDB (backend)  
> **Team size:** 5 developers  
> **Goal:** Complete a production-usable Event Management System with approval workflows, tiers, form builders, and team participation.

---

## System Design Decisions

These are architectural decisions that every developer must be aware of before picking up tasks.

### Event Status State Machine

```
DRAFT ──(organizer publishes)──▶ PENDING_REVIEW  [only for user's FIRST event]
                                       │
                              admin reviews
                             ┌─────────┴─────────┐
                             ▼                   ▼
                          APPROVED           REJECTED ──▶ organizer edits ──▶ PENDING_REVIEW
                             │
               (all future events by same user)
                             ▼
                  DRAFT ──(publish)──▶ APPROVED  [no review needed after first approval]
```

- `DRAFT` — only visible to organizer.
- `PENDING_REVIEW` — visible to organizer + admin, not listed publicly.
- `APPROVED` — publicly listed (if visibility = PUBLIC), discoverable.
- `REJECTED` — visible to organizer only, with rejection reason.

### Tier Permissions Matrix

| Feature                         | FREE | PRO | ULTIMATE |
|---------------------------------|------|-----|----------|
| Active events (published)       | 2    | 10  | Unlimited|
| Max attendees per event         | 100  | 500 | Unlimited|
| Private events                  | ✗    | ✓   | ✓        |
| Custom form builder             | ✗    | ✓   | ✓        |
| Team participation              | ✗    | ✓   | ✓        |
| Event image gallery             | ✗    | ✓   | ✓        |
| Analytics dashboard             | ✗    | ✗   | ✓        |

> **Rule:** Tier limits are **always enforced server-side**. Client-side gates are UX only (show upgrade prompts). Never trust the client for feature access.

### Privacy & Visibility Rules

- `PUBLIC` — discoverable in global search, accessible by anyone.
- `PRIVATE` — not discoverable; only accessible via direct link and only to registered attendees + organizer + admin. FREE tier cannot create PRIVATE events.
- `UNLISTED` — not discoverable in search but accessible by direct link to anyone.

Private event access must be validated **on every API call**, not just at registration.

### Consent Versioning

- Store `consentVersion` (a string like `"v1.0"`) in the User document.
- Maintain a `TermsConfig` singleton in DB with the current active version.
- On every authenticated request, middleware compares `user.consentVersion` with `TermsConfig.currentVersion`. If mismatched, the frontend intercepts with a re-consent modal before allowing action.

### Team Events

- Organizer toggles "Team Participation" during event creation and sets `minTeamSize` / `maxTeamSize`.
- When enabled, individual registration is disabled; only team leaders can register their team.
- Team counts as one slot against event capacity (configurable: per-team or per-member).
- A user can only be in one team per event.

### Admin Role

- Platform has a seeded `ADMIN` user.
- Admins bypass all tier restrictions and can view/edit all events regardless of status or visibility.
- Admin dashboard is a separate `/admin` route, unreachable by non-admins both on frontend and backend.

---

## Tasks

Tasks are labelled `S2-XXX`. Each is designed to be completable by one developer independently. Backend and frontend tasks for the same feature are split so two devs can work in parallel (backend first for contract, then frontend wires up).

---

### Module 1 — Consent & Terms of Service

---

#### S2-001 · Consent System — Backend
**Type:** Backend  
**Depends on:** Nothing  

**What to build:**
- Add fields to the `User` Prisma model: `consentAccepted Boolean @default(false)`, `consentAcceptedAt DateTime?`, `consentVersion String?`
- Create a `TermsConfig` model (singleton): `{ id, currentVersion String, updatedAt }`. Seed it with version `"v1.0"`.
- New endpoint: `POST /api/consent/accept` (authenticated) — sets `consentAccepted = true`, `consentAcceptedAt = now()`, `consentVersion = currentTermsVersion`. Returns `{ ok: true }`.
- New endpoint: `GET /api/consent/status` (authenticated) — returns `{ accepted: bool, userVersion: string, currentVersion: string, needsRenewal: bool }`.
- Add `consentCheck` middleware that runs after `authenticate` on protected routes: if `user.consentVersion !== TermsConfig.currentVersion`, respond `403 CONSENT_REQUIRED`. The frontend handles this response code to show the re-consent modal.
- Apply `consentCheck` to: event creation, registration, form submission, team creation routes.

**Acceptance criteria:**
- New user cannot create events without accepting T&C.
- Existing user who accepted v1.0 is not re-prompted until admin bumps the version.
- Bumping `TermsConfig.currentVersion` via DB causes all users to be re-prompted on next action.

---

#### S2-002 · Consent System — Frontend
**Type:** Frontend  
**Depends on:** S2-001 (API contract)  

**What to build:**
- Dedicated `ConsentModal` component: full-screen modal (not closable via backdrop click or Escape) that shows the T&C text scrollable area. The "Accept" button is **disabled** until the user scrolls to the bottom of the text.
- Intercept `403 CONSENT_REQUIRED` in `lib/api.ts` alongside the existing 401 refresh logic. Instead of logging out, set a global Zustand flag `consentRequired: true`.
- In `App.tsx` or a layout wrapper, if `consentRequired` is true, render `ConsentModal` over all content.
- On accept, call `POST /api/consent/accept`, clear the flag, and re-execute the original failed request.
- On register page, show a checkbox "I agree to the Terms and Conditions" (links to a `/terms` page). This is a pre-flight gate before the form submits; the real server-side consent is saved after account creation during onboarding redirect.
- Create a static `/terms` page with placeholder T&C text.

**Acceptance criteria:**
- User who has not accepted T&C cannot proceed to create events; ConsentModal blocks them.
- Modal cannot be dismissed without accepting.
- After accepting, the original action they were trying to take resumes automatically.

---

### Module 2 — Admin System

---

#### S2-003 · Admin Role & Endpoints — Backend
**Type:** Backend  
**Depends on:** Nothing (uses existing auth middleware)  

**What to build:**
- The `User` model already has `role`. Ensure Prisma schema has `role String @default("user")` with valid values `user` and `admin`.
- Create a DB seed script (`server/prisma/seed.ts`) that creates one admin user if none exists. Admin credentials should come from env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Create `admin.middleware.ts`: runs after `authenticate`, checks `req.user.role === 'ADMIN'`, returns `403` otherwise.
- Admin routes under `/api/admin` (all guarded by `authenticate` + `adminOnly`):
  - `GET /admin/users?page=&limit=&role=` — paginated user list (`id, name, email, role, tier, consentAccepted, createdAt`).
  - `PATCH /admin/users/:id/role` — change user role (body: `{ role: "USER" | "ADMIN" }`).
  - `GET /admin/events?status=&page=&limit=` — all events with organizer details.
  - `PATCH /admin/events/:id/approve` — set event status to `APPROVED`, trigger notification.
  - `PATCH /admin/events/:id/reject` — set event status to `REJECTED`, body: `{ reason: string }`, trigger notification.
  - `GET /admin/stats` — `{ totalUsers, totalEvents, pendingApprovals, totalRegistrations }`.

**Acceptance criteria:**
- Non-admin calling any `/admin/*` route gets `403`.
- Seeded admin user exists after running `npm run db:seed`.
- Approve/reject endpoints update event status and create a Notification record (see S2-022).

---

#### S2-004 · Admin Dashboard — Frontend
**Type:** Frontend  
**Depends on:** S2-003  

**What to build:**
- New route `/admin` — redirect to `/login` if not authenticated; redirect to `/dashboard` if authenticated but role is not `ADMIN`.
- Admin layout with sidebar: **Overview**, **Pending Events**, **All Events**, **Users**.
- **Overview tab:** Stats cards using `GET /admin/stats` (total users, events, pending approvals).
- **Pending Events tab:** List of events with `PENDING_REVIEW` status. Each row shows event title, organizer name, category, created date. Two action buttons: `Approve` and `Reject`. Reject opens a small modal asking for a rejection reason (free text, required). Optimistic UI update on action.
- **All Events tab:** Filterable table (by status, category). Shows all events.
- **Users tab:** Paginated user list. Columns: name, email, role badge, tier badge, consent status, join date. Ability to toggle role between USER and ADMIN (with a confirmation dialog).
- No analytics or charts needed — simple tables are sufficient.

**Acceptance criteria:**
- Admin can approve or reject a pending event from the Pending Events tab.
- Rejection requires a non-empty reason.
- Non-admin users who navigate directly to `/admin` are redirected.
- Role change on user requires confirmation click.

---

### Module 3 — Event CRUD (Backend → Real DB)

---

#### S2-005 · Event Model & Core CRUD — Backend
**Type:** Backend  
**Depends on:** Nothing  

**What to build:**

Update `Event` Prisma model:
```
model Event {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  description     String
  category        String
  tags            String[]
  date            DateTime
  endDate         DateTime?
  location        String
  price           Float       @default(0)
  capacity        Int
  imgUrls         String[]    @default([])
  organizerId     String      @db.ObjectId
  organizer       User        @relation(fields: [organizerId], references: [id])
  status          String      @default("DRAFT")   // DRAFT | PENDING_REVIEW | APPROVED | REJECTED
  rejectionReason String?
  visibility      String      @default("PUBLIC")  // PUBLIC | PRIVATE | UNLISTED
  isTeamEvent     Boolean     @default(false)
  minTeamSize     Int?
  maxTeamSize     Int?
  teamCapacityMode String?    // "per_team" | "per_member"
  formSchemaId    String?     @db.ObjectId
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

Endpoints:
- `POST /api/events` (auth + consentCheck + tierCheck) — Create event. Initial status always `DRAFT`. Returns created event.
- `PATCH /api/events/:id` (auth) — Update event. Only organizer or admin can update. Only `DRAFT` or `REJECTED` events can be edited by the organizer. Admin can edit any.
- `DELETE /api/events/:id` (auth) — Soft-delete or hard-delete. Only allowed if no registrations exist (return `409` if registrations exist). Only organizer or admin.
- `POST /api/events/:id/publish` (auth + consentCheck + tierCheck) — Transition from `DRAFT` to `PENDING_REVIEW` (if first published event) or `APPROVED` (subsequent events). **Tier check:** count of user's currently `APPROVED` events must be below tier limit.
- `GET /api/events/mine` (auth) — Current user's events (all statuses). Include registration count per event.
- `GET /api/events/:id` — Single event. If `PRIVATE`, validate requester is organizer, admin, or registered attendee. If status is not `APPROVED`, only organizer/admin can view.

**Acceptance criteria:**
- Events created via API are stored in MongoDB.
- Publishing first event sets status to `PENDING_REVIEW`.
- Publishing second event (after first is approved) sets status to `APPROVED`.
- FREE tier user cannot publish a third active event (receives `403 TIER_LIMIT_EXCEEDED`).
- Organizer cannot delete an event that has registrations.

---

#### S2-006 · Event Search & Public Listing — Backend
**Type:** Backend  
**Depends on:** S2-005  

**What to build:**
- `GET /api/events` — Public listing. Must only return `status === APPROVED` AND `visibility === PUBLIC || UNLISTED` events. Never return `PRIVATE` events in the listing. Support query params: `?q=` (text search on title + description), `?category=`, `?location=`, `?dateFrom=`, `?dateTo=`, `?page=1`, `?limit=20`.
- Create a MongoDB text index on `title` and `description` fields via Prisma raw command (add to seed or migration script).
- `GET /api/events/:id` (update from S2-005) — For `PRIVATE` events, check the requester is either the organizer, an admin, or has a `CONFIRMED` registration for this event.
- Remove the existing mock event data from `event.service.ts`. All data now comes from DB.

**Acceptance criteria:**
- `GET /api/events` never returns private or unapproved events.
- `GET /api/events?q=hackathon` returns events with "hackathon" in title or description.
- Unauthenticated user can list and view public events.
- Unauthenticated user gets `401` on a private event endpoint.
- Authenticated user without registration gets `403` on a private event they didn't register for.

---

#### S2-007 · Event Creation & Management — Frontend Integration
**Type:** Frontend  
**Depends on:** S2-005, S2-006  

**What to build:**
- Wire `EventCreationForm.tsx` to `POST /api/events` then `POST /api/events/:id/publish`.
- After submission, if status comes back as `PENDING_REVIEW`, show an info banner: "Your event has been submitted for admin review. You'll be notified once it's approved."
- If status is `APPROVED` (returning user), show a success screen with a link to the event.
- Add a **Step 4** to the creation form: **Visibility & Team Settings**:
  - Visibility selector: Public / Unlisted / Private. Show a locked icon with tooltip "Upgrade to PRO" for Private on FREE tier.
  - Team event toggle. When enabled: min and max team size number inputs appear.
- Wire `Global_Event.tsx` search and filters to `GET /api/events` (replacing the in-memory filter on mock data). Add pagination controls.
- Wire the event detail view to `GET /api/events/:id` (real data).

**Acceptance criteria:**
- Creating an event from the form persists it to the database.
- First-time publisher sees the pending review message.
- Search and filter work against the real API.
- FREE tier user sees a locked/disabled Private option with an upgrade prompt.

---

#### S2-008 · My Events Dashboard & Event Editing — Frontend
**Type:** Frontend  
**Depends on:** S2-005, S2-007  

**What to build:**
- Rework the "Events You're Organizing" section in `Dashboard.tsx` to use `GET /api/events/mine`.
- Each event card shows a status badge: `Draft`, `Pending Review` (yellow), `Approved` (green), `Rejected` (red with reason on hover/click).
- Rejected events have a "Edit & Resubmit" button that opens the edit form pre-filled with existing data.
- Add an "Edit Event" flow: same 4-step form pre-populated. Only editable if status is `DRAFT` or `REJECTED`.
- Add a "Delete Event" option (only for events with 0 registrations). Shows a confirmation modal.
- "Publish" button for DRAFT events.

**Acceptance criteria:**
- Dashboard shows real events from the API, not localStorage.
- Status badges reflect actual event state.
- Rejected event can be edited and resubmitted.
- Delete requires confirmation and is blocked (with an error message) if registrations exist.

---

### Module 4 — Event Registration / RSVP

---

#### S2-009 · Event Registration — Backend
**Type:** Backend  
**Depends on:** S2-005  

**What to build:**

New `Registration` Prisma model:
```
model Registration {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId      String   @db.ObjectId
  event        Event    @relation(fields: [eventId], references: [id])
  userId       String   @db.ObjectId
  user         User     @relation(fields: [userId], references: [id])
  status       String   @default("CONFIRMED") // CONFIRMED | CANCELLED
  formData     Json?
  teamId       String?  @db.ObjectId
  registeredAt DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([eventId, userId])
}
```

Endpoints:
- `POST /api/events/:id/register` (auth + consentCheck) — Register for an event. Validate: event is `APPROVED`, not full (check capacity vs confirmed registrations count), user not already registered, event is not a team event (team events use the team registration flow). If event has a form schema, validate `formData` against it. Create Registration record. Trigger confirmation notification.
- `DELETE /api/events/:id/register` (auth) — Cancel registration. Only allowed if event date is >24h away (configurable). Set status to `CANCELLED`.
- `GET /api/events/:id/registrations` (auth) — Organizer or admin only. Returns list of registrations with user details.
- `GET /api/registrations/mine` (auth) — Current user's registrations across all events.

**Acceptance criteria:**
- User cannot register for the same event twice (returns `409`).
- Registration is blocked if event is at capacity (returns `409 EVENT_FULL`).
- Registration is blocked if event is not `APPROVED` (returns `403`).
- Cancellation is blocked within 24h of event start (returns `403 TOO_LATE_TO_CANCEL`).
- Private event registration is possible only if user has the event link (the GET /events/:id already guards this).

---

#### S2-010 · Event Registration — Frontend
**Type:** Frontend  
**Depends on:** S2-009  

**What to build:**
- On the event detail page (`SingleEvent.tsx` / `Event.tsx`), replace any placeholder with a real **Register** button.
- Button states: `Register` (default), `Registered ✓` (already registered), `Event Full`, `Past Event`, `Registration Cancelled`.
- If the event has a custom form schema (see S2-015), clicking Register opens a modal with the rendered form before submitting.
- On successful registration: toast notification + button switches to `Registered ✓`.
- "Cancel Registration" option appears after registration (visible as a secondary button or in a dropdown). Show confirmation modal with the 24h warning if applicable.
- **"My Registrations" section in Dashboard:** List of upcoming events the user has registered for (from `GET /api/registrations/mine`). Each card shows event title, date, status badge. Link to event detail.

**Acceptance criteria:**
- Register button reflects actual registration state fetched from API.
- Registering for a full event shows an appropriate error toast.
- My Registrations section appears in Dashboard with real data.
- If event has a form, the modal form appears before registration is confirmed.

---

### Module 5 — Form Builder

---

#### S2-011 · Custom Form Builder — Backend
**Type:** Backend  
**Depends on:** S2-005 (event model with `formSchemaId`)  

**What to build:**

New `FormSchema` Prisma model:
```
model FormSchema {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String   @unique @db.ObjectId
  fields    Json     // Array of FormField objects
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

`FormField` JSON shape (document the type in a shared types file):
```typescript
type FieldType = 'short_text' | 'long_text' | 'dropdown' | 'checkbox' | 'radio' | 'number' | 'email'
interface FormField {
  id: string          // uuid
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]  // for dropdown, radio, checkbox
  validation?: { min?: number; max?: number; pattern?: string }
}
```

Endpoints:
- `POST /api/events/:id/form` (auth + tierCheck: PRO+ only) — Create or replace the form schema for an event. Only organizer or admin.
- `GET /api/events/:id/form` — Return form schema. Public if event is public; private follows event visibility rules.
- `DELETE /api/events/:id/form` (auth) — Remove form from event. Only organizer or admin.

Form submission validation (used in S2-009's register endpoint):
- Extract shared form validation logic into `form.service.ts`.
- `validateFormData(schema: FormSchema, data: Record<string, unknown>): { valid: boolean; errors: Record<string, string> }`
- Validates required fields, type coercion, and pattern/range validation.

**Acceptance criteria:**
- Attempting to create a form as a FREE tier user returns `403 TIER_REQUIRED`.
- `validateFormData` rejects a submission missing a required field.
- Deleting the form removes the `formSchemaId` reference from the event.

---

#### S2-012 · Custom Form Builder — Frontend
**Type:** Frontend  
**Depends on:** S2-011  

**What to build:**
- Form builder UI accessible from the Event editing page (a new "Registration Form" tab, shown only to the organizer).
- Show "Upgrade to PRO" prompt if user is on FREE tier.
- Field palette on the left (Short Text, Long Text, Dropdown, Checkbox, Radio, Number, Email).
- Drag fields from palette to the builder canvas (use `@dnd-kit/core` for drag-and-drop — add as a dependency).
- Each field in the canvas can be: edited (label, placeholder, required toggle, options for dropdown/radio/checkbox), reordered (drag handle), deleted.
- "Preview" toggle: switch canvas from edit mode to a rendered preview of what registrants will see.
- "Save Form" button: `POST /api/events/:id/form`. Show success toast.
- "Remove Form" button: `DELETE /api/events/:id/form`. Confirm modal.

**Acceptance criteria:**
- Organizer can build a form with at least 3 field types.
- Saving persists the schema to the backend.
- PRO tier guard is enforced — FREE user sees a locked state, not an error.
- Preview mode renders the form fields in read-only view.

---

### Module 6 — Team Participation

---

#### S2-013 · Team Participation — Backend
**Type:** Backend  
**Depends on:** S2-009 (Registration model)  

**What to build:**

New `Team` Prisma model:
```
model Team {
  id        String       @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String       @db.ObjectId
  event     Event        @relation(fields: [eventId], references: [id])
  name      String
  leaderId  String       @db.ObjectId
  members   TeamMember[]
  createdAt DateTime     @default(now())
}

type TeamMember {
  userId String @db.ObjectId
  status String  // INVITED | ACCEPTED | DECLINED
}
```

Endpoints:
- `POST /api/events/:id/teams` (auth + consentCheck + tierCheck: PRO+) — Create a team. Validates: event is a team event, event is APPROVED, user not already in a team for this event, total teams × maxTeamSize does not exceed capacity. Leader is auto-added as ACCEPTED. Creates a Registration record for the leader linked to teamId.
- `POST /api/events/:id/teams/:teamId/invite` (auth) — Invite a user by email. Only team leader can invite. Validates: team not full (`members.ACCEPTED.length < event.maxTeamSize`), user not already in a team for this event. Creates a TeamMember entry with status INVITED. Triggers a notification to the invited user.
- `PATCH /api/events/:id/teams/:teamId/respond` (auth) — Accept or decline invite. Body: `{ action: "accept" | "decline" }`. On accept: validates team still has room, sets status ACCEPTED, creates Registration record. On decline: sets status DECLINED.
- `GET /api/events/:id/teams` (auth) — Returns teams. Organizer/admin gets all teams with member details. Regular user gets only their own team.
- `DELETE /api/events/:id/teams/:teamId/members/:userId` (auth) — Remove a member (leader only, or self-removal). Cannot remove leader; leader must disband instead.
- `DELETE /api/events/:id/teams/:teamId` (auth) — Disband team (leader only). Cancels all team Registrations.

**Acceptance criteria:**
- FREE tier user cannot create a team (403).
- Inviting a user who is already in a team for the event returns 409.
- A team cannot exceed `event.maxTeamSize` accepted members.
- Disbanding a team cancels all associated Registration records.

---

#### S2-014 · Team Participation — Frontend
**Type:** Frontend  
**Depends on:** S2-013  

**What to build:**
- On the event detail page, if `event.isTeamEvent === true`, replace the individual Register button with a **Team Registration** section:
  - If user has no team: show "Create Team" button (opens a modal: team name input) and "Join via Invite" notice (invites come through notifications).
  - If user is team leader: show team management card — team name, member list with status badges, "Invite Member" button (opens modal: email input), "Disband Team" option.
  - If user is a team member: show team card (name, members). Option to leave team.
- **Notification integration:** When a user receives a team invite notification, the notification has "Accept" and "Decline" action buttons that call the respond endpoint directly.
- Team size indicator on the event detail page (e.g., "Teams: 4/20 slots filled").

**Acceptance criteria:**
- Team leader can create a team, invite members, and see their status.
- Invited user can accept/decline from the notification.
- Accepting an invite when the team is now full shows an error (race condition handled).
- Event detail shows correct team slot availability.

---

### Module 7 — File Uploads

---

#### S2-015 · File Upload — Backend (Avatar + Event Images)
**Type:** Backend  
**Depends on:** Nothing (Multer already configured)  

**What to build:**
- `POST /api/user/avatar` (auth) — Upload profile avatar. Accept: `image/jpeg`, `image/png`, `image/webp`. Max size: 2MB. Store in `server/public/avatars/`. Return the public URL. Update `User.avatar` in DB.
- `POST /api/events/:id/images` (auth + tierCheck for gallery: PRO+ for multiple images, FREE gets 1) — Upload event banner/gallery images. Accept: `image/jpeg`, `image/png`, `image/webp`. Max size: 5MB each. Max count: 1 for FREE, 5 for PRO, 10 for ULTIMATE. Store in `server/public/events/:eventId/`. Append URL to `Event.imgUrls`. Return updated list.
- `DELETE /api/events/:id/images` (auth) — Body: `{ url: string }`. Removes URL from `Event.imgUrls` and deletes the file. Only organizer or admin.
- Ensure Multer is configured with correct `limits.fileSize` and a `fileFilter` that rejects non-image MIME types with a proper error (not a crash).

**Acceptance criteria:**
- Uploading a non-image file returns `400 INVALID_FILE_TYPE`.
- Uploading a file over the size limit returns `400 FILE_TOO_LARGE`.
- FREE tier user uploading a second event image returns `403 TIER_LIMIT_EXCEEDED`.
- Avatar upload updates the user record in DB and returns the new URL.

---

#### S2-016 · File Upload — Frontend (Avatar + Event Images)
**Type:** Frontend  
**Depends on:** S2-015  

**What to build:**
- **Profile avatar upload:** In `BasicProfileInfo.tsx`, clicking the avatar opens a file picker. Validate type (JPEG/PNG/WebP) and size (<2MB) client-side. Show a preview before uploading. On confirm, call `POST /api/user/avatar`. Update `useAuthStore` with the new avatar URL. Show progress indicator.
- **Event image upload in EventCreationForm:** In Step 1 (or Step 4), add a drag-and-drop upload zone for event banner. Show thumbnail preview. Indicate tier limit (e.g., "1 image on FREE, up to 5 on PRO"). Upload immediately on file selection (`POST /api/events/:id/images` — requires event to be created first as a draft). Note: creation flow should split into create-draft then upload-images then publish.
- Show client-side errors for type/size violations before hitting the API.

**Acceptance criteria:**
- Invalid file types are caught and rejected client-side with a clear message before any API call is made.
- Avatar preview is shown before upload is confirmed.
- Successful avatar upload immediately reflects the new image in the Navbar and profile.

---

### Module 8 — Notifications

---

#### S2-017 · Notification System — Backend
**Type:** Backend  
**Depends on:** S2-003 (approve/reject), S2-009 (registration)  

**What to build:**

New `Notification` Prisma model:
```
model Notification {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  type      String   // EVENT_APPROVED | EVENT_REJECTED | TEAM_INVITE | REGISTRATION_CONFIRMED | EVENT_REMINDER
  title     String
  message   String
  data      Json?    // { eventId?, teamId?, reason? } — context for deep-link
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

`notification.service.ts` with a `createNotification(userId, type, title, message, data?)` function. Call this from:
- `admin.controller.ts` approve → `EVENT_APPROVED` to organizer.
- `admin.controller.ts` reject → `EVENT_REJECTED` to organizer (include `reason` in data).
- `team.controller.ts` invite → `TEAM_INVITE` to invited user (include `teamId`, `eventId`).
- `registration.controller.ts` register → `REGISTRATION_CONFIRMED` to registrant.
- (Future) Scheduled job for `EVENT_REMINDER` 24h before event.

Endpoints:
- `GET /api/notifications?page=&limit=20` (auth) — User's notifications, newest first. Returns `{ notifications, unreadCount }`.
- `PATCH /api/notifications/:id/read` (auth) — Mark one as read.
- `POST /api/notifications/read-all` (auth) — Mark all as read.

**Acceptance criteria:**
- Admin approving an event creates a notification for the organizer.
- Team invite creates a notification for the invited user.
- `GET /api/notifications` only returns notifications for the requesting user (cannot see others').
- `unreadCount` is accurate.

---

#### S2-018 · Notification System — Frontend
**Type:** Frontend  
**Depends on:** S2-017  

**What to build:**
- Wire `NotificationPage.tsx` to `GET /api/notifications`. Render notifications in a list with type icons:
  - `EVENT_APPROVED` → green checkmark icon.
  - `EVENT_REJECTED` → red X icon; show rejection reason inline.
  - `TEAM_INVITE` → people icon; show "Accept" and "Decline" buttons that call `PATCH /api/events/:id/teams/:teamId/respond`.
  - `REGISTRATION_CONFIRMED` → calendar icon.
- Unread notifications have a highlighted background. Clicking marks them read (`PATCH /api/notifications/:id/read`).
- **Navbar bell icon** (`Navbar.tsx`): show a red badge with unread count. Fetch count on mount and after route changes via `GET /api/notifications?limit=1` (the `unreadCount` field). Poll every 60 seconds or use a manual refresh button.
- "Mark all as read" button at the top of the notification page.

**Acceptance criteria:**
- Unread count badge in Navbar updates after new notifications arrive.
- Team invite notifications show Accept/Decline actions and work correctly.
- Rejected event notifications show the admin's reason.
- Clicking "Mark all as read" sets all to read and removes the badge.

---

### Module 9 — Security & Auth Hardening

---

#### S2-019 · Backend Security Hardening
**Type:** Backend  
**Depends on:** Nothing (can start immediately, apply as other tasks land)  

**What to build:**
- **Input validation:** Install `zod`. Create a `validate(schema)` middleware factory. Apply Zod schemas to request bodies for: register, login, event create/update, form schema create, team create, invite. Return `400` with a structured error list on validation failure.
- **Rate limiting:** Install `express-rate-limit`. Apply limiters:
  - Auth routes (`/api/auth/*`): 10 requests / 15 min per IP.
  - Event create + publish: 20 requests / hour per user.
  - Registration: 30 requests / hour per user.
  - Admin routes: 100 requests / 15 min per IP.
- **Environment validation:** On app startup, check that `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `DATABASE_URL` are set and not equal to `"abc"` or `"def"` (dev defaults). Throw a startup error if in `NODE_ENV=production` with default secrets.
- **Ownership checks:** Audit all `PATCH` and `DELETE` event/form/team endpoints to verify `organizerId === req.user.userId` before allowing the operation. Admin bypasses this check.
- **Query privacy guard:** Add a shared `eventVisibilityFilter(userId?, role?)` utility that returns Prisma `where` conditions ensuring private/unapproved events are never leaked.
- **File upload security:** Verify MIME type by reading file buffer magic bytes (not just `Content-Type` header) in Multer's `fileFilter`.

**Acceptance criteria:**
- Sending an empty `title` to `POST /api/events` returns `400` with a field-level error message.
- Sending more than 10 auth requests in a minute from the same IP returns `429`.
- User A cannot edit User B's event (returns `403`).
- App refuses to start in production with default JWT secrets.

---

#### S2-020 · Frontend Auth Guards & Route Protection
**Type:** Frontend  
**Depends on:** Nothing  

**What to build:**
- **`ProtectedRoute` component:** Wraps routes that require authentication. If `!isAuthenticated`, redirect to `/login` and store the intended path in location state so the user is redirected back after login.
- **`AdminRoute` component:** Wraps `/admin`. If authenticated but `user.role !== 'ADMIN'`, redirect to `/dashboard` with a toast "Access denied."
- **`TierGate` component:** Props: `requiredTier: 'PRO' | 'ULTIMATE'`, `children`. If user's tier is insufficient, renders a locked overlay with "Upgrade to [tier]" button instead of `children`. Use this throughout the UI for gated features.
- Apply `ProtectedRoute` to: `/dashboard`, `/admin`, `/notifications`, `/support`.
- Handle token expiry: the existing 401 refresh flow in `lib/api.ts` clears auth and redirects to `/login` on refresh failure — verify this works correctly end-to-end and does not leave the user on a broken page.
- After a successful login, redirect to the stored intended path (if any), else `/dashboard`.

**Acceptance criteria:**
- Navigating to `/dashboard` without being logged in redirects to `/login`.
- After logging in, the user is taken to `/dashboard` (or the previously intended route).
- `TierGate` around a PRO feature shows an upgrade prompt for FREE users.
- Admin navigating to `/dashboard` works normally; non-admin navigating to `/admin` gets redirected.

---

### Module 10 — User Profile & Subscription UI

---

#### S2-021 · User Profile — Backend Integration & Subscription Tier
**Type:** Frontend  
**Depends on:** S2-015 (avatar upload)  

**What to build:**
- Wire all profile tabs to the real API:
  - `BasicProfileInfo.tsx` → reads from `useAuthStore`, submits `PATCH /api/user/profile` on save. Include avatar upload (from S2-016).
  - `Address.tsx` → same — update address fields.
  - `OrganizationalInfo.tsx` → update org info.
- After any profile update, call `useAuthStore.updateUser()` with the response data so Navbar/avatar updates immediately.
- **Subscription / Tier display:** In the Payment Info tabs, show the user's current tier prominently (badge + description of what's included). The "Upgrade" buttons on `SubscriptionPlans.tsx` should currently show a "Coming Soon" / "Contact Us" state (no payment integration required yet — just a disabled button with a tooltip explaining payment integration is in progress).
- `TransactionHistory.tsx` — show an empty state message ("No transactions yet") since payment is not integrated.

**Acceptance criteria:**
- Updating the user's name reflects in the Navbar without a page reload.
- Uploading a new avatar from the profile page updates the avatar globally.
- Subscription plan UI shows the user's current tier correctly.
- No dummy/hardcoded data remains visible on the profile page.

---

## Backlog (Post-Sprint 2)

These are real requirements but descoped to keep Sprint 2 shippable. They should be planned in Sprint 3.

- **Payment Integration** — Stripe or Razorpay integration for PRO/ULTIMATE subscription purchase. Webhook to update User.tier on payment success.
- **Analytics Dashboard** (ULTIMATE tier) — Event views, registration trends, conversion rate.
- **QR Code Check-in** — Generate unique QR per registration; organizer scans at venue.
- **Email Notifications** — Nodemailer integration for critical notifications (event approval, invite, reminder).
- **Event Reminder Cron** — Scheduled job (24h before event) to send reminders to registrants.
- **Social Sharing** — Open Graph meta tags for events, share buttons.
- **Recurring Events** — `rrule`-based recurrence patterns for weekly/monthly events.
- **Waitlist** — When event is full, allow users to join a waitlist and auto-promote when a slot opens.

---

## Priority Order for Sprint 2

Pick up tasks in this order to minimize blocking dependencies:

| Wave | Tasks | Why |
|------|-------|-----|
| 1 (Day 1–3) | S2-001, S2-003, S2-005, S2-006, S2-019 | Foundation — unblocks almost everything else |
| 2 (Day 3–6) | S2-002, S2-004, S2-007, S2-009, S2-011, S2-015 | Core features enabled by Wave 1 |
| 3 (Day 6–10) | S2-008, S2-010, S2-012, S2-013, S2-016, S2-017, S2-020 | Full feature set |
| 4 (Day 10–12) | S2-014, S2-018, S2-021 | Polish and wiring |

**Quick-start for each dev (Day 1 pick-up, no dependencies):**
- Dev 1 → S2-001 (Consent backend)
- Dev 2 → S2-003 (Admin backend)
- Dev 3 → S2-005 (Event CRUD backend)
- Dev 4 → S2-019 (Security hardening backend)
- Dev 5 → S2-020 (Frontend auth guards — unblocks all frontend wiring)

---

## Open Questions / Assumptions Made

These decisions were made to keep planning unblocked. Confirm or override as needed:

1. **First event only needs review?** — Assumed yes. After first event is approved, subsequent events bypass review. If the team wants stricter control (e.g., review every event from FREE tier users), the status machine in S2-005 needs updating.
2. **Team counts as one registration slot** — Assumed the team occupies 1 slot by default. The `teamCapacityMode` field supports switching to "per_member" if needed.
3. **No payment integration in Sprint 2** — Tier is currently a field on the User document. Upgrading requires direct DB edit or an admin action until Stripe is integrated (Sprint 3).
4. **Unlisted events are accessible by direct link without login** — If you want unlisted events to require login, the `GET /api/events/:id` guard in S2-006 needs a small change.
5. **Cancellation window is 24h** — Hardcoded as a constant. Can be made configurable per event by the organizer (future feature).
