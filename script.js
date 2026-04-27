import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// TODO: Replace with YOUR Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DM CONFIGURATION: Define the pairs here (Group 1 <-> Group 2)
// Use all lowercase letters for the keys to make logging in easier for players
const characterPairs = {
    "elara": "thorin",
    "thorin": "elara",
    "jaskier": "grog",
    "grog": "jaskier",
    "lyra": "caleb",
    "caleb": "lyra"
};

// Logic Elements
const loginBtn = document.getElementById('login-btn');
const sendBtn = document.getElementById('send-btn');
const userIdInput = document.getElementById('user-id');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');

let currentUserId = "";
let partnerId = "";
let roomId = "";

loginBtn.onclick = () => {
    // Convert input to lowercase to check the dictionary safely
    const inputName = userIdInput.value.trim().toLowerCase();

    if (!inputName) return alert("Please enter a name.");
    
    // Check if the name exists in your DM dictionary
    if (!characterPairs[inputName]) {
        return alert("Terminal error: Name not found in the manifest.");
    }

    // Assign names based on the dictionary
    currentUserId = userIdInput.value.trim(); // Keeps their original capitalization for display
    partnerId = characterPairs[inputName];
    
    // Create a unique Room ID by sorting the two names alphabetically
    roomId = [inputName, partnerId.toLowerCase()].sort().join("_");

    // UI Toggle
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'block';
    
    // Capitalize the first letter of the partner's name for display
    const displayPartnerName = partnerId.charAt(0).toUpperCase() + partnerId.slice(1);
    
    document.getElementById('display-name').innerText = currentUserId;
    document.getElementById('partner-name').innerText = displayPartnerName;

    loadMessages();
};

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
    // Check if the sender matches the current user (case-insensitive to be safe)
    if (sender.toLowerCase() === currentUserId.toLowerCase()) {
        div.classList.add('me');
    } else {
        div.classList.add('them');
    }
    div.innerText = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.onclick = () => {
    const text = messageInput.value;
    if (!text) return;

    push(ref(db, `chats/${roomId}`), {
        sender: currentUserId,
        text: text,
        timestamp: serverTimestamp()
    });

    messageInput.value = "";
};

// Allow pressing "Enter" to send a message
messageInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendBtn.click();
  }
});
