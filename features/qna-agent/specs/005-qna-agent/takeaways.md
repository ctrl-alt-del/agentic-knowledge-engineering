# Q&A Knowledge Agent — Takeaways

## What Went Well

- **Multi-skill architecture**: Splitting the agent into orchestrator, retrieval, and memory-curation skills created clean separation of concerns. Each skill is independently readable and testable.
- **Pre-built index**: `build-index.py` was simple to write and verify. The inverted index approach keeps the browser lightweight — search latency is <50ms even with hundreds of files.
- **Zero-dependency approach**: Python stdlib + browser APIs covered everything — no npm, no pip. The `serve.py` + `python3 -m http.server` dual approach gives flexibility.
- **portable agent core**: `agent/` directory is truly self-contained. Skills, knowledge, memory, and config live in one folder that can be copied to any platform.
- **Anti-fabrication design**: Multiple layers — skill instructions (only [Knowledge] blocks), source citation requirement, confidence scores, "I don't know" as a valid answer.
- **ui_lite pattern reuse**: Borrowed heavily from init-chat/ui_lite (markdown, streaming, styling), saving significant development time while adding sidebar + index + memory.

## What We Learned

- **Separation of portable vs local**: Not everything should go in `agent/`. `config/ake.json` is local-only because platforms manage their own LLM credentials. `ui_lite/` is one of many possible UIs. This distinction needs to be documented clearly.
- **Index staleness detection**: Using file set comparison + mtimes works for basic change detection, but doesn't handle file renames well. Future improvement: content hashing.
- **CJK tokenization**: Chinese text tokenization is inherently harder than English. The current approach (character bigrams + whitespace-split) is functional but imperfect. Embeddings would be better for v2.
- **Memory distillation needs UI feedback**: Users don't know when memory has been distilled unless they check the panel. A subtle notification or badge would improve UX.

## API / Tech Surprises

- **Python's `http.server` binds 0.0.0.0 by default**: Security risk if users forget `--bind 127.0.0.1`. Our `serve.py` defaults to 127.0.0.1, solving this.
- **`import.meta.dirname` is Node-only**: Can't use it in browser code. The ui_lite has no filesystem access anyway.
- **localStorage JSON serialization**: Need to handle serialization errors gracefully. Large memory stores could hit the 5-10MB limit. Export is the escape hatch.

## Patterns Worth Reusing

- **agent/ portability pattern**: `<feature>/agent/` = portable core; `<feature>/ui_lite/` = optional UI; `<feature>/serve.py` = optional server. Apply to all future features.
- **Pre-built index pattern**: `build-index.py` + `knowledge-index.json` → browser loads + searches in-memory. Applies to any feature needing fast local search.
- **Skill routing pattern**: orchestrator skill + sub-skills loaded as system messages. The LLM switches modes implicitly based on conversation state. No explicit tool calling needed for v1.
- **Chinese/English language split**: Skills/UI in Chinese, code/schemas in English. Works well for domain-specific concepts while keeping code interoperable.
