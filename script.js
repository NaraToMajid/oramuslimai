// DOM Elements
const sidebar = document.getElementById('sidebar');
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const historyList = document.getElementById('historyList');
const noHistory = document.getElementById('noHistory');

// Chat state
let currentChat = [];
let chatHistory = JSON.parse(localStorage.getItem('oramuslim_history')) || [];
let currentChatId = null;

// Initialize
loadHistory();
createIslamicPattern();

// Create Islamic decorative pattern
function createIslamicPattern() {
    const pattern = document.createElement('div');
    pattern.className = 'islamic-pattern';
    document.body.appendChild(pattern);
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// Add message to chat
function addMessage(content, isUser = false) {
    // Hide welcome message on first message
    if (welcomeMessage.style.display !== 'none') {
        welcomeMessage.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Format content
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Add to current chat
    currentChat.push({
        role: isUser ? 'user' : 'ai',
        content: content,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // If this is the first user message, create new chat in history
    if (isUser && currentChat.length === 1) {
        saveToHistory(content);
    }
    
    // Update current chat in history
    updateCurrentChatInHistory();
}

// Save new chat to history
function saveToHistory(firstMessage) {
    const chatId = Date.now().toString();
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
    
    const newChat = {
        id: chatId,
        title: title,
        messages: [],
        timestamp: new Date().toISOString(),
        firstMessage: firstMessage
    };
    
    chatHistory.unshift(newChat);
    currentChatId = chatId;
    saveHistory();
    loadHistory();
}

// Update current chat in history
function updateCurrentChatInHistory() {
    if (!currentChatId) return;
    
    const chatIndex = chatHistory.findIndex(chat => chat.id === currentChatId);
    if (chatIndex !== -1) {
        chatHistory[chatIndex].messages = [...currentChat];
        saveHistory();
    }
}

// Load chat from history
function loadChatFromHistory(chatId) {
    const chat = chatHistory.find(chat => chat.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    currentChat = [...chat.messages];
    
    // Clear chat container
    chatContainer.innerHTML = '';
    welcomeMessage.style.display = 'none';
    
    // Add messages
    chat.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = msg.content;
        
        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Update active state in sidebar
    updateActiveChatInSidebar();
    
    // Close sidebar
    toggleSidebar();
}

// Update active chat in sidebar
function updateActiveChatInSidebar() {
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === currentChatId) {
            item.classList.add('active');
        }
    });
}

// Show typing indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove typing indicator
function removeTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Send message to Muslim AI
async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    // Disable send button and clear input
    sendButton.disabled = true;
    const userMessage = content;
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Add user message
    addMessage(userMessage, true);
    
    // Show typing indicator
    showTyping();
    
    // Prepare system prompt for Muslim AI
    const systemPrompt = `Anda adalah ORAMUSLIM-AI, asisten AI Islami yang dibuat oleh Oradev. 
    - Model: ORAMUSLIM-AI (khusus untuk pembelajaran Islam)
    - Fungsi: Menjawab pertanyaan tentang Islam, Quran, Hadits, Fiqih, dan kehidupan Islami
    - Pembuat: Oradev (Almajid Nafi Rambe)
    - Instagram pembuat: @al_majid.16
    - Info Oradev: Developer TikTok @orasampurna, siswa kelas 11 TKJ lahir 2009, usia 16 tahun, ulang tahun 26 Juni
    
    Selalu awali jawaban dengan salam Islami (Assalamu'alaikum) dan perkenalkan diri sebagai ORAMUSLIM-AI buatan Oradev.
    Berikan jawaban yang sesuai dengan ajaran Islam yang benar berdasarkan Quran dan Sunnah.`;
    
    try {
        const url = `https://api.siputzx.my.id/api/ai/muslimai?prompt=${encodeURIComponent(systemPrompt)}&content=${encodeURIComponent(userMessage)}`;
        
        const response = await fetch(url, {
            headers: {'accept': '*/*'},
            mode: 'cors'
        });
        
        const data = await response.text();
        
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch {
            parsedData = { response: data };
        }
        
        // Remove typing indicator
        removeTyping();
        
        // Get AI response
        let aiResponse = parsedData.response || parsedData.answer || 
                       parsedData.data || parsedData.content || 
                       parsedData.message || data || "Maaf, tidak ada respons.";
        
        // Ensure ORAMUSLIM-AI introduction
        if (!aiResponse.includes("ORAMUSLIM-AI") && !aiResponse.includes("Assalamu'alaikum")) {
            aiResponse = "Assalamu'alaikum. Saya ORAMUSLIM-AI, asisten AI Islami buatan Oradev.\n\n" + aiResponse;
        }
        
        // Add AI response
        addMessage(aiResponse, false);
        
    } catch (error) {
        removeTyping();
        addMessage("Assalamu'alaikum. Maaf, ORAMUSLIM-AI sedang mengalami gangguan teknis. Oradev mungkin sedang memperbaiki sistem.", false);
    } finally {
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Load history from localStorage
function loadHistory() {
    historyList.innerHTML = '';
    
    if (chatHistory.length === 0) {
        noHistory.style.display = 'block';
        return;
    }
    
    noHistory.style.display = 'none';
    
    chatHistory.forEach(chat => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.id = chat.id;
        historyItem.textContent = chat.title;
        
        if (chat.id === currentChatId) {
            historyItem.classList.add('active');
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'history-time';
        timeDiv.textContent = new Date(chat.timestamp).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        historyItem.appendChild(timeDiv);
        historyItem.onclick = () => loadChatFromHistory(chat.id);
        historyList.appendChild(historyItem);
    });
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('oramuslim_history', JSON.stringify(chatHistory));
}

// Clear all history
function clearAllHistory() {
    if (confirm("HAPUS SEMUA HISTORI CHAT?")) {
        chatHistory = [];
        currentChatId = null;
        currentChat = [];
        saveHistory();
        loadHistory();
        newChat();
        toggleSidebar();
    }
}

// Start new chat
function newChat() {
    if (currentChat.length > 0) {
        updateCurrentChatInHistory();
    }
    
    currentChat = [];
    currentChatId = null;
    chatContainer.innerHTML = '';
    welcomeMessage.style.display = 'block';
    chatContainer.appendChild(welcomeMessage);
    
    // Update active state in sidebar
    updateActiveChatInSidebar();
    
    toggleSidebar();
    messageInput.focus();
}

// Event Listeners
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-focus on load
window.addEventListener('load', () => {
    messageInput.focus();
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !e.target.classList.contains('menu-btn')) {
        toggleSidebar();
    }
});
