import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Firebase config (same as in login.js)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Wait for the auth state to load
onAuthStateChanged(auth, (user) => {
  const nameElement = document.getElementById("userName");

  if (user) {
    // If the user has a displayName, show it; otherwise, show their email
    const nameToShow = user.displayName || user.email;
    nameElement.textContent = nameToShow;
  } else {
    // If no user is logged in, send them back to login page
    window.location.href = "/html/login/login.html";
  }
});
