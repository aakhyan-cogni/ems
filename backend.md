# EMS Backend — Developer Onboarding Guide

> **Audience:** developers joining the EMS team who need to understand how the backend works today.
> **Scope:** what exists right now in `server/` — not what's planned. For the planned work, see [plan.md](plan.md).
> **TL;DR:** Express 5 + MongoDB (native driver) + JWT (access in header, refresh in httpOnly cookie). Three layers: routes → controllers → services. Only auth, consent, user profile, and a mock event listing are wired up so far.

---

## 1. Stack and tooling

| Concern | Choice |
|---|---|
| Runtime | Node.js (ESM) |
| HTTP framework | Express 5 |
| Language | TypeScript (strict, ESM, path alias `@/*` → `src/*`) |
| Database | MongoDB via the official `mongodb` driver (no Mongoose, no Prisma) |
| Auth | JWT (`jsonwebtoken`) — access token in `Authorization: Bearer …`, refresh token in an httpOnly cookie |
| Password hashing | `bcryptjs` |
| Cookies | `cookie-parser` |
| File uploads | `multer` (declared as a dependency; not wired up yet) |
| Build | `tsup` — outputs ESM + `.d.ts` to `dist/` |
| Dev loop | `tsup --watch` re-runs `dist/index.js` on every save |
| CORS | locked to `http://localhost:5173` (Vite dev server) with credentials |

The MongoDB instance is expected to run as a **single-node replica set** on port `27018`, started locally via `npm run db:up` (see `server/package.json`).

---

## 2. Running it locally

```bash
cd server
npm install

# In one terminal — start a local MongoDB replica set on port 27018
npm run db:up

# In another terminal — start the API with hot reload
npm run dev
```

The API listens on `http://localhost:5000`. Static files in `server/public/` are served from `/`.

### Environment variables

`server/.env` is committed today with development defaults (these must be replaced before any non-dev deployment):

```env
DATABASE_URL="mongodb://localhost:27018/ems?directConnection=true"
ACCESS_TOKEN_SECRET=abc
REFRESH_TOKEN_SECRET=def
ACCESS_TOKEN_EXPIRY=900            # seconds (15 min)
REFRESH_TOKEN_EXPIRY=604800        # seconds (7 days)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
```

Types for these are declared in [`server/src/types/env.type.ts`](server/src/types/env.type.ts) so `process.env.DATABASE_URL` is typed as `string`.

> **Gotcha:** `lib/jwt.ts` uses `node:console#assert` to check the env vars exist. `assert` only **logs** when the condition is false — it does **not** throw. So if `ACCESS_TOKEN_SECRET` is missing the server still boots and only crashes later when `jwt.sign` is called. Treat the assertions as warnings, not guards. (Hardening this is task S2-019.)

---

## 3. Directory layout

```
server/
├── .env                         ← dev secrets (DATABASE_URL, JWT secrets, expiries)
├── package.json
├── tsconfig.json                ← path alias @/* → ./src/*
├── tsup.config.ts               ← bundle config
├── public/                      ← static assets served at /
├── mongo-data/                  ← local MongoDB data directory (gitignored)
└── src/
    ├── index.ts                 ← entry point: app.listen(PORT)
    ├── app.ts                   ← Express app: middleware, routes, error handler
    ├── config/
    │   └── constants.ts         ← PORT, DEFAULT_TERMS_VERSION
    ├── routes/                  ← Router definitions (one file per domain)
    │   ├── index.ts             ← barrel re-export
    │   ├── auth.routes.ts
    │   ├── consent.routes.ts
    │   ├── event.routes.ts
    │   └── user.routes.ts
    ├── controllers/             ← HTTP handlers — parse req, call services, build res
    │   ├── auth.controller.ts
    │   ├── consent.controller.ts
    │   ├── event.controller.ts
    │   └── user.controller.ts
    ├── services/                ← business logic and DB access
    │   ├── auth.service.ts
    │   ├── consent.service.ts
    │   ├── event.service.ts     ← currently returns mock data only
    │   └── user.service.ts
    ├── middleware/
    │   ├── auth.middleware.ts   ← authenticate, authorize
    │   └── consent.middleware.ts ← consentCheck
    ├── models/                  ← Mongo document interfaces + collection name constants
    │   ├── index.ts
    │   ├── user.model.ts        ← UserDoc, USER_COLLECTION
    │   ├── event.model.ts       ← EventDoc, EVENT_COLLECTION
    │   ├── terms-config.model.ts ← TermsConfigDoc, TERMS_CONFIG_COLLECTION
    │   └── util.ts              ← fromDoc helper (ObjectId → string id)
    ├── lib/                     ← cross-cutting infrastructure
    │   ├── index.ts
    │   ├── jwt.ts               ← token signing/verifying
    │   ├── mongo.ts             ← MongoClient singleton + collection getters
    │   └── util.ts              ← excludeFields helper
    └── types/
        ├── env.type.ts          ← typed process.env
        ├── index.d.ts           ← global Express.Request augmentation (req.user)
        ├── user.type.ts
        ├── event.type.ts        ← used by the mock event service
        └── review.type.ts
```

