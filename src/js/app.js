// CampusNotes – Schritt 3: Caching-Strategien und Update-Hinweis
'use strict';

const APP_VERSION = '03-caching';
const STORAGE_KEY = 'campusnotes.notes';

const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const noteList = document.getElementById('note-list');
const menuList = document.getElementById('menu-list');
const menuMeta = document.getElementById('menu-meta');
const statusEl = document.getElementById('status');

document.getElementById('app-version').textContent = APP_VERSION;

// ---------- Notizen (localStorage) ----------

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const notes = loadNotes();
  if (notes.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Noch keine Notizen.';
    noteList.replaceChildren(li);
    return;
  }
  noteList.replaceChildren(...notes.map(note => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = note.text;
    const del = document.createElement('button');
    del.className = 'icon-button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Notiz „${note.text}“ löschen`);
    del.addEventListener('click', () => {
      saveNotes(loadNotes().filter(n => n.id !== note.id));
      renderNotes();
    });
    li.append(text, del);
    return li;
  }));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  saveNotes([...loadNotes(), { id: crypto.randomUUID(), text, created: Date.now() }]);
  input.value = '';
  renderNotes();
});

// ---------- Mensaplan (JSON-API) ----------

async function loadMenu() {
  try {
    const response = await fetch('/api/menu.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const menu = await response.json();
    menuMeta.textContent = `(Stand: ${new Date(menu.updated).toLocaleString('de-DE')})`;
    menuList.replaceChildren(...menu.dishes.map(dish => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.className = 'dish';
      name.textContent = dish.name;
      const category = document.createElement('span');
      category.className = 'badge';
      category.textContent = dish.category;
      const price = document.createElement('span');
      price.className = 'price';
      price.textContent = dish.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
      li.append(name, category, price);
      return li;
    }));
  } catch (err) {
    console.warn('[App] Speiseplan konnte nicht geladen werden:', err);
    const li = document.createElement('li');
    li.className = 'error';
    li.textContent = 'Speiseplan nicht verfügbar.';
    menuList.replaceChildren(li);
  }
}

// ---------- Online-/Offline-Anzeige ----------

function updateStatus() {
  statusEl.textContent = navigator.onLine ? 'online' : 'offline';
  statusEl.classList.toggle('offline', !navigator.onLine);
}
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);

// ---------- Service Worker und Update-Hinweis ----------

function showUpdateBanner(worker) {
  const banner = document.getElementById('update-banner');
  banner.hidden = false;
  document.getElementById('update-button').onclick = () => {
    // Der wartende Service Worker ruft daraufhin skipWaiting() auf (siehe sw.js)
    worker.postMessage({ type: 'SKIP_WAITING' });
  };
}

if ('serviceWorker' in navigator) {
  // Gab es beim Laden schon einen Controller? Nur dann ist ein Controller-Wechsel ein Update.
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[App] Service Worker registriert, Scope:', registration.scope);

      // Fall 1: Beim Laden wartet bereits eine neue Version
      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateBanner(registration.waiting);
      }
      // Fall 2: Während die Seite offen ist, wird eine neue Version gefunden
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });
    } catch (err) {
      console.error('[App] Registrierung fehlgeschlagen:', err);
    }
  });
}

updateStatus();
renderNotes();
loadMenu();
