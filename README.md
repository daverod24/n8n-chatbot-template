# n8n-chatbot-template

Lightweight, embeddable chat widget that talks to a backend (e.g., n8n Webhook). No build tooling required. Drop one JS file and a small config onto any page.

## Quick start

1) Add config and script to your page:

```html
<script>
	window.ChatWidgetConfig = {
		webhook: { url: 'https://YOUR_N8N_HOST/webhook/your-endpoint', route: 'chat' },
		branding: { name: 'Support', logo: 'https://…/logo.png' },
		style: { position: 'right', primaryColor: '#854fff' }
	}
;</script>
<script src="/davetechai-chat-widget.js"></script>
```

2) Open the page and click the floating bubble to start a conversation.

## Local demo

Use the included `demo.html`:

- Serve the repo with any static server and open `demo.html`.
- Update `window.ChatWidgetConfig.webhook.url` to your n8n Webhook test URL.

## Configuration (window.ChatWidgetConfig)

All fields are optional and merged with sensible defaults:

```ts
webhook: {
	url: string,   // required for real calls
	route: string, // forwarded to backend
}
branding: {
	logo?: string,
	name?: string,
	welcomeText?: string,
	responseTimeText?: string,
	poweredBy?: { text?: string, link?: string }
}
style: {
	primaryColor?: string,
	secondaryColor?: string,
	position?: 'left' | 'right',
	backgroundColor?: string,
	fontColor?: string,
}
content?: {
	parseMarkdown?: boolean,  // default: true
	allowBotHTML?: boolean,   // default: true; bot messages sanitized
}
suggestions?: {
	enabled?: boolean,        // default: true
	items?: string[],         // labels for suggestion chips
}
prechat?: {
	enabled?: boolean,        // default: true
	fields?: {
		fullNameLabel?: string, // default: "Nombre completo"
		emailLabel?: string,    // default: "Email"
		submitText?: string,    // default: "Comenzar chat"
	}
}
icons: {
	expand?: string,      // SVG string or image URL
	collapse?: string,
	darkMode?: string,
	lightMode?: string,
	clearHistory?: string,
	close?: string,
}
```

## Canonical n8n Webhook contract

The widget sends JSON to `webhook.url` and expects one of:

- `{ output: string }`
- `[ { output: string } ]` (array form)

Actions and payloads:

- Start conversation (`_startNewConversation`):

```json
[
	{
		"action": "loadPreviousSession",
		"sessionId": "<session-id>",
		"route": "<route>",
		"metadata": { "userId": "<session-id>", "user": { "fullName": "…", "email": "…" } }
	}
]
```

- Send message (`_sendMessage`):

```json
{
	"action": "sendMessage",
	"sessionId": "<session-id>",
	"route": "<route>",
	"chatInput": "<sanitized text>",
	"metadata": { "userId": "<session-id>", "user": { "fullName": "…", "email": "…" }, "fileData": { /* optional */ } }
}
```

`fileData` (optional):

- File uploads: `{ name, type, size, content }`
- Audio: `{ type: "audio", data: "data:…base64", size }`

> n8n tip: Parse JSON body with an HTTP Request or Webhook node, branch on `action`, and map your response to `{ output: "…" }`.

### Session and identity

- When `prechat.enabled` is true, a small form collects `fullName` and `email` and stores them in `localStorage['chat_user_profile']`.
- The sessionId is derived as `slug(fullName)|email` for stability across reloads; if profile is missing, a random UUID is used.
- The widget attaches `metadata.userId` and `metadata.user` on all requests.

### Rendering and security

- User messages are always escaped before sending and rendering.
- Bot messages can render Markdown and limited HTML; all HTML passes through a sanitizer that allows only safe tags and attributes.

### Suggestions

- Configure quick-reply chips via `suggestions.items` (array of strings). They appear when the input is empty and hide as you type.

## UX, limits, and behaviors

- Two views: welcome and chat interface; toggled internally.
- Dark mode: persisted in `localStorage['chat_dark_mode']`.
- Expand/collapse adjusts container size; icons update accordingly.
- Input limits:
	- Text: max 1000 chars.
	- Files: .txt/.md/.doc/.docx, <= 100KB.
	- Audio: ~10s, <= ~200KB, recorded as `audio/webm`.
- Sanitization: user text is sanitized before sending; bot output is sanitized after Markdown/HTML rendering.
- Responsive: on small screens the widget can expand to full-screen; default layout adapts to viewport.

## Branding & theming standards

To keep a consistent look across sites, prefer these conventions:

- Colors: set `style.primaryColor` and `style.secondaryColor` for gradients; ensure contrast with `style.fontColor`.
- Position: `style.position` should be `right` unless layout requires `left`.
- Logo: square image recommended (32×32 displayed). Provide a transparent PNG/SVG.
- Powered by: customize via `branding.poweredBy.text` and `.link`.
- Icons: supply SVG strings for crisp scaling. If using URLs, prefer monochrome assets; the widget swaps them based on state (expand/collapse, light/dark).
- Fonts: Geist Sans is auto-injected; override only if your site enforces a different base font.

## Development notes

- Self-contained IIFE: do not introduce global variables.
- Styles live in `_getStyles()` inside `davetechai-chat-widget.js`.
- Errors: on fetch errors, the widget hides the typing indicator and posts a friendly bot message.

### Minimal embed example with pre-chat and suggestions

```html
<script>
	window.ChatWidgetConfig = {
		webhook: { url: 'https://your-host/webhook/endpoint', route: 'chat' },
		branding: { name: 'Support', logo: 'https://example.com/logo.png' },
		style: { position: 'right', primaryColor: '#854fff' },
		content: { parseMarkdown: true, allowBotHTML: true },
		suggestions: { enabled: true, items: ['Precio', 'Horario', 'Contacto'] },
		prechat: { enabled: true, fields: { submitText: 'Iniciar' } }
	};
</script>
<script src="/davetechai-chat-widget.js"></script>
```

## License

MIT (or your preferred license)