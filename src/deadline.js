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
});
