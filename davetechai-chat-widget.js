// Chat Widget Script
(function () {
    // Previene inicializaciones múltiples para garantizar que el widget solo se cargue una vez.
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    /**
     * @class ChatWidget
     * @description Gestiona la creación, estado y funcionalidad de un widget de chat flotante.
     * Mejoras:
     * - UI responsive (mobile-first), expansión a pantalla completa en móviles.
     * - Soporte de contenido HTML/Markdown para mensajes del bot (con sanitización).
     * - Sugerencias configurables por variables.
     * - Formulario de pre-chat (nombre completo, email) para construir y persistir sessionId.
     */
    class ChatWidget {
        /**
         * @param {object} userConfig - Configuración proporcionada por el usuario para sobreescribir los valores por defecto.
         */
        constructor(userConfig = {}) {
            this.config = this._mergeConfig(userConfig);
            this.elements = {}; // Almacenará las referencias a los elementos del DOM.
            this.state = {
                sessionId: null,
                isRecording: false,
                mediaRecorder: null,
                audioChunks: [],
                typingIndicator: null,
                // Persiste el estado del modo oscuro o lo infiere del sistema operativo.
                darkMode: localStorage.getItem('chat_dark_mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches,
                isExpanded: false,
                userProfile: null, // { fullName, email }
                lastMessageTime: 0, // For rate limiting
            };

            this._init();
        }

        // --- MÉTODOS DE INICIALIZACIÓN ---

        /**
         * Inicializa el widget ejecutando la secuencia de configuración.
         * @private
         */
        _init() {
            this._injectAssets();
            this._createDOM();
            this._queryElements();
            this._applyInitialStyles();
            this._addEventListeners();
            this._updateAllIcons();
        }

        /**
         * Combina la configuración por defecto con la del usuario.
         * @private
         * @param {object} userConfig - Configuración del usuario.
         * @returns {object} Configuración final fusionada.
         */
        _mergeConfig(userConfig) {
            const defaultConfig = {
                webhook: { url: '', route: '' },
                branding: {
                    logo: '',
                    name: 'Chat',
                    welcomeText: '¡Hola! ¿Cómo podemos ayudarte?',
                    responseTimeText: 'Normalmente respondemos en unos minutos.',
                    poweredBy: { text: 'Powered by DaverodtechAI', link: 'https://www.daverod.tech' }
                },
                style: {
                    primaryColor: '#854fff',
                    secondaryColor: '#6b3fd4',
                    position: 'right',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    fontColor: '#333333'
                },
                content: {
                    parseMarkdown: true,
                    allowBotHTML: true, // Solo para mensajes del bot; siempre se sanitiza
                },
                suggestions: {
                    enabled: true,
                    items: [
                        '¿Qué servicios ofrecen?',
                    ],
                },
                prechat: {
                    enabled: true,
                    fields: {
                        fullNameLabel: 'Nombre completo',
                        emailLabel: 'Email',
                        submitText: 'Comenzar chat',
                    },
                },
                icons: {
                    expand: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M3 3l7 7M21 21l-7-7"/></svg>',
                    collapse: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H3v6M15 21h6v-6M21 3l-7 7M3 21l7-7"/></svg>',
                    darkMode: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
                    lightMode: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
                    clearHistory: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
                    close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                }
            };
            // Fusiona profundamente cada sección de la configuración.
            return {
                webhook: { ...defaultConfig.webhook, ...userConfig.webhook },
                branding: { ...defaultConfig.branding, ...userConfig.branding },
                style: { ...defaultConfig.style, ...userConfig.style },
                content: { ...defaultConfig.content, ...(userConfig.content || {}) },
                suggestions: { ...defaultConfig.suggestions, ...(userConfig.suggestions || {}) },
                prechat: { ...defaultConfig.prechat, ...(userConfig.prechat || {}) },
                icons: { ...defaultConfig.icons, ...userConfig.icons }
            };
        }

        /**
         * Inyecta dependencias externas como fuentes y la hoja de estilos del widget.
         * @private
         */
        _injectAssets() {
            const fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
            document.head.appendChild(fontLink);

            const styleSheet = document.createElement('style');
            styleSheet.textContent = this._getStyles();
            document.head.appendChild(styleSheet);
        }

        /**
         * Crea la estructura HTML del widget y la añade al body.
         * @private
         */
        _createDOM() {
            const widgetContainer = document.createElement('div');
            widgetContainer.className = 'n8n-chat-widget';
            const { branding, style } = this.config;

            const brandHeaderHTML = `
                <div class="brand-header">
                    <img src="${branding.logo}" alt="${branding.name}">
                    <span>${branding.name}</span>
                    <div class="header-controls">
                        <button class="expand-toggle" title="Expandir chat" aria-label="Expandir chat" data-action="toggleExpand"></button>
                        <button class="dark-mode-toggle" title="Modo oscuro" aria-label="Alternar modo oscuro" data-action="toggleDarkMode"></button>
                        <button class="clear-history-btn" title="Limpiar historial" aria-label="Limpiar historial" data-action="clearHistory"></button>
                        <button class="close-button" aria-label="Cerrar chat" data-action="toggleChat"></button>
                    </div>
                </div>`;

            widgetContainer.innerHTML = `
                <div class="chat-container ${style.position === 'left' ? 'position-left' : ''}">
                    <div class="view new-conversation-view">
                        ${brandHeaderHTML}
                        <div class="new-conversation">
                            <h2 class="welcome-text">${branding.welcomeText}</h2>
                            ${this.config.prechat.enabled ? `
                            <form class="prechat-form" novalidate>
                                <div class="form-row">
                                    <label>${this.config.prechat.fields.fullNameLabel}
                                        <input type="text" name="fullName" placeholder="Tu nombre y apellido" required />
                                    </label>
                                </div>
                                <div class="form-row">
                                    <label>${this.config.prechat.fields.emailLabel}
                                        <input type="email" name="email" placeholder="tu@email.com" required />
                                    </label>
                                </div>
                                <button type="submit" class="new-chat-btn">
                                    <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
                                    ${this.config.prechat.fields.submitText}
                                </button>
                                <p class="response-text">${branding.responseTimeText}</p>
                            </form>
                            ` : `
                            <button class="new-chat-btn">
                                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
                                Envíanos un mensaje
                            </button>
                            <p class="response-text">${branding.responseTimeText}</p>
                            `}
                        </div>
                    </div>
                    <div class="view chat-interface-view" style="display: none;">
                        ${brandHeaderHTML}
                        <div class="chat-messages"></div>
                        <div class="suggestions-container" style="display: none;"></div>
                        <div class="chat-input">
                            <input type="file" class="file-input" style="display: none;" multiple accept=".txt,.md,.doc,.docx">
                            <button type="button" class="file-upload-btn" title="Adjuntar archivo" aria-label="Adjuntar archivo">📎</button>
                            <button type="button" class="audio-btn" title="Grabar audio (10s max)" aria-label="Grabar audio">🎤</button>
                            <textarea placeholder="Escribe tu mensaje aquí..." rows="1" aria-label="Escribe tu mensaje"></textarea>
                            <button type="submit" class="send-btn" title="Enviar" aria-label="Enviar mensaje">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            </button>
                        </div>
                        <div class="chat-footer">
                            <a href="${branding.poweredBy.link}" target="_blank">${branding.poweredBy.text}</a>
                        </div>
                    </div>
                </div>
                <button class="chat-toggle ${style.position === 'left' ? 'position-left' : ''}" aria-label="Abrir chat" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                </button>
            `;
            document.body.appendChild(widgetContainer);
            this.elements.widgetContainer = widgetContainer;
        }

        /**
         * Selecciona y almacena referencias a los elementos del DOM para un acceso rápido.
         * @private
         */
        _queryElements() {
            const container = this.elements.widgetContainer;
            if (!container) return;

            const selectors = {
                chatContainer: '.chat-container',
                toggleButton: '.chat-toggle',
                newConversationView: '.new-conversation-view',
                chatInterfaceView: '.chat-interface-view',
                newChatBtn: '.new-chat-btn',
                prechatForm: '.prechat-form',
                messagesContainer: '.chat-messages',
                textarea: 'textarea',
                sendButton: '.send-btn',
                fileInput: '.file-input',
                fileUploadBtn: '.file-upload-btn',
                audioBtn: '.audio-btn',
                suggestionsContainer: '.suggestions-container',
                // Seleccionamos los contenedores para delegación de eventos
                headerControls: '.header-controls',
            };

            for (const key in selectors) {
                this.elements[key] = container.querySelector(selectors[key]);
            }
            // Elementos que aparecen múltiples veces
            this.elements.allHeaderControls = container.querySelectorAll('.header-controls');
        }

        /**
         * Aplica los estilos iniciales y el modo oscuro si está activado.
         * @private
         */
        _applyInitialStyles() {
            const { style } = this.config;
            const widget = this.elements.widgetContainer;
            widget.style.setProperty('--n8n-chat-primary-color', style.primaryColor);
            widget.style.setProperty('--n8n-chat-secondary-color', style.secondaryColor);
            widget.style.setProperty('--n8n-chat-background-color', style.backgroundColor);
            widget.style.setProperty('--n8n-chat-font-color', style.fontColor);

            if (this.state.darkMode) {
                widget.classList.add('dark-mode');
            }

            // Render dinámico de chips de sugerencias desde config
            this._renderSuggestions();

            // Cargar perfil si existe
            this._loadUserProfile();
        }

        /**
         * Asigna los manejadores de eventos a los elementos del DOM.
         * @private
         */
        _addEventListeners() {
            const el = this.elements;
            el.toggleButton?.addEventListener('click', () => this._toggleChat(true));

            // Pre-chat: iniciar conversación desde el formulario o botón
            if (el.prechatForm) {
                el.prechatForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const fullName = form.fullName?.value?.trim();
                    const email = form.email?.value?.trim();
                    // Validation removed per user request
                    if (!fullName) {
                        alert('Por favor, ingresa tu nombre.');
                        return;
                    }
                    // Email is optional or less strict now
                    this._saveUserProfile({ fullName, email });
                    this._startNewConversation();
                });
            } else {
                el.newChatBtn?.addEventListener('click', () => this._startNewConversation());
            }
            el.sendButton?.addEventListener('click', () => this._handleSendMessage());
            el.fileUploadBtn?.addEventListener('click', () => el.fileInput?.click());
            el.fileInput?.addEventListener('change', e => this._handleFileUpload(e));
            el.audioBtn?.addEventListener('click', () => this._handleAudioRecording());
            el.suggestionsContainer?.addEventListener('click', e => this._handleSuggestionClick(e));

            el.textarea?.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._handleSendMessage();
                }
            });
            el.textarea?.addEventListener('focus', () => this._toggleSuggestions(true));
            el.textarea?.addEventListener('input', () => this._toggleSuggestions(!el.textarea.value.trim()));

            // Delegación de eventos para los controles del header
            el.allHeaderControls?.forEach(controls => {
                controls.addEventListener('click', (e) => {
                    const button = e.target.closest('button');
                    if (!button) return;

                    const action = button.dataset.action;
                    switch (action) {
                        case 'toggleChat': this._toggleChat(false); break;
                        case 'toggleExpand': this._toggleExpand(); break;
                        case 'toggleDarkMode': this._toggleDarkMode(); break;
                        case 'clearHistory': this._clearHistory(); break;
                    }
                });
            });

            el.widgetContainer?.addEventListener('keydown', e => {
                if (e.key === 'Escape') this._toggleChat(false);
            });
        }

        // --- MÉTODOS DE MANEJO DE UI ---

        /**
         * Muestra u oculta el contenedor principal del chat.
         * @private
         * @param {boolean} forceOpen - Si es true, abre el chat; si es false, lo cierra.
         */
        _toggleChat(forceOpen) {
            this.elements.chatContainer?.classList.toggle('open', forceOpen);
        }

        /**
         * Cambia entre la vista de "nueva conversación" y la interfaz de chat.
         * @private
         * @param {boolean} showChatInterface - True para mostrar el chat, false para la bienvenida.
         */
        _toggleView(showChatInterface) {
            if (this.elements.newConversationView && this.elements.chatInterfaceView) {
                this.elements.newConversationView.style.display = showChatInterface ? 'none' : 'block';
                this.elements.chatInterfaceView.style.display = showChatInterface ? 'flex' : 'none';
            }
        }

        /**
         * Muestra u oculta el contenedor de sugerencias.
         * @private
         * @param {boolean} show - True para mostrar, false para ocultar.
         */
        _toggleSuggestions(show) {
            if (!this.elements.suggestionsContainer) return;
            if (!this.config.suggestions.enabled) {
                this.elements.suggestionsContainer.style.display = 'none';
                return;
            }
            const hasText = this.elements.textarea?.value.trim();
            this.elements.suggestionsContainer.style.display = !hasText && show ? 'block' : 'none';
        }

        /**
         * Activa o desactiva el modo oscuro.
         * @private
         */
        _toggleDarkMode() {
            this.state.darkMode = !this.state.darkMode;
            localStorage.setItem('chat_dark_mode', this.state.darkMode);
            this.elements.widgetContainer?.classList.toggle('dark-mode', this.state.darkMode);
            this._updateAllIcons();
        }

        /**
         * Expande o contrae el widget de chat.
         * @private
         */
        _toggleExpand() {
            this.state.isExpanded = !this.state.isExpanded;
            this.elements.chatContainer?.classList.toggle('expanded', this.state.isExpanded);
            this._updateAllIcons();
        }

        /**
         * Limpia el historial de mensajes del chat.
         * @private
         */
        _clearHistory() {
            if (confirm('¿Seguro que quieres borrar el historial del chat?')) {
                if (this.elements.messagesContainer) {
                    this.elements.messagesContainer.innerHTML = '';
                }
                this._toggleView(false);
            }
        }

        /**
         * Renderiza un icono (SVG o imagen) en un elemento botón.
         * @private
         * @param {HTMLElement} element - El botón donde se renderizará el icono.
         * @param {string} iconContent - El contenido del icono (string SVG o URL de imagen).
         */
        _renderIcon(element, iconContent) {
            if (!element) return;
            if (iconContent.startsWith('<svg')) {
                element.innerHTML = iconContent;
            } else {
                element.innerHTML = `<img src="${iconContent}" alt="${element.title || 'icon'}" />`;
            }
        }

        /**
         * Actualiza todos los iconos del widget según el estado actual.
         * @private
         */
        _updateAllIcons() {
            const { icons } = this.config;
            const { isExpanded, darkMode } = this.state;

            this.elements.widgetContainer?.querySelectorAll('.expand-toggle').forEach(btn => {
                this._renderIcon(btn, isExpanded ? icons.collapse : icons.expand);
                btn.title = isExpanded ? 'Restaurar tamaño' : 'Expandir chat';
            });
            this.elements.widgetContainer?.querySelectorAll('.dark-mode-toggle').forEach(btn => {
                this._renderIcon(btn, darkMode ? icons.lightMode : icons.darkMode);
                btn.title = darkMode ? 'Modo claro' : 'Modo oscuro';
            });
            this.elements.widgetContainer?.querySelectorAll('.clear-history-btn').forEach(btn => this._renderIcon(btn, icons.clearHistory));
            this.elements.widgetContainer?.querySelectorAll('.close-button').forEach(btn => this._renderIcon(btn, icons.close));
        }

        // --- MÉTODOS DE LÓGICA DE NEGOCIO Y API ---

        /**
         * Realiza una llamada a la API del webhook.
         * @private
         * @param {object} data - El payload para enviar a la API.
         * @returns {Promise<object|null>} La respuesta de la API o null si hay un error.
         */
        async _apiCall(data) {
            try {
                const response = await fetch(this.config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                this._hideTypingIndicator();
                this._addMessage('Lo siento, ocurrió un error. Por favor intenta de nuevo.', 'bot');
                return null;
            }
        }

        /**
         * Inicia una nueva sesión de chat.
         * @private
         */
        async _startNewConversation() {
            // Asegurar perfil
            if (this.config.prechat.enabled && !this.state.userProfile) {
                this._toggleChat(true);
                this._toggleView(false);
                return;
            }

            // Construir/persistir sessionId
            this.state.sessionId = this._buildSessionId();
            const data = [{
                action: "loadPreviousSession",
                sessionId: this.state.sessionId,
                route: this.config.webhook.route,
                metadata: { userId: this.state.sessionId, user: this.state.userProfile || null }
            }];

            const responseData = await this._apiCall(data);
            if (responseData) {
                this._toggleView(true);
                const output = Array.isArray(responseData) ? responseData[0].output : responseData.output;
                this._addMessage(output, 'bot');
            }
        }

        /**
         * Procesa y envía el mensaje del usuario.
         * @private
         */
        _handleSendMessage() {
            const now = Date.now();
            if (now - this.state.lastMessageTime < 1000) {
                // Simple rate limit: 1 message per second
                return;
            }
            this.state.lastMessageTime = now;

            const message = this.elements.textarea?.value.trim();
            if (!message) return;
            if (message.length > 1000) {
                alert('El mensaje es demasiado largo (máximo 1000 caracteres)');
                return;
            }
            this._sendMessage(message);
            this.elements.textarea.value = '';
            this._toggleSuggestions(false);
        }

        /**
         * Envía un mensaje (texto o archivo) a la API.
         * @private
         * @param {string} message - El texto del mensaje.
         * @param {object|null} fileData - Datos del archivo adjunto.
         */
        async _sendMessage(message, fileData = null) {
            const sanitizedMessage = this._sanitizeInput(message);
            this._addMessage(message, 'user');
            this._showTypingIndicator();

            const messageData = {
                action: "sendMessage",
                sessionId: this.state.sessionId,
                route: this.config.webhook.route,
                chatInput: sanitizedMessage,
                metadata: { userId: this.state.sessionId, user: this.state.userProfile || null, fileData }
            };

            const responseData = await this._apiCall(messageData);
            this._hideTypingIndicator();

            if (responseData) {
                const output = Array.isArray(responseData) ? responseData[0].output : responseData.output;
                this._addMessage(output, 'bot');
                this._toggleSuggestions(true);
            }
        }

        /**
         * Añade un mensaje al contenedor de chat.
         * @private
         * @param {string} content - Contenido del mensaje (texto o HTML).
         * @param {'user'|'bot'} type - El tipo de emisor del mensaje.
         * @param {boolean} [isHTML=false] - Si el contenido debe ser tratado como HTML.
         */
        _addMessage(content, type, isHTML = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${type}`;
            const messageInner = document.createElement('div');
            messageInner.className = 'message-content';
            if (isHTML) {
                messageInner.innerHTML = this._sanitizeHTML(content);
            } else if (type === 'bot' && (this.config.content.parseMarkdown || this.config.content.allowBotHTML)) {
                const html = this._renderMessageContent(content);
                messageInner.innerHTML = html;
            } else {
                messageInner.textContent = content;
            }
            messageDiv.appendChild(messageInner);
            this.elements.messagesContainer?.appendChild(messageDiv);
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }

        /**
         * Muestra el indicador de "escribiendo...".
         * @private
         */
        _showTypingIndicator() {
            if (this.state.typingIndicator || !this.elements.messagesContainer) return;
            this.state.typingIndicator = document.createElement('div');
            this.state.typingIndicator.className = 'typing-indicator';
            this.state.typingIndicator.innerHTML = `
                El agente está escribiendo...
                <div class="typing-dots"><span></span><span></span><span></span></div>`;
            this.elements.messagesContainer.appendChild(this.state.typingIndicator);
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }

        /**
         * Oculta el indicador de "escribiendo...".
         * @private
         */
        _hideTypingIndicator() {
            if (this.state.typingIndicator) {
                this.state.typingIndicator.remove();
                this.state.typingIndicator = null;
            }
        }

        /**
         * Sanitiza una cadena de texto para prevenir XSS.
         * @private
         * @param {string} input - La cadena a sanitizar.
         * @returns {string} La cadena sanitizada.
         */
        _sanitizeInput(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        }

        /**
         * Convierte texto (Markdown/HTML) a HTML seguro para mensajes del bot.
         * - Si hay Markdown, se transforma a HTML básico.
         * - Siempre se sanitiza al final.
         * @private
         */
        _renderMessageContent(text) {
            let html = text;
            if (this.config.content.parseMarkdown) {
                html = this._markdownToHTML(text);
            }
            if (!this.config.content.allowBotHTML) {
                // Si no permitimos HTML de bot, solo dejamos el generado por Markdown
                return this._sanitizeHTML(html);
            }
            return this._sanitizeHTML(html);
        }

        /**
         * Conversor Markdown -> HTML simple (negritas, itálicas, código, enlaces, listas, encabezados)
         * Nota: No pretende cubrir todo el estándar; suficiente para respuestas comunes.
         * @private
         */
        _markdownToHTML(md) {
            if (!md) return '';
            let s = md;
            // Escapar primero para evitar inyección, luego reinsertar patrones convertidos
            s = this._sanitizeInput(s);
            // Bloques de código ```
            s = s.replace(/```([\s\S]*?)```/g, (m, code) => `<pre><code>${code.replace(/\n/g, '\n')}</code></pre>`);
            // Encabezados #, ##, ###
            s = s.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
                .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
                .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
            // Listas no ordenadas
            s = s.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
            s = s.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
            // Listas ordenadas
            s = s.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');
            s = s.replace(/(<li>.*<\/li>\n?)+/g, (m) => m.includes('<ul>') ? m : `<ol>${m}</ol>`);
            // Enlaces [texto](url)
            s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            // Negrita **texto**
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            // Itálica *texto*
            s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
            // Código inline `code`
            s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
            // Saltos de línea
            s = s.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
            // Envolver en párrafos
            s = `<p>${s}</p>`;
            return s;
        }

        /**
         * Sanitiza HTML permitiendo solo un conjunto mínimo de etiquetas/atributos.
         * @private
         */
        _sanitizeHTML(html) {
            const template = document.createElement('template');
            template.innerHTML = html || '';
            // Allowed tags whitelist - strict
            const allowedTags = new Set(['A', 'B', 'STRONG', 'EM', 'I', 'U', 'P', 'BR', 'UL', 'OL', 'LI', 'CODE', 'PRE', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'SPAN']);
            // Allowed attributes map
            const allowedAttrs = {
                'A': ['href', 'target', 'rel', 'title'],
                'CODE': ['class'],
                'PRE': ['class'],
                'SPAN': ['class', 'style'] // Be careful with style, maybe restrict further if needed
            };

            const walker = (node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = node.tagName;
                    if (!allowedTags.has(tag)) {
                        // Strip invalid tags but keep content
                        const text = document.createTextNode(node.textContent || '');
                        node.replaceWith(text);
                        return;
                    }

                    // Filter attributes
                    [...node.attributes].forEach(attr => {
                        const attrName = attr.name.toLowerCase();
                        const allowedForTag = allowedAttrs[tag] || [];
                        if (!allowedForTag.includes(attrName)) {
                            node.removeAttribute(attr.name);
                        }
                    });

                    // Specific security checks
                    if (tag === 'A') {
                        const href = node.getAttribute('href') || '';
                        // Block javascript: URIs and ensure http/https
                        if (/^javascript:/i.test(href) || !/^https?:\/\//i.test(href)) {
                            node.removeAttribute('href');
                            node.style.textDecoration = 'line-through'; // Visual cue
                        } else {
                            node.setAttribute('target', '_blank');
                            node.setAttribute('rel', 'noopener noreferrer nofollow');
                        }
                    }
                }
                // Recursively walk children
                [...node.childNodes].forEach(walker);
            };

            [...template.content.childNodes].forEach(walker);
            return template.innerHTML;
        }

        /** Email simple validator */
        _isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        /** Persistir y cargar perfil del usuario */
        _saveUserProfile(profile) {
            this.state.userProfile = profile;
            try {
                localStorage.setItem('chat_user_profile', JSON.stringify(profile));
            } catch { }
        }
        _loadUserProfile() {
            try {
                const raw = localStorage.getItem('chat_user_profile');
                if (raw) this.state.userProfile = JSON.parse(raw);
            } catch { }
        }

        /** Construye un sessionId estable basado en nombre y email o genera uno aleatorio */
        _buildSessionId() {
            if (this.state.userProfile?.fullName && this.state.userProfile?.email) {
                const slug = this.state.userProfile.fullName
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                const email = this.state.userProfile.email.toLowerCase();
                return `${slug}|${email}`;
            }
            return crypto.randomUUID();
        }

        /** Renderizar chips de sugerencias desde config */
        _renderSuggestions() {
            const cont = this.elements.suggestionsContainer;
            if (!cont) return;
            cont.innerHTML = '';
            if (!this.config.suggestions.enabled) return;
            const items = this.config.suggestions.items || [];
            items.forEach(txt => {
                const btn = document.createElement('button');
                btn.className = 'suggestion-chip';
                btn.textContent = txt;
                cont.appendChild(btn);
            });
        }

        /**
         * Valida un archivo antes de subirlo.
         * @private
         * @param {File} file - El archivo a validar.
         * @returns {boolean} True si el archivo es válido.
         */
        _validateFile(file) {
            const allowedTypes = ['text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 100 * 1024; // 100KB
            if (!allowedTypes.includes(file.type)) {
                alert('Solo se permiten archivos .txt, .md, .doc, .docx');
                return false;
            }
            if (file.size > maxSize) {
                alert('El archivo debe ser menor a 100KB');
                return false;
            }
            return true;
        }

        /**
         * Maneja la subida de archivos.
         * @private
         * @param {Event} event - El evento de cambio del input de archivo.
         */
        async _handleFileUpload(event) {
            for (const file of Array.from(event.target.files)) {
                if (!this._validateFile(file)) continue;
                try {
                    const fileContent = await file.text();
                    const fileData = { name: file.name, type: file.type, size: file.size, content: fileContent };
                    const fileMessageHTML = `<strong>Archivo adjunto:</strong> ${this._sanitizeInput(file.name)} (${(file.size / 1024).toFixed(1)}KB)`;
                    this._addMessage(fileMessageHTML, 'user', true);
                    this._sendMessage(`Archivo adjunto: ${file.name}`, fileData);
                } catch (error) {
                    console.error('Error reading file:', error);
                    alert('Error al leer el archivo');
                }
            }
            event.target.value = ''; // Resetea el input para permitir subir el mismo archivo de nuevo.
        }

        /**
         * Inicia o detiene la grabación de audio.
         * @private
         */
        async _handleAudioRecording() {
            if (this.state.isRecording) {
                this.state.mediaRecorder?.stop();
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.state.mediaRecorder = new MediaRecorder(stream);
                this.state.audioChunks = [];
                this.state.mediaRecorder.ondataavailable = e => this.state.audioChunks.push(e.data);
                this.state.mediaRecorder.onstop = () => this._onStopRecording(stream);

                this.state.mediaRecorder.start();
                this.state.isRecording = true;
                this.elements.audioBtn.textContent = '⏹️';
                this.elements.audioBtn.classList.add('audio-recording');
                this.elements.audioBtn.title = 'Detener grabación';

                setTimeout(() => {
                    if (this.state.isRecording) this.state.mediaRecorder?.stop();
                }, 10000); // Límite de 10 segundos

            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert('No se pudo acceder al micrófono. Asegúrate de dar permisos.');
            }
        }

        /**
         * Se ejecuta cuando la grabación de audio se detiene.
         * @private
         * @param {MediaStream} stream - El stream de audio para detener sus pistas.
         */
        _onStopRecording(stream) {
            this.state.isRecording = false;
            this.elements.audioBtn.textContent = '🎤';
            this.elements.audioBtn.classList.remove('audio-recording');
            this.elements.audioBtn.title = 'Grabar audio (10s max)';
            stream.getTracks().forEach(track => track.stop());

            const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/webm' });
            if (audioBlob.size > 200 * 1024) { // ~200KB limit
                alert('El audio es demasiado largo. Máximo 10 segundos.');
                return;
            }

            const url = URL.createObjectURL(audioBlob);
            this._addMessage(`<strong>Audio enviado:</strong><br><audio controls src="${url}"></audio>`, 'user', true);

            const reader = new FileReader();
            reader.onload = () => {
                const audioData = { type: 'audio', data: reader.result, size: audioBlob.size };
                this._sendMessage('Audio enviado', audioData);
            };
            reader.readAsDataURL(audioBlob);
        }

        /**
         * Maneja el clic en un chip de sugerencia.
         * @private
         * @param {Event} event - El evento de clic.
         */
        _handleSuggestionClick(event) {
            if (event.target.classList.contains('suggestion-chip')) {
                const suggestion = event.target.textContent;
                this.elements.textarea.value = suggestion;
                this._toggleSuggestions(false);
                this.elements.textarea.focus();
            }
        }

        // --- ESTILOS CSS ---

        /**
         * Retorna la cadena de texto con todos los estilos CSS para el widget.
         * @private
         * @returns {string} Estilos CSS.
         */
        _getStyles() {
            // El CSS se mantiene en una cadena para que el widget sea autocontenido.
            // Se ha formateado para mejorar la legibilidad.
            return `
                .n8n-chat-widget {
                    --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
                    --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
                    --chat--color-background: var(--n8n-chat-background-color, rgba(255, 255, 255, 0.5));
                    --chat--color-font: var(--n8n-chat-font-color, #333333);
                    --chat--color-border: rgba(0, 0, 0, 0.1);
                    --chat--color-shadow: rgba(133, 79, 255, 0.15);
                    font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                .n8n-chat-widget .chat-container { 
                    position: fixed; bottom: 20px; right: 20px; z-index: 1000; 
                    display: none; width: 380px; height: 600px; 
                    background: var(--chat--color-background); 
                    border-radius: 16px; 
                    box-shadow: 0 8px 32px var(--chat--color-shadow); 
                    border: 1px solid rgba(255, 255, 255, 0.4); 
                    overflow: hidden; 
                    font-family: inherit; 
                    flex-direction: column; 
                    backdrop-filter: blur(16px); 
                    -webkit-backdrop-filter: blur(16px); 
                    transition: width 0.3s ease, height 0.3s ease; 
                }
                .n8n-chat-widget .chat-container.position-left { right: auto; left: 20px; }
                .n8n-chat-widget .chat-container.open { display: flex; }
                .n8n-chat-widget .chat-container.expanded { width: 90vw; height: 80vh; max-width: 800px; }
                .n8n-chat-widget .view { display: flex; flex-direction: column; height: 100%; }
                .n8n-chat-widget .brand-header { 
                    padding: 12px 16px; display: flex; align-items: center; gap: 12px; 
                    border-bottom: 1px solid var(--chat--color-border); 
                    position: relative; flex-shrink: 0; background: rgba(255,255,255,0.2); 
                }
                .n8n-chat-widget .header-controls { margin-left: auto; display: flex; align-items: center; gap: 4px; }
                .n8n-chat-widget .header-controls button { 
                    background: none; border: none; color: var(--chat--color-font); 
                    cursor: pointer; padding: 6px; display: flex; align-items: center; 
                    justify-content: center; transition: background 0.2s, color 0.2s; 
                    opacity: 0.7; border-radius: 8px; 
                }
                .n8n-chat-widget .header-controls button:hover { opacity: 1; background: rgba(0,0,0,0.08); }
                .n8n-chat-widget .header-controls button svg { width: 18px; height: 18px; stroke-width: 2.5; }
                .n8n-chat-widget .header-controls button img { width: 18px; height: 18px; }
                .n8n-chat-widget .brand-header img { width: 32px; height: 32px; border-radius: 50%; }
                .n8n-chat-widget .brand-header span { font-size: 18px; font-weight: 500; color: var(--chat--color-font); }
                .n8n-chat-widget .new-conversation { 
                    display: flex; flex-direction: column; justify-content: center; 
                    align-items: center; text-align: center; padding: 20px; flex-grow: 1; 
                }
                .n8n-chat-widget .welcome-text { font-size: 24px; font-weight: 600; color: var(--chat--color-font); margin-bottom: 24px; line-height: 1.3; }
                .n8n-chat-widget .new-chat-btn { 
                    display: flex; align-items: center; justify-content: center; gap: 8px; 
                    width: 100%; max-width: 300px; padding: 16px 24px; 
                    background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); 
                    color: white; border: none; border-radius: 12px; cursor: pointer; 
                    font-size: 16px; transition: transform 0.3s, box-shadow 0.3s; 
                    font-weight: 500; font-family: inherit; margin-bottom: 12px; 
                    box-shadow: 0 4px 15px rgba(133, 79, 255, 0.3); 
                }
                .n8n-chat-widget .new-chat-btn:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(133, 79, 255, 0.4); }
                .n8n-chat-widget .prechat-form { width: 100%; max-width: 320px; text-align: left; }
                .n8n-chat-widget .prechat-form .form-row { width: 100%; margin-bottom: 12px; }
                .n8n-chat-widget .prechat-form label { display: block; color: var(--chat--color-font); font-size: 13px; margin-bottom: 6px; opacity: 0.85; }
                .n8n-chat-widget .prechat-form input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.5); color: var(--chat--color-font); font-family: inherit; }
                .n8n-chat-widget.dark-mode .prechat-form input { background: rgba(0,0,0,0.25); border-color: rgba(255,255,255,0.12); }
                .n8n-chat-widget .message-icon { width: 20px; height: 20px; }
                .n8n-chat-widget .response-text { font-size: 14px; color: var(--chat--color-font); opacity: 0.7; margin: 0; }
                .n8n-chat-widget .chat-interface-view { height: 100%; }
                .n8n-chat-widget .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
                .n8n-chat-widget .chat-message { 
                    padding: 12px 16px; margin: 8px 0; border-radius: 18px; 
                    max-width: 80%; word-wrap: break-word; font-size: 15px; line-height: 1.5; 
                }
                .n8n-chat-widget .chat-message.user { 
                    background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); 
                    color: white; align-self: flex-end; 
                    box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2); 
                    border-radius: 18px 18px 4px 18px; 
                }
                .n8n-chat-widget .chat-message.bot { 
                    background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.3); 
                    color: var(--chat--color-font); align-self: flex-start; 
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
                    border-radius: 18px 18px 18px 4px; 
                }
                .n8n-chat-widget .message-content { width: 100%; }
                .n8n-chat-widget .message-content h1,
                .n8n-chat-widget .message-content h2,
                .n8n-chat-widget .message-content h3 { margin: 0.2em 0; line-height: 1.2; }
                .n8n-chat-widget .message-content p { margin: 0.4em 0; }
                .n8n-chat-widget .message-content code { background: rgba(0,0,0,0.08); padding: 2px 6px; border-radius: 6px; }
                .n8n-chat-widget .message-content pre { background: rgba(0,0,0,0.08); padding: 10px; border-radius: 10px; overflow: auto; }
                .n8n-chat-widget.dark-mode .message-content code,
                .n8n-chat-widget.dark-mode .message-content pre { background: rgba(255,255,255,0.12); }
                .n8n-chat-widget .message-content ul, .n8n-chat-widget .message-content ol { padding-left: 18px; margin: 0.4em 0; }
                .n8n-chat-widget .message-content a { color: var(--chat--color-primary); text-decoration: underline; }
                .n8n-chat-widget .chat-input { 
                    padding: 12px 16px; background: rgba(255,255,255,0.2); 
                    border-top: 1px solid var(--chat--color-border); 
                    display: flex; gap: 8px; flex-shrink: 0; align-items: flex-end; 
                }
                .n8n-chat-widget .chat-input textarea { 
                    flex: 1; padding: 12px; border: 1px solid rgba(0,0,0,0.05); 
                    border-radius: 12px; background: rgba(255,255,255,0.3); 
                    color: var(--chat--color-font); resize: none; font-family: inherit; 
                    font-size: 15px; max-height: 100px; transition: background 0.2s; 
                }
                .n8n-chat-widget .chat-input textarea:focus { 
                    background: rgba(255,255,255,0.4); 
                    outline: 2px solid var(--chat--color-primary); border-color: transparent; 
                }
                .n8n-chat-widget .chat-input textarea::placeholder { color: var(--chat--color-font); opacity: 0.6; }
                .n8n-chat-widget .chat-input button { 
                    background: none; color: var(--chat--color-primary); border: none; 
                    border-radius: 50%; width: 44px; height: 44px; cursor: pointer; 
                    transition: background 0.2s, color 0.2s; display: flex; 
                    align-items: center; justify-content: center; flex-shrink: 0; 
                }
                .n8n-chat-widget .chat-input button:hover { background: var(--chat--color-primary); color: white; }
                .n8n-chat-widget .chat-input .send-btn { background: var(--chat--color-primary); color: white; }
                .n8n-chat-widget .chat-input .send-btn:hover { background: var(--chat--color-secondary); }
                .n8n-chat-widget .chat-toggle { 
                    position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; 
                    border-radius: 30px; 
                    background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); 
                    color: white; border: none; cursor: pointer; 
                    box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3); z-index: 999; 
                    transition: transform 0.3s; display: flex; align-items: center; justify-content: center; 
                }
                .n8n-chat-widget .chat-toggle.position-left { right: auto; left: 20px; }
                .n8n-chat-widget .chat-toggle:hover { transform: scale(1.05); }
                .n8n-chat-widget .chat-toggle svg { width: 24px; height: 24px; fill: currentColor; }
                .n8n-chat-widget .chat-footer { 
                    padding: 8px; text-align: center; background: rgba(255,255,255,0.2); 
                    border-top: 1px solid var(--chat--color-border); flex-shrink: 0; 
                }
                .n8n-chat-widget .chat-footer a { 
                    color: var(--chat--color-primary); text-decoration: none; font-size: 12px; 
                    opacity: 0.8; transition: opacity 0.2s; font-family: inherit; 
                }
                .n8n-chat-widget .chat-footer a:hover { opacity: 1; }
                .n8n-chat-widget.dark-mode { 
                    --chat--color-background: rgba(45, 45, 45, 0.6); 
                    --chat--color-font: #ffffff; 
                    --chat--color-border: rgba(255, 255, 255, 0.2); 
                    --chat--color-shadow: rgba(0, 0, 0, 0.2); 
                }
                .n8n-chat-widget.dark-mode .brand-header, 
                .n8n-chat-widget.dark-mode .chat-input, 
                .n8n-chat-widget.dark-mode .chat-footer { background: rgba(0,0,0,0.2); }
                .n8n-chat-widget.dark-mode .chat-message.bot { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
                .n8n-chat-widget.dark-mode .chat-input textarea { background: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.1); }
                .n8n-chat-widget.dark-mode .chat-input textarea:focus { background: rgba(0,0,0,0.3); }
                .n8n-chat-widget.dark-mode .header-controls button:hover { background: rgba(255,255,255,0.1); }
                .n8n-chat-widget .audio-recording { 
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                    animation: pulse 1s infinite; color: white !important; 
                }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                .n8n-chat-widget .typing-indicator { 
                    display: flex; align-items: center; padding: 12px 16px; margin: 8px 0; 
                    border-radius: 18px; background: rgba(255, 255, 255, 0.4); 
                    border: 1px solid rgba(255, 255, 255, 0.3); color: var(--chat--color-font); 
                    align-self: flex-start; max-width: 80%; 
                }
                .n8n-chat-widget .typing-dots { display: flex; gap: 4px; margin-left: 8px; }
                .n8n-chat-widget .typing-dots span { 
                    width: 8px; height: 8px; border-radius: 50%; 
                    background: var(--chat--color-primary); 
                    animation: typing 1.4s infinite ease-in-out; 
                }
                .n8n-chat-widget .typing-dots span:nth-child(1) { animation-delay: -0.32s; } 
                .n8n-chat-widget .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
                .n8n-chat-widget .suggestions-container { padding: 12px 16px; border-top: 1px solid var(--chat--color-border); flex-shrink: 0; }
                .n8n-chat-widget .suggestion-chip { 
                    display: inline-block; background: rgba(133, 79, 255, 0.1); 
                    color: var(--chat--color-primary); padding: 6px 12px; margin: 4px; 
                    border-radius: 16px; border: 1px solid var(--chat--color-primary); 
                    cursor: pointer; font-size: 12px; transition: background 0.2s; 
                }
                .n8n-chat-widget .suggestion-chip:hover { background: rgba(133, 79, 255, 0.2); }

                /* Responsive */
                @media (max-width: 600px) {
                    .n8n-chat-widget .chat-container { 
                        right: 12px; left: 12px; bottom: 12px; 
                        width: calc(100vw - 24px); height: 70vh; 
                    }
                    .n8n-chat-widget .chat-container.expanded, 
                    .n8n-chat-widget .chat-container.open.expanded { 
                        width: 100vw; height: 100vh; max-width: 100vw; border-radius: 0; right: 0; left: 0; bottom: 0; 
                    }
                    .n8n-chat-widget .chat-toggle { width: 54px; height: 54px; bottom: 12px; right: 12px; }
                    .n8n-chat-widget .chat-message { max-width: 92%; }
                }
            `;
        }
    }

    // Inicializa el widget con la configuración global que el usuario pueda definir.
    new ChatWidget(window.ChatWidgetConfig);

})();
