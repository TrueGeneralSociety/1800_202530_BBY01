// chat.js
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const db = getFirestore();

  const input = document.querySelector(".msg-bottom input");
  const sendBtn = document.querySelector(".send-icon");
  const msgPage = document.querySelector(".msg-page");

  // TODO: Set this to the person you're chatting with
  const otherUserId = "Emma"; 

  // ========== AUTH CHECK ==========
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Please log in.");
      window.location.href = "../login.html";
      return;
    }

    document.getElementById("user_name").innerText = otherUserId;

    startChat(user.uid);
  });

  // ========== START CHAT ==========
  function startChat(currentUserId) {
    const messagesRef = collection(db, "messages");

    // Real-time listener for messages between A and B
    const q = query(
      messagesRef,
      where("participants", "array-contains", currentUserId),
      orderBy("timestamp", "asc")
    );

    onSnapshot(q, (snapshot) => {
      msgPage.innerHTML = ""; // clear page

      snapshot.forEach((doc) => {
        const msg = doc.data();
        displayMessage(msg, currentUserId);
      });

      msgPage.scrollTop = msgPage.scrollHeight;
    });

    // Send message
    sendBtn.addEventListener("click", () => sendMessage(currentUserId));
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage(currentUserId);
    });
  }

  // ========== SEND MESSAGE ==========
  async function sendMessage(currentUserId) {
    const text = input.value.trim();
    if (!text) return;

    await addDoc(collection(db, "messages"), {
      text: text,
      from: currentUserId,
      to: otherUserId,
      participants: [currentUserId, otherUserId],
      timestamp: serverTimestamp(),
    });

    input.value = "";
  }

  // ========== DISPLAY MESSAGE ==========
  function displayMessage(msg, currentUserId) {
    const isMe = msg.from === currentUserId;

    const wrapper = document.createElement("div");
    wrapper.classList.add(isMe ? "outgoing-chats" : "received-chats");

    wrapper.innerHTML = isMe
      ? `
      <div class="outgoing-chats-img">
        <img src="user1.png">
      </div>
      <div class="outgoing-msg">
        <div class="outgoing-chats-msg">
          <p>${msg.text}</p>
        </div>
      </div>
    `
      : `
      <div class="received-chats-img">
        <img src="user2.png">
      </div>
      <div class="received-msg">
        <div class="received-msg-inbox">
          <p>${msg.text}</p>
        </div>
      </div>
    `;

    msgPage.appendChild(wrapper);
  }
});
