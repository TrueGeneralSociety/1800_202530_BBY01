// src/register.js
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const db = getFirerestore();
// Wait until DOM is loaded (optional but safer)
document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.querySelector("#registerBtn");
  const usernameInput = document.querySelector("#username");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  registerBtn.addEventListener("click", async () => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        email: email,
      });
      alert(`Welcome, ${username}! Account created successfully.`);
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message);
    }
  });
});
