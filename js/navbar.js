// navbar.js
class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar navbar-expand-md custom-navbar">
        <div class="container-fluid">
          <a class="navbar-brand" href="../index.html">SynCalendar</a>

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
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link" href="../index.html">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./profile.html">Profile</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">What we do</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./calendar.html">Calendar</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./deadline_list.html">Deadlines</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./registerCourses.html">Register Course</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;

    // 🔍 Highlight the current active page
    const currentPage = window.location.pathname.split("/").pop(); // e.g. 'profile.html'
    const navLinks = this.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.includes(currentPage)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
