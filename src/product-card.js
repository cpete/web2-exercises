// Übung: <product-card> mit Shadow DOM und Slots

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const DISCOUNT = 0.2;

const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* TODO: :host stylen (Rahmen, Abstand, Hintergrund) */
    /* TODO: :host([sale]) hervorheben */
  </style>
  <!-- TODO: Slot "image" -->
  <h2><!-- TODO: Slot "title" mit Fallback --></h2>
  <!-- TODO: Default-Slot -->
  <p class="price">
    <span class="old"></span>
    <span class="current"></span>
  </p>
`;

class ProductCard extends HTMLElement {
  static observedAttributes = ['price', 'sale'];

  constructor() {
    super();
    // TODO: Shadow Root anlegen und Template klonen
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get price() { return Number(this.getAttribute('price') ?? 0); }
  set price(v) { this.setAttribute('price', String(v)); }

  get sale() { return this.hasAttribute('sale'); }
  set sale(v) { this.toggleAttribute('sale', Boolean(v)); }

  render() {
    // TODO: Preise in this.shadowRoot schreiben
  }
}

customElements.define('product-card', ProductCard);
