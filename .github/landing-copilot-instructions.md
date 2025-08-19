# Copilot instructions for n8n-chatbot-template

Purpose: Help AI coding agents quickly contribute to this repo by capturing the key architecture, patterns, and workflows found here. Keep changes minimal and aligned with the current code style and constraints.

## Big picture
- This repo is a lightweight, embeddable chat widget intended to sit on any webpage and talk to a backend (e.g., n8n webhook). No build tooling is required.
- **NEW**: Includes a universal landing page template system for service-based businesses with integrated chat widget
- Key files:
  - `davetechai-chat-widget.js`: Entire widget (DOM creation, styles, state, UX, and API calls) in one self-contained IIFE. Injects a `<style>` tag and builds the DOM at runtime.
  - `landing-page-template-prompt.md`: Universal template for creating service business landing pages
  - `README.md`: Currently empty beyond the title; prefer adding usage notes if needed.
- The widget reads a global `window.ChatWidgetConfig` at load to customize branding, styles, webhook target, and icons.

## Landing Page Template System

### Template Architecture
- **Universal design pattern**: Adaptable for any service-based business (cleaning, consulting, healthcare, etc.)
- **Mobile-first approach**: Responsive design with progressive enhancement
- **Integration-ready**: Built-in chat widget and form webhook connections
- **SEO-optimized**: Schema markup, meta tags, sitemap generation
- **No-build deployment**: Static files ready for any web server

### Template Structure
1. **Configuration layer**: Business-specific variables in a config object
2. **Content sections**: 10 standardized sections (hero, services, testimonials, etc.)
3. **Integration points**: n8n webhooks for forms and chat
4. **Styling system**: Tailwind CSS with custom variable overrides
5. **SEO foundation**: Robots.txt, sitemap.xml, structured data

### Customization Patterns
- **businessConfig object**: Centralized configuration for all business-specific data
- **Color variables**: CSS custom properties for brand color consistency
- **Content placeholders**: Clearly marked areas for business-specific content
- **Service arrays**: Configurable service listings and descriptions
- **Contact methods**: Multiple communication channels (phone, email, chat, form)

### Form Integration Contract
Standard form fields sent to n8n webhook:
```json
{
  "action": "submitQuote",
  "formType": "quote|contact|newsletter",
  "data": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "serviceType": "string",
    "message": "string",
    "source": "landing_page"
  },
  "metadata": {
    "timestamp": "ISO_string",
    "userAgent": "string",
    "referrer": "string"
  }
}
```

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

## Landing Page Development Patterns

### Template Generation Workflow
1. **Business analysis**: Identify industry, target market, and service type
2. **Content adaptation**: Replace template variables with business-specific content
3. **Style customization**: Apply brand colors, fonts, and visual elements
4. **Integration setup**: Configure webhooks for forms and chat widget
5. **SEO optimization**: Generate meta tags, schema markup, and sitemaps
6. **Testing**: Validate responsive design, form submissions, and chat functionality

### Content Strategy Patterns
- **Value proposition hierarchy**: Hero → Services → Social Proof → Process → Contact
- **Trust building elements**: Testimonials, certifications, guarantees, case studies
- **Conversion optimization**: Clear CTAs, multiple contact methods, urgency indicators
- **Local SEO**: Service area coverage, location-specific content, map integration

### Technical Implementation Standards
- **Mobile-first CSS**: Start with mobile styles, enhance for larger screens
- **Performance budget**: Images < 500KB, total page < 2MB, LCP < 2.5s
- **Accessibility**: WCAG 2.1 AA compliance, semantic HTML, keyboard navigation
- **Form validation**: Client-side UX + server-side security
- **Error handling**: Graceful degradation, user-friendly error messages

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
- **Landing page forms**: Name/email required, phone optional, message max 2000 chars.

## Development workflow
- No bundler; serve the static files from any web server. For local testing, you can open an HTML page that sets `window.ChatWidgetConfig` and includes `davetechai-chat-widget.js`.
- **Landing pages**: Use the template prompt to generate business-specific pages, then customize styling and content.
- Styling is inline via `_getStyles()`; prefer editing that method directly. Keep CSS variable names aligned with current `--n8n-chat-*` tokens.
- Keep the class self-contained; avoid external runtime deps beyond the injected font.

## Extension points (safe targets for changes)

### Chat Widget Extensions
- New config toggles: add to `_mergeConfig` defaults and use in `_applyInitialStyles`/DOM as needed.
- New icons: extend `config.icons` and update `_updateAllIcons()`.
- New input modes (e.g., images): follow the pattern of `_validateFile` + `_handleFileUpload` and pass a `fileData` variant via `metadata`.
- Alternate backends: adjust `_apiCall` and response parsing (still accept `{ output }` or array form), but don't break existing fields/actions.

### Landing Page Extensions
- **Industry templates**: Create specialized versions for healthcare, consulting, e-commerce, etc.
- **Component library**: Reusable sections (pricing tables, team bios, FAQ accordions)
- **A/B testing**: Multiple hero variations, CTA button testing, layout experiments
- **Advanced integrations**: CRM connectors, email marketing, booking systems
- **Analytics**: Enhanced tracking for conversion funnels, user behavior, form abandonment

### Safe Customization Areas
- **Content sections**: Add/remove/reorder template sections as needed
- **Styling variables**: Brand colors, fonts, spacing, layout preferences
- **Form fields**: Add industry-specific fields while maintaining core structure
- **SEO metadata**: Customize for specific industries and locations
- **Social proof**: Adapt testimonial formats, add industry-specific credentials

## Quality bar
- Preserve the initialization guard (`window.N8NChatWidgetInitialized`).
- Don't introduce global symbols; keep everything inside the IIFE.
- Maintain graceful error UX: call `_hideTypingIndicator()` and show a bot message on failures.
- **Landing pages**: Ensure mobile responsiveness, form validation, and webhook connectivity.
- **SEO compliance**: Valid HTML, proper meta tags, accessible markup.
- **Performance**: Optimize images, minimize CSS/JS, implement lazy loading.

## Template Usage Guidelines

### When to Use This Template
- Service-based businesses (B2B or B2C)
- Local businesses with geographic service areas
- Professional services requiring trust and credibility
- Businesses needing lead generation through forms and chat

### Customization Best Practices
- **Start with business config**: Define all variables before customizing content
- **Maintain section order**: The template flow is optimized for conversion
- **Keep CTAs consistent**: Use the same action words throughout the page
- **Test thoroughly**: Validate forms, chat widget, and mobile experience
- **Monitor performance**: Track conversion rates and optimize accordingly

### Common Pitfalls to Avoid
- Don't skip the chat widget configuration
- Don't remove form validation
- Don't ignore mobile responsiveness
- Don't forget to update meta tags and SEO elements
- Don't hardcode values that should be in the business config

If anything above is unclear or you need more context (e.g., sample HTML harness, n8n flow structure, industry-specific templates), leave a short note in your PR and we'll fill it in.
