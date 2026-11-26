


document.addEventListener("DOMContentLoaded", () => {
    const announcement = document.getElementById('announcement');
    const closeAnnouncementBtn = document.getElementById('close-announcement');
    const announcementImage = document.getElementById('announcement-image');

    // // Verificar si el anuncio ya fue mostrado
    // const announcementSeen = localStorage.getItem("announcementSeen");

    // if (!announcementSeen) {
        if (announcement) {
            // Mostrar el anuncio automáticamente al cargar la página
            announcement.style.display = 'flex';

            // Ocultar el anuncio al hacer clic en cualquier parte de la pantalla
            document.addEventListener('click', (event) => {
                if (!announcement.contains(event.target)) {
                    announcement.style.display = 'none';
                    localStorage.setItem("announcementSeen", "true"); // Guardar que se mostró
                }
            });

            // Evitar que el clic en el anuncio cierre el contenido
            announcement.addEventListener('click', (event) => {
                event.stopPropagation(); // Evitar propagación al documento
            });

            // Ocultar el anuncio al hacer clic en el botón de cierre
            if (closeAnnouncementBtn) {
                closeAnnouncementBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    announcement.style.display = 'none';
                    localStorage.setItem("announcementSeen", "true"); // Guardar que se mostró
                });
            }

            // Abrir la imagen en una nueva pestaña al hacer clic
            if (announcementImage) {
                announcementImage.addEventListener('click', (event) => {
                    event.stopPropagation();
                    window.open(announcementImage.src, '_blank'); // Abrir en una nueva pestaña
                });
            }
        
    }
});








//funcionalidad para el carrusel

document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".carousel");
    const images = document.querySelectorAll(".carousel img");
    const indicators = document.querySelectorAll(".indicator");
    let currentIndex = 0;

    if (carousel && images.length > 0) {
        // Función para mostrar la siguiente imagen
        function showNextImage() {
            // Quitar la clase "active" de la imagen e indicador actuales
            images[currentIndex].classList.remove("active");
            indicators[currentIndex].classList.remove("active");

            // Actualizar el índice a la siguiente imagen
            currentIndex = (currentIndex + 1) % images.length;

            // Agregar la clase "active" a la nueva imagen e indicador
            images[currentIndex].classList.add("active");
            indicators[currentIndex].classList.add("active");
        }

        // Función para mostrar una imagen específica al hacer clic en un punto
        function goToImage(index) {
            // Quitar la clase "active" de la imagen e indicador actuales
            images[currentIndex].classList.remove("active");
            indicators[currentIndex].classList.remove("active");

            // Actualizar el índice actual al nuevo índice
            currentIndex = index;

            // Agregar la clase "active" a la nueva imagen e indicador
            images[currentIndex].classList.add("active");
            indicators[currentIndex].classList.add("active");
        }

        // Añadir eventos de clic a cada indicador
        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => {
                goToImage(index);
            });
        });

        // Navegación automática cada 5 segundos
        setInterval(showNextImage, 100000);
    }
});



