import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// ----------------------
// DOM Elements
// ----------------------
const form = document.getElementById('add-course-form');
const courseSelect = document.getElementById('course-select');
const courseInput = document.getElementById('course-input');

// ----------------------
// URL Params
// ----------------------
const params = new URLSearchParams(window.location.search);
const schoolName = params.get('school');
const programName = params.get('program');
const termName = params.get('term');
const channelName = params.get('channel');

if (!schoolName || !programName || !termName || !channelName) {
  alert('Missing channel information.');
  throw new Error('Missing URL params');
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/html/login/login.html';
    return;
  }

  const userRef = doc(db, 'users', user.uid);

  // ----------------------
  // Load Channel Courses
  // ----------------------
  async function loadCourses() {
    courseSelect.innerHTML = `<option value="">-- Select Existing Course --</option>`;

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

    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    const existingUserCourses = { ...(userData.courses || {}) };
    const existingUserChannels = { ...(userData.channels || {}) };

    const channelKey = `${schoolName}-${programName}-${termName}-${channelName}`;
    let needsUpdate = false;

    const snapshot = await getDocs(coursesRef);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const option = document.createElement('option');
      option.value = docSnap.id;

      if (data.isDeleted) {
        option.textContent = `${docSnap.id}`;
      } else {
        option.textContent = docSnap.id;
      }

      courseSelect.appendChild(option);
      // Add to user.courses if missing
      if (!existingUserCourses[docSnap.id]) {
        existingUserCourses[docSnap.id] = {
          school: schoolName,
          program: programName,
          term: termName,
          channel: channelName,
          channelKey,
          addedAt: data.createdAt || serverTimestamp()
        };
        needsUpdate = true;
      }
    });

    // Add channel to user
    if (!existingUserChannels[channelKey]) {
      existingUserChannels[channelKey] = true;
      needsUpdate = true;
    }

    // Update user doc if needed
    if (needsUpdate) {
      await setDoc(
        userRef,
        {
          courses: existingUserCourses,
          channels: existingUserChannels,
          lastActive: serverTimestamp()
        },
        { merge: true }
      );
    }
  }

  await loadCourses();

  // ----------------------
  // Add Course Handler
  // ----------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const typed = courseInput.value.trim();
    const selected = courseSelect.value.trim();
    const courseName = typed || selected;

    if (!courseName) {
      alert('Please type a course name or select one.');
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

    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    const channelKey = `${schoolName}-${programName}-${termName}-${channelName}`;

    // Prepare user course info
    const newCourseInfo = {
      school: schoolName,
      program: programName,
      term: termName,
      channel: channelName,
      channelKey,
      addedAt: serverTimestamp()
    };

    try {
      const courseSnap = await getDoc(courseRef);
      let isReactivated = false;

      if (courseSnap.exists()) {
        const data = courseSnap.data();
        if (data.isDeleted) {
          await setDoc(courseRef, { isDeleted: false, updatedAt: serverTimestamp() }, { merge: true });
          isReactivated = true;
        }
      } else {
        // Create new course
        await setDoc(courseRef, {
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          isDeleted: false
        });
      }

      // Update user courses + channels always
      await setDoc(
        userRef,
        {
          courses: {
            ...(userData.courses || {}),
            [courseName]: newCourseInfo
          },
          channels: {
            ...(userData.channels || {}),
            [channelKey]: true
          },
          lastActive: serverTimestamp()
        },
        { merge: true }
      );

      alert(`Course "${courseName}" ${isReactivated ? 'restored' : 'added'} successfully!`);

      courseInput.value = '';
      await loadCourses();

      window.location.href = `/html/channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}&channel=${encodeURIComponent(channelName)}`;
    } catch (err) {
      console.error(err);
      alert('Failed to add course.');
    }
  });
});