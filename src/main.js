import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDocs, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const userNameEl = document.getElementById('userName');
const listContainer = document.querySelector('.list-item');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  userNameEl.textContent = user.displayName || user.email;

  // ✅ Soft delete function (marks as deleted instead of removing)
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

      // Mark channel as deleted instead of removing it
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

  // ✅ Load all channels created by the current user
  async function loadChannels() {
    listContainer.innerHTML = ''; // Clear list
    let channelsExist = false;

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

          // Real-time listener for channels in this term
          onSnapshot(channelsRef, (channelsSnapshot) => {
            // Remove existing items from this term before re-rendering
            channelsSnapshot.docChanges().forEach((change) => {
              const channelName = change.doc.id;
              const channelData = change.doc.data();
              const id = `${schoolName}-${programName}-${termName}-${channelName}`;

              if (change.type === 'added') {
                if (channelData.createdBy === user.uid && !channelData.isDeleted) {
                  channelsExist = true;
                  if (document.getElementById(id)) return; // Avoid duplicates

                  const li = document.createElement('li');
                  li.className = 'list-box';
                  li.id = id;

                  // Channel name (click to open)
                  const nameSpan = document.createElement('span');
                  nameSpan.textContent = channelName;
                  nameSpan.style.cursor = 'pointer';
                  nameSpan.onclick = () => {
                    window.location.href = `./channel.html?school=${encodeURIComponent(
                      schoolName
                    )}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(
                      termName
                    )}&channel=${encodeURIComponent(channelName)}`;
                  };

                  // Delete button
                  const deleteBtn = document.createElement('button');
                  deleteBtn.textContent = '🗑️';
                  deleteBtn.className = 'btn btn-sm btn-danger ms-2';
                  deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteChannel(schoolName, programName, termName, channelName);
                  };

                  li.appendChild(nameSpan);
                  li.appendChild(deleteBtn);
                  listContainer.appendChild(li);
                }
              }

              // Remove if deleted
              if (change.type === 'removed' || (channelData?.isDeleted && document.getElementById(id))) {
                document.getElementById(id)?.remove();
              }
            });

            // Update placeholder message if needed
            if (!channelsExist && listContainer.children.length === 0) {
              listContainer.innerHTML = '<li>No channels found for you. Add a new one!</li>';
            }
          });
        }
      }
    }
  }

  loadChannels();
});