// ASISTENTE DE INTELIGENCIA ARTIFICIAL
document.addEventListener('DOMContentLoaded', () => {
    const assistant = document.getElementById('ai-assistant');
    if (!assistant) return;

    const launcher = document.getElementById('ai-launcher');
    const panel = document.getElementById('ai-panel');
    const closeButton = document.getElementById('ai-close');
    const minimizeButton = document.getElementById('ai-minimize');
    const expandButton = document.getElementById('ai-expand');
    const newChatButton = document.getElementById('ai-new-chat');
    const welcome = document.getElementById('ai-welcome');
    const welcomeClose = document.getElementById('ai-welcome-close');
    const messages = document.getElementById('ai-messages');
    const thinking = document.getElementById('ai-thinking');
    const form = document.getElementById('ai-form');
    const input = document.getElementById('ai-input');
    const sendButton = document.getElementById('ai-send');
    const csrfToken = form.querySelector('[name="csrfmiddlewaretoken"]').value;
    let isSending = false;
    let historyLoaded = false;

    function setPanelOpen(isOpen) {
        panel.hidden = !isOpen;
        launcher.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
            welcome.hidden = true;
            loadHistory();
            window.setTimeout(() => input.focus(), 50);
        }
    }

    function scrollToLatest() {
        messages.scrollTop = messages.scrollHeight;
    }

    function removeIntro() {
        const intro = messages.querySelector('[data-ai-intro]');
        if (intro) intro.remove();
    }

    function appendInlineText(container, text) {
        const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        parts.forEach((part) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                const code = document.createElement('code');
                code.textContent = part.slice(1, -1);
                container.appendChild(code);
            } else if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.textContent = part.slice(2, -2);
                container.appendChild(strong);
            } else {
                container.appendChild(document.createTextNode(part));
            }
        });
    }

    function appendMarkdown(container, source) {
        const lines = String(source).replace(/\r\n/g, '\n').split('\n');
        let codeBlock = null;
        let list = null;

        function tableCells(line) {
            return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
        }

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            if (line.trim().startsWith('```')) {
                if (codeBlock) {
                    container.appendChild(codeBlock.wrapper);
                    codeBlock = null;
                } else {
                    const wrapper = document.createElement('pre');
                    const code = document.createElement('code');
                    wrapper.appendChild(code);
                    codeBlock = { wrapper, code };
                }
                list = null;
                continue;
            }

            if (codeBlock) {
                codeBlock.code.textContent += `${line}\n`;
                continue;
            }

            const nextLine = lines[index + 1] || '';
            const tableSeparator = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
            if (line.includes('|') && tableSeparator.test(nextLine)) {
                const wrapper = document.createElement('div');
                wrapper.className = 'ai-table-wrapper';
                const table = document.createElement('table');
                const head = document.createElement('thead');
                const headerRow = document.createElement('tr');
                tableCells(line).forEach((cell) => {
                    const heading = document.createElement('th');
                    appendInlineText(heading, cell);
                    headerRow.appendChild(heading);
                });
                head.appendChild(headerRow);
                table.appendChild(head);

                const body = document.createElement('tbody');
                let rowIndex = index + 2;
                while (rowIndex < lines.length && lines[rowIndex].includes('|') && lines[rowIndex].trim()) {
                    const row = document.createElement('tr');
                    tableCells(lines[rowIndex]).forEach((cell) => {
                        const dataCell = document.createElement('td');
                        appendInlineText(dataCell, cell);
                        row.appendChild(dataCell);
                    });
                    body.appendChild(row);
                    rowIndex += 1;
                }
                table.appendChild(body);
                wrapper.appendChild(table);
                container.appendChild(wrapper);
                index = rowIndex - 1;
                list = null;
                continue;
            }

            const listMatch = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
            if (listMatch) {
                const listTag = listMatch[1].endsWith('.') ? 'ol' : 'ul';
                if (!list || list.tagName.toLowerCase() !== listTag) {
                    list = document.createElement(listTag);
                    container.appendChild(list);
                }
                const item = document.createElement('li');
                appendInlineText(item, listMatch[2]);
                list.appendChild(item);
                continue;
            }
            list = null;

            if (!line.trim()) {
                container.appendChild(document.createElement('br'));
                continue;
            }

            const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
            const element = document.createElement(headingMatch ? 'strong' : 'p');
            appendInlineText(element, headingMatch ? headingMatch[2] : line);
            container.appendChild(element);
        }

        if (codeBlock) container.appendChild(codeBlock.wrapper);
    }

    function addMessage(role, content, options = {}) {
        removeIntro();
        const row = document.createElement('div');
        row.className = `ai-message ai-message-${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'ai-message-bubble';
        if (role === 'assistant') {
            appendMarkdown(bubble, content);
        } else {
            bubble.textContent = content;
        }
        row.appendChild(bubble);

        if (role === 'assistant' && !options.error) {
            const copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.className = 'ai-copy';
            copyButton.textContent = 'Copiar';
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(content);
                    copyButton.textContent = 'Copiado';
                    window.setTimeout(() => { copyButton.textContent = 'Copiar'; }, 1500);
                } catch (error) {
                    copyButton.textContent = 'No se pudo copiar';
                }
            });
            row.appendChild(copyButton);
        }

        if (options.error) row.classList.add('ai-message-error');
        messages.appendChild(row);
        scrollToLatest();
    }

    function setSending(sending) {
        isSending = sending;
        input.disabled = sending;
        sendButton.disabled = sending;
        thinking.hidden = !sending;
        messages.setAttribute('aria-busy', String(sending));
        if (sending) scrollToLatest();
    }

    async function parseResponse(response) {
        try {
            return await response.json();
        } catch (error) {
            return { success: false, error: 'El servidor devolvió una respuesta no válida.' };
        }
    }

    async function loadHistory() {
        if (historyLoaded) return;
        historyLoaded = true;
        try {
            const response = await fetch(assistant.dataset.historyUrl, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            const data = await parseResponse(response);
            if (!response.ok || !data.success) throw new Error(data.error || 'No se pudo recuperar la conversación.');
            data.messages.forEach((message) => {
                if (message.role === 'user' || message.role === 'assistant') {
                    addMessage(message.role, String(message.content || ''));
                }
            });
        } catch (error) {
            addMessage('assistant', error.message, { error: true });
        }
    }

    async function sendQuestion(question) {
        if (isSending || !question.trim()) return;
        const normalizedQuestion = question.trim();
        addMessage('user', normalizedQuestion);
        input.value = '';
        input.style.height = '';
        setSending(true);

        try {
            const response = await fetch(assistant.dataset.chatUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ pregunta: normalizedQuestion }),
            });
            const data = await parseResponse(response);
            if (!response.ok || !data.success) throw new Error(data.error || 'No fue posible obtener una respuesta.');
            addMessage('assistant', data.respuesta);
        } catch (error) {
            addMessage('assistant', error.message, { error: true });
        } finally {
            setSending(false);
            input.focus();
        }
    }

    async function clearConversation() {
        if (isSending) return;
        try {
            const response = await fetch(assistant.dataset.clearUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: '{}',
            });
            const data = await parseResponse(response);
            if (!response.ok || !data.success) throw new Error(data.error || 'No se pudo iniciar una conversación nueva.');
            messages.replaceChildren();
            const intro = document.createElement('div');
            intro.className = 'ai-intro ai-intro-compact';
            intro.dataset.aiIntro = '';
            const title = document.createElement('h3');
            title.textContent = 'Nueva conversación';
            const description = document.createElement('p');
            description.textContent = '¿En qué puedo orientarte?';
            intro.append(title, description);
            messages.appendChild(intro);
            input.focus();
        } catch (error) {
            addMessage('assistant', error.message, { error: true });
        }
    }

    launcher.addEventListener('click', () => setPanelOpen(panel.hidden));
    closeButton.addEventListener('click', () => setPanelOpen(false));
    minimizeButton.addEventListener('click', () => setPanelOpen(false));
    expandButton.addEventListener('click', () => {
        panel.classList.toggle('ai-panel-expanded');
        expandButton.setAttribute('aria-label', panel.classList.contains('ai-panel-expanded') ? 'Reducir panel' : 'Ampliar panel');
    });
    newChatButton.addEventListener('click', clearConversation);
    welcomeClose.addEventListener('click', () => {
        welcome.hidden = true;
        localStorage.setItem('aiWelcomeDismissed', 'true');
    });
    if (localStorage.getItem('aiWelcomeDismissed') === 'true') welcome.hidden = true;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendQuestion(input.value);
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });
    assistant.querySelectorAll('[data-ai-suggestion]').forEach((button) => {
        button.addEventListener('click', () => sendQuestion(button.dataset.aiSuggestion));
    });
});












//ACTUALIZAR RELOJ DE LAS TENDENCIAS
// Script para mostrar la hora en tiempo real
function updateClock() {
    const clock = document.getElementById('realtime-clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000); // Actualizar cada segundo
document.addEventListener('DOMContentLoaded', updateClock);
