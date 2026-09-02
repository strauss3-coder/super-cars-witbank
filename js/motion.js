/* ==========================================================================
   SUPER CARS WITBANK  ·  Motion
   --------------------------------------------------------------------------
   The interaction layer: scroll reveal, counters, the reading bar, the
   shrinking header, button feedback and the FAQ accordion.

   Three rules run through it:

     1. Nothing here is load-bearing. Every element is readable and usable
        with this file removed, and with motion switched off the CSS drops
        each one straight into its resting state.
     2. Anything watching the scroll is passive and rAF-throttled, so a
        finger drag on a phone is never blocked by our work.
     3. Elements added after load (vehicle cards, rendered sections) are
        picked up by calling SC.scan(root) rather than re-running everything.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC = window.SC || {};
var U  = SC.U;

/* matchMedia is missing in some embedded and headless environments. Asking it
   anything without checking first would throw here and take the whole motion
   layer down with it, leaving the page without its reveal. */
function media(q){
  try{ return !!(window.matchMedia && window.matchMedia(q).matches); }
  catch(e){ return false; }
}

var REDUCED = media('(prefers-reduced-motion: reduce)');
SC.reducedMotion = REDUCED;

/* This file owns every scroll-driven change to the header. Deferred scripts run
   in document order and this one is listed before site.js, so the flag is
   already set when site.js decides whether it needs a fallback of its own.
   Without it both files toggled .scrolled on the same element, one of them on
   every scroll event rather than once a frame. */
SC.ownsHeaderScroll = true;

/* Timing, in one place so it stays consistent everywhere.
   STAGGER was 70ms, which on a six-item row meant the last card arrived four
   tenths of a second after the first — long enough to read as waiting. */
var STAGGER = 42;      /* ms between items in a group */
var STAGGER_MAX = 4;   /* never stagger more than this many steps */

/* ------------------------------------------------------------- reveal -- */
/* One observer for the whole page. Elements opt in with data-anim, and
   data-delay staggers a group without needing a class per position. */
var io = null;

function makeObserver(){
  if(!('IntersectionObserver' in window)) return null;
  return new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el = en.target;
      var delay = Math.min(Number(el.dataset.delay) || 0, STAGGER_MAX);
      if(delay){
        setTimeout(function(){ el.classList.add('in'); }, delay * STAGGER);
      }else{
        el.classList.add('in');          /* the first of a group never waits */
      }
      setTimeout(function(){ el.classList.add('done'); }, delay * STAGGER + 700);
      io.unobserve(el);
    });
  }, {
    /* A positive bottom margin starts the animation while the element is still
       below the fold, so by the time it is scrolled to it has already settled.
       A negative margin held it back until it was on screen, which is what made
       content look like it arrived late. */
    rootMargin:'0px 0px 18% 0px',
    threshold:0
  });
}

/* Call after rendering anything, with the new subtree as root. */
SC.scan = function(root){
  var nodes = U.els('[data-anim]:not(.in)', root || document);
  if(!nodes.length) return;

  if(REDUCED || !('IntersectionObserver' in window)){
    nodes.forEach(function(n){ n.classList.add('in','done'); });
    return;
  }
  if(!io) io = makeObserver();

  /* Measure everything first, then change classes. Interleaving a read with a
     write forces the browser to lay the page out once per element, which on a
     long page is the difference between one layout and forty. */
  var vh = window.innerHeight;
  var seen = nodes.map(function(n){
    var r = n.getBoundingClientRect();
    return r.top < vh * 1.15 && r.bottom > -100;
  });

  nodes.forEach(function(n,i){
    if(seen[i]){
      var d = Math.min(Number(n.dataset.delay) || 0, STAGGER_MAX);
      if(d) setTimeout(function(){ n.classList.add('in'); }, d * STAGGER);
      else n.classList.add('in');
      return;
    }
    io.observe(n);
  });

  countersIn(root);
};

/* Keeps the older attribute working, so nothing written before this file
   needs rewriting. */
SC.reveal = function(root){
  U.els('[data-reveal]:not(.in)', root || document).forEach(function(n){
    n.setAttribute('data-anim', n.getAttribute('data-anim') || 'up');
    if(!n.dataset.delay && n.dataset.reveal) n.dataset.delay = n.dataset.reveal;
  });
  SC.scan(root);
};

/* ----------------------------------------------------------- counters -- */
/* Counts once, when the number first comes into view. Formats through the
   same helper the rest of the site uses, so a thousands separator here can
   never disagree with a price elsewhere. */
var counterIO = null;

