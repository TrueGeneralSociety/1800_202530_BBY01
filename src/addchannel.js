import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js'; // adjust path if needed
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Form elements
const schoolSelect = document.getElementById('school-select');
const programSelect = document.getElementById('program-select');
const termSelect = document.getElementById('term-select');
const channelSelect = document.getElementById('channel-select');
const form = document.getElementById('add-channel-form');

// 🔹 Load existing schools
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

// 🔹 Load programs for selected school
async function loadPrograms(schoolName) {
  programSelect.innerHTML = '<option value="">-- Select Existing Program --</option>';
  termSelect.innerHTML = '<option value="">-- Select Existing Term --</option>';
  if (!schoolName) return;

  const programsRef = collection(db, 'schools', schoolName, 'programs');
  const snapshot = await getDocs(programsRef);
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    programSelect.appendChild(option);
  });
}

// 🔹 Load terms for selected program
async function loadTerms(schoolName, programName) {
  termSelect.innerHTML = '<option value="">-- Select Existing Term --</option>';
  if (!schoolName || !programName) return;

  const termsRef = collection(db, 'schools', schoolName, 'programs', programName, 'terms');
  const snapshot = await getDocs(termsRef);
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    termSelect.appendChild(option);
  });
}

async function loadChannels(schoolName, programName, termName) {
  channelSelect.innerHTML = '<option value="">-- Select Existing Channel Name --</option>';
  if (!schoolName || !programName || !termName) return;

  const channelsRef = collection(db, 'schools', schoolName, 'programs', programName, 'terms', termName, 'channels');
  const snapshot = await getDocs(channelsRef);
  snapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.id;
    channelSelect.appendChild(option);
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '/html/login/login.html';
    return;
  }

  // Load schools on page load
  loadSchools();

  // When a school is chosen → load its programs
  schoolSelect.addEventListener('change', async (e) => {
    const selectedSchool = e.target.value;
    await loadPrograms(selectedSchool);
  });

  // When a program is chosen → load its terms
  programSelect.addEventListener('change', async (e) => {
    const selectedSchool = schoolSelect.value;
    const selectedProgram = e.target.value;
    await loadTerms(selectedSchool, selectedProgram);
  });

  // When a term is chosen → load its channels
  termSelect.addEventListener('change', async (e) => {
    const selectedSchool = schoolSelect.value;
    const selectedProgram = programSelect.value;
    const selectedTerm = e.target.value;
    await loadChannels(selectedSchool, selectedProgram, selectedTerm);
  });

  // Handle form submit
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
      // 1️⃣ Ensure school exists
      const schoolRef = doc(db, 'schools', schoolName);
      const schoolSnap = await getDoc(schoolRef);
      if (!schoolSnap.exists()) {
        await setDoc(schoolRef, { name: schoolName, createdAt: serverTimestamp() });
      }

      // 2️⃣ Ensure program exists
      const programRef = doc(db, 'schools', schoolName, 'programs', programName);
      const programSnap = await getDoc(programRef);
      if (!programSnap.exists()) {
        await setDoc(programRef, { name: programName, createdAt: serverTimestamp() });
      }

      // 3️⃣ Ensure term exists (create if missing)
      const termRef = doc(db, 'schools', schoolName, 'programs', programName, 'terms', termName);
      const termSnap = await getDoc(termRef);
      if (!termSnap.exists()) {
        await setDoc(termRef, {
          name: termName,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      // 4️⃣ ✅ Create the actual channel
      const channelRef = doc(db, 'schools', schoolName, 'programs', programName, 'terms', termName, 'channels', channelName);
      const channelSnap = await getDoc(channelRef);

      if (channelSnap.exists()) {
        const data = channelSnap.data();
        // If the channel exists and is not deleted, block creation
        if (!data.isDeleted) {
          alert('This channel already exists.');
          return;
        }

        // If the channel was soft-deleted, "revive" it
        await setDoc(
          channelRef,
          {
            isDeleted: false,
            deletedAt: null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        alert(`Channel "${channelName}" restored successfully!`);
        window.location.href = '../html/main.html';
        return;
      }

      // Otherwise create a new channel
      await setDoc(channelRef, {
        name: channelName,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isDeleted: false,
      });

      window.location.href = '../html/main.html';

    } catch (error) {
      console.error('Error adding channel:', error);
      alert('Failed to add channel. Please try again.');
    }
  });
});
