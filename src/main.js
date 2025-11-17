import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth, db } from './firebase.js';
import { collection, getDocs, updateDoc, getDoc, doc, setDoc, deleteField } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
  const userNameEl = document.getElementById('userName');
  const listContainer = document.querySelector('.list-item');

  if (!listContainer) {
    console.error('Channel list container not found in DOM');
    return;
  }

  // delete user channel
  async function deleteUserChannel(user, channelKey, li) {
    if (!confirm(`Are you sure you want to delete this channel for yourself?`)) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      const updates = { [`channels.${channelKey}`]: deleteField() };

      await updateDoc(userRef, updates);
      li.remove();

    } catch (err) {
      console.error('Failed to delete channel:', err);
      alert('Failed to delete channel. Check console.');
    }
  }

  // user channel load
  async function loadChannels(user) {
    listContainer.innerHTML = '';

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const userChannels = userData.channels || {};

      const channelKeys = Object.keys(userChannels);
      if (channelKeys.length === 0) {
        listContainer.innerHTML = '<li>No channels found for you. Add a new one!</li>';
        return;
      }

      for (const channelKey of channelKeys) {
        const li = document.createElement('li');
        li.className = 'list-box';
        li.style.cursor = 'pointer';

        const displayName = channelKey.split('-').slice(-1)[0];
        const nameSpan = document.createElement('span');
        nameSpan.textContent = displayName;
        const parts = channelKey.split('-');
        const schoolName = parts[0];
        const programName = parts[1];
        const termName = parts[2];
        const channelName = parts.slice(3).join('-');

        li.appendChild(nameSpan);

        // click to open channel
        li.onclick = () => {
          const url = `/html/channel.html?school=${encodeURIComponent(schoolName)}&program=${encodeURIComponent(programName)}&term=${encodeURIComponent(termName)}&channel=${encodeURIComponent(channelName)}`;
          window.location.href = url;
        };


        // delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.className = 'btn btn-sm btn-danger ms-2';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          deleteUserChannel(user, channelKey, li);
        };

        li.appendChild(deleteBtn);
        listContainer.appendChild(li);
      }

    } catch (err) {
      console.error('Error loading channels:', err);
      listContainer.innerHTML = '<li>Failed to load channels.</li>';
    }
  }

  // auth state check
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    // user document update
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      lastLogin: new Date().toISOString(),
      channels: userData.channels || {},
    }, { merge: true });

    // UI update
    if (userNameEl) {
      userNameEl.textContent = user.displayName || user.email || 'Friend';
    }

    loadChannels(user);
  });
});