function runCounter(el){
  var to = Number(el.dataset.count) || 0;
  var dp = Number(el.dataset.decimals) || 0;
  var pre = el.dataset.prefix || '';
  var suf = el.dataset.suffix || '';

  if(REDUCED || !to){
    el.textContent = pre + (dp ? to.toFixed(dp) : U.group(to)) + suf;
    return;
  }
  var dur = 850, t0 = performance.now();
  function tick(now){
    var p = Math.min(1, (now - t0) / dur);
    var eased = 1 - Math.pow(1 - p, 3);
    var v = to * eased;
    el.textContent = pre + (dp ? v.toFixed(dp) : U.group(Math.round(v))) + suf;
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function countersIn(root){
  var nodes = U.els('[data-count]:not([data-counted])', root || document);
  if(!nodes.length) return;

  if(REDUCED || !('IntersectionObserver' in window)){
    nodes.forEach(function(n){ n.dataset.counted = '1'; runCounter(n); });
    return;
  }
  if(!counterIO){
    counterIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        en.target.dataset.counted = '1';
        runCounter(en.target);
        counterIO.unobserve(en.target);
      });
    }, { threshold:0.25, rootMargin:'0px 0px 10% 0px' });
  }
  nodes.forEach(function(n){ counterIO.observe(n); });
}

/* -------------------------------------------------------- scroll work -- */
/* Every scroll-driven effect shares one rAF-throttled listener. Three
   separate passive listeners would each schedule their own frame. */
function scrollDriver(){
  var hdr  = U.el('[data-header]');
  var bar  = U.el('[data-read-bar]');
  var hero = U.el('[data-parallax]');
  var ticking = false;

  function paint(){
    var y = window.scrollY || window.pageYOffset;

    if(hdr){
      hdr.classList.toggle('scrolled', y > 8);
      hdr.classList.toggle('shrunk', y > 120);
    }
    if(bar){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
    /* A very light parallax on the hero wash. Capped so the element can
       never drift out of its own box. */
    if(hero && !REDUCED && y < window.innerHeight * 1.2){
      hero.style.transform = 'translate3d(0,' + Math.min(y * 0.16, 90) + 'px,0)';
    }
    ticking = false;
  }

  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  paint();
}

/* ------------------------------------------------------------ buttons -- */
/* A ripple from the point of contact. Delegated, so it applies to buttons
   that do not exist yet. */
function buttonFeedback(){
  if(REDUCED) return;
  document.addEventListener('pointerdown', function(e){
    var btn = e.target.closest('.btn');
    if(!btn || btn.disabled) return;

    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = (e.clientX - r.left - size / 2) + 'px';
    dot.style.top  = (e.clientY - r.top  - size / 2) + 'px';
    btn.appendChild(dot);
    setTimeout(function(){ dot.remove(); }, 650);
  }, { passive:true });
}

/* A few pixels of pull toward the cursor on the largest buttons only.
   Skipped entirely on touch, where there is no cursor to be magnetic to. */
function magnetic(){
  /* No cursor, nothing to be magnetic to. */
  if(REDUCED || !media('(hover:hover)')) return;

  U.els('[data-magnetic]').forEach(function(el){
    var raf = null;
    el.addEventListener('pointermove', function(e){
      if(raf) return;
      raf = requestAnimationFrame(function(){
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        raf = null;
      });
    });
    el.addEventListener('pointerleave', function(){
      el.style.transform = '';
    });
  });
}

/* --------------------------------------------------------------- FAQ -- */
/* Delegated so questions rendered later still work. Uses grid-template-rows
   rather than max-height, so a long answer is never clipped and never has a
   guessed height to overshoot. */
function faq(){
  U.on(document, 'click', '.faq-q', function(e, q){
    var item = q.closest('.faq-item');
    if(!item) return;
    var open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ------------------------------------------------------------- images -- */
/* Fades a photograph in once it has actually decoded, so a slow image
   appears deliberately rather than snapping in. */
SC.fadeImages = function(root){
  U.els('img[loading="lazy"]:not([data-faded])', root || document).forEach(function(img){
    img.dataset.faded = '1';
    if(img.complete && img.naturalWidth) return;
    img.style.opacity = '0';
    /* the same duration and curve the stylesheet uses, read from the tokens
       so a change there reaches this too */
    img.style.transition = 'opacity var(--t-slow) var(--ease-soft)';
    var show = function(){ img.style.opacity = '1'; };
    img.addEventListener('load', show, { once:true });
    /* A broken image must not stay invisible. */
    img.addEventListener('error', show, { once:true });
  });
};

/* ---------------------------------------------------------------- go -- */
/* Each piece is independent, so one failing must not stop the others. The
   reveal in particular has to run: without it, anything carrying data-anim
   would sit at opacity 0 until the safety net in core.js fires. */
function boot(){
  [scrollDriver, buttonFeedback, magnetic, faq,
   function(){ SC.scan(document); },
   function(){ SC.fadeImages(document); }
  ].forEach(function(step){
    try{ step(); }
    catch(err){ console.error('[motion] '+(err && err.message)); }
  });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
}else{
  boot();
}

})();
