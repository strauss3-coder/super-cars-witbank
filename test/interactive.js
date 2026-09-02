/* ==========================================================================
   SUPER CARS WITBANK  ·  Interactive element audit
   --------------------------------------------------------------------------
   Renders every page and inspects each thing a visitor can click, tap, type
   into or reach with the keyboard. It fails on the faults that are invisible
   when you look at a page but obvious the moment somebody uses it with a
   screen reader, a keyboard, or a thumb:

     · a control with no accessible name — "button" is all it announces
     · a link that goes nowhere (href="#" with no handler)
     · a field with no label
     · a tap target smaller than the 44px Apple and Google both ask for
     · a toggle that never says whether it is open
     · a control that cannot be reached by tab

   The sizes come from the stylesheet rather than layout, because jsdom has no
   layout engine. That is enough to catch a target declared too small; it
   cannot catch one squeezed by its container, which is what the eye is for.

       node test/interactive.js
   ========================================================================== */
const fs   = require('fs');
const path = require('path');
const http = require('http');
const { JSDOM, VirtualConsole, requestInterceptor } =
  require(process.env.JSDOM_PATH || '/tmp/node_modules/jsdom');

const ROOT = path.join(__dirname, '..');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml',
  '.jpg':'image/jpeg','.png':'image/png','.json':'application/json','.xml':'application/xml','.txt':'text/plain' };

function serve(){
  return new Promise(resolve => {
    const s = http.createServer((req,res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || 'index.html';
      const f = path.join(ROOT, rel);
      if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end(); }
      res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0,'127.0.0.1',()=>resolve(s));
  });
}

const PAGES = ['index.html','inventory.html','finance.html','sell.html',
               'about.html','testimonials.html','contact.html','404.html',
               ['vehicle.html','?v=2021-toyota-fortuner-2-4gd-6-auto-0009']];

/* What a control announces to a screen reader. */
function name(el){
  const txt = (el.getAttribute('aria-label') || '').trim()
    || (el.getAttribute('title') || '').trim()
    || (el.textContent || '').replace(/\s+/g,' ').trim()
    || (el.getAttribute('alt') || '').trim()
    || (el.value || '').trim();
  if(txt) return txt;
  const by = el.getAttribute('aria-labelledby');
  if(by){
    const t = el.ownerDocument.getElementById(by);
    if(t && t.textContent.trim()) return t.textContent.trim();
  }
  return '';
}

function where(el){
  let s = el.tagName.toLowerCase();
  if(el.id) s += '#' + el.id;
  const c = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)[0];
  if(c) s += '.' + c;
  return s;
}

/* Declared tap targets, read out of the stylesheets. A control whose rule sets
   a height or a min-height under 44px is flagged wherever it is used. */