### What goes where (the rule of thumb)

- **Route file:** wire a URL + HTTP verb + middleware chain to a controller function. No logic.
- **Controller:** parse `req`, call services, shape the response, set status codes. No DB calls.
- **Service:** business logic + MongoDB calls. Returns plain objects (with string `id`, not `ObjectId`).
- **Model:** TypeScript interface for the document shape (`*Doc`) plus the public type (`*` with `id: string`) and the collection name constant.
- **Middleware:** anything that decorates `req` (e.g. `authenticate` setting `req.user`) or short-circuits with a status.
- **Lib:** infrastructure utilities used across layers (Mongo client, JWT helpers).

Adding a new feature usually means: one model file + one service file + one controller file + one routes file, plus a registration in `routes/index.ts` and `app.ts`.

---

## 4. Request lifecycle

```
HTTP request
   │
   ▼
app.ts                      cookieParser → cors → express.json → express.static
   │
   ▼
routes/<domain>.routes.ts   match URL + verb, run middleware chain
   │
   ▼
middleware/                 e.g. authenticate (verify access token, set req.user)
   │                              consentCheck (block if user.consentVersion stale)
   ▼
controllers/<domain>.controller.ts
                            parse req.body / req.params / req.user
   │                        call into services
   │                        build JSON response with status code
   ▼
services/<domain>.service.ts
                            business rules + MongoDB calls via lib/mongo.ts
   │
   ▼
lib/mongo.ts                lazy-connected MongoClient → collection<T>(name)
   │
   ▼
MongoDB (port 27018)
```

The global error handler in `app.ts` catches anything that bubbles up and returns `500 Internal server error`. It is intentionally minimal — most controllers wrap their own `try/catch` and return tailored error messages.

---

## 5. The MongoDB layer

Everything DB-related goes through [`server/src/lib/mongo.ts`](server/src/lib/mongo.ts):

```ts
const client = new MongoClient(uri);
let dbPromise: Promise<Db> | null = null;

function getDb(): Promise<Db> {
    if (!dbPromise) dbPromise = client.connect().then((c) => c.db());
    return dbPromise;
}

async function collection<T extends object>(name: string): Promise<Collection<T>> {
    const db = await getDb();
    return db.collection<T>(name);
}

export const users         = () => collection<UserDoc>(USER_COLLECTION);
export const termsConfigs  = () => collection<TermsConfigDoc>(TERMS_CONFIG_COLLECTION);
export const events        = () => collection<EventDoc>(EVENT_COLLECTION);
```

Key points:

1. **One MongoClient per process.** `dbPromise` caches the `connect()` call so we don't reconnect per request.
2. **No schema definitions.** MongoDB is schemaless; the `*Doc` interfaces describe what we *expect*, but the driver will accept anything. Validation must happen at the service layer (Zod is planned in S2-019).
3. **No defaults.** When you `insertOne`, you pass the *complete* document. Default values like `consentAccepted: false` or `role: "user"` are written explicitly by the service (see `auth.service.ts::createUser`).
4. **`fromDoc` mapper** ([`server/src/models/util.ts`](server/src/models/util.ts)) converts `{ _id: ObjectId, … }` to `{ id: string, … }` before crossing layer boundaries. Always run service results through it before sending to the controller. Public types like `User = Omit<UserDoc, "_id"> & { id: string }` reflect this.
5. **ObjectId wrapping is manual.** When you query by id you have to wrap it: `findOne({ _id: new ObjectId(userId) })`. There is no Mongoose-style automatic casting.

