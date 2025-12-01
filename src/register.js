// Import Firebase auth from your firebase.js
import { auth } from "/src/firebase.js"; // adjust the path to firebase.js
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// DOM elements
const signup = document.getElementById("registerBtn");

signup.addEventListener("click", async (event) => {
  event.preventDefault();

  // Inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set display name
    await updateProfile(user, { displayName: username });

    alert("Account created successfully!");
    window.location.href = "/html/login.html"; // redirect to login page
  } catch (error) {
    alert(error.message);
  }
});

const logoLink = document.querySelector('.logo-link');

if (logoLink) {
  logoLink.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default <a> behavior
    window.location.href = '/index.html'; // go to homepage
  });
}

