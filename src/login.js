import { auth } from "/src/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

// DOM elements
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    window.location.href = "/html/main.html";
  } catch (error) {
    alert(error.message);
  }
});
