# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use React route components for each capability, with `src/api/client.ts` for every fetch and shared `CapabilityCard` rendering for loading, empty, success, and accessible error states.
- Logic tier decision: Keep Express routes thin and put validation and business operations in `src/services/octofitService.ts`; services return model data or deliberate 4xx errors.
- Data tier decision: Define required fields and defaults in Mongoose schemas, keep seed records stable through upserts, and never clear existing application data.
- Activity tracking approach: Validate IDs and positive minutes, verify both referenced records exist, compute points from minutes, and store the creation timestamp.
- Team management approach: Require a name and mascot, default members to an empty array, and validate submitted member IDs before creating the team.
- Leaderboard approach: Aggregate activity points by team, include teams with zero points, sort by descending totals, break ties by team name, and assign 1-based ranks.
- Workout suggestions approach: Find the matching user by normalized email, consider the user's most recent activity and fitness goal, match a workout by focus, and include a reason for the result.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Verifies required Mongoose fields, member defaults, and idempotent seeding.
  - A validation failure means a model accepts incomplete user, team, activity, or workout data.
  - A seed failure means demo records or existing-team reconciliation are not preserved correctly.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Verifies activity and team validation, leaderboard ordering, and workout matching.
  - A `501` or `400` mismatch means business validation or route behavior is incomplete.
  - An empty leaderboard or incorrect suggestion means aggregation or recommendation logic is missing.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Verifies API rendering and accessible loading, empty, and error states on every route.
  - Missing data or status elements indicate a presentation or shared API-client implementation gap.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Confirms the Express and Mongoose implementation has no TypeScript errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Confirms React, routing, API types, and Vite configuration compile and bundle successfully.