function smallTargets(){
  const css = ['style','components','premium']
    .map(f => fs.readFileSync(path.join(ROOT,'css',f+'.css'),'utf8')).join('\n')
    /* comments out first, or a note above a rule is read as part of its
       selector and the rule is never recognised */
    .replace(/\/\*[\s\S]*?\*\//g,' ');
  const bad = [];
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;

  /* A small glyph is allowed when an invisible box is centred on it to catch
     the thumb. Collect those first, so the control they belong to passes. */
  const enlarged = new Set();
  while((m = re.exec(css))){
    const sel = m[1].replace(/\s+/g,' ').trim();
    const pseudo = /^(.*?)::?(?:before|after)$/.exec(sel.split(',')[0].trim());
    if(!pseudo) continue;
    const w = /(?:^|;)\s*width:\s*([\d.]+)px/.exec(m[2]);
    const h = /(?:^|;)\s*height:\s*([\d.]+)px/.exec(m[2]);
    if(w && h && parseFloat(w[1]) >= 44 && parseFloat(h[1]) >= 44) enlarged.add(pseudo[1].trim());
  }
  re.lastIndex = 0;

  while((m = re.exec(css))){
    const sel = m[1].replace(/\s+/g,' ').trim(), body = m[2];
    if(/^@/.test(sel)) continue;
    if(enlarged.has(sel.split(',')[0].trim())) continue;
    const h = /(?:^|;)\s*(?:min-)?height:\s*([\d.]+)px/.exec(body);
    if(!h) continue;
    const px = parseFloat(h[1]);
    if(px >= 44 || px < 18) continue;              /* under 18px is an icon, not a target */
    /* the glyph inside a control is not the control, and a decoration is not
       a target at all */
    if(/\bsvg\b|::?(before|after)|\btl-dot\b/.test(sel)) continue;
    if(!/\b(btn|chip|tab|fopt|burger|pill|toggle|close)\b/.test(sel)) continue;
    bad.push(sel.split(',')[0].trim() + '  ' + px + 'px');
  }
  return bad;
}

function audit(file, query, base){
  return new Promise(resolve => {
    const vc = new VirtualConsole();
    const dom = new JSDOM(fs.readFileSync(path.join(ROOT,file),'utf8'), {
      url: base+'/'+file+(query||''), runScripts:'dangerously',
      resources:{ interceptors:[ requestInterceptor(r =>
        r.url.indexOf(base)===0 ? undefined : new Response('',{headers:{'Content-Type':'text/html'}})) ]},
      pretendToBeVisual:true, virtualConsole:vc
    });
    dom.window.fetch = () => Promise.reject(new Error('no database in test'));
    dom.window.scrollTo = () => {};

    setTimeout(() => {
      const doc = dom.window.document, faults = [];
      const seen = new Set();
      const add = (what, el) => {
        const k = what + '|' + where(el);
        if(seen.has(k)) return;
        seen.add(k); faults.push(what + ' — ' + where(el));
      };

      /* every control announces something */
      doc.querySelectorAll('button, a, [role="button"], summary').forEach(el => {
        if(el.closest('[aria-hidden="true"]')) return;
        if(!name(el) && !el.querySelector('img[alt]:not([alt=""])')) add('no accessible name', el);
      });

      /* no link that goes nowhere */
      doc.querySelectorAll('a').forEach(a => {
        const h = a.getAttribute('href');
        if(h === null) add('a link with no href', a);
        else if(h === '#') add('a link to nowhere (href="#")', a);
      });

      /* every field is labelled */
      doc.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(f => {
        if(f.getAttribute('aria-label') || f.getAttribute('aria-labelledby')) return;
        if(f.id && doc.querySelector('label[for="'+f.id+'"]')) return;
        if(f.closest('label')) return;
        if(f.getAttribute('placeholder')) { add('labelled by placeholder only', f); return; }
        add('field with no label', f);
      });

      /* a toggle says what state it is in */
      doc.querySelectorAll('[aria-controls]').forEach(t => {
        if(!t.hasAttribute('aria-expanded') && !t.hasAttribute('aria-selected'))
          add('toggle never reports its state', t);
      });

      /* nothing interactive is removed from the tab order */
      doc.querySelectorAll('button[tabindex="-1"], a[href][tabindex="-1"]').forEach(el => {
        if(el.closest('[hidden], [aria-hidden="true"]')) return;
        add('cannot be reached by keyboard', el);
      });

      const counts = {
        buttons: doc.querySelectorAll('button, [role="button"]').length,
        links:   doc.querySelectorAll('a[href]').length,
        fields:  doc.querySelectorAll('input:not([type=hidden]), select, textarea').length
      };
      dom.window.close();
      resolve({ file, faults, counts });
    }, 900);
  });
}

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:'+server.address().port;
  let failed = 0, controls = 0;
  console.log('Auditing every control a visitor can reach.\n');

  for(const p of PAGES){
    const [file, query] = Array.isArray(p) ? p : [p, ''];
    const r = await audit(file, query, base);
    controls += r.counts.buttons + r.counts.links + r.counts.fields;
    if(r.faults.length) failed++;
    console.log((r.faults.length ? '  FAIL  ' : '  ok    ') + file.padEnd(20) +
      r.counts.buttons+' buttons, '+r.counts.links+' links, '+r.counts.fields+' fields');
    r.faults.forEach(f => console.log('          ! '+f));
  }

  const small = smallTargets();
  console.log('\n  tap targets under 44px: ' + (small.length ? '' : 'none'));
  small.forEach(s => console.log('          ! '+s));

  server.close();
  console.log('\n  '+controls+' controls checked across '+PAGES.length+' pages');
  console.log(failed || small.length ? '  Interactive audit FAILED.' : '  Every control is named, reachable and large enough.');
  process.exit(failed || small.length ? 1 : 0);
})();
