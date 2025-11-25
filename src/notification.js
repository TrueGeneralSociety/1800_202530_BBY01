import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { auth, db } from "./firebase.js";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Helper: create HTML for each notification
function createDeadlineCard(courseName, title, relative, dateText) {
  return `
        <div class="notification-list notification-list--unread">
            <div class="notification-list_content">
                <div class="status-bar ${relative.status}"></div>
            </div>
            <div class="notification-list_detail">
                <p><b>${courseName}</b> ${title}</p>
                <p class="text-muted ${relative.status}">${relative.text}</p>
                <p class="text-muted"><small>${dateText}</small></p>
            </div>
        </div>
    `;
}

// Helper: calculate relative time to today
function calculateRelativeTime(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return { text: "due today", status: "due-today" };
  if (diff === 1) return { text: "due tomorrow", status: "reallyupcoming" };
  if (diff > 1) return { text: `due in ${diff} days`, status: "upcoming" };
  if (diff === -1) return { text: "overdue yesterday", status: "overdue" };

  return { text: `overdue ${Math.abs(diff)} days ago`, status: "overdue" };
}

// Helper: format date
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function loadNotifications(user) {
  const overdueContainer = document.querySelector(
    ".notification_deadline_overdue"
  );

  const due24hContainer = document.querySelector(
    ".notification_deadline_due_in_24h"
  );
  const duelaterContainer = document.querySelector(
    ".notification_deadline_due_later"
  );

  overdueContainer.innerHTML = "";
  due24hContainer.innerHTML = "";
  duelaterContainer.innerHTML = "";

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const courses = userSnap.data()?.courses || {};

  let totalNotifications = 0;

  for (const [courseName, courseData] of Object.entries(courses)) {
    const deadlinesRef = collection(
      db,
      `schools/${courseData.school}/programs/${courseData.program}/terms/${courseData.term}/channels/${courseData.channel}/courses/${courseName}/deadlines`
    );

    const deadlinesSnapshot = await getDocs(deadlinesRef);
    deadlinesSnapshot.forEach((deadlineDoc) => {
      const d = deadlineDoc.data();
      const relative = calculateRelativeTime(d.deadlineDateTime);
      const dueDate = new Date(d.deadlineDateTime);
      const cardHTML = createDeadlineCard(
        courseName,
        d.taskName,
        relative,
        formatDate(dueDate)
      );

      let targetContainer = null;

      if (relative.status === "overdue") {
        targetContainer = overdueContainer;
      } else if (
        relative.status === "reallyupcoming" ||
        relative.status === "due-today"
      ) {
        targetContainer = due24hContainer;
      } else if (relative.status === "upcoming") {
        targetContainer = duelaterContainer;
      }

      if (targetContainer) {
        targetContainer.insertAdjacentHTML("beforeend", cardHTML);
        totalNotifications++;
      }
    });
  }
  if (totalNotifications === 0) {
    duelaterContainer.innerHTML = "<li> No upcoming deadlines.</li>";
  }
}
// Auth listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/index.html";
    return;
  }

  loadNotifications(user);
});
