# IC Verification Learning App

This project is an IC verification learning application.

Core principles:

1. Mobile First.
2. The user is a beginner transitioning from a non-EE background into IC verification.
3. Keep explanations beginner-friendly but technically correct.
4. Learning content must be separated from UI logic.
5. Do not redesign the learning roadmap unless explicitly requested.
6. Do not add backend services unless explicitly requested.
7. Do not add authentication unless explicitly requested.
8. Do not add AI APIs unless explicitly requested.
9. Avoid unnecessary dependencies.
10. Preserve existing user progress when changing data structures.
11. After meaningful changes, run appropriate type and build checks.
12. Keep UI compact and engineering-oriented.
13. Do not introduce gamification, leaderboards, coins, streak pressure, or childish visual design.
14. Future weeks should be added as data rather than hard-coded pages whenever possible.
15. Before major architectural changes, explain why they are necessary.

Project-specific constraints:

- Learning content and the Week 1–24 roadmap are supplied by the user. Never add, remove, rename, or reinterpret learning topics without explicit user confirmation.
- Study time may only be edited from the Today page. Progress may read and aggregate study time but must never provide a second editing entry point.
- V1 persistence is device-local and uses localStorage with a versioned schema. Do not introduce cloud persistence.
- Automated test frameworks are deferred until Week 2 or Week 3. For the current phase, use TypeScript checks, production builds, and basic manual acceptance only.
- Milestone boundaries are scope boundaries. Do not implement later milestone business logic early.
