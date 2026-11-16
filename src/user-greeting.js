class UserGreeting extends HTMLElement {
  // Nur diese Attribute lösen attributeChangedCallback aus
  static observedAttributes = ['name'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal !== newVal) this.render();
  }

  render() {
    // textContent statt innerHTML: kein XSS über das Attribut möglich
    this.textContent = `Hallo, ${this.getAttribute('name') ?? 'Gast'}!`;
  }
}

// Name MUSS einen Bindestrich enthalten
customElements.define('user-greeting', UserGreeting);
