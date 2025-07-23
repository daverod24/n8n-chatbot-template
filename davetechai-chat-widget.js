/* DavetechAI Chat Widget v1.0 */

// DavetechAI Chat Widget v2.0 - Responsive, Accessible, Darkmode, Dynamic, History
(function () {
    // Configurable agent info
    let agentAvatar = localStorage.getItem('dtai_agent_avatar') || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&q=80';
    let agentName = localStorage.getItem('dtai_agent_name') || 'DavetechAI Centro Musical';

    // Chat history
    let chatHistory = JSON.parse(localStorage.getItem('dtai_chat_history') || '[]');

    // Detect dark mode
    let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkMode = localStorage.getItem('dtai_dark_mode') === 'true' || prefersDark;

    // Responsive CSS
    const style = document.createElement('style');
    style.innerHTML = `
    .davetechai-chat-widget {
        position: fixed; bottom: 2vw; right: 2vw; z-index: 99999;
        width: 350px; max-width: 98vw; background: var(--dtai-bg,#fff); border-radius: 16px;
        box-shadow: 0 8px 32px rgba(102,126,234,0.18);
        font-family: Arial, sans-serif; overflow: hidden;
        transition: background 0.3s, color 0.3s;
        border: 1px solid #e3e7fa;
    }
    @media (max-width: 600px) {
        .davetechai-chat-widget { width: 98vw; right: 1vw; bottom: 1vw; border-radius: 10px; }
    }
    .dtai-header {
        display: flex; align-items: center; padding: 12px 16px; background: linear-gradient(90deg,#667eea,#764ba2);
        color: #fff; font-weight: bold; font-size: 1.1rem;
    }
    .dtai-header .dtai-avatar {
        width:32px;height:32px;border-radius:50%;margin-right:10px;object-fit:cover;
    }
    .dtai-header .dtai-agent-edit {
        background:none;border:none;color:#fff;font-size:1rem;cursor:pointer;margin-left:8px;
    }
    .dtai-header .dtai-close {
        background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;margin-left:8px;
    }
    .dtai-chat-area {
        height:320px;max-height:50vh;overflow-y:auto;padding:12px;background:var(--dtai-chat-bg,#fafaff);
        color:var(--dtai-chat-color,#222);font-size:1rem;
    }
    .dtai-input-area {
        display:flex;align-items:center;padding:10px 12px;background:var(--dtai-input-bg,#f5f5fa);border-top:1px solid #eee;gap:8px;
    }
    .dtai-input-area input[type="text"] {
        flex:1;padding:8px;border-radius:8px;border:1px solid #ccc;font-size:1rem;
        background:var(--dtai-input-bg,#fff);color:var(--dtai-input-color,#222);
    }
    .dtai-input-area input[type="text"]:focus {
        outline:2px solid #667eea;
    }
    .dtai-input-area button, .dtai-input-area label {
        background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--dtai-btn-color,#667eea);
    }
    .dtai-input-area button:focus {
        outline:2px solid #ffd700;
    }
    .dtai-input-area .dtai-send {
        background:#667eea;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:bold;cursor:pointer;font-size:1rem;
        transition:background 0.2s;
    }
    .dtai-input-area .dtai-send:focus {
        outline:2px solid #ffd700;
    }
    .dtai-powered {
        text-align:center;padding:6px 0;font-size:0.9rem;color:#888;background:var(--dtai-input-bg,#f5f5fa);
    }
    .dtai-suggestion-box {
        display:flex;flex-wrap:wrap;gap:6px;padding:6px 12px;background:var(--dtai-input-bg,#f5f5fa);border-top:1px solid #eee;
    }
    .dtai-suggestion-box button {
        background:#e3e7fa;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.95rem;color:#222;
        margin-bottom:4px;
    }
    .dtai-suggestion-box button:focus {
        outline:2px solid #667eea;
    }
    .dtai-emoji-picker {
        position:absolute;bottom:60px;right:60px;background:#fff;border:1px solid #ccc;border-radius:8px;padding:8px;z-index:100000;display:flex;flex-wrap:wrap;gap:6px;
    }
    .dtai-msg {
        margin:8px 0;padding:8px;background:#e3e7fa;border-radius:8px;word-break:break-word;
    }
    .dtai-msg.agent {
        background:#667eea;color:#fff;text-align:left;
    }
    .dtai-msg.user {
        background:#e3e7fa;color:#222;text-align:right;
    }
    .dtai-dark {
        --dtai-bg:#222;
        --dtai-chat-bg:#222;
        --dtai-chat-color:#fafaff;
        --dtai-input-bg:#333;
        --dtai-input-color:#fafaff;
        --dtai-btn-color:#ffd700;
    }
    .dtai-toggle-dark {
        background:none;border:none;color:#ffd700;font-size:1.2rem;cursor:pointer;margin-left:8px;
    }
    .dtai-history-bar {
        display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:var(--dtai-input-bg,#f5f5fa);border-bottom:1px solid #eee;font-size:0.95rem;
    }
    .dtai-history-bar button {
        background:#e3e7fa;border:none;border-radius:8px;padding:4px 10px;cursor:pointer;font-size:0.95rem;color:#222;margin-left:6px;
    }
    .dtai-history-bar button:focus {
        outline:2px solid #667eea;
    }
    `;
    document.head.appendChild(style);

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'davetechai-chat-widget' + (darkMode ? ' dtai-dark' : '');
    widgetContainer.setAttribute('role','dialog');
    widgetContainer.setAttribute('aria-label','Chat DavetechAI');
    widgetContainer.setAttribute('tabindex','-1');

    // Header
    const header = document.createElement('div');
    header.className = 'dtai-header';
    header.innerHTML = `
        <img src="${agentAvatar}" class="dtai-avatar" alt="Avatar agente" tabindex="0" />
        <span class="dtai-agent-name" tabindex="0">${agentName}</span>
        <button class="dtai-agent-edit" title="Editar agente" aria-label="Editar agente">✏️</button>
        <button class="dtai-toggle-dark" title="Modo oscuro" aria-label="Modo oscuro">${darkMode ? '🌙' : '☀️'}</button>
        <button class="dtai-close" title="Cerrar chat" aria-label="Cerrar chat">&times;</button>
    `;
    widgetContainer.appendChild(header);

    // History bar
    const historyBar = document.createElement('div');
    historyBar.className = 'dtai-history-bar';
    historyBar.innerHTML = `<span>Historial de chat</span><span><button class="dtai-download" title="Descargar historial" aria-label="Descargar historial">⬇️</button><button class="dtai-clear" title="Limpiar historial" aria-label="Limpiar historial">🗑️</button></span>`;
    widgetContainer.appendChild(historyBar);

    // Chat area
    const chatArea = document.createElement('div');
    chatArea.className = 'dtai-chat-area';
    chatArea.setAttribute('aria-live','polite');
    widgetContainer.appendChild(chatArea);

    // Sugerencias automáticas
    const suggestions = ['¿Cuáles son los horarios de clases?', '¿Qué instrumentos puedo aprender?', '¿Cómo me inscribo?', '¿Hay clases online?', '¿Cuánto cuesta la matrícula?'];
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'dtai-suggestion-box';
    suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = s;
        btn.onclick = () => {
            inputArea.querySelector('#dtai-input').value = s;
            inputArea.querySelector('#dtai-input').focus();
        };
        suggestionBox.appendChild(btn);
    });

    // Input area
    const inputArea = document.createElement('form');
    inputArea.className = 'dtai-input-area';
    inputArea.innerHTML = `
        <input type="text" id="dtai-input" placeholder="Escribe tu mensaje..." autocomplete="off" aria-label="Escribe tu mensaje" />
        <button type="button" id="dtai-emoji" title="Emojis" aria-label="Emojis">😊</button>
        <input type="file" id="dtai-file" style="display:none;" multiple accept=".pdf,.txt,.md,.doc,.docx,.xls,.xlsx" />
        <button type="button" id="dtai-attach" title="Adjuntar archivo" aria-label="Adjuntar archivo">📎</button>
        <button type="button" id="dtai-audio" title="Enviar audio" aria-label="Enviar audio">🎤</button>
        <button type="submit" class="dtai-send">Enviar</button>
    `;

    // Powered by
    const powered = document.createElement('div');
    powered.className = 'dtai-powered';
    powered.innerHTML = '<a href="https://landing.daverod.tech" style="color:#667eea;text-decoration:none;" target="_blank">Powered by DaverodtechAI</a>';

    // Add widget to page
    document.body.appendChild(widgetContainer);

    widgetContainer.appendChild(suggestionBox);
    widgetContainer.appendChild(inputArea);
    widgetContainer.appendChild(powered);

    // Accessibility: focus trap
    widgetContainer.focus();

    // Close button
    header.querySelector('.dtai-close').onclick = () => widgetContainer.remove();

    // Dark mode toggle
    header.querySelector('.dtai-toggle-dark').onclick = () => {
        darkMode = !darkMode;
        localStorage.setItem('dtai_dark_mode', darkMode);
        widgetContainer.classList.toggle('dtai-dark', darkMode);
        header.querySelector('.dtai-toggle-dark').textContent = darkMode ? '🌙' : '☀️';
    };

    // Edit agent info
    header.querySelector('.dtai-agent-edit').onclick = () => {
        const name = prompt('Nombre del agente:', agentName);
        if (name) {
            agentName = name;
            localStorage.setItem('dtai_agent_name', name);
            header.querySelector('.dtai-agent-name').textContent = name;
        }
        const avatar = prompt('URL del avatar:', agentAvatar);
        if (avatar) {
            agentAvatar = avatar;
            localStorage.setItem('dtai_agent_avatar', avatar);
            header.querySelector('.dtai-avatar').src = avatar;
        }
    };

    // Emoji picker (simple)
    const emojiList = ['😀','😁','😂','🤣','😊','😍','😎','😢','😡','👍','🙏','🎵','🎶','🥁','🎸','🎹','🎤'];
    let emojiPicker;
    inputArea.querySelector('#dtai-emoji').onclick = function() {
        if (emojiPicker) { emojiPicker.remove(); emojiPicker = null; return; }
        emojiPicker = document.createElement('div');
        emojiPicker.className = 'dtai-emoji-picker';
        emojiList.forEach(e => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.textContent = e;
            btn.onclick = () => {
                inputArea.querySelector('#dtai-input').value += e;
                emojiPicker.remove(); emojiPicker = null;
            };
            emojiPicker.appendChild(btn);
        });
        document.body.appendChild(emojiPicker);
    };

    // Attach file
    inputArea.querySelector('#dtai-attach').onclick = function() {
        inputArea.querySelector('#dtai-file').click();
    };
    inputArea.querySelector('#dtai-file').onchange = function(e) {
        Array.from(e.target.files).forEach(file => {
            addMessage('user', `<b>Archivo adjunto:</b> ${file.name}`);
        });
        chatArea.scrollTop = chatArea.scrollHeight;
    };

    // Audio recording
    let mediaRecorder, audioChunks = [];
    inputArea.querySelector('#dtai-audio').onclick = async function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Audio no soportado en este navegador');
            return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            addMessage('user', `<b>Audio enviado:</b><br><audio controls src="${url}"></audio>`);
            chatArea.scrollTop = chatArea.scrollHeight;
        };
        setTimeout(() => mediaRecorder.stop(), 5000); // 5s grabación
    };

    // Validación de entrada y envío
    inputArea.onsubmit = function(e) {
        e.preventDefault();
        const input = inputArea.querySelector('#dtai-input');
        const text = input.value.trim();
        if (!text) {
            input.style.borderColor = '#e53e3e';
            input.setAttribute('aria-invalid','true');
            input.placeholder = 'Escribe un mensaje válido';
            setTimeout(() => { input.style.borderColor = '#ccc'; input.setAttribute('aria-invalid','false'); input.placeholder = 'Escribe tu mensaje...'; }, 1500);
            return;
        }
        addMessage('user', text);
        input.value = '';
    };

    // Mensaje de bienvenida dinámico
    function getWelcomeMessage() {
        const hour = new Date().getHours();
        let saludo = '¡Hola!';
        if (hour < 12) saludo = '¡Buenos días!';
        else if (hour < 18) saludo = '¡Buenas tardes!';
        else saludo = '¡Buenas noches!';
        const user = (window.localStorage.getItem('dtai_user_name') || '');
        return `${saludo} ${user ? user + ',' : ''} ¿En qué podemos ayudarte hoy?`;
    }

    // Render chat history
    function renderHistory() {
        chatArea.innerHTML = '';
        chatHistory.forEach(msg => {
            addMessage(msg.role, msg.text, false);
        });
    }

    // Add message to chat and history
    function addMessage(role, text, save = true) {
        const msg = document.createElement('div');
        msg.className = 'dtai-msg ' + role;
        msg.innerHTML = (role === 'agent' ? `<b>${agentName}:</b> ` : '<b>Tú:</b> ') + text;
        chatArea.appendChild(msg);
        chatArea.scrollTop = chatArea.scrollHeight;
        if (save) {
            chatHistory.push({ role, text });
            localStorage.setItem('dtai_chat_history', JSON.stringify(chatHistory));
        }
    }

    // Download chat history
    historyBar.querySelector('.dtai-download').onclick = () => {
        const content = chatHistory.map(m => (m.role === 'agent' ? agentName : 'Tú') + ': ' + m.text.replace(/<[^>]+>/g,'')).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'chat-history.txt';
        a.click();
    };

    // Clear chat history
    historyBar.querySelector('.dtai-clear').onclick = () => {
        if (confirm('¿Seguro que quieres borrar el historial?')) {
            chatHistory = [];
            localStorage.removeItem('dtai_chat_history');
            renderHistory();
        }
    };

    // Initial render
    renderHistory();
    if (chatHistory.length === 0) {
        addMessage('agent', getWelcomeMessage());
    }

    // Keyboard accessibility: Enter to send, Esc to close
    inputArea.querySelector('#dtai-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            inputArea.querySelector('.dtai-send').click();
        }
        if (e.key === 'Escape') {
            widgetContainer.remove();
        }
    });
    widgetContainer.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') widgetContainer.remove();
    });
})();
