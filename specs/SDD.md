# Spec-Driven Development Workflow

## Phases

1. **Spec** — Write plan.md + spec.md + UX mockups. Review with stakeholder.
2. **Plan** — Break into tasks.md + test_plan.md. Estimate and order.
3. **Build** — Implement one task per commit. Verify build + tests at each commit.
4. **Ship** — Write takeaways.md. Merge to MEMORY.md.

## Skills to Use

### Spec Writing Phase
- **`doc-coauthoring`**: Invoke when starting spec.md or plan.md. Enforces a
  describe → review → approve → iterate loop. Prevents guessing requirements.

### Mockup Generation Phase
- **`canvas-design` + `theme-factory`**: Invoke when user describes a feature
  but has NO mockup. `canvas-design` generates visual layout; `theme-factory`
  applies the project's existing color scheme. Output to ux-ui/.
  Skip when user provides real screenshots — AI reads them natively.

### Interactive Prototyping Phase (optional)
- **`frontend-design`**: When feature has complex interaction logic (navigation
  flow, state transitions). Generates HTML/React prototype.
- **`webapp-testing`**: Verifies HTML prototype interactions with Playwright.
  Use when: feature has >= 3 screens or multi-step flows that would be
  expensive to get wrong in native code.

### Reading Provided Screenshots
- No skill needed. AI reads real UI screenshots natively. Only use when the
  user provides actual images of their intended UI.

### Test Plan Authoring
- No skill needed. Apply standard practices:
  - AAA pattern (Arrange-Act-Assert)
  - Boundary testing
  - Equivalence partitioning
  Reference project-specific testing conventions.

### Codebase Knowledge Generation
- **`codebase-to-sdd-knowledge`**: Invoke when there is existing code but no
  `knowledge/` directory or when `MEMORY.md` is sparse. Analyzes the codebase
  to produce structured knowledge files (`knowledge/`) and populate `MEMORY.md`
  with durable findings from actual code and git history — not templates. Run
  once during SDD setup and re-run when the codebase structure changes
  significantly.

## Skill Invocation Order

```
Feature Request Received
│
├── knowledge/ directory exists and is recent?
│   ├── YES → proceed
│   └── NO  → codebase-to-sdd-knowledge → generate knowledge/ + populate MEMORY.md
│
├── User has mockup?
│   ├── YES → AI reads natively → spec writing
│   └── NO  → canvas-design + theme-factory → generate mockup
│
├── doc-coauthoring → co-write spec.md + plan.md
│
├── Complex flow (>= 3 screens)?
│   ├── YES → frontend-design → HTML prototype
│   │         └── webapp-testing → verify interactions
│   └── NO  → skip
│
└── Implementation → tasks.md → one commit per task
```

## Conventions

- Folder names: `NNN-short-kebab-name/` (e.g., `001-user-auth/`)
- NNN is zero-padded sequential ID (001, 002, ...)
- Statuses: 📋 Planned → 🚧 In Progress → ✅ Done → 📦 Archived
- One task = one independent, build-verifiable, test-passing commit
- File conflicts surface via `touches` field in plan.md frontmatter + index.md

## Build & Test Commands

- Build: `{project_build_cmd}`
- Test: `{project_test_cmd}`

> **TODO**: Replace `{project_build_cmd}` and `{project_test_cmd}` with actual
> commands once the tech stack is chosen.
