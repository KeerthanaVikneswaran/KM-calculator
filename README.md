# Bus KM System

Two portals + one admin dashboard, backed by a single transaction table (`tblBusEmployee`)
matched on `EmployeeID + TravelDate`. Portal 1 fills the bus side, Portal 2 fills the KM side;
whichever arrives second flips the row to `Completed`. If a portal saves first, the row is
created as `KM Pending` or `Bus Pending` and completes itself once the other side arrives.

## Stack
- Frontend: HTML + Bootstrap 5 + vanilla JS (`public/portal1`, `public/portal2`, `public/admin`, `public/login`)
- Backend: Node.js + Express (`server.js`, `routes/`, `controllers/`)
- Database: SQLite (`database/BusKMSystem.db`), accessed via `better-sqlite3` — a single file,
  no server or network config required. Schema lives in `database/schema.sql` and is applied
  automatically every time the app starts.
- Auth: JWT with three roles — `admin`, `portal1`, `portal2`

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and set a real `JWT_SECRET`.
   No database credentials are needed.
   ```
   cp .env.example .env
   ```

3. **Seed login accounts**
   ```
   node scripts/seedAdmin.js
   ```
   This also creates `database/BusKMSystem.db` (via the schema on first run) if it doesn't
   already exist. Creates:
   - `admin` / `Admin@123` (role: admin — dashboard, reports, master data)
   - `user1` / `user1@123` (role: portal1 — bus/employee registration)
   - `user2` / `user2@123` (role: portal2 — KM entry)

   Change these passwords before going live.

4. **Run**
   ```
   npm start
   ```
   Visit `http://localhost:3000/` to log in. Each role is redirected to its own portal.

## Inspecting the database

`database/BusKMSystem.db` is a plain SQLite file. Open it directly with
[DB Browser for SQLite](https://sqlitebrowser.org/) any time — including while the server is
running — to view/edit `tblEmployees`, `tblBuses`, `tblBusEmployee`, and `tblUsers` by hand.
Stop the Node server first if you want to edit and save changes from DB Browser, to avoid
write conflicts with the app's WAL journal.

## Deploying to Render (free tier)

Gives you a permanent public URL instead of a temporary tunnel.

1. Push this project to a GitHub repo (`git add`, `git commit`, create a repo on GitHub, `git push`).
2. On [render.com](https://render.com), sign up/log in, then **New > Blueprint** and point it at
   your repo — it will read `render.yaml` in this project and set up the web service
   automatically (build command `npm install`, start command `npm start`, a generated
   `JWT_SECRET`). Or set those same values manually under **New > Web Service** if you'd rather
   not use the blueprint.
3. Once deployed, Render gives you a URL like `https://bus-km-system.onrender.com` — that's
   permanent (until you delete the service) and works from any network.
4. Login accounts are created automatically on first boot (see "Auto-seeding" below) —
   no shell access needed.

**Important caveat — SQLite on Render's free tier:** the free plan's disk is ephemeral. Your
`database/BusKMSystem.db` file will reset (losing all data) whenever the service redeploys or
spins back up after being idle. This is fine for demos, but for real day-to-day use you'd need
either a paid instance + persistent disk (mount it and set `DB_PATH` to a path on that disk), or
swap to a hosted database. Ask if you want help with either when you're ready to go live for real.

## Auto-seeding

On every boot, the server checks `tblUsers` and creates/updates the three default logins
(`admin`/`Admin@123`, `user1`/`user1@123`, `user2`/`user2@123`) if they don't already
exist (`config/seed.js`). This is what makes a fresh Render deploy usable immediately without
running a script by hand. `node scripts/seedAdmin.js` still works too, for local use.

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Get a JWT |
| GET | `/api/employees?search=` | Employee lookup (used by both portals) |
| POST | `/api/employees` | Add employee (admin) |
| GET | `/api/buses` | Active bus list |
| POST | `/api/buses` | Add bus (admin) |
| POST | `/api/bus-entry` | Portal 1 save — `{ employeeId, busId, travelDate }` |
| POST | `/api/km-entry` | Portal 2 save — `{ employeeId, travelDate, km }` |
| GET | `/api/transactions?date=&busId=&employeeId=&status=` | Filtered transaction list |
| GET | `/api/dashboard?date=` | Summary counts for the admin dashboard |

## Notes / next steps for production

- SQLite is fine for a single-server deployment with moderate traffic; if you outgrow it
  (many concurrent writers, need for a separate DB host), swap `config/database.js` for a
  `mssql`/`pg` client — the controllers isolate all DB access, so only that layer changes.
- Put this behind HTTPS (reverse proxy with a real certificate — nginx/IIS/Caddy).
- Back up `database/BusKMSystem.db` regularly (it's a single file — copying it is a full backup).
- Add rate limiting on `/api/auth/login`.
- Add an audit log table if you need to track who edited what, when.
- The `UNIQUE (EmployeeID, TravelDate)` constraint on `tblBusEmployee` is the real
  duplicate-prevention guard — the app-level check-then-insert is a convenience, the DB
  constraint is the backstop.
