/* ==========================================================================
   SUPER CARS WITBANK  ·  Home page
   --------------------------------------------------------------------------
   Renders every section of the home page from the `homepage` settings
   document, which the portal's Homepage Editor writes.

   Two rules run through this file:
     A section listed in homepage.sections as false is removed, not hidden.
     A section with nothing to show removes itself, so an empty testimonial
     list or an empty stock list never leaves a heading with a gap under it.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

/* Show skeleton cards immediately so the page has its final shape before
   the first read comes back. */
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
  var on   = home.sections || {};

  /* Sections the portal has switched off leave the document entirely. */
  U.els('[data-sec]').forEach(function(el){
    var k = el.dataset.sec;
    if(on[k] === false) el.remove();
  });

  paintText(home);
  paintHero(home, biz, vehicles);
  paintStats(home, vehicles);
  paintFeatured(home, vehicles, fin);
  paintLatest(home, vehicles, fin);
  paintCategories(home, vehicles);
  paintWhy(home);
  paintTestimonials(home, reviews);
  paintAboutRating(biz);
  paintContact(biz);

  SC.reveal();
}).catch(function(err){
  console.error('[home] '+err.message);
  if(featuredHost) featuredHost.innerHTML = errorBox();
  if(latestHost)   latestHost.remove();
});

function errorBox(){
  return '<div class="empty" style="grid-column:1/-1">'+SC.icon.warn+
    '<b>Stock could not be loaded</b>'+
    '<p>Something went wrong reaching our system. Please refresh, or telephone us and we will tell you what is on the floor.</p>'+
    '</div>';
}