### Collections currently in use

| Constant | Collection name | Document interface | File |
|---|---|---|---|
| `USER_COLLECTION` | `User` | `UserDoc` | [`models/user.model.ts`](server/src/models/user.model.ts) |
| `EVENT_COLLECTION` | `Event` | `EventDoc` | [`models/event.model.ts`](server/src/models/event.model.ts) (defined but **no events are written yet** — the controller still returns mock data) |
| `TERMS_CONFIG_COLLECTION` | `TermsConfig` | `TermsConfigDoc` | [`models/terms-config.model.ts`](server/src/models/terms-config.model.ts) |

---

## 6. Authentication — the whole flow

Auth is a textbook **JWT access + refresh** setup with refresh-token rotation. Every active session has two tokens:

| Token | Lifetime | Stored where | Sent how |
|---|---|---|---|
| Access token | `ACCESS_TOKEN_EXPIRY` (15 min default) | Frontend memory only | `Authorization: Bearer <token>` header on every request |
| Refresh token | `REFRESH_TOKEN_EXPIRY` (7 days default) | httpOnly cookie + mirrored in `User.refreshToken` in DB | Cookie automatically sent by the browser |

Both tokens are signed JWTs with the same payload shape (`TokenPayload` in [`lib/jwt.ts`](server/src/lib/jwt.ts)):

```ts
{ userId: string, email: string, role: string }
```

### 6.1 Register — `POST /api/auth/register`

File: [`controllers/auth.controller.ts`](server/src/controllers/auth.controller.ts)

```
client                          controller                      service / DB
──────                          ──────────                      ────────────
{ email, password,
  name, termsAccepted } ──────▶ if !termsAccepted  → 400
                                AuthService.findUserByEmail ──▶ User collection
                                if exists           → 400
                                AuthService.hashPassword (bcrypt salt+hash)
                                AuthService.createUser ──────▶ insertOne UserDoc
                                                                {
                                                                  consentAccepted: true,
                                                                  consentVersion: <current>,
                                                                  role: "user", …
                                                                }
                                generateTokens(user)
                                AuthService.updateRefreshToken ▶ $set refreshToken
                                res.cookie("refreshToken", …, { httpOnly, sameSite: "strict" })
                          ◀── 201 { accessToken, user }
```

Notable details:

- The frontend sends `termsAccepted: true` from the registration form's checkbox. The server stamps `consentAccepted`, `consentAcceptedAt`, and `consentVersion` immediately based on the active `TermsConfig`.
- Password is hashed with `bcryptjs` (auto-salt). The plain password never touches MongoDB.
- The refresh token is **persisted on the user record**. This enables server-side revocation (set it to `null` on logout) and rotation.

### 6.2 Login — `POST /api/auth/login`

```
client                          controller                      service / DB
──────                          ──────────                      ────────────
{ email, password } ──────────▶ AuthService.findUserByEmail ──▶ User collection
                                if !user            → 400 "Invalid email or password"
                                AuthService.comparePassword (bcrypt.compare)
                                if invalid          → 400 (same message — avoids enumeration)
                                generateTokens(user)
                                AuthService.updateRefreshToken ▶ $set refreshToken
                                res.cookie("refreshToken", …)
                          ◀── 200 { accessToken, user (without password/refreshToken) }
```

`excludeFields` ([`lib/util.ts`](server/src/lib/util.ts)) strips sensitive fields before the user object is returned to the client.

### 6.3 Authenticated requests — the `authenticate` middleware

File: [`middleware/auth.middleware.ts`](server/src/middleware/auth.middleware.ts)

```ts
authHeader = req.headers.authorization;
if (!authHeader?.startsWith("Bearer ")) → 401
token = authHeader.split(" ")[1];
decoded = verifyAccessToken(token);   // throws if invalid/expired
req.user = decoded;                    // typed as TokenPayload via types/index.d.ts
next();
```

Any route that wires `authenticate` into its chain gets `req.user` populated downstream. `req.user.userId` is what services use to scope queries.

