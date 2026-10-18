// service worker for the offline copy; written by chronas_frames/standalone.py --site. Version 98cd8c9716.
const VER = '98cd8c9716', SHELL = 'hm-shell-' + VER, FR = 'hm-frames', FRAMES = ["frames-africa.590d3f2c84.txt", "frames-asia.3f40d8fc9c.txt", "frames-europe.b8a7c5bee4.txt", "frames-mideast_seasia.e25c520634.txt", "frames-namerica.d4f9543648.txt", "frames-samerica.62c48a6d5e.txt"];
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('hm-shell-') && k !== SHELL) await caches.delete(k);
  const fr = await caches.open(FR);
  for (const r of await fr.keys()) { const n = new URL(r.url).pathname.split('/').pop(); if (!FRAMES.includes(n)) await fr.delete(r); }
  await self.clients.claim();
})()); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url); if (u.origin !== location.origin) return;
  if (FRAMES.includes(u.pathname.split('/').pop())) {          // big frame files: cache first, kept until a new build drops them
    e.respondWith(caches.open(FR).then(async c => { const m = await c.match(req); if (m) return m; const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }));
    return;
  }
  e.respondWith((async () => {                                  // page and small files: network first, the saved copy when offline
    const c = await caches.open(SHELL);
    try { const r = await Promise.race([fetch(req, { cache: 'no-cache' }), new Promise((_, j) => setTimeout(j, 5000))]); if (r.ok) c.put(req, r.clone()); return r; }
    catch (err) { return (await c.match(req, { ignoreSearch: true })) || (await c.match('index.html')) || Response.error(); }
  })());
});
