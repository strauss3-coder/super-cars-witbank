/* ==========================================================================
   SUPER CARS WITBANK  ·  Mobile menu test
   --------------------------------------------------------------------------
   Taps the burger the way a finger does — on the icon inside it, not on the
   button's padding — and asserts one tap opens and one tap closes, every time,
   for a hundred cycles.
   ========================================================================== */
const fs=require('fs'), path=require('path'), http=require('http');
const { JSDOM, VirtualConsole, requestInterceptor } = require('/tmp/node_modules/jsdom');
const ROOT=path.join(__dirname,'..');
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};

function serve(){return new Promise(r=>{const s=http.createServer((q,res)=>{
  const rel=decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html';
  const f=path.join(ROOT,rel);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);});s.listen(0,'127.0.0.1',()=>r(s));});}

(async()=>{
  const server=await serve(), base='http://127.0.0.1:'+server.address().port;
  const vc=new VirtualConsole();
  const errs=[]; vc.on('jsdomError',e=>errs.push(String(e.message||e)));

  const dom=new JSDOM(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'),{
    url:base+'/index.html',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
    resources:{interceptors:[requestInterceptor(r=>r.url.indexOf(base)===0?undefined
      :new Response('',{headers:{'Content-Type':'text/html'}}))]}});
  dom.window.fetch=()=>Promise.reject(new Error('no database in test'));
  dom.window.scrollTo=()=>{};
  await new Promise(r=>setTimeout(r,900));

  const w=dom.window, d=w.document;
  const burger=d.querySelector('#burger'), menu=d.querySelector('#nav');
  let fail=0;
  const say=(ok,m)=>{ if(!ok) fail++; console.log('  '+(ok?'ok    ':'FAIL  ')+m); };

  say(!!burger,'the burger exists');
  say(!!menu,'the menu exists');
  if(!burger||!menu){ server.close(); process.exit(1); }

  /* A finger lands on the icon, not on the padding. That distinction is the
     whole bug, so the test has to reproduce it. */
  const tap=()=>{
    const target = burger.querySelector('svg *') || burger.querySelector('svg') || burger;
    target.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  };

  tap();
  say(menu.classList.contains('open'), 'one tap on the icon OPENS the menu');
  tap();
  say(!menu.classList.contains('open'),'one tap on the icon CLOSES the menu');

  /* and again, a hundred times, because the failure was intermittent */
  let opened=0, closed=0;
  for(let i=0;i<100;i++){
    tap(); if(menu.classList.contains('open')) opened++;
    tap(); if(!menu.classList.contains('open')) closed++;
  }
  say(opened===100,'100 taps opened it 100 times  (got '+opened+')');
  say(closed===100,'100 taps closed it 100 times  (got '+closed+')');

  /* a tap on the page itself must still close it */
  tap();
  d.querySelector('main').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  say(!menu.classList.contains('open'),'tapping the page closes it');

  say(errs.length===0,'nothing threw  '+(errs[0]||''));
  dom.window.close(); server.close();
  console.log('\n  '+(fail?fail+' failed':'menu is solid'));
  process.exit(fail?1:0);
})();
