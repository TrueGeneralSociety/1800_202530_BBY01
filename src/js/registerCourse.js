import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { auth, db } from "/src/js/firebase.js";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("confirm-btn");
  const courseName = document.getElementById("course-name");
  const courseCode = document.getElementById("course-code");
});

// Register a new course
async function registerCourse() {
  const courseNameValue = courseName.value.trim();
  const courseCodeValue = courseCode.value.trim();

  if (!courseNameValue || !courseCodeValue) {
    alert("Please fill in all fields.");
    return;
  }
  try {
    const courseRef = doc(db, "courses", courseCodeValue);
    await setDoc(courseRef, {
      name: courseNameValue,
      code: courseCodeValue,
      createdAt: new Date().toISOString(),
    });

    alert(`Course "${courseNameValue}" registered successfully.`);
    courseName.value = "";
    courseCode.value = "";
  } catch (error) {
    console.error("Error registering course:", error);
    alert("Failed to register course. Check console for details.");
  }
}
