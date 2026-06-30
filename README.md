# Agentic Knowledge Engineering

Open-code skill and UI project for building and orchestrating Claude skills.

- **UI**: Vue 3 + TypeScript + Tailwind CSS (Vite)
- **Testing**: Vitest + @vue/test-utils

## Getting Started

```bash
cd ui
npm install
npm run dev    # start dev server
npm test       # run tests
```

## Project Structure

```
├── skill/          # opencode skills
├── ui/             # Vue 3 frontend
│   └── src/
│       ├── components/   # Vue components (chat UI)
│       └── lib/          # Providers, mock responder
├── specs/          # feature specifications (SDD workflow)
├── MEMORY.md       # accumulated project knowledge
└── AGENTS.md       # AI workflow conventions
```

## Workflow

All features follow spec-driven development. See `specs/SDD.md` for the full workflow.
