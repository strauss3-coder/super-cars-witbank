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

var REDUCED = window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
SC.reducedMotion = REDUCED;

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
      var delay = Number(el.dataset.delay) || 0;
      setTimeout(function(){
        el.classList.add('in');
        /* Drop the compositor hint once it has settled. */
        setTimeout(function(){ el.classList.add('done'); }, 900);
      }, delay * 70);
      io.unobserve(el);
    });
  }, { rootMargin:'0px 0px -9% 0px', threshold:0.08 });
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

  nodes.forEach(function(n){
    /* Anything already on screen when it is created should not wait for a
       scroll that may never come. */
    var r = n.getBoundingClientRect();
    if(r.top < window.innerHeight * 0.92 && r.bottom > 0){
      var d = Number(n.dataset.delay) || 0;
      setTimeout(function(){ n.classList.add('in'); }, d * 70);
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
  var dur = 1100, t0 = performance.now();
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
    }, { threshold:0.4 });
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
  if(REDUCED || !window.matchMedia('(hover:hover)').matches) return;

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
    img.style.transition = 'opacity .5s cubic-bezier(.22,1,.36,1)';
    var show = function(){ img.style.opacity = '1'; };
    img.addEventListener('load', show, { once:true });
    /* A broken image must not stay invisible. */
    img.addEventListener('error', show, { once:true });
  });
};

/* ---------------------------------------------------------------- go -- */
function boot(){
  scrollDriver();
  buttonFeedback();
  magnetic();
  faq();
  SC.scan(document);
  SC.fadeImages(document);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
}else{
  boot();
}

})();
