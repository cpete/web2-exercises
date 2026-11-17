// Übung – Lösung: <product-card title="…" price="…" sale>

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const DISCOUNT = 0.2;

class ProductCard extends HTMLElement {
  static observedAttributes = ['title', 'price', 'sale'];

  connectedCallback() {
    // Nur beim ersten Einhängen Markup erzeugen
    if (!this.querySelector('.card')) {
      const tpl = document.getElementById('product-card-template');
      this.append(tpl.content.cloneNode(true));
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render();
  }

  // ---- Properties  ----

  get price() {
    return Number(this.getAttribute('price') ?? 0);
  }

  set price(value) {
    this.setAttribute('price', String(value));
  }

  get sale() {
    return this.hasAttribute('sale');
  }

  set sale(value) {
    // NICHT setAttribute('sale', false) – das wäre trotzdem "vorhanden"!
    this.toggleAttribute('sale', Boolean(value));
  }

  // Hinweis: "title" ist ein globales HTML-Attribut (Tooltip) und HTMLElement
  // hat bereits eine title-Property. Besser wäre z. B. "product-name".

  render() {
    const card = this.querySelector('.card');
    if (!card) return; // attributeChangedCallback kann vor connectedCallback kommen

    card.querySelector('.title').textContent = this.getAttribute('title') ?? 'Unbenanntes Produkt';

    const old = card.querySelector('.old');
    const current = card.querySelector('.current');

    if (this.sale) {
      old.textContent = euro.format(this.price);
      current.textContent = euro.format(this.price * (1 - DISCOUNT));
    } else {
      old.textContent = '';
      current.textContent = euro.format(this.price);
    }
    current.classList.toggle('sale', this.sale);
  }
}

customElements.define('product-card', ProductCard);
