// Minimaler Entwicklungsserver für CampusNotes – ohne Abhängigkeiten.
//
//   node server.js <ordner> [port]
//   z. B.  node server.js 00-starter
//          node server.js 03-caching 3001
//
// Liefert die Dateien des Ordners statisch aus und stellt eine kleine
// Mock-API bereit:  GET/POST /api/notes  (Daten nur im Arbeitsspeicher).
'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3]) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const notes = [];

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function handleNotes(req, res) {
  if (req.method === 'GET') {
    return send(res, 200, JSON.stringify(notes), MIME['.json']);
  }
  if (req.method === 'POST') {
    try {
      const note = JSON.parse(await readBody(req));
      if (typeof note.text !== 'string' || !note.id) throw new Error('id und text erforderlich');
      if (!notes.some(n => n.id === note.id)) notes.push({ ...note, received: Date.now() });
      console.log(`  → Notiz gespeichert: "${note.text}" (insgesamt ${notes.length})`);
      return send(res, 201, JSON.stringify(note), MIME['.json']);
    } catch (err) {
      return send(res, 400, `Ungültige Notiz: ${err.message}`);
    }
  }
  return send(res, 405, 'Method Not Allowed');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${new Date().toLocaleTimeString('de-DE')}  ${req.method} ${url.pathname}`);

  if (url.pathname === '/api/notes') return handleNotes(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed');

  let filePath = path.join(root, decodeURIComponent(url.pathname));
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return send(res, 403, 'Forbidden');

  try {
    if ((await fs.stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    const body = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    send(res, 404, 'Not Found');
  }
});

server.listen(port, () => {
  console.log(`CampusNotes läuft auf http://localhost:${port}/  (Ordner: ${root})`);
});
