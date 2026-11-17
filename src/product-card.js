// Übung 3 – Lösung: <product-card> mit Shadow DOM und Slots

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const DISCOUNT = 0.2;

const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Gilt nur im Shadow DOM – globales CSS der Seite wirkt hier nicht */
    :host {
      display: block;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgb(0 0 0 / .1);
    }
    :host([sale]) {
      border-color: crimson;
      border-width: 2px;
    }
    h2 { margin: .5rem 0; font-size: 1.2rem; color: #333; }
    .old { text-decoration: line-through; opacity: .6; margin-right: .5rem; }
    .current { font-weight: bold; }
    :host([sale]) .current { color: crimson; }
  </style>
  <slot name="image"></slot>
  <h2><slot name="title">Unbenanntes Produkt</slot></h2>
  <slot></slot>
  <p class="price">
    <span class="old"></span>
    <span class="current"></span>
  </p>
`;

class ProductCard extends HTMLElement {
  static observedAttributes = ['price', 'sale'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render();
  }

  get price() { return Number(this.getAttribute('price') ?? 0); }
  set price(v) { this.setAttribute('price', String(v)); }

  get sale() { return this.hasAttribute('sale'); }
  set sale(v) { this.toggleAttribute('sale', Boolean(v)); }

  render() {
    // Shadow Root existiert seit dem constructor → kein Null-Check nötig
    const old = this.shadowRoot.querySelector('.old');
    const current = this.shadowRoot.querySelector('.current');
    if (this.sale) {
      old.textContent = euro.format(this.price);
      current.textContent = euro.format(this.price * (1 - DISCOUNT));
    } else {
      old.textContent = '';
      current.textContent = euro.format(this.price);
    }
  }
}

customElements.define('product-card', ProductCard);
