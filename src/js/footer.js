class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `

  <footer>
  <small>&copy; BBY-01, BCIT</small>
</footer>

    `;
  }
}

// Register the custom element
customElements.define("site-footer", SiteFooter);
