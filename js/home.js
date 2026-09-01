/* ==========================================================================
   SUPER CARS WITBANK  ·  Home page
   --------------------------------------------------------------------------
   Renders every section from the `homepage` settings document, which the
   portal's Homepage Editor writes.

   Three rules run through this file:

     A section switched off in homepage.sections is removed, not hidden.
     A section with nothing to show removes itself, so an empty list never
       leaves a heading with a gap under it.
     Anything derived from live stock (the marques, the body types, the
       "vehicles in stock" figure) is counted at render time rather than
       typed, so it cannot go stale.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

var featuredHost = U.el('[data-featured]');
var latestHost   = U.el('[data-latest]');
if(featuredHost) featuredHost.innerHTML = SC.cardSkeletons(4);
if(latestHost)   latestHost.innerHTML   = SC.cardSkeletons(3);

Promise.all([
  SC.site,
  SC.data.settings(),
  SC.data.vehicles(),
  SC.data.testimonials()
]).then(function(r){
  var settings = r[1], vehicles = r[2], reviews = r[3];
  var home = settings.homepage || {};
  var biz  = settings.business || {};
  var fin  = settings.finance  || {};
  var about= settings.about    || {};
  var on   = home.sections || {};

  /* Sections the portal has switched off leave the document entirely. */
  U.els('[data-sec]').forEach(function(el){
    if(on[el.dataset.sec] === false) el.remove();
  });

  /* Work the instalment out once per vehicle rather than per card. */
  vehicles.forEach(function(v){
    if(v.price > 0 && !v.installment) v.installment = SC.instalment(v.price, fin);
  });
  SC.markNewArrivals(vehicles);
  if(SC.compare) SC.compare.attach(vehicles);

  paintText(home);
  paintHero(home, vehicles);
  paintTrust(home);
  paintStats(home, vehicles);
  paintFeatured(home, vehicles);
  paintLatest(home, vehicles);
  paintMakes(home, vehicles);
  paintProcess(home);
  paintCategories(home, vehicles);
  paintPromises(home);
  paintWhy(home);
  paintTimeline(home, about);
  paintTestimonials(home, reviews);
  paintSold(home, vehicles);
  paintAboutRating(biz);
  paintFaq(home);
  paintContact(biz);

  SC.scan(document);
  SC.fadeImages(document);
}).catch(function(err){
  console.error('[home] '+err.message);
  if(featuredHost) featuredHost.innerHTML = errorBox();
  if(latestHost)   latestHost.closest('[data-sec]').remove();
});

function errorBox(){
  return '<div class="empty" style="grid-column:1/-1">'+SC.icon.warn+
    '<b>Stock could not be loaded</b>'+
    '<p>Something went wrong reaching our system. Please refresh, or telephone us and '+
    'we will tell you what is on the floor.</p></div>';
}

/* Removes a whole section when it has nothing to say. */
function drop(host){
  if(!host) return;
  var sec = host.closest('[data-sec]');
  (sec || host).remove();
}
function show(host){
  if(!host) return;
  var sec = host.closest('[data-sec]');
  if(sec) sec.hidden = false;
}

/* ------------------------------------------------------ text bindings -- */
function paintText(home){
  U.els('[data-home]').forEach(function(el){
    var v = home[el.dataset.home];
    /* A missing value leaves the markup alone, so an empty field can never
       blank out a heading. */
    if(v) el.textContent = v;
  });
  U.els('[data-home-cta]').forEach(function(el){
    var cta = home[el.dataset.homeCta];
    if(cta && cta.text){
      el.textContent = cta.text;
      if(cta.link) el.href = cta.link;
    }else{
      el.remove();
    }
  });
}

