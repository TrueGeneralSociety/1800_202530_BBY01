import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Elements
const form = document.getElementById('add-course-form');
const courseSelect = document.getElementById('course-select');
const courseInput = document.getElementById('course-input');

// Read URL params
const urlParams = new URLSearchParams(window.location.search);
const schoolName = urlParams.get('school');
const programName = urlParams.get('program');
const termName = urlParams.get('term');
const channelName = urlParams.get('channel');

if (!schoolName || !programName || !termName || !channelName) {
  alert('Channel information missing. Cannot add courses.');
  throw new Error('Missing channel info in URL');
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/html/login/login.html';
    return;
  }

  // Load existing courses under this channel
  async function loadCourses() {
    courseSelect.innerHTML = '<option value="">-- Select Existing Course --</option>';

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

    const snapshot = await getDocs(coursesRef);
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.isDeleted) {
        const option = document.createElement('option');
        option.value = docSnap.id;
        option.textContent = docSnap.id;
        courseSelect.appendChild(option);
      }
    });
  }

  await loadCourses();

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const courseName = courseInput.value.trim() || courseSelect.value;
    if (!courseName) {
      alert('Please select or enter a course name.');
      return;
    }

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

    const courseSnap = await getDoc(courseRef);

    try {
      if (courseSnap.exists()) {
        const data = courseSnap.data();
        if (data.isDeleted) {
          await setDoc(courseRef, { isDeleted: false, updatedAt: serverTimestamp() }, { merge: true });
          alert(`Course "${courseName}" reactivated in this channel.`);
        } else {
          alert(`Course "${courseName}" already exists in this channel.`);
          return;
        }
      } else {
        await setDoc(courseRef, {
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        window.location.href = `/html/channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}&channel=${encodeURIComponent(channelName)}`;
      }

      

      courseInput.value = '';
      await loadCourses();
    } catch (error) {
      console.error(error);
      alert('Failed to add course. Check console for details.');
    }
  });
});

