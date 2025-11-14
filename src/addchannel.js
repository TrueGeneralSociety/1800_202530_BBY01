import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDocs, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Form elements
const schoolSelect = document.getElementById('school-select');
const programSelect = document.getElementById('program-select');
const termSelect = document.getElementById('term-select');
const channelSelect = document.getElementById('channel-select');
const form = document.getElementById('add-channel-form');

// Load existing schools
async function loadSchools() {
  schoolSelect.innerHTML = '<option value="">-- Select Existing School --</option>';
  const snapshot = await getDocs(collection(db, 'schools'));
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    schoolSelect.appendChild(option);
  });
}

//Load programs for selected school
async function loadPrograms(schoolName) {
  programSelect.innerHTML = '<option value="">-- Select Existing Program --</option>';
  termSelect.innerHTML = '<option value="">-- Select Existing Term --</option>';
  if (!schoolName) return;

  const snapshot = await getDocs(collection(db, 'schools', schoolName, 'programs'));
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    programSelect.appendChild(option);
  });
}

//Load terms for selected program
async function loadTerms(schoolName, programName) {
  termSelect.innerHTML = '<option value="">-- Select Existing Term --</option>';
  if (!schoolName || !programName) return;

  const snapshot = await getDocs(collection(db, 'schools', schoolName, 'programs', programName, 'terms'));
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    termSelect.appendChild(option);
  });
}

//Load channels for selected term
async function loadChannels(schoolName, programName, termName) {
  channelSelect.innerHTML = '<option value="">-- Select Existing Channel Name --</option>';
  if (!schoolName || !programName || !termName) return;

  const snapshot = await getDocs(collection(db, 'schools', schoolName, 'programs', programName, 'terms', termName, 'channels'));
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    channelSelect.appendChild(option);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/html/login/login.html';
    return;
  }

  const userRef = doc(db, 'users', user.uid);

  loadSchools();

  schoolSelect.addEventListener('change', (e) => loadPrograms(e.target.value));
  programSelect.addEventListener('change', (e) => loadTerms(schoolSelect.value, e.target.value));
  termSelect.addEventListener('change', (e) => loadChannels(schoolSelect.value, programSelect.value, e.target.value));

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const schoolName = document.getElementById('school-input').value.trim() || schoolSelect.value;
    const programName = document.getElementById('program-input').value.trim() || programSelect.value;
    const termName = document.getElementById('term-input').value.trim() || termSelect.value;
    const channelName = document.getElementById('channel-input').value.trim() || channelSelect.value;

    if (!schoolName || !programName || !termName || !channelName) {
      alert('Please select or enter all fields.');
      return;
    }

    try {
      // Ensure school exists
      const schoolRef = doc(db, 'schools', schoolName);
      if (!(await getDoc(schoolRef)).exists()) {
        await setDoc(schoolRef, { name: schoolName, createdAt: serverTimestamp() });
      }

      // Ensure program exists
      const programRef = doc(db, 'schools', schoolName, 'programs', programName);
      if (!(await getDoc(programRef)).exists()) {
        await setDoc(programRef, { name: programName, createdAt: serverTimestamp() });
      }

      // Ensure term exists
      const termRef = doc(db, 'schools', schoolName, 'programs', programName, 'terms', termName);
      if (!(await getDoc(termRef)).exists()) {
        await setDoc(termRef, { name: termName, createdBy: user.uid, createdAt: serverTimestamp() });
      }

      // Ensure channel exists in public collection
      const channelRef = doc(db, 'schools', schoolName, 'programs', programName, 'terms', termName, 'channels', channelName);
      if (!(await getDoc(channelRef)).exists()) {
        await setDoc(channelRef, { name: channelName, createdBy: user.uid, createdAt: serverTimestamp(), isDeleted: false });
      }

      // Add/restore channel for user
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const userChannels = userData.channels || {};
      const channelKey = `${schoolName}-${programName}-${termName}-${channelName}`;

      if (!userChannels[channelKey]) {
        // Add channel to user's channels
        await setDoc(userRef, {
          channels: { [channelKey]: true },
          currentChannel: channelKey,
          lastActive: serverTimestamp()
        }, { merge: true });
        alert(`Channel "${channelName}" added for you!`);
      } else {
        alert(`Channel "${channelName}" already exists for you.`);
      }

      window.location.href = '../html/main.html';
    } catch (err) {
      console.error('Error adding channel:', err);
      alert('Failed to add channel. Check console.');
    }
  });
});
