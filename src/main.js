import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDocs, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
  const userNameEl = document.getElementById('userName');
  const listContainer = document.querySelector('.list-item');

  if (!listContainer) {
    console.error('Channel list container not found in DOM');
    return;
  }

  // Soft-delete a channel
  async function deleteChannel(schoolName, programName, termName, channelName) {
    if (!confirm(`Are you sure you want to delete the channel "${channelName}"? This will hide it but keep its data.`))
      return;

    try {
      const channelRef = doc(
        db,
        'schools',
        schoolName,
        'programs',
        programName,
        'terms',
        termName,
        'channels',
        channelName
      );

      await setDoc(
        channelRef,
        { isDeleted: true, deletedAt: new Date().toISOString() },
        { merge: true }
      );

      alert(`Channel "${channelName}" hidden successfully (data retained).`);
    } catch (error) {
      console.error('Error hiding channel:', error);
      alert('Failed to hide channel. Check console for details.');
    }
  }

  // Load channels for the current user
  async function loadChannels(user) {
    listContainer.innerHTML = '';

    try {
      const schoolsSnapshot = await getDocs(collection(db, 'schools'));

      for (const schoolDoc of schoolsSnapshot.docs) {
        const schoolName = schoolDoc.id;
        const programsSnapshot = await getDocs(collection(db, 'schools', schoolName, 'programs'));

        for (const programDoc of programsSnapshot.docs) {
          const programName = programDoc.id;
          const termsSnapshot = await getDocs(
            collection(db, 'schools', schoolName, 'programs', programName, 'terms')
          );

          for (const termDoc of termsSnapshot.docs) {
            const termName = termDoc.id;
            const channelsRef = collection(
              db,
              'schools',
              schoolName,
              'programs',
              programName,
              'terms',
              termName,
              'channels'
            );

            // Use real-time listener for updates
            onSnapshot(channelsRef, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                const chName = change.doc.id;
                const chData = change.doc.data();
                const liId = `${schoolName}-${programName}-${termName}-${chName}`;

                // Handle added or modified channels
                if ((change.type === 'added' || change.type === 'modified') && chData.createdBy === user.uid && !chData.isDeleted) {
                  if (!document.getElementById(liId)) {
                    const li = document.createElement('li');
                    li.className = 'list-box';
                    li.id = liId;
                    li.style.cursor = 'pointer';

                    li.onclick = () => {
                      window.location.href = `/html/channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}&channel=${encodeURIComponent(chName)}`;
                    };

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = chName;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '🗑️';
                    deleteBtn.className = 'btn btn-sm btn-danger ms-2';
                    deleteBtn.onclick = async (e) => {
                      e.stopPropagation();
                      await deleteChannel(schoolName, programName, termName, chName);
                      li.remove();
                    };

                    li.appendChild(nameSpan);
                    li.appendChild(deleteBtn);
                    listContainer.appendChild(li);
                  }
                }

                // Remove deleted channels
                if (chData.isDeleted && document.getElementById(liId)) {
                  document.getElementById(liId).remove();
                }
              });

              // Placeholder if no channels
              if (listContainer.children.length === 0) {
                listContainer.innerHTML = '<li>No channels found for you. Add a new one!</li>';
              }
            });
          }
        }
      }
    } catch (err) {
      console.error('Error loading channels:', err);
      listContainer.innerHTML = '<li>Failed to load channels.</li>';
    }
  }

  // Auth state listener
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    // Set user name safely
    if (userNameEl) {
      userNameEl.textContent = user.displayName || user.email || 'Friend';
    }

    // Load the channels
    loadChannels(user);
  });
});
