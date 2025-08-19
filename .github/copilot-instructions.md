# Copilot instructions for n8n-chatbot-template

Purpose: Help AI coding agents quickly contribute to this repo by capturing the key architecture, patterns, and workflows found here. Keep changes minimal and aligned with the current code style and constraints.

## Big picture
- This repo is a lightweight, embeddable chat widget intended to sit on any webpage and talk to a backend (e.g., n8n webhook). No build tooling is required.
- Key files:
  - `davetechai-chat-widget.js`: Entire widget (DOM creation, styles, state, UX, and API calls) in one self-contained IIFE. Injects a `<style>` tag and builds the DOM at runtime.
  - `README.md`: Currently empty beyond the title; prefer adding usage notes if needed.
- The widget reads a global `window.ChatWidgetConfig` at load to customize branding, styles, webhook target, and icons.

## Runtime architecture
- One class: `ChatWidget` created once via a global guard `window.N8NChatWidgetInitialized`.
- Major responsibilities:
  - Asset injection (`_injectAssets`): loads Geist Sans and inlines CSS via `_getStyles()`.
  - DOM creation (`_createDOM`) and query cache (`_queryElements`). Two views: "new conversation" and the active chat view.
  - UI state (`this.state`): sessionId, darkMode, isExpanded, recording state, typing indicator.
  - Event wiring (`_addEventListeners`) using delegation for header controls.
  - API calls (`_apiCall`) to `config.webhook.url` using JSON body; expects `{ output }` or an array with `{ output }`.
  - Media: optional audio capture (10s, ~200KB cap) and small file uploads (txt/md/doc/docx up to 100KB) passed as `metadata.fileData`.

## Configuration contract (window.ChatWidgetConfig)
- Shape (all fields optional; merged with defaults):
  - `webhook: { url: string, route: string }`
  - `branding: { logo, name, welcomeText, responseTimeText, poweredBy: { text, link } }`
  - `style: { primaryColor, secondaryColor, position: 'left'|'right', backgroundColor, fontColor }`
  - `icons: { expand, collapse, darkMode, lightMode, clearHistory, close }` (SVG string or image URL)
- Example minimal setup:
  ```html
  <script>
    window.ChatWidgetConfig = {
      webhook: { url: 'https://example.com/webhook', route: 'chat' },
      branding: { name: 'Support', logo: 'https://…/logo.png' },
      style: { position: 'right', primaryColor: '#854fff' }
    }
  </script>
  <script src="/davetechai-chat-widget.js"></script>
  ```

## Backend API contract
- Start new conversation: `_startNewConversation()` sends an array payload:
  ```json
  [{
    "action": "loadPreviousSession",
    "sessionId": "<uuid>",
    "route": "<route>",
    "metadata": { "userId": "" }
  }]
  ```
  Response: `{ "output": string }` or `[ { "output": string } ]`.
- Send message (and optional file/audio):
  ```json
  {
    "action": "sendMessage",
    "sessionId": "<uuid>",
    "route": "<route>",
    "chatInput": "<sanitized text>",
    "metadata": { "userId": "", "fileData": { /* optional */ } }
  }
  ```
  Where `fileData` for uploads is `{ name, type, size, content }` and for audio is `{ type: 'audio', data: 'data:…base64', size }`.

## UX and UI conventions
- Two top-level views inside `.chat-container`: `.new-conversation-view` and `.chat-interface-view`; toggled by `_toggleView(showChatInterface)`.
- The chat bubble is toggled with `._toggleChat(true|false)` by clicking `.chat-toggle`.
- Dark mode state persisted in `localStorage['chat_dark_mode']` and toggles `.dark-mode` class on root `.n8n-chat-widget`.
- Expand/collapse toggles `.expanded` on `.chat-container`; icons update via `_updateAllIcons()`.
- Messages: `_addMessage(content, 'user'|'bot', isHTML=false)`; normal path uses textContent unless `isHTML` is true (only used for safe, local HTML like file/audio cards).
- Suggestion chips in `.suggestions-container` show when textarea is empty/focused; clicking fills the textarea.

## Limits and validation
- Text message length: 1000 chars.
- File uploads: txt/md/doc/docx only, <= 100KB.
- Audio recording: 10 seconds; rejects blobs > ~200KB.
- Inputs are sanitized via `_sanitizeInput()` before sending.

## Development workflow
- No bundler; serve the static files from any web server. For local testing, you can open an HTML page that sets `window.ChatWidgetConfig` and includes `davetechai-chat-widget.js`.
- Styling is inline via `_getStyles()`; prefer editing that method directly. Keep CSS variable names aligned with current `--n8n-chat-*` tokens.
- Keep the class self-contained; avoid external runtime deps beyond the injected font.

## Extension points (safe targets for changes)
- New config toggles: add to `_mergeConfig` defaults and use in `_applyInitialStyles`/DOM as needed.
- New icons: extend `config.icons` and update `_updateAllIcons()`.
- New input modes (e.g., images): follow the pattern of `_validateFile` + `_handleFileUpload` and pass a `fileData` variant via `metadata`.
- Alternate backends: adjust `_apiCall` and response parsing (still accept `{ output }` or array form), but don’t break existing fields/actions.

## Quality bar
- Preserve the initialization guard (`window.N8NChatWidgetInitialized`).
- Don’t introduce global symbols; keep everything inside the IIFE.
- Maintain graceful error UX: call `_hideTypingIndicator()` and show a bot message on failures.

If anything above is unclear or you need more context (e.g., sample HTML harness, n8n flow structure), leave a short note in your PR and we’ll fill it in.
