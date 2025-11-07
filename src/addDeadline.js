import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Wait until DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const taskNameInput = document.getElementById('taskName');
    const deadlineInput = document.getElementById('deadlineDateTime');
    const notesInput = document.getElementById('additionalNotes');

    // Create a container to show deadlines
    let deadlinesList = document.getElementById('deadlinesList');
    if (!deadlinesList) {
        deadlinesList = document.createElement('ul');
        deadlinesList.id = 'deadlinesList';
        deadlinesList.className = 'list-group mt-3';
        form.parentElement.appendChild(deadlinesList);
    }

    // Read URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const schoolName = urlParams.get('school');
    const programName = urlParams.get('program');
    const termName = urlParams.get('term');
    const channelName = urlParams.get('channel');
    const courseName = urlParams.get('course');

    if (!schoolName || !programName || !termName || !channelName || !courseName) {
        alert('Missing required course/channel information in URL');
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/index.html';
            return;
        }

        const deadlinesRef = collection(
            db,
            'schools',
            schoolName,
            'programs',
            programName,
            'terms',
            termName,
            'channels',
            channelName,
            'courses',
            courseName,
            'deadlines'
        );

        // Real-time listener for deadlines
        onSnapshot(deadlinesRef, (snapshot) => {
            deadlinesList.innerHTML = '';
            if (snapshot.empty) {
                deadlinesList.innerHTML = '<li class="list-group-item">No deadlines yet.</li>';
            } else {
                snapshot.docs.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.isDeleted) return;

                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';

                    const text = document.createElement('span');
                    text.textContent = `${data.taskName} - ${new Date(data.deadlineDateTime).toLocaleString()}`;
                    li.appendChild(text);

                    if (data.notes) {
                        const note = document.createElement('small');
                        note.textContent = ` (${data.notes})`;
                        note.className = 'text-muted ms-1';
                        li.appendChild(note);
                    }

                    // Delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '🗑️';
                    deleteBtn.className = 'btn btn-sm btn-danger ms-2';
                    deleteBtn.onclick = async () => {
                        try {
                            await setDoc(doc(deadlinesRef, docSnap.id), { isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true });
                        } catch (err) {
                            console.error('Error deleting deadline:', err);
                            alert('Failed to delete deadline.');
                        }
                    };

                    li.appendChild(deleteBtn);
                    deadlinesList.appendChild(li);
                });
            }
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const taskName = taskNameInput.value.trim();
            const deadlineDateTime = deadlineInput.value;
            const notes = notesInput.value.trim();

            if (!taskName || !deadlineDateTime) {
                alert('Please enter a task name and date/time.');
                return;
            }

            try {
                // Generate a unique ID for each deadline
                const uniqueId = `${taskName}-${Date.now()}`;

                await setDoc(doc(deadlinesRef, uniqueId), {
                    taskName,
                    deadlineDateTime,
                    notes,
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                    isDeleted: false
                });

                alert(`Deadline "${taskName}" added successfully!`);

                const params = new URLSearchParams({
                    school: schoolName,
                    program: programName,
                    term: termName,
                    channel: channelName,
                    course: courseName
                });
                window.location.href = `/html/course.html?${params.toString()}`;

            } catch (err) {
                console.error('Error adding deadline:', err);
                alert('Failed to add deadline. Check console for details.');
            }
        });
    });
});
