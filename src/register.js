// Import the functions you need from the SDKs you need
import { eventListeners } from "@popperjs/core";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzBAo2PgeO5ZGjTHhZ335U0F0tryPCJbE",
  authDomain: "bby01-7d3e8.firebaseapp.com",
  projectId: "bby01-7d3e8",
  storageBucket: "bby01-7d3e8.firebasestorage.app",
  messagingSenderId: "709025938649",
  appId: "1:709025938649:web:569f14030351ac6ec652c8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//submit button
const login = document.getElementById("loginBtn");
const signup = document.getElementById("registerBtn");

signup.addEventListener("click", function (event) {
  event.preventDefault();
  //inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;
  createUserWithEmailAndPassword(auth, email, password, username)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      alert("Creating account...");
      window.location.href = "login.html";
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
});
