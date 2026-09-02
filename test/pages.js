/* ==========================================================================
   SUPER CARS WITBANK  ·  Page test
   --------------------------------------------------------------------------
   Loads every page in a real DOM, runs its scripts, and fails on any error.

   This exists because `node --check` only proves a file parses. It cannot see
   a ReferenceError, a null being read, or a section that quietly renders
   nothing — all of which are runtime faults that only appear when the code
   actually executes. A syntax check passed happily on a page that was showing
   "Stock could not be loaded" to every visitor.

   Network is blocked on purpose, so each page has to fall back to the content
   built into js/fallback.js. That is also the state a fresh copy of the site
   is in, so this tests the path most people will see first.

       npm --prefix /tmp install jsdom     (once)
       node test/pages.js

   ========================================================================== */
const fs   = require('fs');
const path = require('path');
const http = require('http');
const { JSDOM, VirtualConsole, requestInterceptor } =
  require(process.env.JSDOM_PATH || '/tmp/node_modules/jsdom');

/* Only our own files load. Anything third party — the Google Maps iframe in
   particular — is answered with an empty document, because this is testing our
   code rather than theirs, and a real map in a headless DOM brings the run
   down on an API we do not control. */
function localOnly(base){
  return requestInterceptor(request => {
    if(request.url.indexOf(base) === 0) return undefined;
    return new Response('', { headers:{ 'Content-Type':'text/html' } });
  });
}

const ROOT = path.join(__dirname, '..');

/* The pages are served over HTTP rather than read off disk, so relative paths,
   MIME types and script order are exercised the way a browser would. */
const MIME = {
  '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png',
  '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain'
};