/* ---------------------------------------------------------------- hero -- */
function paintHero(home,vehicles){
  var host = U.el('[data-hero-copy]');
  if(!host) return;

  var photo = U.el('[data-hero-photo]');
  if(photo && home.heroPhoto){
    photo.style.backgroundImage = 'url("'+home.heroPhoto+'")';
    photo.hidden = false;
  }

  host.innerHTML =
    (home.heroBadge
      ? '<span class="hero-eyebrow" data-anim="down"><i class="beacon"></i>'+
        U.esc(home.heroBadge)+'</span>' : '')+
    '<h1 data-anim="up" data-delay="1">'+U.esc(home.heroTitle||'')+
      (home.heroTitleAccent
        ? '<span class="accent">'+U.esc(home.heroTitleAccent)+'</span>' : '')+
    '</h1>'+
    (home.heroSubtitle
      ? '<p class="lead" data-anim="up" data-delay="2">'+U.esc(home.heroSubtitle)+'</p>' : '')+
    '<div class="hero-cta" data-anim="up" data-delay="3">'+
      cta(home.ctaPrimary,'btn-pri')+
      cta(home.ctaSecondary,'btn-inv')+
    '</div>';

  function cta(o,cls){
    if(!o || !o.text) return '';
    return '<a class="btn '+cls+' btn-lg" href="'+U.esc(o.link||'#')+'"'+
      (cls==='btn-pri'?' data-magnetic':'')+'>'+U.esc(o.text)+
      (cls==='btn-pri' ? SC.icon.arrowR : '')+'</a>';
  }

  paintSearch(home, vehicles);
}

/* The search panel offers only makes and body types actually in stock, so a
   visitor cannot pick a filter that returns nothing. */
function paintSearch(home,vehicles){
  /* The section switch already removed this if it was turned off. */
  var host = U.el('[data-hero-search]');
  if(!host) return;

  var live = vehicles.filter(function(v){ return !v.sold; });
  var makes  = uniq(live.map(function(v){ return v.make; })).sort();
  var bodies = uniq(live.map(function(v){ return v.body; })).sort();
  var maxPrice = live.reduce(function(m,v){ return Math.max(m, v.price||0); },0);

  host.innerHTML =
    '<form class="hero-search" role="search" aria-label="Search our stock" '+
      'data-anim="left" data-delay="2">'+
      '<h3>Find your next car</h3>'+
      '<div class="fields">'+
        '<select name="make" aria-label="Make"><option value="">Any make</option>'+
          makes.map(function(m){ return '<option>'+U.esc(m)+'</option>'; }).join('')+
        '</select>'+
        '<select name="body" aria-label="Body type"><option value="">Any body</option>'+
          bodies.map(function(b){ return '<option>'+U.esc(b)+'</option>'; }).join('')+
        '</select>'+
        '<select name="max" class="full" aria-label="Maximum price">'+
          '<option value="">Any price</option>'+
          priceBands(maxPrice).map(function(b){
            return '<option value="'+b+'">Up to '+U.money(b)+'</option>';
          }).join('')+
        '</select>'+
        '<input class="full" type="search" name="q" '+
          'placeholder="'+U.esc(home.searchPlaceholder||'Search by make, model or keyword')+'" '+
          'aria-label="Search by keyword">'+
      '</div>'+
      '<button class="btn btn-pri btn-block" type="submit">'+SC.icon.search+'Search stock</button>'+
      '<p style="font-size:11.5px;color:var(--text-inv-3);text-align:center;margin-top:11px">'+
        live.length+' vehicles on the floor right now</p>'+
    '</form>';

  host.querySelector('form').addEventListener('submit',function(e){
    e.preventDefault();
    var fd = new FormData(e.target), qs = new URLSearchParams();
    ['make','body','max','q'].forEach(function(k){
      var v = (fd.get(k)||'').trim();
      if(v) qs.set(k,v);
    });
    location.href = 'inventory.html' + (qs.toString() ? '?'+qs : '');
  });
}

function priceBands(max){
  if(!max) return [];
  return [100000,150000,200000,250000,300000,400000,500000,750000,1000000]
    .filter(function(s){ return s < max; })
    .concat([Math.ceil(max/50000)*50000]);
}