### 6.4 Refresh — `POST /api/auth/refresh`

This is how the frontend keeps a session alive after the access token expires. It is called in the 401-handler of the frontend's API client.

```
client (no body, cookie auto-sent)    controller
─────────────────────────────────     ──────────
                                       refreshToken = req.cookies.refreshToken
                                       if missing               → 401
                                       decoded = verifyRefreshToken(refreshToken)
                                       AuthService.validateRefreshToken
                                          (compare cookie value against User.refreshToken in DB)
                                       if no match              → 403
                                       generateTokens(user)         ← rotate
                                       updateRefreshToken (DB)      ← rotate
                                       res.cookie(new refreshToken)
                                  ◀──  200 { accessToken }
```

**Rotation:** every refresh issues a *new* refresh token and overwrites the one in the DB. If an attacker steals an old refresh token and uses it after the legitimate user has refreshed, the DB lookup fails and we return `403`. (We do not currently revoke the entire session on a mismatch — that would be a future hardening.)

### 6.5 Logout — `POST /api/auth/logout`

```
client (cookie auto-sent) ──▶ controller
                              if cookie present:
                                 decoded = verifyRefreshToken (best-effort, ignore errors)
                                 AuthService.updateRefreshToken(userId, null)
                              res.clearCookie("refreshToken")
                          ◀── 200 { message: "Logged out successfully" }
```

After logout, even if someone replays the old refresh-token cookie, the DB value is `null` and the refresh endpoint will return `403`.

### 6.6 The `req.user` type

`req.user` is augmented globally in [`server/src/types/index.d.ts`](server/src/types/index.d.ts):

```ts
declare global {
    namespace Express {
        export interface Request {
            user?: TokenPayload;
        }
    }
}
```

So inside any handler that runs after `authenticate`, `req.user!.userId`, `req.user!.email`, and `req.user!.role` are all typed.

---

## 7. Authorization

A second middleware factory `authorize(roles: string[])` is exported from [`auth.middleware.ts`](server/src/middleware/auth.middleware.ts) but **is not used on any route yet**. It is the building block for restricting routes to specific roles (e.g. `authorize(["ADMIN"])`). Wiring it up to admin routes is part of S2-003.

`User.role` is a free-form `string | null` today. Narrowing it to `"USER" | "ADMIN"` and filling the value on user creation is also S2-003.

---

## 8. Consent enforcement

The consent system has three moving parts:

1. **`TermsConfig` collection** — a singleton document holding the current active terms version (e.g. `"v1.0"`). Created lazily on first read via `getOrCreateTermsConfig` in [`services/consent.service.ts`](server/src/services/consent.service.ts). `DEFAULT_TERMS_VERSION` lives in [`config/constants.ts`](server/src/config/constants.ts).
2. **`User.consentVersion`** — the version the user last accepted.
3. **`consentCheck` middleware** — blocks any authenticated route it's wired to if `user.consentVersion !== TermsConfig.currentVersion`.

### Endpoints (already mounted at `/api/consent/*`)

| Method | Path | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/consent/status` | Required | Returns `{ accepted, userVersion, currentVersion, needsRenewal }` |
| `POST` | `/api/consent/accept` | Required | Stamps `consentAccepted: true`, `consentAcceptedAt: now`, `consentVersion: <current>` on the user |

### How the middleware behaves

```ts
async function consentCheck(req, res, next) {
    if (!req.user)                  return 401;
    const status = await getConsentStatus(req.user.userId);
    if (status.needsRenewal)
        return 403 { code: "CONSENT_REQUIRED", currentVersion, userVersion };
    next();
}
```

The frontend's API client intercepts the `403 CONSENT_REQUIRED` body specifically and pops the consent modal instead of logging the user out. After accept, the original failed request is retried.

> **Note:** `consentCheck` is implemented but **not yet wired onto any route**. As soon as event creation, registration, etc. land (S2-005, S2-009), they will mount it after `authenticate`. Today, only consent acceptance happens inside the registration flow.

### Bumping the terms version

There is no admin endpoint for this yet. To force a global re-consent, edit the `TermsConfig.currentVersion` field directly in the database. On the next call into `consentCheck`, every user with a stale `consentVersion` will be blocked until they re-accept.

---

## 9. The User model — annotated

[`server/src/models/user.model.ts`](server/src/models/user.model.ts) defines the document we store. Worth knowing field-by-field:

```ts
export interface UserDoc {
    _id?: ObjectId;
    email: string;            // unique by convention; no DB-level unique index yet
    password: string;         // bcrypt hash, never the plain text
    name: string;
    avatar: string;           // filename in /public/avatars (default "default.png")

