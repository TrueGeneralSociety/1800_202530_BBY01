import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from '/src/js/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// ----------------------
// DOM Elements
// ----------------------
const form = document.getElementById('add-deadline-form');
const taskNameInput = document.getElementById('taskName');
const deadlineDateInput = document.getElementById('deadlineDateTime');
const notesInput = document.getElementById('notes');
const backBtn = document.getElementById('backButton');

// ----------------------
// URL Params
// ----------------------
const params = new URLSearchParams(window.location.search);
const schoolName = params.get('school');
const programName = params.get('program');
const termName = params.get('term');
const channelName = params.get('channel');
const courseName = params.get('course');

if (!schoolName || !programName || !termName || !channelName || !courseName) {
  alert('Missing course/channel info in URL.');
  throw new Error('Missing URL params');
}

// ----------------------
// Build absolute URL for Go Back button
// ----------------------
if (backBtn) {
  const backQuery = new URLSearchParams({
    school: schoolName,
    program: programName,
    term: termName,
    channel: channelName,
    course: courseName
  }).toString();
  backBtn.href = `${window.location.origin}/src/html/course.html?${backQuery}`;
}

// ----------------------
// Auth Check
// ----------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = `${window.location.origin}/index.html`;
    return;
  }

  const userRef = doc(db, 'users', user.uid);

  // ----------------------
  // Form Submit Handler
  // ----------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent default form submission

    const taskName = taskNameInput.value.trim();
    const deadlineDateTime = deadlineDateInput.value;
    const notes = notesInput.value.trim();

    if (!taskName || !deadlineDateTime) {
      alert('Task name and deadline are required.');
      return;
    }

    const timestamp = Date.now();
    const deadlineId = `${taskName}-${timestamp}`;

    const deadlineRef = doc(
      db,
      'schools', schoolName,
      'programs', programName,
      'terms', termName,
      'channels', channelName,
      'courses', courseName,
      'deadlines', deadlineId
    );

    try {
      // Add deadline to Firestore
      await setDoc(deadlineRef, {
        taskName,
        deadlineDateTime,
        notes,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      // Update user's course deadlines map
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const userCourseData = userData.courses?.[courseName] || {};

      await setDoc(
        userRef,
        {
          courses: {
            [courseName]: {
              ...userCourseData,
              deadlines: {
                ...userCourseData.deadlines,
                [deadlineId]: true
              }
            }
          }
        },
        { merge: true }
      );

      alert('Deadline added successfully!');

      // ----------------------
      // Redirect to deadline list (absolute path)
      // ----------------------
      const queryParams = new URLSearchParams({
        school: schoolName,
        program: programName,
        term: termName,
        channel: channelName,
        course: courseName
      }).toString();

      window.location.href = `${window.location.origin}/src/html/course.html?${queryParams}`;

    } catch (err) {
      console.error('Failed to add deadline:', err);
      alert('Failed to add deadline.');
    }
  });
});
