import { auth } from '../src/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<nav class="navbar navbar-expand-md custom-navbar"><div class="container-fluid">Loading...</div></nav>';
    this.renderNavbar();
  }

  renderNavbar() {
    onAuthStateChanged(auth, (user) => {
      const isLoggedIn = !!user;

      // Set logo link based on auth state
      const logoHref = isLoggedIn ? '/html/main.html' : '/index.html';

      this.innerHTML = `
        <nav class="navbar navbar-expand-md custom-navbar">
          <div class="container-fluid">
            <a class="navbar-brand" href="${logoHref}">SynCalendar</a>

            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <a class="nav-link" href="/html/profile.html">Profile</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">What we do</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/html/calendar.html">Calendar</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/html/deadline_list.html">Deadlines</a>
                </li>
              </ul>

              <ul class="navbar-nav ms-auto">
                ${isLoggedIn ? `
                  <li class="nav-item">
                    <a class="nav-link" href="#" id="logout-btn">Logout</a>
                  </li>
                ` : `
                  <li class="nav-item">
                    <a class="nav-link" href="/html/login/login.html" id="login-btn">Login</a>
                  </li>
                `}
              </ul>
            </div>
          </div>
        </nav>
      `;

      // Logout button listener
      const logoutBtn = this.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            await signOut(auth);
            window.location.href = '/index.html';
          } catch (error) {
            console.error('Logout failed:', error);
          }
        });
      }

      // Highlight current page
      const currentPage = window.location.pathname.split('/').pop();
      const navLinks = this.querySelectorAll('.nav-link');
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  }
}

customElements.define('site-navbar', SiteNavbar);
