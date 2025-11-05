import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const userNameEl = document.getElementById('userName');
const listContainer = document.querySelector('.list-item');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  userNameEl.textContent = user.displayName || user.email;

  // Load channels for this user
  async function loadChannels() {
    listContainer.innerHTML = ''; // clear existing
    let channelsExist = false;

    const schoolsSnapshot = await getDocs(collection(db, 'schools'));

    for (const schoolDoc of schoolsSnapshot.docs) {
      const schoolName = schoolDoc.id;
      const programsSnapshot = await getDocs(collection(db, 'schools', schoolName, 'programs'));

      for (const programDoc of programsSnapshot.docs) {
        const programName = programDoc.id;
        const termsRef = collection(db, 'schools', schoolName, 'programs', programName, 'terms');

        // Real-time listener for this program's terms
        onSnapshot(termsRef, (termsSnapshot) => {
          termsSnapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const termData = change.doc.data();

              // Show only if created by current user
              if (termData.createdBy === user.uid) {
                channelsExist = true;

                // Avoid duplicates
                const id = `${schoolName}-${programName}-${change.doc.id}`;
                if (document.getElementById(id)) return;

                const li = document.createElement('li');
                li.className = 'list-box';
                li.id = id;
                li.textContent = `${change.doc.id}`;
                li.onclick = () => {
                  window.location.href = `./channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(change.doc.id)}`;
                };
                listContainer.appendChild(li);
              }
            }
          });

          // If no channels yet, show message
          if (!channelsExist && listContainer.children.length === 0) {
            listContainer.innerHTML = '<li>No channels found for you. Add a new one!</li>';
          }
        });
      }
    }
  }

  loadChannels();
});