/* --------------------------------------------------------------- trust -- */
function paintTrust(home){
  var host = U.el('[data-trust]');
  if(!host) return;
  var list = Array.isArray(home.trust) ? home.trust : [];
  if(!list.length) return drop(host);

  host.innerHTML = list.map(function(t,i){
    return '<span class="trust-chip" data-anim="up" data-delay="'+(4+i)+'">'+
      (SC.icon[t.icon] || SC.icon.check)+
      '<span><b>'+U.esc(t.value||'')+'</b> '+U.esc(t.label||'')+'</span></span>';
  }).join('');
  show(host);
}

/* --------------------------------------------------------------- stats -- */
/* A figure whose value is the word "auto" is counted from live data rather
   than typed, so the stock number can never go stale. */
function paintStats(home,vehicles){
  var host = U.el('[data-hero-stats]');
  if(!host) return;
  var stats = Array.isArray(home.stats) ? home.stats : [];
  if(!stats.length) return drop(host);

  var live = vehicles.filter(function(v){ return !v.sold; }).length;

  host.innerHTML = stats.map(function(s,i){
    var raw = String(s.value||'');
    if(raw.toLowerCase() === 'auto') raw = String(live);

    /* Split "25+" or "4.8" into a number the counter can animate and a
       suffix that survives it. Anything not numeric is printed as written. */
    var m = raw.match(/^([\d.]+)(.*)$/);
    var value = m
      ? '<span data-count="'+m[1]+'"'+
        (m[1].indexOf('.') > -1 ? ' data-decimals="1"' : '')+
        ' data-suffix="'+U.esc(m[2])+'">0</span>'
      : U.esc(raw);

    return '<div class="stat-cell" data-anim="up" data-delay="'+i+'">'+
      '<b>'+value+'</b>'+
      '<span>'+U.esc(s.label||'')+'</span>'+
      (s.sub ? '<small>'+U.esc(s.sub)+'</small>' : '')+
    '</div>';
  }).join('');
  show(host);
}

/* ------------------------------------------------------------ listings -- */
function paintFeatured(home,vehicles){
  var host = U.el('[data-featured]');
  if(!host) return;
  var n = Number(home.featuredCount)||4;
  var list = vehicles.filter(function(v){ return v.featured && !v.sold; }).slice(0,n);

  /* Nothing flagged featured: show the newest stock rather than an empty
     section under a heading promising cars. */
  if(!list.length) list = vehicles.filter(function(v){ return !v.sold; }).slice(0,n);
  if(!list.length) return drop(host);

  host.innerHTML = cards(list);
  show(host);
}

function paintLatest(home,vehicles){
  var host = U.el('[data-latest]');
  if(!host) return;
  var n = Number(home.latestCount)||6;
  var list = vehicles.filter(function(v){ return !v.sold; }).slice()
    .sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); })
    .slice(0,n);
  if(!list.length) return drop(host);
  host.innerHTML = cards(list);
  show(host);
}

function paintSold(home,vehicles){
  var host = U.el('[data-sold]');
  if(!host) return;
  var n = Number(home.soldCount)||4;
  var list = vehicles.filter(function(v){ return v.sold; }).slice(0,n);
  /* Nothing sold yet is not a failure, it is a new dealership website. The
     section simply is not there. */
  if(!list.length) return drop(host);
  host.innerHTML = cards(list);
  show(host);
}

function cards(list){
  return list.map(function(v,i){
    return SC.vehicleCard(v,{delay:i % 4});
  }).join('');
}

/* -------------------------------------------------------------- makes -- */
/* Built from the stock itself, so a marque appears the day one arrives and
   disappears the day the last one sells. A logo can be supplied per make in
   the portal; without one the wordmark is used, which is honest and legible. */
