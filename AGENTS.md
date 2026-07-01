# Agentic Knowledge Engineering

Open-code skill and UI project for building and orchestrating Claude skills.

- **UI**: Vue 3 + TypeScript + Tailwind CSS (Vite)
- **Testing**: Vitest + @vue/test-utils
- **Skills**: Open-code skills in `skill/` directory, loaded by LLM via `LlmProvider`

## Project Conventions

- Spec-driven development: all features start in `specs/` before any code
- One task = one commit with passing build + tests
- Skills live in `skill/` directory; each skill follows the Skill Creator workflow (draft → eval → iterate)
- `ake.json` is gitignored; `ake.example.json` is the committed template. Never commit real API keys
- `ui_lite/` is the zero-dependency demo — single HTML file, no install, served by any HTTP server
- See `specs/SDD.md` for the full workflow

## Triggering Feature Development

When the user describes a new feature (creates, builds, adds, wants a new screen,
etc.), follow the spec-driven development workflow in `specs/SDD.md`. Read
`MEMORY.md` before writing any spec to avoid repeating known bugs. The workflow:
1. Generate mockups if needed (`canvas-design` + `theme-factory`)
2. Co-author spec + plan (`doc-coauthoring`)
3. Write test plan and tasks
4. Implement one commit per task
5. Write takeaways → promote to `MEMORY.md`
