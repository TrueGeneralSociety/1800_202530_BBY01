import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { auth, db } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.querySelector(".list-item");
  const addDeadlineBtn = document.getElementById("add-deadline-btn");
  const backBtn = document.getElementById("backButton");

  if (!listContainer) {
    console.error("Deadline list container not found in DOM");
    return;
  }

  // URL params
  const params = new URLSearchParams(window.location.search);
  const school = params.get("school");
  const program = params.get("program");
  const term = params.get("term");
  const channel = params.get("channel");
  const courseName = params.get("course");

  if (!school || !program || !term || !channel || !courseName) {
    alert("Missing channel/course information in URL");
    return;
  }

  // Go Back button
  if (backBtn) {
    const backQuery = new URLSearchParams({
      school,
      program,
      term,
      channel,
    }).toString();
    backBtn.href = `${window.location.origin}/html/channel.html?${backQuery}`;
  }

  // Soft delete + remove from user's map
  async function deleteDeadline(deadlineId, user) {
    if (!confirm(`Are you sure you want to delete this deadline?`)) return;

    try {
      const deadlineRef = doc(
        db,
        "schools",
        school,
        "programs",
        program,
        "terms",
        term,
        "channels",
        channel,
        "courses",
        courseName,
        "deadlines",
        deadlineId
      );

      // Mark deleted
      await setDoc(
        deadlineRef,
        { isDeleted: true, deletedAt: new Date().toISOString() },
        { merge: true }
      );

      // Remove from user's deadlines
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const userCourseData = userData.courses?.[courseName] || {};

      if (userCourseData.deadlines?.[deadlineId]) {
        const updatedDeadlines = { ...userCourseData.deadlines };
        delete updatedDeadlines[deadlineId];

        await setDoc(
          userRef,
          {
            courses: {
              [courseName]: {
                ...userCourseData,
                deadlines: updatedDeadlines,
              },
            },
          },
          { merge: true }
        );
      }

      alert("Deadline deleted successfully.");
    } catch (err) {
      console.error("Error deleting deadline:", err);
      alert("Failed to delete deadline.");
    }
  }

  // Load deadlines + sync to user DB
  async function loadAndSyncDeadlines(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const userCourses = userData.courses || {};
    const userCourseData = userCourses[courseName] || {};

    const deadlinesRef = collection(
      db,
      "schools",
      school,
      "programs",
      program,
      "terms",
      term,
      "channels",
      channel,
      "courses",
      courseName,
      "deadlines"
    );

    // Fetch once for sync
    const deadlineSnap = await getDocs(deadlinesRef);
    const newDeadlines = {};

    deadlineSnap.forEach((docSnap) => {
      const dId = docSnap.id;
      const data = docSnap.data();
      if (data.isDeleted) return;
      if (!userCourseData.deadlines?.[dId]) {
        newDeadlines[dId] = true;
      }
    });

    if (Object.keys(newDeadlines).length > 0) {
      await setDoc(
        userRef,
        {
          courses: {
            [courseName]: {
              ...userCourseData,
              deadlines: {
                ...userCourseData.deadlines,
                ...newDeadlines,
              },
            },
          },
        },
        { merge: true }
      );
      console.log("Synced user deadlines:", newDeadlines);
    }

    // Real-time rendering
    onSnapshot(deadlinesRef, (snapshot) => {
      listContainer.innerHTML = "";

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isDeleted) return;

        const li = document.createElement("li");
        li.className = "list-box";

        const taskSpan = document.createElement("span");
        taskSpan.textContent = `${data.taskName} - ${new Date(
          data.deadlineDateTime
        ).toLocaleString()}`;
        li.appendChild(taskSpan);

        if (data.notes) {
          const note = document.createElement("small");
          note.textContent = ` (${data.notes})`;
          note.className = "text-muted ms-1";
          li.appendChild(note);
        }

        const deleteBtn = document.createElement("button");
        const icon = document.createElement("i");
        icon.className = "material-icons";
        icon.textContent = "delete";
        deleteBtn.classList.add("border-0", "shadow-none");
        deleteBtn.appendChild(icon);
        deleteBtn.onclick = async (e) => {
          e.stopPropagation();
          await deleteDeadline(docSnap.id, user);
          li.remove();
        };

        li.appendChild(deleteBtn);
        listContainer.appendChild(li);
      });

      if (listContainer.children.length === 0) {
        listContainer.innerHTML =
          "<li>No deadlines found for this course.</li>";
      }
    });
  }

  // Auth listener
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/index.html";
      return;
    }
    loadAndSyncDeadlines(user);
  });

  // Add deadline button redirects to addDeadline page
  if (addDeadlineBtn) {
    addDeadlineBtn.onclick = () => {
      const paramsStr = new URLSearchParams({
        school,
        program,
        term,
        channel,
        course: courseName,
      }).toString();

      window.location.href = `/html/addDeadline.html?${paramsStr}`;
    };
  }
});
