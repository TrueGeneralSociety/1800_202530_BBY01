import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { auth, db } from "/src/js/firebase.js";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.querySelector(".list-item");
  const addCourseBtn = document.getElementById("add-course-btn");

  if (!listContainer) {
    console.error("Course list container not found in DOM");
    return;
  }

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  const schoolName = urlParams.get("school");
  const programName = urlParams.get("program");
  const termName = urlParams.get("term");
  const channelName = urlParams.get("channel");

  if (!schoolName || !programName || !termName || !channelName) {
    alert("Missing channel information in URL");
    return;
  }

  const channelKey = `${schoolName}-${programName}-${termName}-${channelName}`;

  // Soft delete a course
  async function deleteCourse(courseName) {
    if (
      !confirm(
        `Are you sure you want to delete "${courseName}"? It will be hidden but data is kept.`
      )
    )
      return;

    try {
      const courseRef = doc(
        db,
        "schools",
        schoolName,
        "programs",
        programName,
        "terms",
        termName,
        "channels",
        channelName,
        "courses",
        courseName
      );

      await setDoc(
        courseRef,
        { isDeleted: true, deletedAt: new Date().toISOString() },
        { merge: true }
      );

      // Also remove from user's courses map
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() || {};
        const updatedCourses = { ...(userData.courses || {}) };

        for (const [courseKey, courseData] of Object.entries(updatedCourses)) {
          if (
            courseData.channelKey === channelKey &&
            courseKey === courseName
          ) {
            updatedCourses[courseKey] = {
              ...updatedCourses[courseKey],
              isDeleted: true,
            };
          }
        }

        await setDoc(userRef, { courses: updatedCourses }, { merge: true });
      }

      alert(`"${courseName}" hidden successfully.`);
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to hide course. Check console.");
    }
  }

  // Load courses and sync to user profile
  async function loadCourses(user) {
    listContainer.innerHTML = "";
    const coursesRef = collection(
      db,
      "schools",
      schoolName,
      "programs",
      programName,
      "terms",
      termName,
      "channels",
      channelName,
      "courses"
    );

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const updatedCourses = { ...(userData.courses || {}) };
    const updatedChannels = {
      ...(userData.channels || {}),
      [channelKey]: true,
    };
    let needsUpdate = false;

    onSnapshot(coursesRef, async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const courseName = change.doc.id;
        const courseData = change.doc.data();
        const liId = `course-${courseName}`;

        // Sync course into user profile
        if (!courseData.isDeleted && !updatedCourses[courseName]) {
          updatedCourses[courseName] = {
            school: schoolName,
            program: programName,
            term: termName,
            channel: channelName,
            channelKey,
            addedAt: courseData.createdAt || new Date().toISOString(),
          };
          needsUpdate = true;
        }

        // UI: add or update course
        if (
          (change.type === "added" || change.type === "modified") &&
          !courseData.isDeleted
        ) {
          if (!document.getElementById(liId)) {
            const li = document.createElement("li");
            li.className = "list-box";
            li.id = liId;
            li.style.cursor = "default";

            li.onclick = () => {
              window.location.href = `/src/html/course.html?school=${encodeURIComponent(
                schoolName
              )}&program=${encodeURIComponent(
                programName
              )}&term=${encodeURIComponent(
                termName
              )}&channel=${encodeURIComponent(
                channelName
              )}&course=${encodeURIComponent(courseName)}`;
            };

            const innerContainer = document.createElement("div");
            innerContainer.className =
              "d-flex justify-content-between align-items-center w-100";

            const nameSpan = document.createElement("span");
            nameSpan.textContent = courseName;

            const deleteBtn = document.createElement("button");

            // Use the <i> tag with the required classes and icon name
            deleteBtn.innerHTML = '<i class="material-icons">delete</i>';
            deleteBtn.classList.add("border-0", "shadow-none");
            innerContainer.appendChild(nameSpan);
            innerContainer.appendChild(deleteBtn);
            deleteBtn.onclick = async (e) => {
              e.stopPropagation();
              await deleteCourse(courseName);
              li.remove();
            };

            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            listContainer.appendChild(li);
          }
        }

        // Remove deleted courses from UI
        if (courseData.isDeleted && document.getElementById(liId)) {
          document.getElementById(liId).remove();
        }
      });

      // Update user profile if new courses added
      if (needsUpdate) {
        await setDoc(
          userRef,
          { courses: updatedCourses, channels: updatedChannels },
          { merge: true }
        );
        needsUpdate = false;
      }

      // Placeholder if no courses
      if (listContainer.children.length === 0) {
        listContainer.innerHTML =
          "<li>No courses found in this channel. Add a new one!</li>";
      }
    });
  }

  // Auth listener
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/index.html";
      return;
    }

    loadCourses(user);
  });

  // Add course button
  if (addCourseBtn) {
    addCourseBtn.onclick = () => {
      window.location.href = `/src/html/addcourse.html?school=${encodeURIComponent(
        schoolName
      )}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(
        termName
      )}&channel=${encodeURIComponent(channelName)}`;
    };
  }

  const backbtn = document.getElementById('backBtn');
  if (backbtn) {
    backbtn.onclick = () => {
      window.location.href = "main.html";
    }
  }

});
