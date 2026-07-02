# Agentic Knowledge Engineering

Open-code skill and UI project for building and orchestrating Claude skills.

- **UI**: Vue 3 + TypeScript + Tailwind CSS (Vite)
- **Testing**: Vitest + @vue/test-utils
- **Skills**: Open-code skills per feature in `features/<feature>/skill/` directory, loaded by LLM via `LlmProvider`

## Project Conventions

- Multi-feature structure: each feature lives under `features/<feature>/` with its own `agent/` (skills + knowledge + memory, portable), optional `ui_lite/` (browser UI), and optional `serve.py` (local dev server). `ui/` for full Vue apps.
- Spec-driven development: all features start with specs before any code
- One task = one commit with passing build + tests
- Skills live in `features/<feature>/skill/`; each skill follows the Skill Creator workflow (draft → eval → iterate)
- `ake.json` is gitignored; `ake.example.json` is the committed template. Never commit real API keys
- `specs/SDD.md` for the full workflow; `specs/_template/` for new feature scaffolding
- See `specs/SDD.md` for the full workflow

## Triggering Feature Development

When the user describes a new feature (creates, builds, adds, wants a new screen,
etc.), follow the spec-driven development workflow in `specs/SDD.md`. Read
`MEMORY.md` before writing any spec to avoid repeating known bugs. The workflow:
1. Create the feature folder: `mkdir -p features/<new-feature>/{ui,ui_lite,skill,specs}`
2. Generate mockups if needed (`canvas-design` + `theme-factory`)
3. Co-author spec + plan (`doc-coauthoring`)
4. Write test plan and tasks
5. Implement one commit per task
6. Write takeaways → promote to `MEMORY.md`
