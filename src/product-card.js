// Übung: <product-card title="…" price="…" sale>

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const DISCOUNT = 0.2;

class ProductCard extends HTMLElement {
  // TODO: zu beobachtende Attribute
  static observedAttributes = [];

  connectedCallback() {
    // TODO: Template #product-card-template klonen und anhängen (nur einmal!)
    // Tipp: document.getElementById(...).content.cloneNode(true) nutzen
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  // TODO: Getter/Setter für price (Number)

  // TODO: Getter/Setter für sale (Boolean)

  render() {
    // TODO: Titel und Preis(e) in das geklonte Markup schreiben
    // Bei sale = true: .old zeigt den alten Preis, .current zeigt den Rabattpreis mit Klasse "sale"
    // Bei sale = false: .old ist leer, .current zeigt den normalen Preis
  }
}

customElements.define('product-card', ProductCard);
