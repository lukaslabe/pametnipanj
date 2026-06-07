# PametniPanj Development Rules

- PametniPanj is a serious production-oriented application, not a throwaway demo.
- Treat every normal user flow as production: real accounts, server persistence, and explicit error states.
- Never silently fall back to demo mode, demo accounts, demo data, or local-only persistence when the server connection is missing or fails.
- Demo or simulated sensor features are allowed only as clearly separated administrator/testing tools and only when the user explicitly requests them.
- Do not describe the main application as a demo, prototype, test app, or offline-only app.
- Preserve all existing working features unless the user explicitly requests their removal.
- Keep each change narrowly scoped to the requested behavior.
- Before editing, inspect the affected flow and its dependencies.
- After editing, run the Slovenian text check, production build, and relevant functional checks.
- Never claim a feature is fixed or live without verification.
- Do not deploy or push unless the user explicitly requests publication.
- Keep all user-facing text in correct Slovenian with šumniki.
