/* ==========================================================================
   SUPER CARS WITBANK  ·  Animation test
   --------------------------------------------------------------------------
   Renders every page and checks that nothing carrying data-anim is left at
   opacity 0. An element that never receives .in is invisible to the visitor
   while being perfectly present in the DOM, so no other test would see it.

       node test/animation.js
   ========================================================================== */
const fs=require('fs'),path=require('path'),http=require('http');
const {JSDOM,VirtualConsole,requestInterceptor}=require(process.env.JSDOM_PATH || '/tmp/node_modules/jsdom');
const ROOT=path.join(__dirname,'..');
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{const rel=decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html';
 const f=path.join(ROOT,rel); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
srv.listen(0,'127.0.0.1',async()=>{
 const base='http://127.0.0.1:'+srv.address().port;
 const pages=['index.html','inventory.html','finance.html','sell.html','about.html','testimonials.html','contact.html'];
 let bad=0;
 for(const p of pages){
  const r=await new Promise(res=>{
   const dom=new JSDOM(fs.readFileSync(path.join(ROOT,p),'utf8'),{url:base+'/'+p,runScripts:'dangerously',
    resources:{interceptors:[requestInterceptor(x=>x.url.indexOf(base)===0?undefined:new Response('',{headers:{'Content-Type':'text/html'}}))]},
    pretendToBeVisual:true,virtualConsole:new VirtualConsole()});
   dom.window.fetch=()=>Promise.reject(new Error('no db'));dom.window.scrollTo=()=>{};
   // jsdom reports every element at 0x0, so "above the fold" is true for all of
   // them. Anything left without .in after everything has settled would be an
   // element the reveal simply never reached.
   setTimeout(()=>{const d=dom.window.document;
    const all=d.querySelectorAll('[data-anim]');
    const stuck=[...all].filter(e=>!e.classList.contains('in'));
    const obs=[...d.querySelectorAll('[data-count]')].filter(e=>!e.dataset.counted);
    dom.window.close();res({total:all.length,stuck:stuck.map(e=>e.tagName.toLowerCase()+'.'+((e.className||'').split(' ')[0]||'?')),counters:obs.length});},1400);
  });
  const ok=r.stuck.length===0;
  if(!ok)bad++;
  console.log((ok?'  ok    ':'  FAIL  ')+p.padEnd(20)+r.total+' animated elements, all revealed'+(r.counters?', '+r.counters+' counters pending':''));
  r.stuck.slice(0,6).forEach(s=>console.log('          ! never revealed: '+s));
 }
 srv.close();
 console.log('\n  '+(bad?'BROKEN ANIMATIONS':'No element is left stuck invisible.'));
 process.exit(bad?1:0);
});
