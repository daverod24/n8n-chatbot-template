// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }

        .n8n-chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
        }

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        .n8n-chat-widget .new-conversation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
        }

        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.3;
        }

        .n8n-chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }

        .n8n-chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
        }

        .n8n-chat-widget .message-icon {
            width: 20px;
            height: 20px;
        }

        .n8n-chat-widget .response-text {
            font-size: 14px;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin: 0;
        }

        .n8n-chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
        }

        .n8n-chat-widget .chat-interface.active {
            display: flex;
        }

        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }

        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }

        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }

        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }

        /* Dark mode styles */
        .n8n-chat-widget.dark-mode {
            --chat--color-background: #2d2d2d;
            --chat--color-font: #ffffff;
        }

        .n8n-chat-widget .dark-mode-toggle {
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            font-size: 16px;
            opacity: 0.8;
            transition: opacity 0.2s;
        }

        .n8n-chat-widget .dark-mode-toggle:hover {
            opacity: 1;
        }

        /* File upload styles */
        .n8n-chat-widget .file-upload-btn {
            background: none;
            border: none;
            color: var(--chat--color-primary);
            cursor: pointer;
            padding: 8px;
            font-size: 16px;
            transition: color 0.2s;
        }

        .n8n-chat-widget .file-upload-btn:hover {
            color: var(--chat--color-secondary);
        }

        .n8n-chat-widget .clear-history-btn {
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            font-size: 14px;
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        .n8n-chat-widget .clear-history-btn:hover {
            opacity: 1;
        }

        /* Audio recording styles */
        .n8n-chat-widget .audio-recording {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .n8n-chat-widget .audio-btn {
            background: none;
            border: none;
            color: var(--chat--color-primary);
            cursor: pointer;
            padding: 8px;
            font-size: 16px;
            transition: color 0.2s;
        }

        .n8n-chat-widget .audio-btn:hover {
            color: var(--chat--color-secondary);
        }

        /* Typing indicator */
        .n8n-chat-widget .typing-indicator {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            max-width: 80%;
        }

        .n8n-chat-widget .typing-dots {
            display: flex;
            gap: 4px;
            margin-left: 8px;
        }

        .n8n-chat-widget .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--chat--color-primary);
            animation: typing 1.4s infinite ease-in-out;
        }

        .n8n-chat-widget .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .n8n-chat-widget .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }

        /* Suggestions styles */
        .n8n-chat-widget .suggestions-container {
            padding: 12px 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .suggestion-chip {
            display: inline-block;
            background: rgba(133, 79, 255, 0.1);
            color: var(--chat--color-primary);
            padding: 6px 12px;
            margin: 4px;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        }

        .n8n-chat-widget .suggestion-chip:hover {
            background: rgba(133, 79, 255, 0.2);
        }
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by DaverodtechAI',
                link: 'https://landing.daverod.tech'
            }
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
        } : defaultConfig;

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    
    // Dark mode functionality
    let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkMode = localStorage.getItem('chat_dark_mode') === 'true' || prefersDark;

    // Audio recording variables
    let mediaRecorder, audioChunks = [];
    let isRecording = false;

    // Typing indicator
    let typingIndicator = null;

    // Input validation and sanitization
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function validateFile(file) {
        const allowedTypes = ['text/plain', 'text/markdown', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget' + (darkMode ? ' dark-mode' : '');
    
    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="dark-mode-toggle" title="Modo oscuro">${darkMode ? '🌙' : '☀️'}</button>
            <button class="clear-history-btn" title="Limpiar historial">🗑️</button>
            <button class="close-button">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
                Send us a message
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="dark-mode-toggle" title="Modo oscuro">${darkMode ? '🌙' : '☀️'}</button>
                <button class="clear-history-btn" title="Limpiar historial">🗑️</button>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <input type="file" id="file-input" style="display: none;" multiple accept=".txt,.md,.doc,.docx" />
                <button type="button" class="file-upload-btn" title="Adjuntar archivo">📎</button>
                <button type="button" class="audio-btn" title="Grabar audio (10s max)">🎤</button>
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="suggestions-container" style="display: none;">
                <button class="suggestion-chip">¿Cuáles son los horarios?</button>
                <button class="suggestion-chip">¿Qué servicios ofrecen?</button>
                <button class="suggestion-chip">¿Cómo me inscribo?</button>
                <button class="suggestion-chip">¿Tienen clases online?</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    
    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const fileInput = chatContainer.querySelector('#file-input');
    const fileUploadBtn = chatContainer.querySelector('.file-upload-btn');
    const audioBtn = chatContainer.querySelector('.audio-btn');
    const suggestionsContainer = chatContainer.querySelector('.suggestions-container');

    function generateUUID() {
        return crypto.randomUUID();
    }

    function showTypingIndicator() {
        if (typingIndicator) return;
        
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            El agente está escribiendo...
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
    }

    async function startNewConversation() {
        currentSessionId = generateUUID();
        const data = [{
            action: "loadPreviousSession",
            sessionId: currentSessionId,
            route: config.webhook.route,
            metadata: {
                userId: ""
            }
        }];

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            chatContainer.querySelector('.brand-header').style.display = 'none';
            chatContainer.querySelector('.new-conversation').style.display = 'none';
            chatInterface.classList.add('active');

            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function sendMessage(message, fileData = null) {
        const sanitizedMessage = sanitizeInput(message);
        
        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: sanitizedMessage,
            metadata: {
                userId: "",
                fileData: fileData
            }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });
            
            const data = await response.json();
            
            // Hide typing indicator
            hideTypingIndicator();
            
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Show suggestions after bot response
            suggestionsContainer.style.display = 'block';
        } catch (error) {
            hideTypingIndicator();
            console.error('Error:', error);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message bot';
            errorDiv.textContent = 'Lo siento, ocurrió un error. Por favor intenta de nuevo.';
            messagesContainer.appendChild(errorDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    newChatBtn.addEventListener('click', startNewConversation);
    
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            // Input validation
            if (message.length > 1000) {
                alert('El mensaje es demasiado largo (máximo 1000 caracteres)');
                return;
            }
            sendMessage(message);
            textarea.value = '';
            suggestionsContainer.style.display = 'none';
        }
    });
    
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                // Input validation
                if (message.length > 1000) {
                    alert('El mensaje es demasiado largo (máximo 1000 caracteres)');
                    return;
                }
                sendMessage(message);
                textarea.value = '';
                suggestionsContainer.style.display = 'none';
            }
        }
    });

    // Show suggestions when textarea is focused and empty
    textarea.addEventListener('focus', () => {
        if (!textarea.value.trim()) {
            suggestionsContainer.style.display = 'block';
        }
    });

    textarea.addEventListener('input', () => {
        if (textarea.value.trim()) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    // Add close button handlers
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });

    // Dark mode toggle functionality
    const darkModeToggles = chatContainer.querySelectorAll('.dark-mode-toggle');
    darkModeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            darkMode = !darkMode;
            localStorage.setItem('chat_dark_mode', darkMode);
            widgetContainer.classList.toggle('dark-mode', darkMode);
            // Update all toggle buttons
            chatContainer.querySelectorAll('.dark-mode-toggle').forEach(btn => {
                btn.textContent = darkMode ? '🌙' : '☀️';
            });
        });
    });

    // Clear history functionality
    const clearHistoryBtns = chatContainer.querySelectorAll('.clear-history-btn');
    clearHistoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres borrar el historial del chat?')) {
                messagesContainer.innerHTML = '';
                localStorage.removeItem('chat_history');
            }
        });
    });

    // File upload functionality
    if (fileUploadBtn && fileInput) {
        fileUploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            for (const file of Array.from(e.target.files)) {
                if (!validateFile(file)) continue;
                
                try {
                    const fileContent = await file.text();
                    const fileData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: fileContent
                    };
                    
                    const fileMessageDiv = document.createElement('div');
                    fileMessageDiv.className = 'chat-message user';
                    fileMessageDiv.innerHTML = `<strong>Archivo adjunto:</strong> ${sanitizeInput(file.name)} (${(file.size/1024).toFixed(1)}KB)`;
                    messagesContainer.appendChild(fileMessageDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    
                    // Send file with message
                    sendMessage(`Archivo adjunto: ${file.name}`, fileData);
                } catch (error) {
                    console.error('Error reading file:', error);
                    alert('Error al leer el archivo');
                }
            }
            fileInput.value = ''; // Reset file input
        });
    }

    // Audio recording functionality
    if (audioBtn) {
        audioBtn.addEventListener('click', async () => {
            if (isRecording) {
                // Stop recording
                mediaRecorder.stop();
                isRecording = false;
                audioBtn.textContent = '🎤';
                audioBtn.classList.remove('audio-recording');
                audioBtn.title = 'Grabar audio (10s max)';
            } else {
                // Start recording
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    
                    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        const url = URL.createObjectURL(audioBlob);
                        
                        // Check audio size (approximate)
                        if (audioBlob.size > 200 * 1024) { // ~200KB limit for 10s audio
                            alert('El audio es demasiado largo. Máximo 10 segundos.');
                            return;
                        }
                        
                        const audioMessageDiv = document.createElement('div');
                        audioMessageDiv.className = 'chat-message user';
                        audioMessageDiv.innerHTML = `<strong>Audio enviado:</strong><br><audio controls src="${url}"></audio>`;
                        messagesContainer.appendChild(audioMessageDiv);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        
                        // Convert to base64 for sending
                        const reader = new FileReader();
                        reader.onload = () => {
                            const audioData = {
                                type: 'audio',
                                data: reader.result,
                                size: audioBlob.size
                            };
                            sendMessage('Audio enviado', audioData);
                        };
                        reader.readAsDataURL(audioBlob);
                        
                        // Stop all tracks
                        stream.getTracks().forEach(track => track.stop());
                    };
                    
                    mediaRecorder.start();
                    isRecording = true;
                    audioBtn.textContent = '⏹️';
                    audioBtn.classList.add('audio-recording');
                    audioBtn.title = 'Detener grabación';
                    
                    // Auto-stop after 10 seconds
                    setTimeout(() => {
                        if (isRecording) {
                            mediaRecorder.stop();
                            isRecording = false;
                            audioBtn.textContent = '🎤';
                            audioBtn.classList.remove('audio-recording');
                            audioBtn.title = 'Grabar audio (10s max)';
                        }
                    }, 10000);
                    
                } catch (error) {
                    console.error('Error accessing microphone:', error);
                    alert('No se pudo acceder al micrófono');
                }
            }
        });
    }

    // Suggestions functionality
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const suggestion = e.target.textContent;
                textarea.value = suggestion;
                suggestionsContainer.style.display = 'none';
                textarea.focus();
            }
        });
    }

    // Keyboard accessibility
    chatContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            chatContainer.classList.remove('open');
        }
    });

    // Enhanced textarea with Enter to send
    if (textarea) {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = textarea.value.trim();
                if (message) {
                    // Input validation
                    if (message.length > 1000) {
                        alert('El mensaje es demasiado largo (máximo 1000 caracteres)');
                        return;
                    }
                    sendMessage(message);
                    textarea.value = '';
                    suggestionsContainer.style.display = 'none';
                }
            }
        });
    }
})();