function paintMakes(home,vehicles){
  var host = U.el('[data-makes]');
  if(!host) return;

  var live = vehicles.filter(function(v){ return !v.sold; });
  var counts = {};
  live.forEach(function(v){ if(v.make) counts[v.make] = (counts[v.make]||0)+1; });

  var makes = Object.keys(counts).sort(function(a,b){
    return counts[b] - counts[a] || a.localeCompare(b);
  });
  if(makes.length < 3) return drop(host);

  var logos = home.makeLogos || {};

  host.innerHTML = makes.map(function(m,i){
    return '<a class="make-tile" href="inventory.html?make='+encodeURIComponent(m)+'" '+
      'data-anim="scale" data-delay="'+(i % 6)+'" aria-label="'+U.esc(m)+', '+counts[m]+' in stock">'+
      (logos[m]
        ? '<img src="'+U.esc(logos[m])+'" alt="'+U.esc(m)+'" loading="lazy">'
        : '<b>'+U.esc(m)+'</b>')+
      '<span>'+counts[m]+' in stock</span>'+
    '</a>';
  }).join('');
  show(host);
}

/* ------------------------------------------------------------ process -- */
function paintProcess(home){
  var host = U.el('[data-process]');
  if(!host) return;
  var list = Array.isArray(home.process) ? home.process : [];
  if(!list.length) return drop(host);

  host.innerHTML = list.map(function(s,i){
    return '<div class="p-card step-card" data-anim="up" data-delay="'+i+'">'+
      '<span class="step-n" aria-hidden="true">'+(i+1)+'</span>'+
      '<span class="p-ic">'+(SC.icon[s.icon] || SC.icon.check)+'</span>'+
      '<h3>'+U.esc(s.title||'')+'</h3>'+
      '<p>'+U.esc(s.text||'')+'</p>'+
    '</div>';
  }).join('');
  show(host);
}

/* ----------------------------------------------------------- promises -- */
function paintPromises(home){
  var host = U.el('[data-promises]');
  if(!host) return;
  var list = Array.isArray(home.promises) ? home.promises : [];
  if(!list.length) return drop(host);

  host.innerHTML = list.map(function(p,i){
    return '<div class="p-card" data-anim="'+(i%2?'left':'right')+'" data-delay="'+(i%2)+'">'+
      '<span class="p-ic">'+(SC.icon[p.icon] || SC.icon.check)+'</span>'+
      '<h3>'+U.esc(p.title||'')+'</h3>'+
      '<p>'+U.esc(p.text||'')+'</p>'+
    '</div>';
  }).join('');
  show(host);
}

/* ---------------------------------------------------------- categories -- */
/* Each tile shows how many it will actually return, and a body type with
   nothing in it is dropped, so no tile leads to an empty page. */
function paintCategories(home,vehicles){
  var host = U.el('[data-categories]');
  if(!host) return;

  var cats = Array.isArray(home.categories) ? home.categories : [];
  var live = vehicles.filter(function(v){ return !v.sold; });

  var out = cats.map(function(c,i){
    var n = live.filter(function(v){ return v.body === c.body; }).length;
    if(!n) return '';
    return '<a class="cat" href="inventory.html?body='+encodeURIComponent(c.body)+'" '+
      'data-anim="up" data-delay="'+(i%6)+'">'+
      SC.icon.car+
      '<b>'+U.esc(c.label||c.body)+'</b>'+
      '<span>'+n+' available</span>'+
    '</a>';
  }).filter(Boolean).join('');

  if(!out) return drop(host);
  host.innerHTML = out;
  show(host);
}

/* ---------------------------------------------------------------- why -- */
function paintWhy(home){
  var host = U.el('[data-why]');
  if(!host) return;
  var list = Array.isArray(home.why) ? home.why : [];
  if(!list.length) return drop(host);

  host.innerHTML = list.map(function(w,i){
    return '<div class="why-item" data-anim="up" data-delay="'+(i%2)+'">'+
      '<span class="why-ic">'+(SC.icon[w.icon] || SC.icon.check)+'</span>'+
      '<div><b>'+U.esc(w.title||'')+'</b><p>'+U.esc(w.text||'')+'</p></div></div>';
  }).join('');
  show(host);
}