function serve(){
  return new Promise(resolve => {
    const server = http.createServer((req,res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || 'index.html';
      const file = path.join(ROOT, rel);
      /* Never serve outside the project. */
      if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
        res.writeHead(404); return res.end('not found');
      }
      res.writeHead(200,{'Content-Type': MIME[path.extname(file)] || 'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0,'127.0.0.1',() => resolve(server));
  });
}

/* What each page must end up showing. Selectors are checked after the page
   has settled, so an empty result means a section silently failed. */
const PAGES = [
  { file:'index.html', name:'Home', expect:[
      ['[data-hero-copy] h1',            'hero heading'],
      ['.hero-search',                   'search panel'],
      ['.trust-chip',                    'trust badges'],
      ['.stat-cell',                     'figure band'],
      ['[data-featured] .veh',           'featured stock'],
      ['[data-latest] .veh',             'latest arrivals'],
      ['.make-tile',                     'marque tiles'],
      ['.brand-logo',                    'the real logo in the header'],
      ['.gal-card img',                  'dealership gallery'],
      ['[data-review-photo] img',        'handover photograph'],
      ['[data-process] .p-card',         'how buying works'],
      ['.cat',                           'body type tiles'],
      ['[data-promises] .p-card',        'promises'],
      ['[data-why] .why-item',           'why buy from us'],
      ['.tl-row',                        'timeline'],
      ['.faq-item',                      'questions'],
      ['[data-contact-card] .info-row',  'contact card'],
      ['.ftr-top',                       'footer'],
      ['.nav a',                         'navigation']
    ]},
  { file:'inventory.html', name:'Stock list', expect:[
      ['[data-results] .veh',   'vehicle cards'],
      ['[data-filters] .fopt',  'filter options'],
      ['[data-count]',          'result count'],
      ['.nav a',                'navigation']
    ]},
  { file:'vehicle.html', name:'Vehicle detail', query:'?v=2021-toyota-fortuner-2-4gd-6-auto-0009',
    expect:[
      ['.gal-main img',   'gallery'],
      ['.vd-head h1',     'heading'],
      ['.spec',           'specifications'],
      ['.feat-list li',   'features'],
      ['[data-related] .veh', 'related vehicles']
    ]},
  { file:'finance.html', name:'Finance', expect:[
      ['.calc-fields',  'calculator'],
      ['.calc-out',     'result panel'],
      ['[data-apply] form', 'application form'],
      ['[data-fin-steps] .why-item', 'steps']
    ]},
  { file:'sell.html', name:'Sell my car', expect:[
      ['[data-sell-form] form', 'valuation form'],
      ['[data-drop]',           'photo uploader'],
      ['[data-steps] .why-item','steps']
    ]},
  { file:'about.html', name:'About', expect:[
      ['[data-story-photo] img',    'forecourt photograph'],
      ['[data-location-photo] img', 'canopy photograph'],
      ['[data-story] p',    'story'],
      ['[data-values] .why-item', 'values'],
      ['[data-timeline] div',     'timeline'],
      ['[data-team] .tm',         'team']
    ]},
  { file:'testimonials.html', name:'Reviews', expect:[
      ['[data-review-photo] img',    'handover photograph'],
      ['[data-rating] .rating-hero', 'rating block'],
      ['[data-reviews]',             'reviews area']
    ]},
  { file:'contact.html', name:'Contact', expect:[
      ['[data-contact-photo] img', 'dealership photograph'],
      ['[data-details] .info-row', 'contact details'],
      ['[data-contact-form] form', 'enquiry form'],
      ['.hours div',               'opening hours']
    ]},
  { file:'privacy.html', name:'Privacy', expect:[['[data-legal-body] h2','policy text']] },
  { file:'terms.html',   name:'Terms',   expect:[['[data-legal-body] h2','terms text']] },
  { file:'404.html',     name:'Not found', expect:[['.btn','recovery links']] }
];

function loadPage(p, base){
  return new Promise(resolve => {
    const errors = [];
    const vc = new VirtualConsole();

    vc.on('jsdomError', e => errors.push('threw: ' + (e.message || e)));
    vc.on('error',      (...a) => {
      const msg = a.map(String).join(' ');
      /* The data layer logs on purpose when there is no database. That is
         the expected state here, not a fault. */
      if(msg.indexOf('[SC.data]') > -1) return;
      errors.push('console.error: ' + msg);
    });

    const html = fs.readFileSync(path.join(ROOT, p.file), 'utf8');

    const dom = new JSDOM(html, {
      url: base + '/' + p.file + (p.query || ''),
      runScripts: 'dangerously',
      resources: { interceptors:[ localOnly(base) ] },
      pretendToBeVisual: true,
      virtualConsole: vc
    });

    /* Only the database is unreachable. Scripts and stylesheets are served
       normally, so this is a fresh copy of the site with no Supabase behind
       it — the state most people see first. */
    dom.window.fetch = () => Promise.reject(new Error('no database in test'));
    dom.window.scrollTo = () => {};

    dom.window.addEventListener('error', e => errors.push('uncaught: ' + e.message));
    dom.window.addEventListener('unhandledrejection', e =>
      errors.push('unhandled rejection: ' + (e.reason && e.reason.message || e.reason)));

    /* Let the scripts load, the promises settle and the renders run. */
    setTimeout(() => {
      const doc = dom.window.document;
      const missing = (p.expect || [])
        .filter(([sel]) => !doc.querySelector(sel))
        .map(([sel, label]) => label + '  (' + sel + ')');
      dom.window.close();
      resolve({ page:p, errors, missing });
    }, 900);
  });
}

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  let failed = 0;
  console.log('Running every page in a real DOM, served over HTTP, no Supabase.\n');

  for(const p of PAGES){
    const r = await loadPage(p, base);
    const bad = r.errors.length + r.missing.length;
    if(bad) failed++;

    console.log((bad ? '  FAIL  ' : '  ok    ') + p.name.padEnd(16) + p.file);
    r.errors.forEach(e => console.log('          ! ' + e));
    r.missing.forEach(m => console.log('          ~ rendered nothing: ' + m));
  }

  server.close();
  console.log('\n' + (PAGES.length - failed) + ' of ' + PAGES.length + ' pages clean');
  process.exit(failed ? 1 : 0);
})();
