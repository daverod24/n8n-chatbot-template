/* DavetechAI Chat Widget v1.0 */
(function () {
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'davetechai-chat-widget';
    widgetContainer.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; z-index: 99999;
        width: 350px; max-width: 95vw; background: #fff; border-radius: 16px;
        box-shadow: 0 8px 32px rgba(102,126,234,0.18);
        font-family: Arial, sans-serif; overflow: hidden;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex; align-items: center; padding: 12px 16px; background: linear-gradient(90deg,#667eea,#764ba2);
        color: #fff; font-weight: bold; font-size: 1.1rem;
    `;
    header.innerHTML = `<img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&q=80" style="width:32px;height:32px;border-radius:50%;margin-right:10px;"> DavetechAI Centro Musical <span style="flex:1"></span><button id="dtai-close" style="background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;">&times;</button>`;
    widgetContainer.appendChild(header);

    // Chat area
    const chatArea = document.createElement('div');
    chatArea.className = 'dtai-chat-area';
    chatArea.style.cssText = 'height:320px;overflow-y:auto;padding:12px;background:#fafaff;';
    widgetContainer.appendChild(chatArea);

    // Input area
    const inputArea = document.createElement('form');
    inputArea.className = 'dtai-input-area';
    inputArea.style.cssText = 'display:flex;align-items:center;padding:10px 12px;background:#f5f5fa;border-top:1px solid #eee;gap:8px;';
    inputArea.innerHTML = `
        <input type="text" id="dtai-input" placeholder="Escribe tu mensaje..." style="flex:1;padding:8px;border-radius:8px;border:1px solid #ccc;font-size:1rem;" autocomplete="off" />
        <button type="button" id="dtai-emoji" title="Emojis" style="background:none;border:none;font-size:1.3rem;cursor:pointer;">😊</button>
        <input type="file" id="dtai-file" style="display:none;" multiple accept=".pdf,.txt,.md,.doc,.docx,.xls,.xlsx" />
        <button type="button" id="dtai-attach" title="Adjuntar archivo" style="background:none;border:none;font-size:1.3rem;cursor:pointer;">📎</button>
        <button type="button" id="dtai-audio" title="Enviar audio" style="background:none;border:none;font-size:1.3rem;cursor:pointer;">🎤</button>
        <button type="submit" id="dtai-send" style="background:#667eea;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:bold;cursor:pointer;">Enviar</button>
    `;
    widgetContainer.appendChild(inputArea);

    // Powered by
    const powered = document.createElement('div');
    powered.style.cssText = 'text-align:center;padding:6px 0;font-size:0.9rem;color:#888;background:#f5f5fa;';
    powered.innerHTML = '<a href="https://davetechai.com" style="color:#667eea;text-decoration:none;" target="_blank">Powered by DavetechAI</a>';
    widgetContainer.appendChild(powered);

    // Add widget to page
    document.body.appendChild(widgetContainer);

    // Close button
    header.querySelector('#dtai-close').onclick = () => widgetContainer.remove();

    // Emoji picker (simple)
    const emojiList = ['😀','😁','😂','🤣','😊','😍','😎','😢','😡','👍','🙏','🎵','🎶','🥁','🎸','🎹','🎤'];
    let emojiPicker;
    inputArea.querySelector('#dtai-emoji').onclick = function() {
        if (emojiPicker) { emojiPicker.remove(); emojiPicker = null; return; }
        emojiPicker = document.createElement('div');
        emojiPicker.style.cssText = 'position:absolute;bottom:60px;right:60px;background:#fff;border:1px solid #ccc;border-radius:8px;padding:8px;z-index:100000;display:flex;flex-wrap:wrap;gap:6px;';
        emojiList.forEach(e => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.textContent = e;
            btn.style.cssText = 'font-size:1.3rem;background:none;border:none;cursor:pointer;';
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
            const msg = document.createElement('div');
            msg.style.cssText = 'margin:8px 0;padding:8px;background:#e3e7fa;border-radius:8px;';
            msg.innerHTML = `<b>Archivo adjunto:</b> ${file.name}`;
            chatArea.appendChild(msg);
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
            const msg = document.createElement('div');
            msg.style.cssText = 'margin:8px 0;padding:8px;background:#e3e7fa;border-radius:8px;';
            msg.innerHTML = `<b>Audio enviado:</b><br><audio controls src="${url}"></audio>`;
            chatArea.appendChild(msg);
            chatArea.scrollTop = chatArea.scrollHeight;
        };
        setTimeout(() => mediaRecorder.stop(), 5000); // 5s grabación
    };

    // Sugerencias automáticas
    const suggestions = ['¿Cuáles son los horarios de clases?', '¿Qué instrumentos puedo aprender?', '¿Cómo me inscribo?', '¿Hay clases online?', '¿Cuánto cuesta la matrícula?'];
    const suggestionBox = document.createElement('div');
    suggestionBox.style.cssText = 'display:flex;gap:6px;padding:6px 12px;background:#f5f5fa;border-top:1px solid #eee;';
    suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = s;
        btn.style.cssText = 'background:#e3e7fa;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.95rem;';
        btn.onclick = () => {
            inputArea.querySelector('#dtai-input').value = s;
            inputArea.querySelector('#dtai-input').focus();
        };
        suggestionBox.appendChild(btn);
    });
    widgetContainer.insertBefore(suggestionBox, inputArea);

    // Validación de entrada
    inputArea.onsubmit = function(e) {
        e.preventDefault();
        const input = inputArea.querySelector('#dtai-input');
        const text = input.value.trim();
        if (!text) {
            input.style.borderColor = '#e53e3e';
            input.placeholder = 'Escribe un mensaje válido';
            setTimeout(() => { input.style.borderColor = '#ccc'; input.placeholder = 'Escribe tu mensaje...'; }, 1500);
            return;
        }
        const msg = document.createElement('div');
        msg.style.cssText = 'margin:8px 0;padding:8px;background:#e3e7fa;border-radius:8px;';
        msg.innerHTML = `<b>Tú:</b> ${text}`;
        chatArea.appendChild(msg);
        chatArea.scrollTop = chatArea.scrollHeight;
        input.value = '';
    };
})();
