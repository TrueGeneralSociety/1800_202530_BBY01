import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";

async function loadNotifications() {
    const container = document.querySelector(".notification-ui_dd-content");

    const coursesRef = collection(
        db,
        "schools/BCIT/programs/CST/terms/Term 1/channels/Set A/courses"
    );

    const courseSnapshots = await getDocs(coursesRef);

    for (const courseDoc of courseSnapshots.docs) {
        const courseId = courseDoc.id;

        const deadlinesRef = collection(
            db,
            `schools/BCIT/programs/CST/terms/Term 1/channels/Set A/courses/${courseId}/deadlines`
        );

        const deadlinesSnapshot = await getDocs(deadlinesRef);

        deadlinesSnapshot.forEach(deadlineDoc => {
            const d = deadlineDoc.data();
            const relative = calculateRelativeTime(d.deadlineDateTime); 

            const dueDate = new Date(d.deadlineDateTime);

            const cardHTML = createDeadlineCard(
                courseId,
                d.taskName,
                relative,
                formatDate(dueDate)
            );

            container.insertAdjacentHTML("beforeend", cardHTML);
        });
    }
}

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
        </div>
    `;
}


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


function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

loadNotifications();
