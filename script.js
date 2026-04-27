import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your exact Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DM CONFIGURATION: Define the pairs here (Group 1 <-> Group 2)
// Use all lowercase letters for the keys
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
    
    // Check if the sender matches the current user
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
