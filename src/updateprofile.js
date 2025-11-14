import { db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

function fetchUserProfile(user) {
  async function fetchAndDisplayData() {
    try {
      // Direct reference to document using user.uid
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("No data found for this user");
        return;
      }

      const data = docSnap.data();

      document.getElementById("profileName").textContent = data.name || "";
      document.getElementById("profileEmail").textContent = data.email || "";
      document.getElementById("profileSchool").textContent = data.school || "";
      document.getElementById("profileMajor").textContent = data.major || "";
      document.getElementById("profileCourse").textContent =
        data.registeredcourses || "";
    } catch (error) {
      console.error("Error updating information:", error);
    }
  }

  fetchAndDisplayData();
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    fetchUserProfile(user);
  } else {
    console.log("No user logged in");
  }
});
