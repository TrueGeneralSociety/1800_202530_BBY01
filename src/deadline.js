import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth } from "/src/firebase.js";
import { updateProfile, updateCurrentUser } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// DOM elements
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const user = auth.currentUser;
  const title = document.getElementById("title").value;

  if (user) {
    const userDocRef = doc(collection(db, "deadlines"), user.uid);
    await setDoc(
      userDocRef,
      {
        title: title,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    alert("Deadline saved successfully!");
  } else {
    alert("No user is signed in.");
  }
});
