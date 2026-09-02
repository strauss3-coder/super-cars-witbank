/* ==========================================================================
   SUPER CARS WITBANK  ·  Listener leak test
   --------------------------------------------------------------------------
   Navigates the portal through every module several times over and counts the
   listeners left behind on document and window. A handler added on each
   navigation and never removed is a leak: it survives the page it belonged to,
   fires for events it no longer understands, and eventually runs its work N
   times for one click.
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
const wait=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{
  const server=await serve(), base='http://127.0.0.1:'+server.address().port;
  const vc=new VirtualConsole();
  const src=fs.readFileSync(path.join(ROOT,'portal/index.html'),'utf8')
    .replace(/url:'https:\/\/[^']*'/,"url:'https://YOUR-PROJECT.supabase.co'")
    .replace(/key:'[^']*'/,"key:'YOUR-PUBLISHABLE-KEY'");
  const dom=new JSDOM(src,{url:base+'/portal/index.html',runScripts:'dangerously',
    pretendToBeVisual:true,virtualConsole:vc,
    resources:{interceptors:[requestInterceptor(r=>r.url.indexOf(base)===0?undefined
      :new Response('',{headers:{'Content-Type':'text/html'}}))]}});
  dom.window.fetch=()=>Promise.reject(new Error('no database in test'));
  dom.window.scrollTo=()=>{};
  await wait(1200);

  const w=dom.window, d=w.document;

  /* count what is attached to the long-lived objects */
  const counts={};
  for(const [label,obj] of [['document',d],['window',w]]){
    const add=obj.addEventListener.bind(obj), rem=obj.removeEventListener.bind(obj);
    counts[label]=0;
    obj.addEventListener=function(t,f,o){ counts[label]++; return add(t,f,o); };
    obj.removeEventListener=function(t,f,o){ counts[label]--; return rem(t,f,o); };
  }

  const nav=[...d.querySelectorAll('.sb-link')].map(b=>b.dataset.nav);
  const snapshots=[];
  for(let pass=1; pass<=3; pass++){
    for(const id of nav){ w.location.hash='#/'+id; await wait(60); }
    snapshots.push({document:counts.document, window:counts.window});
  }

  let fail=0;
  const say=(ok,m)=>{ if(!ok) fail++; console.log('  '+(ok?'ok    ':'FAIL  ')+m); };
  console.log('  visited '+nav.length+' modules, three times over\n');
  snapshots.forEach((s,i)=>console.log('    after pass '+(i+1)+
    ':  document +'+s.document+'   window +'+s.window));
  console.log();

  const growthDoc = snapshots[2].document - snapshots[0].document;
  const growthWin = snapshots[2].window  - snapshots[0].window;
  say(growthDoc<=0, 'document listeners do not grow with navigation  (change '+growthDoc+')');
  say(growthWin<=0, 'window listeners do not grow with navigation  (change '+growthWin+')');

  /* modals must clean up after themselves too */
  const before=counts.document;
  for(let i=0;i<20;i++){
    w.UI && w.UI.toast && w.UI.toast('ok','x','y');
  }
  say(counts.document-before<=0,'toasts leave nothing behind');

  dom.window.close(); server.close();
  console.log('\n  '+(fail?fail+' failed':'no listener leaks'));
  process.exit(fail?1:0);
})();
