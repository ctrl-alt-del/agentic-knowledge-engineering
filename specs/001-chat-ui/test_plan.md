# Chat UI — Test Plan

## Unit Tests

### MockResponder
- [ ] **Happy path**: Given a `MockResponder` instance, when `sendMessage("hello")` is called, then it returns a non-empty string after a delay between 300–1500ms
- [ ] **Empty input**: Given `sendMessage("")`, then it returns a response (mock is lenient — no validation)
- [ ] **Multiple calls**: Given 10 sequential calls to `sendMessage()`, then responses vary across calls (not always the same string)

### ChatInput
- [ ] **Enter key sends**: Given text in the input, when Enter is pressed, then `@submit` event is emitted with the trimmed text
- [ ] **Shift+Enter newline**: Given text in the input, when Shift+Enter is pressed, then a newline is inserted (not submitted)
- [ ] **Empty submit blocked**: Given empty input, when Enter is pressed, then no submit event is emitted
- [ ] **Whitespace-only blocked**: Given input containing only spaces, when Enter is pressed, then no submit event is emitted
- [ ] **Input clears after submit**: Given text "hello", when submitted, then the input field is cleared
- [ ] **Send button disabled when empty**: Given empty input, then the send button is visually disabled (not clickable)

### MessageBubble
- [ ] **User message renders**: Given `role="user"` and `content="hello"`, then the bubble is right-aligned with warm background
- [ ] **Assistant message renders**: Given `role="assistant"` and `content="hi"`, then the bubble is left-aligned with cool background
- [ ] **Long message**: Given `content` of 300+ chars, then the bubble width is capped and text wraps without overflow
- [ ] **Special characters**: Given `content` containing `<script>alert(1)</script>`, then it renders as text (no XSS)

### ChatContainer
- [ ] **Initial state**: Given the component mounts, then the message list contains the welcome greeting from the assistant
- [ ] **Provider integration**: Given the component mounts, then the injected `LlmProvider` is available in the component

## Integration Tests

- [ ] **Full send-receive flow**: Mount `ChatContainer` with `MockResponder` provided → type "hello" → click Send → verify user message appears → verify typing indicator appears → verify assistant response appears → verify input cleared → verify auto-scroll
- [ ] **Keyboard-only flow**: Mount → type "test" → press Enter → verify message sent (no mouse needed)

## Edge Cases
- [ ] **Rapid consecutive sends**: Send 3 messages rapidly → each gets an independent response (no interleaving, no lost messages)
- [ ] **Very long message**: Send 2000-char message → renders without layout breakage
