import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { auth } from '../src/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
  // Check auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = './html/app/main.html'; 
    }

  });

const disableNavbarExceptLogin = () => {
  const navbar = document.querySelector('site-navbar');
  if (!navbar) return;

  const links = navbar.shadowRoot ? navbar.shadowRoot.querySelectorAll('a') : navbar.querySelectorAll('a');

  links.forEach(link => {

    if (link.textContent.toLowerCase().includes('login')) return;


    link.addEventListener('click', (event) => {
      event.preventDefault();
      console.log(`"${link.textContent}" navbar link is disabled`);
    });
  });
};


customElements.whenDefined('site-navbar').then(() => {
  disableNavbarExceptLogin();
});
});
