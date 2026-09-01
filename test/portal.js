/* ==========================================================================
   SUPER CARS WITBANK  ·  Portal test
   --------------------------------------------------------------------------
   Opens the portal in a real DOM and visits every module, so a render() or
   mount() that throws is caught here rather than by whoever clicks it.

       node test/portal.js
   ========================================================================== */
const fs   = require('fs');
const path = require('path');
const http = require('http');
const { JSDOM, VirtualConsole, requestInterceptor } =
  require(process.env.JSDOM_PATH || '/tmp/node_modules/jsdom');

const ROOT = path.join(__dirname, '..');
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
               '.svg':'image/svg+xml', '.jpg':'image/jpeg' };

function serve(){
  return new Promise(resolve => {
    const server = http.createServer((req,res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || 'index.html';
      const file = path.join(ROOT, rel);
      if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
        res.writeHead(404); return res.end('nope');
      }
      res.writeHead(200,{'Content-Type':MIME[path.extname(file)] || 'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0,'127.0.0.1',()=>resolve(server));
  });
}

const wait = ms => new Promise(r => setTimeout(r,ms));

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('threw: ' + (e.message||e)));
  vc.on('error', (...a) => {
    const m = a.map(String).join(' ');
    if(m.indexOf('[SC.data]') > -1) return;
    errors.push('console.error: ' + m);
  });

  const dom = new JSDOM(fs.readFileSync(path.join(ROOT,'portal/index.html'),'utf8'), {
    url: base + '/portal/index.html',
    runScripts:'dangerously',
    resources:{ interceptors:[ requestInterceptor(r =>
      r.url.indexOf(base) === 0 ? undefined
        : new Response('', {headers:{'Content-Type':'text/html'}})) ] },
    pretendToBeVisual:true,
    virtualConsole: vc
  });
  dom.window.fetch = () => Promise.reject(new Error('no database in test'));
  /* jsdom does not implement scrolling. The portal scrolls to the top on every
     navigation, which is correct behaviour, so it is stubbed rather than
     treated as a fault. */
  dom.window.scrollTo = () => {};
  dom.window.addEventListener('error', e => errors.push('uncaught: ' + e.message));
  dom.window.addEventListener('unhandledrejection', e =>
    errors.push('unhandled rejection: ' + (e.reason && e.reason.message || e.reason)));

  await wait(1200);
  const w = dom.window, doc = w.document;

  console.log('Opening the portal with no database behind it.\n');

  const boot = [];
  if(!doc.querySelector('.sb-link')) boot.push('sidebar rendered no links');
  if(!doc.querySelector('#view').innerHTML.trim()) boot.push('the view is empty');
  boot.forEach(b => errors.push(b));

  const nav = [...doc.querySelectorAll('.sb-link')].map(b => b.dataset.nav);
  console.log('  ' + nav.length + ' modules in the sidebar\n');

  let failed = 0;
  for(const id of nav){
    const before = errors.length;
    w.location.hash = '#/' + id;
    await wait(260);

    const view = doc.querySelector('#view');
    const empty = !view || !view.innerHTML.trim() || view.innerHTML.indexOf('Something went wrong') > -1;
    const threw = errors.length > before;
    const bad = empty || threw;
    if(bad) failed++;

    /* Tabs are separate render paths inside one module, so each is opened
       too. The Homepage Editor alone has nine. */
    let tabNote = '';
    if(!bad){
      const tabs = [...view.querySelectorAll('[data-tab]')].map(t => t.dataset.tab);
      let tabBad = 0;
      for(const t of tabs){
        const tb = errors.length;
        const btn = doc.querySelector('#view [data-tab="' + t + '"]');
        if(!btn) continue;
        btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
        await wait(90);
        const v = doc.querySelector('#view');
        if(!v || !v.innerHTML.trim() || errors.length > tb){ tabBad++; failed++; }
      }
      if(tabs.length) tabNote = tabs.length + ' tabs' + (tabBad ? ', ' + tabBad + ' BROKEN' : '');
    }

    console.log((bad || tabNote.indexOf('BROKEN') > -1 ? '  FAIL  ' : '  ok    ') +
      id.padEnd(14) + (empty ? 'rendered nothing' : tabNote));
    errors.slice(before).forEach(e => console.log('          ! ' + e));
  }

  dom.window.close();
  server.close();
  console.log('\n' + (nav.length - failed) + ' of ' + nav.length + ' modules clean');
  process.exit(failed || boot.length ? 1 : 0);
})();
