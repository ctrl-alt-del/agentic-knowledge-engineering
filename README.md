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
├── skill/          # opencode skills (loaded by LLM via LlmProvider)
│   └── project-initializer/    # 项目初始化助手技能
├── ui/             # Vue 3 frontend
│   └── src/
│       ├── components/   # Chat UI components
│       └── lib/          # LlmProvider interface, MockResponder, types
├── specs/          # feature specifications (SDD workflow)
│   ├── 001-chat-ui/            # Chat UI feature
│   └── 002-project-initializer-skill/  # Project initializer skill
├── MEMORY.md       # accumulated project knowledge
└── AGENTS.md       # AI workflow conventions
```

## Workflow

All features follow spec-driven development. See `specs/SDD.md` for the full workflow.
