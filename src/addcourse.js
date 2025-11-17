import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Elements
const form = document.getElementById('add-course-form');
const courseSelect = document.getElementById('course-select');
const courseInput = document.getElementById('course-input');

// URL params
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

    const courseName = (courseInput.value.trim() || courseSelect.value.trim());
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

    const userRef = doc(db, 'users', user.uid);

    // 채널 key 생성
    const channelKey = `${schoolName}-${programName}-${termName}-${channelName}`;

    try {
      const courseSnap = await getDoc(courseRef);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // 새 코스 정보
      const newCourseInfo = {
        school: schoolName,
        program: programName,
        term: termName,
        channel: channelName,
        addedAt: serverTimestamp()
      };

      // 기존 courses/채널 업데이트
      const updatedCourses = {
        ...(userData.courses || {}),
        [courseName]: newCourseInfo
      };
      const updatedChannels = {
        ...(userData.channels || {}),
        [channelKey]: true
      };

      if (courseSnap.exists()) {
        const data = courseSnap.data();
        if (data.isDeleted) {
          // Reactivate course
          await setDoc(courseRef, { isDeleted: false, updatedAt: serverTimestamp() }, { merge: true });
        } else {
          alert(`Course "${courseName}" already exists in this channel.`);
          return;
        }
      } else {
        // Create new course
        await setDoc(courseRef, {
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          isDeleted: false
        });
      }

      // 유저 문서 업데이트
      await setDoc(
        userRef,
        {
          courses: updatedCourses,
          channels: updatedChannels,
          lastActive: serverTimestamp()
        },
        { merge: true }
      );

      alert(`Course "${courseName}" added/updated successfully!`);

      courseInput.value = '';
      await loadCourses();

      // Optional: redirect back to channel page
      window.location.href = `/html/channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}&channel=${encodeURIComponent(channelName)}`;
    } catch (error) {
      console.error(error);
      alert('Failed to add course. Check console for details.');
    }
  });
});
