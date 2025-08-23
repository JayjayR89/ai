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


    // --- State & Initial Data ---
    let chatHistory = []; // To hold the conversation for the AI
    let activeModels = [];
    let settingsCache = {}; // To handle setting cancellation
    const SETTINGS_KEY = 'ai-chat-app-settings';

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
    const addMessage = (sender, text, options = {}) => {
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

        messageWrapper.innerHTML = `
            <div class="meta-info">${metaInfo}</div>
            <div class="content">${text.replace(/\n/g, '<br>')}</div>
            <div class="actions">
                <button class="resend-btn" title="Resend">🔄</button>
                <button class="copy-btn" title="Copy">📋</button>
                <button class="delete-btn" title="Delete">🗑️</button>
            </div>
        `;

        chatDisplay.prepend(messageWrapper); // Prepend to add to the top
        chatDisplay.scrollTop = 0; // Scroll to top to see the new message

        // Add event listeners for action buttons (functionality to be added later)
        messageWrapper.querySelector('.resend-btn').addEventListener('click', () => {
            userInput.value = text;
            userInput.focus();
        });
        messageWrapper.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(text);
        });
        messageWrapper.querySelector('.delete-btn').addEventListener('click', () => {
            messageWrapper.remove();
            // Also remove from chatHistory if needed (to be implemented)
        });

        return messageWrapper;
    };

    /**
     * Handles sending the user's message to the AI and displaying the response.
     */
    const handleSendMessage = async () => {
        const prompt = userInput.value.trim();
        if (!prompt) return;

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

    newChatBtn.addEventListener('click', () => {
        chatDisplay.innerHTML = '';
        chatHistory = [];
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
    };

    init();
});
