import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCVhuOYpQ_3U5GO16P7XWHuR_SuTyUAYwc",
  authDomain: "twoway-34b26.firebaseapp.com",
  databaseURL: "https://twoway-34b26-default-rtdb.firebaseio.com",
  projectId: "twoway-34b26",
  storageBucket: "twoway-34b26.firebasestorage.app",
  messagingSenderId: "324614179982",
  appId: "1:324614179982:web:1400f9a68376b11ef50ddf",
  measurementId: "G-7FVXKLCGKC"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- FACTION & LORE CONFIGURATION ---
// Using Sets for faster O(1) lookups instead of Arrays
const teamAzure = new Set(["azure_seeker", "weaveshaper_seeker", "fabled_seeker", "typed_seeker", "faded_seeker", "mneme_seeker"]); 
const teamAmber = new Set(["amber_seeker", "old_seeker", "prince_seeker", "written_seeker", "dual_seeker", "mirror_seeker"]);

const characterPairs = {
    "amber_seeker": "azure_seeker", "azure_seeker": "amber_seeker",
    "old_seeker": "weaveshaper_seeker", "weaveshaper_seeker": "old_seeker",
    "prince_seeker": "fabled_seeker", "fabled_seeker": "prince_seeker",
    "written_seeker": "typed_seeker", "typed_seeker": "written_seeker",
    "dual_seeker": "faded_seeker", "faded_seeker": "dual_seeker",
    "mirror_seeker": "mneme_seeker", "mneme_seeker": "mirror_seeker" 
};

// --- UI ELEMENTS CACHE ---
const elements = {
    loginBtn: document.getElementById('login-btn'),
    sendBtn: document.getElementById('send-btn'),
    userIdInput: document.getElementById('user-id'),
    messageInput: document.getElementById('message-input'),
    messagesDiv: document.getElementById('messages'),
    authContainer: document.getElementById('auth-container'),
    chatContainer: document.getElementById('chat-container'),
    azureNameDisplay: document.querySelector('.azure-header .char-name'),
    amberNameDisplay: document.querySelector('.amber-header .char-name')
};

// --- SESSION STATE ---
const currentSession = {
    userId: "",
    partnerId: "",
    roomId: ""
};

// --- UTILITY FUNCTIONS ---
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const getFactionClass = (userId) => teamAzure.has(userId) ? 'azure-msg' : 'amber-msg';

// --- CORE LOGIC ---
const initChat = () => {
    const inputName = elements.userIdInput.value.trim().toLowerCase();

    if (!inputName) return alert("System Error: Identity required to puncture reality.");
    if (!characterPairs[inputName]) return alert("System Error: Character signature not found in the manifest.");

    // Assign identities and room
    currentSession.userId = inputName; 
    currentSession.partnerId = characterPairs[inputName];
    currentSession.roomId = [inputName, currentSession.partnerId].sort().join("_");

    // UI Toggle
    elements.authContainer.style.display = 'none';
    elements.chatContainer.style.display = 'flex';

    // Set Headers dynamically based on faction
    const isAzure = teamAzure.has(inputName);
    elements.azureNameDisplay.innerText = capitalize(isAzure ? inputName : currentSession.partnerId);
    elements.amberNameDisplay.innerText = capitalize(isAzure ? currentSession.partnerId : inputName);

    loadMessages();
};

const loadMessages = () => {
    const chatRef = ref(db, `chats/${currentSession.roomId}`);
    onChildAdded(chatRef, (snapshot) => {
        const { sender, text } = snapshot.val();
        displayMessage(sender, text);
    });
};

const displayMessage = (sender, text) => {
    const div = document.createElement('div');
    
    // Apply general message class and faction-specific styling
    div.classList.add('message', getFactionClass(sender.toLowerCase()));
    div.innerText = text;
    
    elements.messagesDiv.appendChild(div);
    elements.messagesDiv.scrollTop = elements.messagesDiv.scrollHeight;
};

const sendMessage = () => {
    const text = elements.messageInput.value.trim();
    if (!text) return; 

    push(ref(db, `chats/${currentSession.roomId}`), {
        sender: currentSession.userId,
        text: text,
        timestamp: serverTimestamp()
    });

    elements.messageInput.value = ""; 
};

// --- EVENT LISTENERS ---
elements.loginBtn.addEventListener('click', initChat);
elements.sendBtn.addEventListener('click', sendMessage);

elements.messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
