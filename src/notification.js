import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

async function loadNotifications(user) {
    const container = document.querySelector(".notification-ui_dd-content");
    container.innerHTML = ''; // clear old notifications

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const courses = userSnap.data()?.courses || {};

    // Loop through all courses the user is enrolled in
    for (const [courseName, courseData] of Object.entries(courses)) {
        const deadlinesRef = collection(
            db,
            `schools/${courseData.school}/programs/${courseData.program}/terms/${courseData.term}/channels/${courseData.channel}/courses/${courseName}/deadlines`
        );

        const deadlinesSnapshot = await getDocs(deadlinesRef);

        deadlinesSnapshot.forEach(deadlineDoc => {
            const d = deadlineDoc.data();
            const relative = calculateRelativeTime(d.deadlineDateTime);
            const dueDate = new Date(d.deadlineDateTime);

            const cardHTML = createDeadlineCard(courseName, d.taskName, relative, formatDate(dueDate));
            container.insertAdjacentHTML("beforeend", cardHTML);
        });
    }

    // Placeholder if no notifications
    if (container.children.length === 0) {
        container.innerHTML = '<li>No upcoming deadlines.</li>';
    }
}

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
        year: "numeric"
    });
}

// Auth listener
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    loadNotifications(user);
});