/* ------------------------------------------------------ simple bindings -- */
function paintText(home){
  U.els('[data-home]').forEach(function(el){
    var v = home[el.dataset.home];
    /* No value in the portal leaves the element as it is, so a missing
       field can never blank out a heading. */
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
function paintHero(home,biz,vehicles){
  var host = U.el('[data-hero-copy]');
  if(!host) return;

  var title = U.esc(home.heroTitle || '');
  var accent = home.heroTitleAccent ? '<span class="accent">'+U.esc(home.heroTitleAccent)+'</span>' : '';

  host.innerHTML =
    (home.heroBadge
      ? '<span class="hero-badge"><i class="dot"></i>'+U.esc(home.heroBadge)+'</span>' : '')+
    '<h1>'+title+accent+'</h1>'+
    (home.heroSubtitle ? '<p class="lead">'+U.esc(home.heroSubtitle)+'</p>' : '')+
    '<div class="hero-actions">'+
      cta(home.ctaPrimary,'btn-pri')+
      cta(home.ctaSecondary,'btn-inv')+
    '</div>';

  function cta(o,cls){
    if(!o || !o.text) return '';
    return '<a class="btn '+cls+' btn-lg" href="'+U.esc(o.link||'#')+'">'+U.esc(o.text)+
           (cls==='btn-pri' ? SC.icon.arrowR : '')+'</a>';
  }

  paintSearch(home, vehicles);
}

/* The search panel offers only makes and body types that are actually in
   stock, so a visitor cannot pick a filter that returns nothing. */
function paintSearch(home,vehicles){
  var host = U.el('[data-hero-search]');
  if(!host) return;
  if(home.searchEnabled === false){ host.remove(); return; }

  var live = vehicles.filter(function(v){ return !v.sold; });
  var makes = uniq(live.map(function(v){ return v.make; })).sort();
  var bodies = uniq(live.map(function(v){ return v.body; })).sort();

  var maxPrice = live.reduce(function(m,v){ return Math.max(m, v.price||0); },0);
  var bands = priceBands(maxPrice);

  host.innerHTML =
    '<form class="hero-search" role="search" aria-label="Search our stock">'+
      '<h3>Find your next car</h3>'+
      '<div class="fields">'+
        '<select name="make" aria-label="Make">'+
          '<option value="">Any make</option>'+
          makes.map(function(m){ return '<option>'+U.esc(m)+'</option>'; }).join('')+
        '</select>'+
        '<select name="body" aria-label="Body type">'+
          '<option value="">Any body</option>'+
          bodies.map(function(b){ return '<option>'+U.esc(b)+'</option>'; }).join('')+
        '</select>'+
        '<select name="max" class="full" aria-label="Maximum price">'+
          '<option value="">Any price</option>'+
          bands.map(function(b){
            return '<option value="'+b+'">Up to '+U.money(b)+'</option>';
          }).join('')+
        '</select>'+
        '<input class="full" type="search" name="q" '+
          'placeholder="'+U.esc(home.searchPlaceholder||'Search by make, model or keyword')+'" '+
          'aria-label="Search by keyword">'+
      '</div>'+
      '<button class="btn btn-pri btn-block" type="submit">'+SC.icon.search+'Search stock</button>'+
    '</form>';

  host.querySelector('form').addEventListener('submit',function(e){
    e.preventDefault();
    var fd = new FormData(e.target);
    var qs = new URLSearchParams();
    ['make','body','max','q'].forEach(function(k){
      var v = (fd.get(k)||'').trim();
      if(v) qs.set(k,v);
    });
    location.href = 'inventory.html' + (qs.toString() ? '?'+qs : '');
  });
}

function priceBands(max){
  if(!max) return [];
  var steps = [100000,150000,200000,250000,300000,400000,500000,750000,1000000];
  return steps.filter(function(s){ return s < max; }).concat([Math.ceil(max/50000)*50000]);
}

/* --------------------------------------------------------------- stats -- */
/* A stat whose value is the word "auto" is worked out from live data rather
   than typed by hand, so the stock count can never go stale. */
function paintStats(home,vehicles){
  var host = U.el('[data-hero-stats]');
  if(!host) return;
  var stats = Array.isArray(home.stats) ? home.stats : [];
  if(!stats.length){ host.remove(); return; }

  var live = vehicles.filter(function(v){ return !v.sold; }).length;

  host.innerHTML = stats.map(function(s){
    var val = String(s.value||'');
    if(val.toLowerCase() === 'auto') val = String(live);
    return '<div class="hero-stat">'+
      '<b>'+U.esc(val)+'</b>'+
      '<span>'+U.esc(s.label||'')+'</span>'+
      (s.sub ? '<small>'+U.esc(s.sub)+'</small>' : '')+
    '</div>';
  }).join('');
}

/* ------------------------------------------------------------ listings -- */
function paintFeatured(home,vehicles,fin){
  var host = U.el('[data-featured]');
  if(!host) return;
  var sec = host.closest('[data-sec]');

  var n = Number(home.featuredCount)||4;
  var list = vehicles.filter(function(v){ return v.featured && !v.sold; }).slice(0,n);

  /* Nothing flagged as featured: fall back to the newest stock rather than
     showing an empty section under a heading that promises cars. */
  if(!list.length){
    list = vehicles.filter(function(v){ return !v.sold; }).slice(0,n);
  }
  if(!list.length){ sec && sec.remove(); return; }

  render(host, list, fin);
  sec && (sec.hidden = false);
}

function paintLatest(home,vehicles,fin){
  var host = U.el('[data-latest]');
  if(!host) return;
  var sec = host.closest('[data-sec]');

  var n = Number(home.latestCount)||6;
  var list = vehicles
    .filter(function(v){ return !v.sold; })
    .slice()
    .sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); })
    .slice(0,n);

  if(!list.length){ sec && sec.remove(); return; }
  render(host, list, fin);
  sec && (sec.hidden = false);
}

function render(host,list,fin){
  host.innerHTML = list.map(function(v,i){
    if(v.price > 0 && !v.installment) v.installment = SC.instalment(v.price, fin);
    return SC.vehicleCard(v,{reveal:i%4});
  }).join('');
}