/* ----------------------------------------------------------- timeline -- */
/* The milestones come from the About page content, so the story is written
   once and told in both places. */
function paintTimeline(home,about){
  var host = U.el('[data-timeline]');
  if(!host) return;
  var list = Array.isArray(about.timeline) ? about.timeline : [];
  if(!list.length) return drop(host);

  host.innerHTML = list.map(function(t,i){
    return '<div class="tl-row" data-anim="up" data-delay="'+i+'">'+
      '<span class="tl-dot"><i></i></span>'+
      '<span class="tl-year">'+U.esc(t.year||'')+'</span>'+
      '<h3>'+U.esc(t.title||'')+'</h3>'+
      '<p>'+U.esc(t.text||'')+'</p>'+
    '</div>';
  }).join('');
  host.setAttribute('data-anim','up');
  show(host);
}

/* ------------------------------------------------------- testimonials -- */
function paintTestimonials(home,reviews){
  var host = U.el('[data-testimonials]');
  if(!host) return;
  var n = Number(home.testimonialsCount)||3;

  var list = reviews.filter(function(t){ return t.featured; });
  if(list.length < n) list = list.concat(reviews.filter(function(t){ return !t.featured; }));
  list = list.slice(0,n);

  /* No published reviews. The section removes itself rather than showing
     invented ones. */
  if(!list.length) return drop(host);
  host.innerHTML = list.map(function(t,i){ return SC.testimonialCard(t,i%3); }).join('');
  show(host);
}

/* Shared with testimonials.html. */
SC.testimonialCard = function(t,delay){
  var stars = '';
  for(var i=1;i<=5;i++){
    stars += '<span'+(i<=t.rating?'':' class="off"')+'>'+SC.icon.starFill+'</span>';
  }
  var av = t.photo ? '<img src="'+U.esc(t.photo)+'" alt="" loading="lazy">'
                   : U.esc(U.initials(t.name));

  return '<article class="tm" data-anim="up"'+(delay!=null?' data-delay="'+delay+'"':'')+'>'+
    '<span style="color:var(--red);opacity:.24;display:block;width:26px;height:26px">'+
      SC.icon.quote+'</span>'+
    '<div class="rating" aria-label="'+t.rating+' out of 5">'+stars+'</div>'+
    '<p class="tm-quote">'+U.esc(t.review)+'</p>'+
    '<div class="tm-who">'+
      '<span class="tm-av">'+av+'</span>'+
      '<div style="min-width:0"><b>'+U.esc(t.name)+'</b>'+
      '<span>'+U.esc([t.vehicle,t.location].filter(Boolean).join(' · '))+'</span></div>'+
      (t.isGoogle ? '<span class="badge line tm-src">Google</span>' : '')+
    '</div>'+
  '</article>';
};

/* ------------------------------------------------------- about rating -- */
function paintAboutRating(biz){
  var host = U.el('[data-about-rating]');
  if(!host) return;
  if(!biz.googleRating){ host.remove(); return; }

  var full = Math.round(biz.googleRating), stars = '';
  for(var i=1;i<=5;i++) stars += '<span'+(i<=full?'':' class="off"')+'>'+SC.icon.starFill+'</span>';

  host.innerHTML =
    '<div class="rating-hero">'+
      '<div><div class="score"><span data-count="'+biz.googleRating+'" data-decimals="1">0</span></div>'+
        '<div class="of">out of 5</div></div>'+
      '<div class="stack" style="gap:8px;min-width:0">'+
        '<div class="rating">'+stars+'</div>'+
        '<p class="small" style="margin:0">Rated by '+U.esc(biz.googleReviews||0)+
          ' customers on Google.</p>'+
        (biz.googleUrl
          ? '<a class="btn btn-out btn-sm" href="'+U.esc(biz.googleUrl)+'" target="_blank" '+
            'rel="noopener noreferrer" style="justify-self:start">Read the reviews</a>' : '')+
      '</div>'+
    '</div>';
}

