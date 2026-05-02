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
// Define which characters belong to which reality (use all lowercase)
// Example: Adding "new_seeker" to Azure and "shadow_seeker" to Amber
const teamAzure = ["azure_seeker","weaveshaper_seeker", "fabled_seeker", "typed_seeker", "faded_seeker", "mneme_seeker"]; 
const teamAmber = ["amber_seeker","old_seeker", "prince_seeker", "written_seeker", "dual_seeker", "mirror_seeker"];

// Define the 1-on-1 connections across the rift
const characterPairs = {
    "amber_seeker": "azure_seeker",
    "azure_seeker": "amber_seeker",
  
    "old_seeker": "weaveshaper_seeker",
    "weaveshaper_seeker": "old_seeker",
  
    "prince_seeker": "fabled_seeker",
    "fabled_seeker": "prince_seeker",
  
    "written_seeker": "typed_seeker",
    "typed_seeker": "written_seeker",
    
    "dual_seeker": "faded_seeker",
    "faded_seeker": "dual_seeker" 

    "mirror_seeker": "mneme_seeker",
    "mneme_seeker": "mirror_seeker" 
};

// --- UI ELEMENTS ---
const loginBtn = document.getElementById('login-btn');
const sendBtn = document.getElementById('send-btn');
const userIdInput = document.getElementById('user-id');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');

let currentUserId = "";
let partnerId = "";
let roomId = "";

// --- LOGIN LOGIC ---
loginBtn.onclick = () => {
    const inputName = userIdInput.value.trim().toLowerCase();

    if (!inputName) return alert("System Error: Identity required to puncture reality.");
    if (!characterPairs[inputName]) return alert("System Error: Character signature not found in the manifest.");

    // Assign identities
    currentUserId = inputName; 
    partnerId = characterPairs[inputName];
    
    // Create unique Room ID by sorting alphabetically so both players share the same database path
    roomId = [currentUserId, partnerId].sort().join("_");

    // UI Toggle: Hide login, show the rift
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';

    // Format names for the display headers (Capitalizes the first letter)
    const displayUser = currentUserId.charAt(0).toUpperCase() + currentUserId.slice(1);
    const displayPartner = partnerId.charAt(0).toUpperCase() + partnerId.slice(1);

    // Lock the names to the correct dimension in the headers!
    const azureNameDisplay = document.querySelector('.azure-header .char-name');
    const amberNameDisplay = document.querySelector('.amber-header .char-name');

    if (teamAzure.includes(currentUserId)) {
        azureNameDisplay.innerText = displayUser;
        amberNameDisplay.innerText = displayPartner;
    } else {
        azureNameDisplay.innerText = displayPartner;
        amberNameDisplay.innerText = displayUser;
    }

    loadMessages();
};

// --- MESSAGE RENDERING LOGIC ---
function loadMessages() {
    const chatRef = ref(db, `chats/${roomId}`);
    onChildAdded(chatRef, (snapshot) => {
        const data = snapshot.val();
        displayMessage(data.sender, data.text);
    });
}

function displayMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    const lowerSender = sender.toLowerCase();

    // Route the message styles based entirely on FACTION
    if (teamAzure.includes(lowerSender)) {
        div.classList.add('azure-msg');
    } else if (teamAmber.includes(lowerSender)) {
        div.classList.add('amber-msg');
    } else {
        div.classList.add('amber-msg'); // Fallback failsafe
    }
    
    div.innerText = text;
    messagesDiv.appendChild(div);
    
    // Auto-scroll to bottom as new messages manifest
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- SENDING LOGIC ---
sendBtn.onclick = () => {
    const text = messageInput.value.trim();
    if (!text) return; // Prevent sending empty voids

    push(ref(db, `chats/${roomId}`), {
        sender: currentUserId,
        text: text,
        timestamp: serverTimestamp()
    });

    messageInput.value = ""; // Clear input after projecting
};

// Allow pressing "Enter" to transmit
messageInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendBtn.click();
  }
});