    // Profile fields, all optional. PATCH /api/user/profile updates these.
    phoneNumber, dob, gender, country, city, state, zipcode,
    orgName, designation, companyWebsite, bio: string | null

    refreshToken?: string | null;   // current refresh token (server-side mirror of cookie)
    role?: string | null;           // free-form today; will be Role union ("USER"|"ADMIN")

    consentAccepted: boolean;
    consentAcceptedAt?: Date | null;
    consentVersion?: string | null;

    createdAt: Date;
    updatedAt: Date;
}
```

The public type `User = Omit<UserDoc, "_id"> & { id: string }` is what services return. Controllers further strip `password` and `refreshToken` via `excludeFields(user, ["password", "refreshToken"])` before sending to the client.

---

## 10. Current API surface

Everything wired up *today*. Anything not in this table is not yet implemented.

| Method | Path | Middleware | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, issue tokens, accept terms |
| `POST` | `/api/auth/login` | — | Verify credentials, issue tokens |
| `POST` | `/api/auth/refresh` | — (uses cookie) | Rotate access + refresh tokens |
| `POST` | `/api/auth/logout` | — (uses cookie) | Clear server-side refresh token + cookie |
| `GET` | `/api/user/profile` | `authenticate` | Return the current user (sans password/refreshToken) |
| `PATCH` | `/api/user/profile` | `authenticate` | Update profile fields |
| `GET` | `/api/consent/status` | `authenticate` | Return consent state & whether re-consent is needed |
| `POST` | `/api/consent/accept` | `authenticate` | Record acceptance of current terms version |
| `GET` | `/api/events` | — | Returns 30 hardcoded mock events from `event.service.ts` |

The event endpoint is intentionally a placeholder — the real CRUD lands in S2-005 / S2-006. The mock data lives in `getAllEvents()` and uses the `Event` type from [`types/event.type.ts`](server/src/types/event.type.ts), which is shaped slightly differently from the planned `EventDoc` (e.g. `tags: string` vs `tags: string[]`, `id: number` vs `id: string`).

---

## 11. Common patterns and gotchas

- **Always use `fromDoc`** when handing a document out of a service. The frontend never sees `ObjectId`; it sees `id: string`. Forgetting this leaks Mongo internals into the API.
- **Always wrap ids with `new ObjectId(...)`** in queries. The driver does **not** accept string ids on `_id` lookups.
- **Defaults are written by services, not by the DB.** When adding a new field to a `*Doc`, update the corresponding `createX` service to write a default value, otherwise old documents will be missing it.
- **Cookies are httpOnly + `sameSite: "strict"`.** This means CORS preflight in dev requires `credentials: true` on both the server (`app.ts`) and the frontend's fetch/axios config.
- **`assert` is not a guard.** `node:console#assert` only logs on failure. Don't trust it to enforce env presence; the planned `S2-019` adds a real startup check.
- **No request validation yet.** Bodies come in as `Record<string, unknown>` and are cast. Bad input = silently corrupted documents. Adding Zod schemas is part of S2-019.
- **No rate limiting yet.** Brute-force on `/api/auth/login` is not blocked. S2-019 again.
- **No indexes are created from code.** `mongo.ts` does not call `createIndex` anywhere. Email uniqueness is enforced by an `existingUser` check in the controller, which has a small race window. Future tasks will add an `ensureIndexes()` step on app boot.

---

## 12. Where to look next

- **For the planned architecture** (event approval workflow, tiers, teams, notifications, feedback): see [plan.md](plan.md). Tasks `S2-003` through `S2-023` describe what's missing and where it goes.
- **For the frontend that talks to this API:** see `web/` (React 19 + Vite + Zustand). The frontend's `lib/api.ts` is where the access-token header is attached and the 401 → refresh dance lives.

If something here is out of date with the code, treat the code as the source of truth and update this doc.
