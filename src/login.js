import { auth } from "/src/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!loginBtn || !emailInput || !passwordInput) return;

  // 🔹 Auto-redirect if user is already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "/html/main.html"; // already logged in
    }
  });

  // 🔹 Login form handler
  loginBtn.addEventListener("click", async (event) => {
    event.preventDefault(); // prevent form submission

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/html/main.html";
    } catch (error) {
      alert(error.message);
    }
  });
});
