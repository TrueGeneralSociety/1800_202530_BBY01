import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

export { auth };
