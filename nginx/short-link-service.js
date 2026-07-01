const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4001;
const HOST = '127.0.0.1';
const DB_FILE = path.join(__dirname, 'short-links.json');
const BASE_URL = process.env.SHORT_BASE_URL || 'http://114.55.237.202';
const PREVIEW_BASE = `${BASE_URL}/preview?url=`;

let db = {};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    db = {};
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getUniqueId() {
  let id = generateId();
  while (db[id]) {
    id = generateId();
  }
  return id;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // GET /healthz
  if (req.method === 'GET' && url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, links: Object.keys(db).length }));
    return;
  }

  // POST /shorten
  if (req.method === 'POST' && url.pathname === '/shorten') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { url: longUrl } = JSON.parse(body);
        if (!longUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'url is required' }));
          return;
        }

        // 检查是否已存在
        for (const [id, entry] of Object.entries(db)) {
          if (entry.url === longUrl) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id,
              shortUrl: `${BASE_URL}/s/${id}`,
              previewUrl: `${PREVIEW_BASE}${encodeURIComponent(longUrl)}`,
            }));
            return;
          }
        }

        const id = getUniqueId();
        db[id] = { url: longUrl, createdAt: new Date().toISOString() };
        saveDB();

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id,
          shortUrl: `${BASE_URL}/s/${id}`,
          previewUrl: `${PREVIEW_BASE}${encodeURIComponent(longUrl)}`,
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid json' }));
      }
    });
    return;
  }

  // GET /s/:id -> 重定向到预览页
  const match = url.pathname.match(/^\/s\/([a-zA-Z0-9]{6})$/);
  if (req.method === 'GET' && match) {
    const id = match[1];
    const entry = db[id];
    if (entry) {
      res.writeHead(302, { Location: `${PREVIEW_BASE}${encodeURIComponent(entry.url)}` });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - 短链接不存在</h1>');
    }
    return;
  }

  // GET /api/links - 列出所有短链接（管理用）
  if (req.method === 'GET' && url.pathname === '/api/links') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

loadDB();
server.listen(PORT, HOST, () => {
  console.log(`Short link service listening on http://${HOST}:${PORT}`);
  console.log(`Loaded ${Object.keys(db).length} existing links`);
});
