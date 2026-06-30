# Chat UI — Specification

## User Story
As a user, I want to chat with an AI assistant through a clean, beautiful web interface so that I can interact with LLM-powered skills in the future.

## UX/UI
- [x] Mockup: `ux-ui/mockup.png` (screenshot) + `ux-ui/mockup.html` (source) — generated following "Luminous Conduit" design philosophy
- Chat window with:
  - Header showing assistant name and status
  - Scrollable message list with auto-scroll to latest
  - User messages: right-aligned, warm earth tone (#d4b896), rounded bubbles
  - Assistant messages: left-aligned, cool neutral (#e8ecf0), rounded bubbles
  - Typing indicator (animated dots) while waiting for response
  - Single input bar with rounded textarea + send button
  - Send button: dark (#3d3929), subtle hover/active states
- Responsive: works at 480px+ width, fluid sizing
- Light theme with warm neutral background (#f8f5f0)

## Acceptance Criteria

### Happy Path
- [ ] Given the chat is loaded, when I type a message and press Enter or click Send, then my message appears in the message list right-aligned
- [ ] Given I send a message, when the mock responder processes it, then a typing indicator appears briefly, followed by a random response left-aligned
- [ ] Given new messages appear, when they overflow the viewport, then the list auto-scrolls to show the latest message
- [ ] Given the page loads, when no conversation has started, then a welcome greeting from the assistant is shown

### Edge Cases
- [ ] Given the input is empty, when I try to send, then nothing happens (send is blocked)
- [ ] Given the input is whitespace-only, when I try to send, then nothing happens
- [ ] Given long messages (200+ chars), when rendered, then the bubble expands gracefully without breaking layout
- [ ] Given rapid sends, when multiple messages are sent quickly, then each gets its own independent response

## Non-Functional Requirements
- Performance: mock response delay 300–1500ms (simulated, removable)
- Accessibility: input focusable by keyboard, send triggerable by Enter
- Architecture: LLM provider behind an abstract interface for future swap