/* ---------------------------------------------------------------- faq -- */
function paintFaq(home){
  var host = U.el('[data-faq]');
  if(!host) return;
  var list = Array.isArray(home.faq) ? home.faq : [];
  if(!list.length) return drop(host);

  host.innerHTML = list.map(function(f,i){
    return '<div class="faq-item" data-anim="up" data-delay="'+(i%3)+'">'+
      '<button class="faq-q" aria-expanded="false" id="faq-q'+i+'" '+
        'aria-controls="faq-a'+i+'">'+
        U.esc(f.q||'')+
        '<span class="chev" aria-hidden="true">'+SC.icon.chevD+'</span>'+
      '</button>'+
      '<div class="faq-a" id="faq-a'+i+'" role="region" aria-labelledby="faq-q'+i+'">'+
        '<div><p>'+U.esc(f.a||'')+'</p></div>'+
      '</div>'+
    '</div>';
  }).join('');
  show(host);

  /* The questions and answers, marked up for search engines. */
  SC.ldJson({
    '@context':'https://schema.org',
    '@type':'FAQPage',
    mainEntity:list.map(function(f){
      return {
        '@type':'Question', name:f.q,
        acceptedAnswer:{ '@type':'Answer', text:f.a }
      };
    })
  },'ld-faq');
}

/* ------------------------------------------------------------ contact -- */
function paintContact(biz){
  var host = U.el('[data-contact-card]');
  if(!host) return;

  var rows = [];
  if(biz.addressFull) rows.push(row('pin','Address',U.esc(biz.addressFull),
    [biz.landmark ? U.esc(biz.landmark) : '',
     biz.mapsUrl ? '<a href="'+U.esc(biz.mapsUrl)+'" target="_blank" rel="noopener noreferrer">Get directions</a>' : ''
    ].filter(Boolean).join(' &middot; ')));
  if(biz.phone)  rows.push(row('phone','Telephone','<a href="tel:'+U.esc(U.telHref(biz.phone))+'">'+U.esc(biz.phone)+'</a>'));
  if(biz.mobile) rows.push(row('wa','WhatsApp','<a href="'+
    SC.waLink('Hello '+(biz.shortName||'Super Cars')+', I would like to enquire about a vehicle.')+
    '" target="_blank" rel="noopener noreferrer">'+U.esc(biz.mobile)+'</a>'));
  if(biz.email)  rows.push(row('mail','Email','<a href="mailto:'+U.esc(biz.email)+'">'+U.esc(biz.email)+'</a>'));

  var hoursHtml = '';
  if(Array.isArray(biz.hours) && biz.hours.length){
    var todayName = new Date().toLocaleDateString('en-ZA',{weekday:'long'});
    hoursHtml = '<div><b style="display:block;font-size:11.5px;font-weight:750;letter-spacing:.08em;'+
      'text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Opening hours</b>'+
      '<div class="hours">'+biz.hours.map(function(h){
        var today = h.day === todayName;
        var when = h.closed ? '<span class="shut">Closed</span>'
                            : '<span>'+U.esc(h.open)+' &ndash; '+U.esc(h.close)+'</span>';
        return '<div'+(today?' class="today"':'')+'><span>'+U.esc(h.day)+'</span>'+when+'</div>';
      }).join('')+'</div></div>';
  }

  host.innerHTML = '<div class="info-card" data-anim="right">'+rows.join('')+hoursHtml+
    '<a class="btn btn-dark btn-block" href="contact.html">Contact page</a></div>';

  function row(icon,label,value,extra){
    return '<div class="info-row">'+
      '<span class="ic">'+SC.icon[icon]+'</span>'+
      '<div style="min-width:0"><b>'+label+'</b>'+
        (value.indexOf('<a') === 0 ? value : '<p>'+value+'</p>')+
        (extra ? '<p class="tiny" style="margin-top:4px">'+extra+'</p>' : '')+
      '</div></div>';
  }
}

function uniq(arr){
  return arr.filter(function(v,i,a){ return v && a.indexOf(v)===i; });
}

})();
