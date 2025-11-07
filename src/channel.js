import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.querySelector('.list-item');
  const addCourseBtn = document.getElementById('add-course-btn');

  if (!listContainer) {
    console.error('Course list container not found in DOM');
    return;
  }

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  const schoolName = urlParams.get('school');
  const programName = urlParams.get('program');
  const termName = urlParams.get('term');
  const channelName = urlParams.get('channel');

  if (!schoolName || !programName || !termName || !channelName) {
    alert('Missing channel information in URL');
    return;
  }

  // Soft delete a course
  async function deleteCourse(courseName) {
    if (!confirm(`Are you sure you want to delete "${courseName}"? It will be hidden but data is kept.`)) return;

    try {
      const courseRef = doc(
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
        courseName
      );

      await setDoc(courseRef, { isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      alert(`"${courseName}" hidden successfully.`);
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to hide course. Check console.');
    }
  }

  // Load courses in this channel
  async function loadCourses(user) {
    listContainer.innerHTML = '';

    try {
      const coursesRef = collection(
        db,
        'schools',
        schoolName,
        'programs',
        programName,
        'terms',
        termName,
        'channels',
        channelName,
        'courses'
      );

      // Real-time listener
      onSnapshot(coursesRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const courseName = change.doc.id;
          const courseData = change.doc.data();
          const liId = `course-${courseName}`;

          // Added or modified
          if ((change.type === 'added' || change.type === 'modified') && !courseData.isDeleted) {
            if (!document.getElementById(liId)) {
              const li = document.createElement('li');
              li.className = 'list-box';
              li.id = liId;
              li.style.cursor = 'default'; // courses may not navigate

              const nameSpan = document.createElement('span');
              nameSpan.textContent = courseName;

              const deleteBtn = document.createElement('button');
              deleteBtn.textContent = '🗑️';
              deleteBtn.className = 'btn btn-sm btn-danger ms-2';
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

          // Remove deleted courses
          if (courseData.isDeleted && document.getElementById(liId)) {
            document.getElementById(liId).remove();
          }
        });

        // Placeholder if no courses
        if (listContainer.children.length === 0) {
          listContainer.innerHTML = '<li>No courses found in this channel. Add a new one!</li>';
        }
      });
    } catch (err) {
      console.error('Error loading courses:', err);
      listContainer.innerHTML = '<li>Failed to load courses.</li>';
    }
  }

  // Auth listener
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    loadCourses(user);
  });

  // Optional: redirect Add Course button to addcourse.html with same URL params
  if (addCourseBtn) {
    addCourseBtn.onclick = () => {
      window.location.href = `/html/addcourse.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}&channel=${encodeURIComponent(channelName)}`;
    };
  }
});