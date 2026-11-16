// Übung 1 – Lösung: <counter-button start="5">

class CounterButton extends HTMLElement {
  static observedAttributes = ['start'];

  count = 0;
  button = null;

  constructor() {
    super();
    console.log('constructor');
  }

  connectedCallback() {
    console.log('connectedCallback');
    // connectedCallback läuft bei jedem Einhängen (auch beim Verschieben!),
    // deshalb den Button nur einmal anlegen.
    if (!this.button) {
      this.button = document.createElement('button');
      this.button.addEventListener('click', () => {
        this.count++;
        this.render();
      });
      this.append(this.button);
    }
    this.render();
  }

  disconnectedCallback() {
    console.log('disconnectedCallback');
  }

  adoptedCallback() {
    console.log('adoptedCallback');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback', name, oldValue, '→', newValue);
    if (name === 'start') {
      this.count = Number(newValue) || 0;
      this.render();
    }
  }

  // Property-API zusätzlich zum Attribut
  get count() {
    return this.count;
  }

  render() {
    // Kann vor connectedCallback aufgerufen werden (attributeChangedCallback beim Parsen)
    if (this.button) this.button.textContent = `Klicks: ${this.count}`;
  }
}

// Bonus: verzögerte Definition, um :not(:defined) und whenDefined() zu zeigen
const DELAY_MS = 0; // z. B. auf 2000 setzen
setTimeout(() => customElements.define('counter-button', CounterButton), DELAY_MS);

customElements.whenDefined('counter-button').then(() => console.log('counter-button ist definiert'));