/* ---------------------------------------------------------- categories -- */
/* Each tile shows how many vehicles it will actually return. A body type
   with nothing in it is dropped, so no tile leads to an empty result. */
function paintCategories(home,vehicles){
  var host = U.el('[data-categories]');
  if(!host) return;
  var sec = host.closest('[data-sec]');

  var cats = Array.isArray(home.categories) ? home.categories : [];
  var live = vehicles.filter(function(v){ return !v.sold; });

  var icons = {
    'Hatchback':'car','Sedan':'car','SUV':'car','Double Cab':'car',
    'Single Cab':'car','MPV':'car','Coupe':'car','Station Wagon':'car'
  };

  var out = cats.map(function(c){
    var n = live.filter(function(v){ return v.body === c.body; }).length;
    if(!n) return '';
    return '<a class="cat" href="inventory.html?body='+encodeURIComponent(c.body)+'" data-reveal>'+
      SC.icon[icons[c.body]||'car']+
      '<b>'+U.esc(c.label||c.body)+'</b>'+
      '<span>'+n+' available</span>'+
    '</a>';
  }).filter(Boolean).join('');

  if(!out){ sec && sec.remove(); return; }
  host.innerHTML = out;
  sec && (sec.hidden = false);
}

/* ----------------------------------------------------------------- why -- */
function paintWhy(home){
  var host = U.el('[data-why]');
  if(!host) return;
  var sec = host.closest('[data-sec]');
  var list = Array.isArray(home.why) ? home.why : [];
  if(!list.length){ sec && sec.remove(); return; }

  host.innerHTML = list.map(function(w,i){
    return '<div class="why-item" data-reveal="'+(i%2)+'">'+
      '<span class="why-ic">'+(SC.icon[w.icon]||SC.icon.check)+'</span>'+
      '<div><b>'+U.esc(w.title||'')+'</b><p>'+U.esc(w.text||'')+'</p></div>'+
    '</div>';
  }).join('');
  sec && (sec.hidden = false);
}

/* -------------------------------------------------------- testimonials -- */
function paintTestimonials(home,reviews){
  var host = U.el('[data-testimonials]');
  if(!host) return;
  var sec = host.closest('[data-sec]');

  var n = Number(home.testimonialsCount)||3;
  var list = reviews.filter(function(t){ return t.featured; });
  if(list.length < n) list = list.concat(reviews.filter(function(t){ return !t.featured; }));
  list = list.slice(0,n);

  /* No published reviews yet. The section removes itself rather than
     showing invented ones. */
  if(!list.length){ sec && sec.remove(); return; }

  host.innerHTML = list.map(function(t,i){ return SC.testimonialCard(t,i%3); }).join('');
  sec && (sec.hidden = false);
}

/* Shared with testimonials.html. */
SC.testimonialCard = function(t,reveal){
  var stars = '';
  for(var i=1;i<=5;i++){
    stars += '<span'+(i<=t.rating?'':' class="off"')+'>'+SC.icon.starFill+'</span>';
  }
  var av = t.photo
    ? '<img src="'+U.esc(t.photo)+'" alt="" loading="lazy">'
    : U.esc(U.initials(t.name));

  return '<article class="tm"'+(reveal!=null?' data-reveal="'+reveal+'"':'')+'>'+
    '<div class="rating" aria-label="'+t.rating+' out of 5">'+stars+'</div>'+
    '<p class="tm-quote">'+U.esc(t.review)+'</p>'+
    '<div class="tm-who">'+
      '<span class="tm-av">'+av+'</span>'+
      '<div style="min-width:0">'+
        '<b>'+U.esc(t.name)+'</b>'+
        '<span>'+U.esc([t.vehicle,t.location].filter(Boolean).join(' · '))+'</span>'+
      '</div>'+
      (t.isGoogle ? '<span class="badge line tm-src">Google</span>' : '')+
    '</div>'+
  '</article>';
};

