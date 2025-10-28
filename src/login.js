// src/loginPage.js
// This script controls the login.html page

import { loginUser, signupUser, authErrorMessage } from "./authentification.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// --- Get HTML Elements ---
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginBtn = document.querySelector("#loginBtn");
const registerBtn = document.querySelector("#registerBtn");

// --- Add Login Event ---
loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await loginUser(emailInput.value, passwordInput.value);
    alert("Login successful!");
    // Redirect to your main app page (assuming it's main.html)
    window.location.href = "main.html";
  } catch (error) {
    // Use the helpful error message function!
    alert(authErrorMessage(error));
  }
});

// --- Add Register Event ---
registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!nameInput.value) {
    alert("Please enter a name to register.");
    return;
  }

  try {
    await signupUser(nameInput.value, emailInput.value, passwordInput.value);
    alert("Account created successfully!");
    // Redirect to your main app page
    window.location.href = "main.html";
  } catch (error) {
    // Use the helpful error message function!
    alert(authErrorMessage(error));
  }
});
