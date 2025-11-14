import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDoc, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.querySelector('.list-item');
  const addDeadlineBtn = document.getElementById('add-deadline-btn');

  if (!listContainer) {
    console.error('Deadline list container not found in DOM');
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    // Get course info from user document
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const defaultCourse = userData.courses
      ? Object.entries(userData.courses)[0]
      : null;

    if (!defaultCourse) {
      alert('No course assigned to this channel.');
      return;
    }

    const [courseName, courseInfo] = defaultCourse;
    const { school, program, term, channel } = courseInfo;

    const deadlinesRef = collection(
      db,
      'schools', school,
      'programs', program,
      'terms', term,
      'channels', channel,
      'courses', courseName,
      'deadlines'
    );

    // Soft delete a deadline
    async function deleteDeadline(deadlineId) {
      if (!confirm(`Are you sure you want to delete this deadline?`)) return;

      try {
        const deadlineRef = doc(
          db,
          'schools', school,
          'programs', program,
          'terms', term,
          'channels', channel,
          'courses', courseName,
          'deadlines', deadlineId
        );
        await setDoc(deadlineRef, { isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.error('Error deleting deadline:', err);
        alert('Failed to delete deadline.');
      }
    }

    // Real-time listener
    onSnapshot(deadlinesRef, (snapshot) => {
      listContainer.innerHTML = '';

      if (snapshot.empty) {
        listContainer.innerHTML = '<li class="list-group-item">No deadlines found.</li>';
      } else {
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.isDeleted) return;

          const li = document.createElement('li');
          li.className = 'list-box';

          const taskSpan = document.createElement('span');
          taskSpan.textContent = `${data.taskName} - ${new Date(data.deadlineDateTime).toLocaleString()}`;
          li.appendChild(taskSpan);

          if (data.notes) {
            const note = document.createElement('small');
            note.textContent = ` (${data.notes})`;
            note.className = 'text-muted ms-1';
            li.appendChild(note);
          }

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn btn-sm btn-danger ms-2';
          deleteBtn.textContent = '🗑️';
          deleteBtn.onclick = async () => {
            await deleteDeadline(docSnap.id);
          };

          li.appendChild(deleteBtn);
          listContainer.appendChild(li);
        });
      }
    });

    // Add Deadline button redirects with URL params
    if (addDeadlineBtn) {
      addDeadlineBtn.onclick = () => {
        const params = new URLSearchParams(window.location.search);
        window.location.href = `/html/addDeadline.html?${params.toString()}`;
      };
    }
  });
});
