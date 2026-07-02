# Agentic Knowledge Engineering

Open-code skill and UI project for building and orchestrating Claude skills.

- **UI**: Vue 3 + TypeScript + Tailwind CSS (Vite)
- **Testing**: Vitest + @vue/test-utils

## Getting Started

### Option A: Q&A Agent (no npm needed)
```bash
cd features/qna-agent/
cp config/ake.example.json config/ake.json    # edit with LLM credentials
python3 build-index.py                         # initial knowledge index
python3 serve.py                               # http://127.0.0.1:3100/ui_lite/
# See features/qna-agent/ARCHITECTURE.md for deployment to other platforms
```

### Option B: Chat UI (Vue 3, requires npm)
```bash
cd features/init-chat/ui
npm install
npm run dev    # start dev server
npm test       # run tests
```

### Option C: Zero-dependency Chat Demo (no npm needed)
```bash
python3 -m http.server 8000
# Open http://localhost:8000/features/init-chat/ui_lite/
```

## Project Structure

```
├── ake.example.json   # LLM API config template (copy to ake.json)
├── ake.schema.json    # Config JSON Schema
├── features/          # feature modules (each with ui, skill, specs)
│   ├── init-chat/     # chatbot for project initialization
│   │   ├── ui/        #   Vue 3 frontend (requires npm)
│   │   ├── ui_lite/   #   Zero-dependency demo
│   │   ├── skill/     #   project-initializer skill
│   │   └── specs/     #   feature specifications (001-004)
│   └── qna-agent/     # offline knowledge Q&A agent
│       ├── agent/     #   portable agent core (skills + knowledge + memory)
│       ├── ui_lite/   #   zero-dependency browser UI
│       ├── serve.py   #   local dev server
│       └── ARCHITECTURE.md  # design doc + deployment guide
├── specs/             # SDD workflow + template
│   ├── SDD.md
│   └── _template/
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
    "paths": ["features/init-chat/skill/"],
    "autoload": ["project-initializer"]
  }
}
```

- `provider`: `"openai-compatible"` or `"anthropic"`
- `skills.paths`: one or more skill directories. For qna-agent use `"features/qna-agent/agent/skill/"`
- `skills.autoload`: skill names loaded into context on startup. qna-agent uses `["qna-orchestrator", "knowledge-retrieval", "memory-curation"]`
- `ake.json` is gitignored — never commit your API keys

Each feature has its own `config/ake.example.json` template. See `features/qna-agent/ARCHITECTURE.md` for the full deployment guide.

## Workflow

All features follow spec-driven development. See `specs/SDD.md` for the full workflow.
