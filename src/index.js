import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth } from '../src/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
  const heroText = document.querySelector('.hero-text h1');

  // Check auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const displayName = user.displayName || user.email;
      heroText.textContent = `Welcome back, ${displayName}!`;

      // Optional: Change Sign Up button to go to main page
      const signUpBtn = document.querySelector('.hero-text button');
      if (signUpBtn) {
        signUpBtn.textContent = 'Go to App';
        signUpBtn.onclick = () => {
          window.location.href = './html/login/resigter.html';
        };
      }
    }
  });
});
