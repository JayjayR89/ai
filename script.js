document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const newChatBtn = document.getElementById('new-chat-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsContent = document.getElementById('settings-content');
    const themeSelect = document.getElementById('theme-select');
    const textSizeSlider = document.getElementById('text-size-slider');
    const textSizeValue = document.getElementById('text-size-value');
    const modelListContainer = document.getElementById('model-list-container');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const appContainer = document.getElementById('app-container');
    const appBtns = document.querySelectorAll('.app-btn');
    const ocrUploadBtn = document.getElementById('ocr-upload-btn');
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    const ttsModal = document.getElementById('tts-modal');
    const ttsInput = document.getElementById('tts-input');
    const ttsPlayBtn = document.getElementById('tts-play-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');
    const promptsModal = document.getElementById('prompts-modal');
    const promptList = document.getElementById('prompt-list');
    const newPromptInput = document.getElementById('new-prompt-input');
    const addPromptBtn = document.getElementById('add-prompt-btn');
    const promptEnhancerInput = document.getElementById('prompt-enhancer-input');
    const enhancePromptBtn = document.getElementById('enhance-prompt-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const headerOptions = document.getElementById('header-options');
    const appsBarToggleBtn = document.getElementById('apps-bar-toggle-btn');
    const appsBar = document.getElementById('apps-bar');


    // --- State & Initial Data ---
    let currentMode = 'chat'; // chat, image, ocr, tts, code, prompts
    let chatHistory = []; // To hold the conversation for the AI
    let activeModels = [];
    let customPrompts = [];
    let settingsCache = {}; // To handle setting cancellation
    const SETTINGS_KEY = 'ai-chat-app-settings';
    const HISTORY_KEY = 'ai-chat-history';
    const PROMPTS_KEY = 'ai-chat-custom-prompts';

    const defaultPrompts = [
        { title: 'Summarize', text: 'Summarize the following text: ' },
        { title: 'Translate to French', text: 'Translate the following to French: ' },
        { title: 'Explain Like I\'m 5', text: 'Explain the following concept like I am 5 years old: ' },
        { title: 'Act as a Linux Terminal', text: 'I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first command is pwd.' },
    ];

    const defaultModels = [
        'gpt-5', 'gpt-4.1', 'gpt-4o', 'claude-sonnet-4',
        'google/gemini-2.0-flash-exp:free', 'qwen/qwen3-235b-a22b-07-25',
        'meta-llama/llama-4-maverick', 'deepseek-chat', 'x-ai/grok-4'
    ];

    const allModels = {
        "OpenAI": ["gpt-5", "gpt-5-mini", "gpt-5-nano", "gpt-5-chat-latest", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4.5-preview", "gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "o1-pro", "o3", "o3-mini", "o4-mini"],
        "Claude": ["claude-sonnet-4", "claude-opus-4", "claude-3-7-sonnet", "claude-3-5-sonnet"],
        "DeepSeek": ["deepseek-chat", "deepseek-reasoner"],
        "Gemini": ["google/gemini-2.0-flash-001", "google/gemini-2.0-flash-exp:free", "google/gemini-2.0-flash-lite-001", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite-preview-06-17", "google/gemini-2.5-flash-preview", "google/gemini-2.5-flash-preview-05-20", "google/gemini-2.5-flash-preview-05-20:thinking", "google/gemini-2.5-flash-preview:thinking", "google/gemini-2.5-pro", "google/gemini-2.5-pro-exp-03-25", "google/gemini-2.5-pro-preview", "google/gemini-2.5-pro-preview-05-06", "google/gemini-flash-1.5", "google/gemini-flash-1.5-8b", "google/gemini-pro-1.5"],
        "Llama": ["meta-llama/llama-3-70b-instruct", "meta-llama/llama-3-8b-instruct", "meta-llama/llama-3.1-405b", "meta-llama/llama-3.1-405b-instruct", "meta-llama/llama-3.1-70b-instruct", "meta-llama/llama-3.1-8b-instruct", "meta-llama/llama-3.2-11b-vision-instruct", "meta-llama/llama-3.2-11b-vision-instruct:free", "meta-llama/llama-3.2-1b-instruct", "meta-llama/llama-3.2-3b-instruct", "meta-llama/llama-3.2-90b-vision-instruct", "meta-llama/llama-3.3-70b-instruct", "meta-llama/llama-3.3-70b-instruct:free", "meta-llama/llama-4-maverick", "meta-llama/llama-4-maverick:free", "meta-llama/llama-4-scout", "meta-llama/llama-4-scout:free", "meta-llama/llama-guard-2-8b", "meta-llama/llama-guard-3-8b", "meta-llama/llama-guard-4-12b"],
        "Grok": ["x-ai/grok-2-1212", "x-ai/grok-2-vision-1212", "x-ai/grok-3", "x-ai/grok-3-beta", "x-ai/grok-3-mini", "x-ai/grok-3-mini-beta", "x-ai/grok-4", "x-ai/grok-vision-beta"],
        "Mistral": ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mistral-nemo", "codestral-latest"],
        "Qwen": ["qwen/qwen-2-72b-instruct", "qwen/qwen-2.5-72b-instruct", "qwen/qwen-2.5-72b-instruct:free", "qwen/qwen-2.5-7b-instruct", "qwen/qwen-2.5-coder-32b-instruct", "qwen/qwen-2.5-coder-32b-instruct:free", "qwen/qwen-2.5-vl-7b-instruct", "qwen/qwen-max", "qwen/qwen-plus", "qwen/qwen-turbo", "qwen/qwen-vl-max", "qwen/qwen-vl-plus", "qwen/qwen2.5-vl-32b-instruct", "qwen/qwen2.5-vl-32b-instruct:free", "qwen/qwen2.5-vl-72b-instruct", "qwen/qwen2.5-vl-72b-instruct:free", "qwen/qwen3-14b", "qwen/qwen3-14b:free", "qwen/qwen3-235b-a22b", "qwen/qwen3-235b-a22b-07-25", "qwen/qwen3-235b-a22b-07-25:free", "qwen/qwen3-235b-a22b:free", "qwen/qwen3-30b-a3b", "qwen/qwen3-30b-a3b:free", "qwen/qwen3-32b", "qwen/qwen3-4b:free", "qwen/qwen3-8b", "qwen/qwen3-8b:free", "qwen/qwen3-coder", "qwen/qwq-32b", "qwen/qwq-32b-preview", "qwen/qwq-32b:free"]
    };

    // --- Main Functions ---

    /**
     * Adds a message bubble to the chat display.
     * @param {string} sender - 'user' or 'ai'
     * @param {string} text - The message content
     * @param {object} options - Additional options like modelName
     * @returns {HTMLElement} The created message element
     */
    const addMessage = (sender, content, options = {}) => {
        // Use a more robust unique ID
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message ${sender}-message`;
        messageWrapper.id = messageId;

        const timestamp = new Date().toLocaleTimeString();
        const modelName = options.modelName || modelSelect.value;

        const metaInfo = sender === 'ai'
            ? `${modelName} - ${timestamp}`
            : `${timestamp}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        if (typeof content === 'string') {
            contentDiv.innerHTML = content.replace(/\n/g, '<br>');
        } else if (content instanceof HTMLElement) {
            contentDiv.appendChild(content);
        }

        messageWrapper.innerHTML = `
            <div class="meta-info">${metaInfo}</div>
            <div class="actions">
                <button class="resend-btn" title="Resend">🔄</button>
                <button class="copy-btn" title="Copy">📋</button>
                <button class="delete-btn" title="Delete">🗑️</button>
            </div>
        `;
        messageWrapper.insertBefore(contentDiv, messageWrapper.querySelector('.actions'));


        chatDisplay.prepend(messageWrapper); // Prepend to add to the top
        chatDisplay.scrollTop = 0; // Scroll to top to see the new message

        // Add event listeners for action buttons
        const textContent = typeof content === 'string' ? content : content.alt || '';
        messageWrapper.querySelector('.resend-btn').addEventListener('click', () => {
            if (textContent) {
                userInput.value = textContent;
                userInput.focus();
            }
        });
        messageWrapper.querySelector('.copy-btn').addEventListener('click', () => {
            if (textContent) navigator.clipboard.writeText(textContent);
        });
        messageWrapper.querySelector('.delete-btn').addEventListener('click', () => {
            messageWrapper.remove();
        });

        return messageWrapper;
    };

    /**
     * Handles sending the user's message to the AI and displaying the response.
     */
    const handleSendMessage = async () => {
        const prompt = userInput.value.trim();
        if (!prompt) return;

        if (currentMode === 'chat' || currentMode === 'code') {
            // Add user message to display and history
            addMessage('user', prompt);
            chatHistory.push({ role: 'user', content: prompt });
            userInput.value = '';

            const selectedModel = modelSelect.value;
            const aiMessageElement = addMessage('ai', '...', { modelName: selectedModel });
            const aiContentElement = aiMessageElement.querySelector('.content');
            aiContentElement.innerHTML = 'Thinking...';

            let fullResponse = '';
            try {
                const stream = await puter.ai.chat(chatHistory, { model: selectedModel, stream: true });

                let firstChunk = true;
                for await (const part of stream) {
                    if (part.text) {
                        fullResponse += part.text;
                        if (firstChunk) {
                            aiContentElement.innerHTML = ''; // Clear "Thinking..."
                            firstChunk = false;
                        }
                        aiContentElement.innerHTML = fullResponse.replace(/\n/g, '<br>');
                    }
                }

                // Update the message element with the final text for copy/resend
                aiMessageElement.querySelector('.resend-btn').addEventListener('click', () => { userInput.value = fullResponse; userInput.focus(); });
                aiMessageElement.querySelector('.copy-btn').addEventListener('click', () => { navigator.clipboard.writeText(fullResponse); });

                chatHistory.push({ role: 'assistant', content: fullResponse });

            } catch (error) {
                console.error('AI Chat Error:', error);
                aiContentElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
                aiContentElement.style.color = '#e74c3c';
            }
        }
        // Placeholder for other modes
        else if (currentMode === 'image') {
            addMessage('user', prompt);
            userInput.value = '';

            const placeholder = addMessage('ai', 'Generating image...');
            const contentDiv = placeholder.querySelector('.content');

            try {
                // Using testMode=true to avoid using credits during development
                const imageElement = await puter.ai.txt2img(prompt, true);
                imageElement.style.maxWidth = '100%';
                imageElement.style.borderRadius = '10px';
                imageElement.alt = prompt; // For copy/resend functionality

                contentDiv.innerHTML = '';
                contentDiv.appendChild(imageElement);

                // Re-assign copy/resend for the final content
                placeholder.querySelector('.resend-btn').addEventListener('click', () => { userInput.value = prompt; userInput.focus(); });
                placeholder.querySelector('.copy-btn').addEventListener('click', () => { navigator.clipboard.writeText(prompt); });

            } catch (error) {
                console.error("Image generation error:", error);
                contentDiv.innerHTML = `<strong>Error generating image:</strong> ${error.message}`;
                contentDiv.style.color = '#e74c3c';
            }
        }
    };

    /**
     * Populates the model selection dropdown.
     * @param {string[]} models - An array of model names.
     */
    const populateModelSelect = (models) => {
        const currentSelection = modelSelect.value;
        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        // Preserve selection if possible
        if (models.includes(currentSelection)) {
            modelSelect.value = currentSelection;
        }
    };

    // --- Settings Panel Logic ---

    const openSettings = () => {
        // Cache current settings for cancellation
        settingsCache.theme = themeSelect.value;
        settingsCache.textSize = textSizeSlider.value;
        settingsCache.models = [...activeModels];

        populateModelSettings();
        settingsModal.classList.remove('hidden');
    };

    const closeSettings = (save = false) => {
        if (!save) {
            // Revert UI changes if not saving
            themeSelect.value = settingsCache.theme;
            applyTheme(settingsCache.theme);
            textSizeSlider.value = settingsCache.textSize;
            applyTextSize(settingsCache.textSize);
        }
        settingsModal.classList.add('hidden');
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
    };

    const applyTextSize = (size) => {
        document.documentElement.style.setProperty('--font-size-base', `${12 + (size / 100) * 8}px`); // Scale from 12px to 20px
        textSizeValue.textContent = `${size}%`;
    };

    const populateModelSettings = () => {
        modelListContainer.innerHTML = '';
        for (const provider in allModels) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'provider-group';
            let groupHTML = `<h4>${provider}</h4>`;

            allModels[provider].forEach(model => {
                const isChecked = activeModels.includes(model);
                groupHTML += `
                    <div class="model-item">
                        <input type="checkbox" id="model-${model}" value="${model}" ${isChecked ? 'checked' : ''}>
                        <label for="model-${model}">${model}</label>
                    </div>
                `;
            });
            groupDiv.innerHTML = groupHTML;
            modelListContainer.appendChild(groupDiv);
        }
    };

    const saveAiSettings = () => {
        const newActiveModels = [];
        const checkboxes = modelListContainer.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            newActiveModels.push(checkbox.value);
        });
        activeModels = newActiveModels;
        populateModelSelect(activeModels);

        const settings = {
            theme: themeSelect.value,
            textSize: textSizeSlider.value,
            models: activeModels
        };
        puter.kv.set(SETTINGS_KEY, settings);

        closeSettings(true);
    };

    const saveCurrentSettings = async () => {
        const settings = {
            theme: themeSelect.value,
            textSize: textSizeSlider.value,
            models: activeModels
        };
        await puter.kv.set(SETTINGS_KEY, settings);
    };

    const loadSettings = async () => {
        const savedSettings = await puter.kv.get(SETTINGS_KEY);
        if (savedSettings) {
            // Apply saved settings
            themeSelect.value = savedSettings.theme || 'light';
            textSizeSlider.value = savedSettings.textSize || 50;
            activeModels = savedSettings.models || [...defaultModels];
        } else {
            // Use defaults if no settings are saved
            activeModels = [...defaultModels];
        }
        applyTheme(themeSelect.value);
        applyTextSize(textSizeSlider.value);
        populateModelSelect(activeModels);
    };


    // --- Event Listeners ---
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    newChatBtn.addEventListener('click', async () => {
        await saveChatSession();
        chatDisplay.innerHTML = '';
        chatHistory = [];
        // Ensure system prompt is re-added if in code mode
        if (currentMode === 'code') {
            const codeSystemPrompt = { role: 'system', content: 'You are an expert code generation assistant. Please provide only code in your responses, with minimal explanation unless asked.' };
            chatHistory.unshift(codeSystemPrompt);
        }
    });

    // --- History Feature ---

    const saveChatSession = async () => {
        // Don't save empty chats or chats with only a system prompt
        if (chatHistory.length <= 1) {
            const hasNonSystemMessage = chatHistory.some(msg => msg.role !== 'system');
            if (!hasNonSystemMessage) return;
        }

        const history = await puter.kv.get(HISTORY_KEY) || [];
        const firstUserMessage = chatHistory.find(msg => msg.role === 'user');

        const newSession = {
            id: Date.now(),
            title: firstUserMessage ? firstUserMessage.content.substring(0, 40) + '...' : 'Chat Session',
            messages: chatHistory
        };

        history.unshift(newSession); // Add to the beginning
        await puter.kv.set(HISTORY_KEY, history.slice(0, 50)); // Limit to 50 sessions
    };

    const loadAndDisplayHistory = async () => {
        const history = await puter.kv.get(HISTORY_KEY) || [];
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p>No saved chats found.</p>';
            return;
        }

        history.forEach(session => {
            const sessionEl = document.createElement('div');
            sessionEl.className = 'history-item';
            sessionEl.innerHTML = `
                <div class="history-title">${session.title}</div>
                <div class="history-date">${new Date(session.id).toLocaleString()}</div>
            `;
            sessionEl.addEventListener('click', () => {
                restoreChatSession(session.id, history);
            });
            historyList.appendChild(sessionEl);
        });
    };

    const restoreChatSession = (sessionId, history) => {
        const session = history.find(s => s.id === sessionId);
        if (!session) return;

        chatHistory = session.messages;
        chatDisplay.innerHTML = ''; // Clear current display

        // Re-add messages from the restored session
        // Loop backwards to prepend correctly
        for (let i = chatHistory.length - 1; i >= 0; i--) {
            const message = chatHistory[i];
            if (message.role !== 'system') { // Don't display system prompts
                 addMessage(message.role, message.content);
            }
        }

        historyModal.classList.add('hidden');
    };


    // --- Mode Switching Logic ---
    const setMode = (mode) => {
        const oldMode = currentMode;
        currentMode = mode;

        // System prompt for code mode
        const codeSystemPrompt = { role: 'system', content: 'You are an expert code generation assistant. Please provide only code in your responses, with minimal explanation unless asked.' };

        // Remove system prompt when leaving code mode
        if (oldMode === 'code') {
            const firstMessage = chatHistory[0];
            if (firstMessage && firstMessage.role === 'system') {
                chatHistory.shift();
            }
        }

        // Add system prompt when entering code mode
        if (currentMode === 'code') {
            chatHistory.unshift(codeSystemPrompt);
        }

        // Update active button style
        appBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Toggle visibility of mode-specific UI elements
        ocrUploadBtn.classList.toggle('hidden', mode !== 'ocr');
        appContainer.classList.toggle('code-mode', mode === 'code');

        // Handle modal-based modes
        if (mode === 'history') {
            loadAndDisplayHistory();
            historyModal.classList.remove('hidden');
        } else if (mode === 'tts') {
            ttsModal.classList.remove('hidden');
        } else if (mode === 'prompts') {
            loadAndRenderPrompts();
            promptsModal.classList.remove('hidden');
        }

        // Reset to chat mode after opening a modal
        if (['history', 'tts', 'prompts'].includes(mode)) {
            setTimeout(() => setMode('chat'), 200);
        }
    };

    // --- Event Listeners ---
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Settings panel event listeners
    settingsBtn.addEventListener('click', openSettings);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) { // Click on overlay
            closeSettings(false);
        }
    });

    tabLinks.forEach(button => {
        button.addEventListener('click', () => {
            tabLinks.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
    textSizeSlider.addEventListener('input', () => applyTextSize(textSizeSlider.value));
    saveSettingsBtn.addEventListener('click', () => {
        // 1. Update active models from checkboxes
        const newActiveModels = [];
        const checkboxes = modelListContainer.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            newActiveModels.push(checkbox.value);
        });
        activeModels = newActiveModels;
        populateModelSelect(activeModels);

        // 2. Save all current settings
        saveCurrentSettings();

        // 3. Close modal
        closeSettings(true);
    });


    // --- Initialization ---
    const init = async () => {
        await loadSettings();
        setMode('chat'); // Set initial mode
    };

    // --- Prompt Management Logic ---
    const loadAndRenderPrompts = async () => {
        customPrompts = await puter.kv.get(PROMPTS_KEY) || [];
        promptList.innerHTML = '';

        // Render default prompts
        defaultPrompts.forEach(prompt => {
            const el = document.createElement('div');
            el.className = 'prompt-item';
            el.textContent = prompt.title;
            el.addEventListener('click', () => {
                userInput.value = prompt.text;
                promptsModal.classList.add('hidden');
                userInput.focus();
            });
            promptList.appendChild(el);
        });

        // Render custom prompts
        customPrompts.forEach((prompt, index) => {
            const el = document.createElement('div');
            el.className = 'prompt-item';

            const textSpan = document.createElement('span');
            textSpan.textContent = prompt;
            textSpan.addEventListener('click', () => {
                userInput.value = prompt;
                promptsModal.classList.add('hidden');
                userInput.focus();
            });

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'prompt-item-actions';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete Prompt';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCustomPrompt(index);
            });

            actionsDiv.appendChild(deleteBtn);
            el.appendChild(textSpan);
            el.appendChild(actionsDiv);
            promptList.appendChild(el);
        });
    };

    const addCustomPrompt = async () => {
        const newPrompt = newPromptInput.value.trim();
        if (!newPrompt) return;
        customPrompts.push(newPrompt);
        await puter.kv.set(PROMPTS_KEY, customPrompts);
        newPromptInput.value = '';
        loadAndRenderPrompts();
    };

    const deleteCustomPrompt = async (index) => {
        customPrompts.splice(index, 1);
        await puter.kv.set(PROMPTS_KEY, customPrompts);
        loadAndRenderPrompts();
    };

    // App mode buttons
    appBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        headerOptions.classList.toggle('visible');
    });

    appsBarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        appsBar.classList.toggle('visible');
    });

    document.addEventListener('click', () => {
        // Hide mobile menus if they are visible
        if (headerOptions.classList.contains('visible')) {
            headerOptions.classList.remove('visible');
        }
        if (appsBar.classList.contains('visible')) {
            appsBar.classList.remove('visible');
        }
    });

    addPromptBtn.addEventListener('click', addCustomPrompt);
    newPromptInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') addCustomPrompt();
    });

    enhancePromptBtn.addEventListener('click', async () => {
        const promptToEnhance = promptEnhancerInput.value.trim();
        if (!promptToEnhance) return;

        enhancePromptBtn.disabled = true;
        enhancePromptBtn.textContent = 'Enhancing...';

        try {
            const enhancerHistory = [
                { role: 'system', content: 'You are a prompt engineer. Rewrite the following user\'s prompt to be more detailed, clear, and effective for a large language model. Return only the enhanced prompt and nothing else.' },
                { role: 'user', content: promptToEnhance }
            ];
            const response = await puter.ai.chat(enhancerHistory);
            promptEnhancerInput.value = response.message.content;

        } catch (error) {
            console.error('Prompt Enhancer Error:', error);
            promptEnhancerInput.value = `Error: ${error.message}`;
        } finally {
            enhancePromptBtn.disabled = false;
            enhancePromptBtn.textContent = 'Enhance';
        }
    });

    ttsPlayBtn.addEventListener('click', async () => {
        const text = ttsInput.value.trim();
        if (!text) return;

        ttsPlayBtn.disabled = true;
        ttsPlayBtn.textContent = 'Synthesizing...';

        try {
            const audio = await puter.ai.txt2speech(text);
            ttsPlayBtn.textContent = 'Playing...';
            audio.play();
            audio.onended = () => {
                ttsPlayBtn.disabled = false;
                ttsPlayBtn.textContent = 'Play';
            };
        } catch (error) {
            console.error('TTS Error:', error);
            ttsPlayBtn.disabled = false;
            ttsPlayBtn.textContent = 'Play';
            // Optionally show an error message to the user
            ttsInput.value = `Error: ${error.message}`;
        }
    });

    ocrUploadBtn.addEventListener('click', async () => {
        try {
            const file = await puter.ui.showOpenFilePicker({ accept: 'image/*' });
            if (!file) return;

            const placeholder = addMessage('ai', `Extracting text from ${file.name}...`);
            const contentDiv = placeholder.querySelector('.content');

            try {
                const extractedText = await puter.ai.img2txt(file.path);
                contentDiv.innerHTML = `<strong>Extracted Text:</strong><br><pre>${extractedText}</pre>`;

                // Update actions for the extracted text
                placeholder.querySelector('.resend-btn').addEventListener('click', () => { userInput.value = extractedText; userInput.focus(); });
                placeholder.querySelector('.copy-btn').addEventListener('click', () => { navigator.clipboard.writeText(extractedText); });

            } catch (ocrError) {
                console.error("OCR Error:", ocrError);
                contentDiv.innerHTML = `<strong>Error during OCR:</strong> ${ocrError.message}`;
            }
        } catch (pickerError) {
            console.error("File picker error:", pickerError);
            addMessage('ai', `Could not open file picker: ${pickerError.message}`);
        }
    });

    // Generic close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });

    init();
});
