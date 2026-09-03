/* ==========================================================================
   SUPER CARS WITBANK  ·  Core
   Namespace, formatting helpers, icon registry, toasts, lightbox, reveal.
   Loaded on every page, before every other script.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC = window.SC || {};

/* ------------------------------------------------------------- helpers -- */
var U = SC.U = {
  esc:function(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  },
  /* R209 950, the way prices are written on a South African windscreen.

     Grouped by hand rather than with toLocaleString, because en-ZA gives a
     comma in some engines and a non-breaking space in others. A price has to
     look identical in every browser, so the separator is a plain space we
     put there ourselves. */
  group:function(n){
    var v = Math.round(Math.abs(Number(n)||0));
    return (Number(n) < 0 ? '-' : '') +
           String(v).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  },
  money:function(n){ return 'R' + U.group(n); },
  num:function(n){ return U.group(n); },
  km:function(n){ return U.num(n) + ' km'; },
  date:function(v){
    if(!v) return '';
    var d = new Date(v);
    if(isNaN(d)) return '';
    return d.toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'});
  },
  initials:function(name){
    return String(name||'?').trim().split(/\s+/).slice(0,2)
      .map(function(w){ return w[0]||''; }).join('').toUpperCase();
  },
  /* South African numbers: 072 095 7172 -> 27720957172 for a wa.me link. */
  waNumber:function(raw){
    var d = String(raw||'').replace(/[^0-9]/g,'');
    if(!d) return '';
    if(d.indexOf('27')===0) return d;
    if(d.charAt(0)==='0') return '27'+d.slice(1);
    return d;
  },
  telHref:function(raw){
    var d = String(raw||'').replace(/[^0-9]/g,'');
    if(!d) return '';
    if(d.indexOf('27')===0) return '+'+d;
    if(d.charAt(0)==='0') return '+27'+d.slice(1);
    return '+'+d;
  },
  slug:function(s){
    return String(s||'').toLowerCase()
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  },
  el:function(sel,root){ return (root||document).querySelector(sel); },
  els:function(sel,root){
    return Array.prototype.slice.call((root||document).querySelectorAll(sel));
  },
  on:function(root,ev,sel,fn){
    root.addEventListener(ev,function(e){
      var t = e.target.closest(sel);
      if(t && root.contains(t)) fn(e,t);
    });
  },
  debounce:function(fn,ms){
    var t; ms = ms||220;
    return function(){
      var a=arguments, c=this;
      clearTimeout(t);
      t=setTimeout(function(){ fn.apply(c,a); },ms);
    };
  },
  /* Reads the query string into a plain object. */
  params:function(){
    var out = {};
    new URLSearchParams(location.search).forEach(function(v,k){ out[k]=v; });
    return out;
  },
  /* Very small markdown subset, used for the legal pages that staff edit as
     text in the portal. Headings, bold, links, paragraphs and lists only. */
  markdown:function(src){
    var esc = U.esc(String(src||'').trim());
    var blocks = esc.split(/\n{2,}/);
    return blocks.map(function(b){
      b = b.trim();
      if(!b) return '';
      if(/^###\s+/.test(b)) return '<h3>'+inline(b.replace(/^###\s+/,''))+'</h3>';
      if(/^##\s+/.test(b))  return '<h2>'+inline(b.replace(/^##\s+/,''))+'</h2>';
      if(/^[-*]\s+/m.test(b) && b.split('\n').every(function(l){ return /^[-*]\s+/.test(l.trim()); })){
        return '<ul>'+b.split('\n').map(function(l){
          return '<li>'+inline(l.trim().replace(/^[-*]\s+/,''))+'</li>';
        }).join('')+'</ul>';
      }
      return '<p>'+inline(b).replace(/\n/g,'<br>')+'</p>';
    }).join('');
    function inline(s){
      return s
        .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
    }
  }
};

/* --------------------------------------------------------------- icons -- */
var s = function(p){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '+
         'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
};
SC.icon = {
  chevD:s('<path d="M5.5 9l6.5 6.5L18.5 9"/>'),
  heart:s('<path d="M12 20.5l-1.5-1.4C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.8 3c1.6 0 3.1.7 4 1.9l1.2 1.5 1.2-1.5A5.2 5.2 0 0117.2 3C19.9 3 22 4.9 22 7.6c0 3.8-3.4 6.9-8.5 11.5z"/>'),
  heartFill:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5l-1.5-1.4C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.8 3c1.6 0 3.1.7 4 1.9l1.2 1.5 1.2-1.5A5.2 5.2 0 0117.2 3C19.9 3 22 4.9 22 7.6c0 3.8-3.4 6.9-8.5 11.5z"/></svg>',
  scales:s('<path d="M12 3v18M7 21h10M3 8l4-4 4 4M3 8a4 4 0 008 0M13 8l4-4 4 4M13 8a4 4 0 008 0"/>'),
  award:s('<circle cx="12" cy="9" r="6"/><path d="M8.2 13.9L7 22l5-2.6L17 22l-1.2-8.1"/>'),
  quote:s('<path d="M9.5 6C6.5 7.4 5 10 5 13.2V18h5.6v-5.6H8.2c0-2 .6-3.4 2.4-4.4zM19 6c-3 1.4-4.5 4-4.5 7.2V18h5.6v-5.6h-2.4c0-2 .6-3.4 2.4-4.4z"/>'),
  zap:s('<path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>'),
  clock2:s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>'),
  handshake:s('<path d="M11 17l2 2 4-4"/><path d="M2 11.5l4-4 4.5 4.5a2 2 0 002.8 0L18 7.5l4 4"/><path d="M6 7.5h4M14 7.5h4"/>'),
  sparkle:s('<path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>'),
  doc:s('<path d="M13.5 2.5H7a2 2 0 00-2 2v15a2 2 0 002 2h10a2 2 0 002-2V8l-5.5-5.5z"/><path d="M13.5 2.5V8H19"/>'),
  car:s('<path d="M5 17h14M6.5 17a1.8 1.8 0 11-3.5 0 1.8 1.8 0 013.5 0zM21 17a1.8 1.8 0 11-3.5 0 1.8 1.8 0 013.5 0z"/><path d="M3 14l1.6-5.2A2 2 0 016.5 7.4h11a2 2 0 011.9 1.4L21 14v3H3v-3z"/><path d="M6 11h12"/>'),
  gauge:s('<circle cx="12" cy="12" r="9"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
  fuel:s('<path d="M4 21V5a2 2 0 012-2h6a2 2 0 012 2v16"/><path d="M3 21h12"/><path d="M14 9h3a2 2 0 012 2v6a1.5 1.5 0 003 0V9l-3-3"/><path d="M6 8h6"/>'),
  gear:s('<path d="M6 4v16M12 4v16M18 4v9"/><circle cx="6" cy="4" r="1.4"/><circle cx="12" cy="4" r="1.4"/><circle cx="18" cy="4" r="1.4"/><path d="M6 12h6"/>'),
  cal:s('<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
  seat:s('<path d="M6 4h3a2 2 0 012 2v6H8a2 2 0 01-2-2V4z"/><path d="M6 14h9a3 3 0 013 3v3"/><path d="M4 20h3"/>'),
  bolt:s('<path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>'),
  co2:s('<circle cx="7" cy="12" r="3.4"/><path d="M13.5 15v-2.6a1.6 1.6 0 013.2 0V15M19 9h2.5M19 12h2.5M19 15h2.5"/>'),
  door:s('<path d="M4 21h16M6 21V4a1 1 0 011-1h9a1 1 0 011 1v17"/><circle cx="14" cy="12" r="1"/>'),
  paint:s('<path d="M12 3a9 9 0 000 18c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2a1.7 1.7 0 011.2-2.9H17a4 4 0 004-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/>'),
  tag:s('<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7-7A2 2 0 013 12.2V5a2 2 0 012-2h7.2a2 2 0 011.4.6l7 7a2 2 0 010 2.8z"/><circle cx="7.8" cy="7.8" r="1.3"/>'),
  wrench:s('<path d="M14.5 5.5a4.5 4.5 0 005.9 5.9L21 12l-8.5 8.5a2.1 2.1 0 01-3-3L18 9l.6-.6z"/>'),
  phone:s('<path d="M22 16.9v3a2 2 0 01-2.2 2 19.5 19.5 0 01-8.5-3 19.2 19.2 0 01-5.9-5.9 19.5 19.5 0 01-3-8.6A2 2 0 014.4 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.5 9.8a15.7 15.7 0 005.7 5.7l1.2-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/>'),
  mail:s('<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 7l9 6 9-6"/>'),
  pin:s('<path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"/><circle cx="12" cy="10.4" r="2.8"/>'),
  /* WhatsApp is a brand mark, not a line icon, so it does NOT go through s().
     That helper draws fill:none + stroke, which turned the solid glyph into an
     outlined blob with a squiggle in it. This is the official geometry, filled,
     with fill-rule evenodd so the bubble reads as a ring and the handset sits
     inside it whichever way the contours happen to wind. The viewBox is padded
     to 27.2 so the full-bleed mark carries the same optical weight as the
     stroked icons it sits beside at 14px, 17px and 28px. */
  wa:'<svg viewBox="-1.6 -1.6 27.2 27.2" fill="currentColor" fill-rule="evenodd" '+
     'clip-rule="evenodd" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967'+
     '-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15'+
     '-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133'+
     '.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612'+
     '-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372'+
     '-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487'+
     '.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248'+
     '-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1'+
     '-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45'+
     ' 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003'+
     ' 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157'+
     ' 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005'+
     'c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488"/></svg>',
  star:s('<path d="M12 3.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9L12 3.4z"/>'),
  starFill:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9L12 3.4z"/></svg>',
  shield:s('<path d="M12 22s8-4 8-10V5.5l-8-3-8 3V12c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
  bank:s('<path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M2.5 21h19M12 2.5L21 8H3l9-5.5z"/>'),
  swap:s('<path d="M7 4L3.5 7.5 7 11"/><path d="M3.5 7.5H17a3.5 3.5 0 013.5 3.5"/><path d="M17 20l3.5-3.5L17 13"/><path d="M20.5 16.5H7A3.5 3.5 0 013.5 13"/>'),
  check:s('<path d="M4.5 12.5l5 5 10-11"/>'),
  checkCircle:s('<circle cx="12" cy="12" r="9"/><path d="M8.2 12.3l2.6 2.6 5-5.4"/>'),
  x:s('<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>'),
  search:s('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>'),
  arrowR:s('<path d="M4.5 12h15M13.5 6l6 6-6 6"/>'),
  chevR:s('<path d="M9 5.5l6.5 6.5L9 18.5"/>'),
  chevL:s('<path d="M15 5.5L8.5 12l6.5 6.5"/>'),
  menu:s('<path d="M3.5 12h17M3.5 6.5h17M3.5 17.5h17"/>'),
  grid:s('<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>'),
  list:s('<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12M3.6 6.5h.01M3.6 12h.01M3.6 17.5h.01"/>'),
  filter:s('<path d="M3 5.5h18l-7 8v5.5l-4 2V13.5l-7-8z"/>'),
  camera:s('<path d="M3 8.5A2.5 2.5 0 015.5 6h1.7l1.2-2h6.2l1.2 2h1.7A2.5 2.5 0 0120 8.5v8A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5z"/><circle cx="11.8" cy="12.2" r="3.2"/>'),
  info:s('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>'),
  warn:s('<path d="M10.3 3.7L2.5 17a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.7a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
  key:s('<circle cx="7.5" cy="15.5" r="4"/><path d="M10.5 12.5L20 3M17 6l2.5 2.5M14.5 8.5L17 11"/>'),
  fb:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V7a1.5 1.5 0 011.5-1.5H17V2.5h-2.5A4.5 4.5 0 0010 7v1.5H7.5V12H10v9.5h4V12h2.6l.4-3.5H14z"/></svg>',
  ig:s('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>'),
  tiktok:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 2.5h-3v13a2.6 2.6 0 11-2.6-2.6c.3 0 .5 0 .8.1V9.9a5.7 5.7 0 102.8 5v-6a6.5 6.5 0 004 1.4V7.2a3.7 3.7 0 01-2-4.7z"/></svg>',
  globe:s('<circle cx="12" cy="12" r="9"/><path d="M3.2 9.5h17.6M3.2 14.5h17.6"/><path d="M12 3a15 15 0 010 18 15 15 0 010-18z"/>'),
  doc:s('<path d="M13.5 2.5H7a2 2 0 00-2 2v15a2 2 0 002 2h10a2 2 0 002-2V8l-5.5-5.5z"/><path d="M13.5 2.5V8H19"/>')
};

/* -------------------------------------------------------------- toasts -- */
SC.toast = function(kind,title,text){
  var host = U.el('#toasts');
  if(!host){
    host = document.createElement('div');
    host.id = 'toasts';
    document.body.appendChild(host);
  }
  var t = document.createElement('div');
  t.className = 'toast ' + (kind||'ok');
  t.setAttribute('role','status');
  t.innerHTML = (kind==='err' ? SC.icon.warn : SC.icon.checkCircle) +
    '<div><b>'+U.esc(title)+'</b>'+(text?'<span>'+U.esc(text)+'</span>':'')+'</div>';
  host.appendChild(t);
  setTimeout(function(){
    t.classList.add('out');
    setTimeout(function(){ t.remove(); },260);
  }, kind==='err' ? 6000 : 4200);
};

/* ------------------------------------------------------------ lightbox -- */
/* One instance, reused. Opened with SC.lightbox(images, startIndex). */
SC.lightbox = (function(){
  var box, imgEl, countEl, list = [], i = 0, lastFocus = null;

  function build(){
    box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
    box.setAttribute('aria-label','Vehicle photograph');
    box.innerHTML =
      '<button class="lb-close" aria-label="Close">'+SC.icon.x+'</button>'+
      '<button class="lb-nav prev" aria-label="Previous photograph">'+SC.icon.chevL+'</button>'+
      '<img alt="">'+
      '<button class="lb-nav next" aria-label="Next photograph">'+SC.icon.chevR+'</button>'+
      '<div class="lb-count"></div>';
    document.body.appendChild(box);
    imgEl = box.querySelector('img');
    countEl = box.querySelector('.lb-count');
    box.querySelector('.lb-close').addEventListener('click',close);
    box.querySelector('.prev').addEventListener('click',function(e){ e.stopPropagation(); step(-1); });
    box.querySelector('.next').addEventListener('click',function(e){ e.stopPropagation(); step(1); });
    box.addEventListener('click',function(e){ if(e.target===box) close(); });
    document.addEventListener('keydown',function(e){
      if(!box.classList.contains('on')) return;
      if(e.key==='Escape') close();
      if(e.key==='ArrowLeft') step(-1);
      if(e.key==='ArrowRight') step(1);
    });
  }
  function paint(){
    imgEl.src = list[i];
    imgEl.alt = 'Photograph ' + (i+1) + ' of ' + list.length;
    countEl.textContent = (i+1) + ' / ' + list.length;
    var many = list.length > 1;
    box.querySelector('.prev').hidden = !many;
    box.querySelector('.next').hidden = !many;
  }
  function step(d){
    if(!list.length) return;
    i = (i + d + list.length) % list.length;
    paint();
  }
  function close(){
    box.classList.remove('on');
    document.body.style.overflow = '';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  return function(images,start){
    if(!images || !images.length) return;
    if(!box) build();
    lastFocus = document.activeElement;
    list = images;
    i = Math.max(0, Math.min(start||0, list.length-1));
    paint();
    box.classList.add('on');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  };
})();

/* -------------------------------------------------------- reveal safety -- */
/* js/motion.js owns the reveal. This is only the net beneath it: if that file
   fails to load or throws, anything still waiting is shown rather than left
   invisible. Content must never depend on an animation arriving. */
setTimeout(function(){
  U.els('[data-anim]:not(.in)').forEach(function(n){ n.classList.add('in','done'); });
  U.els('[data-reveal]:not(.in)').forEach(function(n){ n.classList.add('in'); });
  /* A figure that never counted would sit on its placeholder zero, which reads
     as a real number rather than as an animation that did not arrive. */
  U.els('[data-count]:not([data-counted])').forEach(function(n){
    n.dataset.counted = '1';
    var to = Number(n.dataset.count) || 0;
    var dp = Number(n.dataset.decimals) || 0;
    n.textContent = (n.dataset.prefix || '') +
      (dp ? to.toFixed(dp) : U.group(to)) + (n.dataset.suffix || '');
  });
}, 2600);


})();
