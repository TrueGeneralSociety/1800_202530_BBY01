import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const userNameEl = document.getElementById('userName');
const listContainer = document.querySelector('.list-item');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/html/login/login.html';
    return;
  }

  // Show user's name
  userNameEl.textContent = user.displayName || user.email;

  // Load channels dynamically
  listContainer.innerHTML = ''; // clear existing

  try {
    const schoolsSnapshot = await getDocs(collection(db, 'schools'));
    for (const schoolDoc of schoolsSnapshot.docs) {
      const schoolName = schoolDoc.id;

      const programsSnapshot = await getDocs(collection(db, 'schools', schoolName, 'programs'));
      for (const programDoc of programsSnapshot.docs) {
        const programName = programDoc.id;

        const termsSnapshot = await getDocs(collection(db, 'schools', schoolName, 'programs', programName, 'terms'));
        for (const termDoc of termsSnapshot.docs) {
          const termName = termDoc.id;

          // Create a list item
          const li = document.createElement('li');
          li.className = 'list-box';
          li.textContent = `${termName}`;
          li.onclick = () => {
            // Redirect to channel page (optionally pass info via query params)
            window.location.href = `./channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}`;
          };
          listContainer.appendChild(li);
        }
      }
    }

    // If no channels found
    if (listContainer.children.length === 0) {
      listContainer.innerHTML = '<li>No channels found. Add a new one!</li>';
    }

  } catch (error) {
    console.error('Error loading channels:', error);
    listContainer.innerHTML = '<li>Failed to load channels.</li>';
  }
});
