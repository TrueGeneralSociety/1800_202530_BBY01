// editprofile.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "/src/js/firebase";

// -----------------------------
// Wait for authentication first
// -----------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Populate profile form with current data
    await populateUserInfo(user.uid);

    // Enable editing when clicking Edit
    document.querySelector("#editButton").addEventListener("click", () => {
      document.getElementById("personalInfo").disabled = false;
    });

    // Save changes when clicking Save
    document
      .querySelector("#saveButton")
      .addEventListener("click", async () => {
        await saveUserInfo(user.uid);
      });
  } else {
    alert("Please log in first!");
    window.location.href = "/src/html/login.html"; // Redirect to login
  }
});

// -----------------------------
// Populate user info from Firestore
// -----------------------------
async function populateUserInfo(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      document.getElementById("nameInput").value = data.name || "";
      document.getElementById("emailInput").value = data.email || "";
      document.getElementById("schoolInput").value = data.school || "";
      document.getElementById("majorInput").value = data.major || "";
      document.getElementById("courseInput").value =
        data.registeredcourses || "";
    } else {
      console.log("No user document found. Fields will be empty.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Failed to load profile data.");
  }
}

// -----------------------------
// Save updated user info to Firestore
// -----------------------------
async function saveUserInfo(uid) {
  // Get values from form
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const school = document.getElementById("schoolInput").value;
  const major = document.getElementById("majorInput").value;
  const registeredcourses = document.getElementById("courseInput").value;

  try {
    // Update Firestore
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      {
        name,
        email,
        school,
        major,
        registeredcourses,
      },
      { merge: true }
    );

    alert("Profile saved successfully!");
    document.getElementById("personalInfo").disabled = true;
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to save profile. Check console for details.");
  }
}
// editprofile.js
const saveBtn = document.getElementById('saveButton');

if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    // Profile.html
    window.location.href = '/src/html/Profile.html'; 
  });
}