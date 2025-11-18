import { db } from './firebase.js';
import { getDocs, collection, doc, setDoc } from 'firebase/firestore';

async function fixChannelKeys() {
  const usersSnap = await getDocs(collection(db, 'users'));

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data() || {};
    const updatedCourses = { ...(userData.courses || {}) };
    let needsUpdate = false;

    for (const [courseName, courseData] of Object.entries(updatedCourses)) {
      const { school, program, term, channel } = courseData;

      // Skip if channelKey already correct
      if (!school || !program || !term || !channel) continue;

      const correctKey = `${school}-${program}-${term}-${channel}`;
      if (courseData.channelKey !== correctKey) {
        updatedCourses[courseName] = { ...courseData, channelKey: correctKey };
        needsUpdate = true;
        console.log(`Fixing ${courseName} for user ${userDoc.id}: ${correctKey}`);
      }
    }

    if (needsUpdate) {
      await setDoc(doc(db, 'users', userDoc.id), { courses: updatedCourses }, { merge: true });
    }
  }

  console.log('All channelKeys fixed!');
}

fixChannelKeys();