/* -------------------------------------------------------- about rating -- */
function paintAboutRating(biz){
  var host = U.el('[data-about-rating]');
  if(!host) return;
  if(!biz.googleRating){ host.remove(); return; }

  var full = Math.round(biz.googleRating);
  var stars = '';
  for(var i=1;i<=5;i++) stars += '<span'+(i<=full?'':' class="off"')+'>'+SC.icon.starFill+'</span>';

  host.innerHTML =
    '<div class="rating-hero" data-reveal="1">'+
      '<div>'+
        '<div class="score">'+U.esc(biz.googleRating)+'</div>'+
        '<div class="of">out of 5</div>'+
      '</div>'+
      '<div class="stack" style="gap:8px;min-width:0">'+
        '<div class="rating">'+stars+'</div>'+
        '<p class="small" style="margin:0">Rated by '+U.esc(biz.googleReviews||0)+
          ' customers on Google.</p>'+
        (biz.googleUrl
          ? '<a class="btn btn-out btn-sm" href="'+U.esc(biz.googleUrl)+'" target="_blank" '+
            'rel="noopener noreferrer" style="justify-self:start">Read the reviews</a>'
          : '')+
      '</div>'+
    '</div>';
}

/* -------------------------------------------------------------- contact -- */
function paintContact(biz){
  var host = U.el('[data-contact-card]');
  if(!host) return;

  var rows = [];
  if(biz.addressFull) rows.push(row('pin','Address', U.esc(biz.addressFull),
    biz.mapsUrl ? '<a href="'+U.esc(biz.mapsUrl)+'" target="_blank" rel="noopener noreferrer">Get directions</a>' : ''));
  if(biz.phone)  rows.push(row('phone','Telephone','<a href="tel:'+U.esc(U.telHref(biz.phone))+'">'+U.esc(biz.phone)+'</a>'));
  if(biz.mobile) rows.push(row('wa','WhatsApp','<a href="'+SC.waLink('Hello '+(biz.shortName||'Super Cars')+', I would like to enquire about a vehicle.')+'" target="_blank" rel="noopener noreferrer">'+U.esc(biz.mobile)+'</a>'));
  if(biz.email)  rows.push(row('mail','Email','<a href="mailto:'+U.esc(biz.email)+'">'+U.esc(biz.email)+'</a>'));

  var hoursHtml = '';
  if(Array.isArray(biz.hours) && biz.hours.length){
    hoursHtml = '<div><b style="display:block;font-size:11.5px;font-weight:750;letter-spacing:.08em;'+
      'text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Opening hours</b>'+
      '<div class="hours" data-biz="hours"></div></div>';
  }

  host.innerHTML = '<div class="info-card" data-reveal>'+rows.join('')+hoursHtml+
    '<a class="btn btn-dark btn-block" href="contact.html">Contact page</a></div>';

  /* Re-run the hours binding, because this markup was added after site.js ran. */
  var hoursEl = U.el('[data-biz="hours"]',host);
  if(hoursEl && Array.isArray(biz.hours)){
    var todayName = new Date().toLocaleDateString('en-ZA',{weekday:'long'});
    hoursEl.innerHTML = biz.hours.map(function(h){
      var today = h.day === todayName;
      var when = h.closed ? '<span class="shut">Closed</span>'
                          : '<span>'+U.esc(h.open)+' &ndash; '+U.esc(h.close)+'</span>';
      return '<div'+(today?' class="today"':'')+'><span>'+U.esc(h.day)+'</span>'+when+'</div>';
    }).join('');
  }

  function row(icon,label,value,extra){
    return '<div class="info-row">'+
      '<span class="ic">'+SC.icon[icon]+'</span>'+
      '<div style="min-width:0"><b>'+label+'</b>'+
        (value.indexOf('<')===0 ? value : '<p>'+value+'</p>')+
        (extra ? '<p class="tiny" style="margin-top:4px">'+extra+'</p>' : '')+
      '</div></div>';
  }
}

function uniq(arr){
  return arr.filter(function(v,i,a){ return v && a.indexOf(v)===i; });
}

})();
