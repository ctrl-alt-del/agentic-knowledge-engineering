# Agentic Knowledge Engineering

Open-code skill and UI project for building and orchestrating Claude skills.

- **UI**: Vue 3 + TypeScript + Tailwind CSS (Vite)
- **Testing**: Vitest + @vue/test-utils

## Getting Started

```bash
# 1. Configure LLM API
cp ake.example.json ake.json
# Edit ake.json with your API credentials (provider, apiKey, baseURL, model)

# 2. Start the UI
cd ui
npm install
npm run dev    # start dev server
npm test       # run tests
```

## Project Structure

```
├── ake.example.json   # LLM API config template (copy to ake.json)
├── ake.schema.json    # Config JSON Schema
├── skill/             # opencode skills (loaded by LLM via LlmProvider)
│   └── project-initializer/    # 项目初始化助手技能
├── ui/                # Vue 3 frontend
│   └── src/
│       ├── components/   # Chat UI components
│       └── lib/          # LlmProvider, OpenAi/Anthropic providers, skillLoader
├── specs/             # feature specifications (SDD workflow)
│   ├── 001-chat-ui/
│   ├── 002-project-initializer-skill/
│   └── 003-llm-api-config/
├── MEMORY.md          # accumulated project knowledge
└── AGENTS.md          # AI workflow conventions
```

## Configuration

Copy the template and fill in your LLM API details:

```json
{
  "llm": {
    "provider": "openai-compatible",
    "apiKey": "sk-...",
    "baseURL": "https://api.openai.com/v1",
    "model": "gpt-4o",
    "options": {
      "temperature": 0.7,
      "maxTokens": 4096,
      "stream": true
    }
  },
  "skills": {
    "paths": ["skill/"],
    "autoload": ["project-initializer"]
  }
}
```

- `provider`: `"openai-compatible"` or `"anthropic"`
- `skills.autoload`: skills loaded into context on startup
- `ake.json` is gitignored — never commit your API keys

## Workflow

All features follow spec-driven development. See `specs/SDD.md` for the full workflow.
