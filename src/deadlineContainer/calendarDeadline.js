import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { auth, db } from "../firebase.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.querySelector(".list-item");
  const addDeadlineBtn = document.getElementById("add-deadline-btn");

  if (!listContainer) return console.error("Deadline list container not found");

  const params = new URLSearchParams(window.location.search);
  const school = params.get("school");
  const program = params.get("program");
  const term = params.get("term");
  const channel = params.get("channel");
  const courseName = params.get("course");

  if (!school || !program || !term || !channel || !courseName) {
    alert("Missing course/channel info in URL");
    return;
  }

  // Soft delete
  async function deleteDeadline(deadlineId) {
    if (!confirm("Delete this deadline?")) return;
    const deadlineRef = doc(
      db,
      "schools", school,
      "programs", program,
      "terms", term,
      "channels", channel,
      "courses", courseName,
      "deadlines", deadlineId
    );

    try {
      await setDoc(deadlineRef, { isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error(err);
      alert("Failed to delete deadline");
    }
  }

  async function loadAndSyncDeadlines(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const userCourseData = userData.courses?.[courseName] || {};

    const deadlinesRef = collection(
      db,
      "schools", school,
      "programs", program,
      "terms", term,
      "channels", channel,
      "courses", courseName,
      "deadlines"
    );

    // Fetch once for sync
    const snapshot = await getDoc(deadlinesRef);
    const deadlineSnap = await getDoc(deadlinesRef);
    const newDeadlines = {};

    const deadlineDocs = await getDocs(deadlinesRef);
    deadlineDocs.forEach(docSnap => {
      if (docSnap.data().isDeleted) return;
      if (!userCourseData.deadlines?.[docSnap.id]) newDeadlines[docSnap.id] = true;
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
    }

    // Real-time listener
    onSnapshot(deadlinesRef, snapshot => {
      listContainer.innerHTML = "";
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.isDeleted) return;

        const li = document.createElement("li");
        li.className = "list-box";

        const taskSpan = document.createElement("span");
        taskSpan.textContent = `${data.taskName} - ${new Date(data.deadlineDateTime).toLocaleString()}`;
        li.appendChild(taskSpan);

        if (data.notes) {
          const note = document.createElement("small");
          note.textContent = ` (${data.notes})`;
          note.className = "text-muted ms-1";
          li.appendChild(note);
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        deleteBtn.className = "btn btn-sm btn-danger ms-2";
        deleteBtn.onclick = async e => {
          e.stopPropagation();
          await deleteDeadline(docSnap.id);
          li.remove();
        };

        li.appendChild(deleteBtn);
        listContainer.appendChild(li);
      });

      if (!listContainer.children.length) listContainer.innerHTML = "<li>No deadlines</li>";
    });
  }

  onAuthStateChanged(auth, user => {
    if (!user) return window.location.href = "/index.html";
    loadAndSyncDeadlines(user);
  });

  if (addDeadlineBtn) {
    addDeadlineBtn.onclick = () => {
      const paramsStr = new URLSearchParams({
        school, program, term, channel, course: courseName
      }).toString();
      window.location.href = `/html/addDeadline.html?${paramsStr}`;
    };
  }
});
