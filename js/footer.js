class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `

  <footer>
    <button type="button" class="btn btn-primary btn-large position-relative">
      <img src="/svgs/house.svg" alt="home" />
    </button>
    <button type="button" class="btn btn-primary btn-large position-relative">
      <img src="/svgs/chat.svg" alt="inbox" />
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        99+
        <span class="visually-hidden">unread messages</span>
      </span>
    </button>
    <button type="button" onclick="location.href='../html/notification.html'" class="btn btn-primary btn-large position-relative">
      <img src="/svgs/bell-fill.svg" alt="Notifications" />
      <span class="badge text-bg-secondary">4</span>
    </button>
    <button type="button" class="btn btn-primary btn-large position-relative">
      <img src="/svgs/person-circle.svg"  alt="profile" />
    </button>
  </footer>
    `;
  }
}

// Register the custom element
customElements.define("site-footer", SiteFooter);
