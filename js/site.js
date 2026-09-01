/* ==========================================================================
   SUPER CARS WITBANK  ·  Site chrome
   --------------------------------------------------------------------------
   Runs on every page. Builds the header and footer, fills in the business
   details, sets the page's SEO tags and wires the WhatsApp button.

   Nothing here is hardcoded copy. Every string comes from the portal:
     business    -> Business Information module
     navigation  -> Website Content module
     footer      -> Website Content module
     seo         -> SEO module

   Each page declares which one it is with <body data-page="inventory">. That
   picks the active nav item and the right SEO entry.

   If a value is missing from the database the markup already in the page is
   left as it is, so a failed request can never blank out the header.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;
var page = document.body.dataset.page || 'index';

/* Cached so a page script can await the same promise without a second read. */
SC.site = SC.data.settings().then(function(s){
  var biz  = s.business   || {};
  var nav  = s.navigation || {};
  var ftr  = s.footer     || {};
  var seo  = s.seo        || {};

  SC.biz = biz;
  paintSeo(seo, biz);
  paintAnnounce(s.announce || {});
  paintHeader(biz, nav);
  paintFooter(biz, ftr, nav, s.finance || {});
  paintWhatsApp(biz);
  paintBusinessBindings(biz);
  return s;
}).catch(function(err){
  console.error('[SC.site] '+err.message);
  return {};
});

/* ----------------------------------------------------------------- SEO -- */
function paintSeo(seo,biz){
  var entry = (seo.pages && seo.pages[page]) || {};
  var suffix = seo.titleSuffix || '';
  var siteName = seo.siteName || biz.name || 'Super Cars Witbank';

  /* A page that sets its own title (a vehicle detail page) wins. */
  if(entry.title && !document.body.dataset.titleSet){
    document.title = entry.title + suffix;
  }
  meta('description', entry.description || '');
  meta('keywords', entry.keywords || '');
  meta('robots', seo.robots || 'index,follow');

  og('og:title', document.title);
  og('og:description', entry.description || '');
  og('og:site_name', siteName);
  og('og:type', page==='vehicle' ? 'product' : 'website');
  og('og:url', location.href.split('#')[0]);
  if(seo.defaultImage) og('og:image', seo.defaultImage);

  meta('twitter:card','summary_large_image');
  meta('twitter:title',document.title);
  meta('twitter:description',entry.description||'');
  if(seo.defaultImage) meta('twitter:image',seo.defaultImage);

  /* Local business structured data, from the real business record. Emitted
     on every page so search engines see it wherever they land. */
  if(biz.name){
    var ld = {
      '@context':'https://schema.org',
      '@type':'AutoDealer',
      name:biz.name,
      description:entry.description || biz.tagline || '',
      url:biz.website || location.origin,
      telephone:biz.phone || biz.mobile || '',
      email:biz.email || '',
      address:{
        '@type':'PostalAddress',
        streetAddress:biz.address1 || '',
        addressLocality:biz.address2 || '',
        addressRegion:biz.province || '',
        postalCode:biz.postcode || '',
        addressCountry:'ZA'
      }
    };
    if(biz.googleRating && biz.googleReviews){
      ld.aggregateRating = {
        '@type':'AggregateRating',
        ratingValue:String(biz.googleRating),
        reviewCount:String(biz.googleReviews),
        bestRating:'5'
      };
    }
    if(Array.isArray(biz.hours)){
      ld.openingHoursSpecification = biz.hours.filter(function(h){ return !h.closed; })
        .map(function(h){
          return {
            '@type':'OpeningHoursSpecification',
            dayOfWeek:'https://schema.org/'+h.day,
            opens:h.open, closes:h.close
          };
        });
    }
    script(ld,'ld-business');
  }
}

function meta(name,content){
  if(!content) return;
  var sel = 'meta[name="'+name+'"]';
  var el = U.el(sel);
  if(!el){
    el = document.createElement('meta');
    el.setAttribute('name',name);
    document.head.appendChild(el);
  }
  el.setAttribute('content',content);
}
function og(prop,content){
  if(!content) return;
  var el = U.el('meta[property="'+prop+'"]');
  if(!el){
    el = document.createElement('meta');
    el.setAttribute('property',prop);
    document.head.appendChild(el);
  }
  el.setAttribute('content',content);
}
SC.ldJson = script;
function script(obj,id){
  var el = document.getElementById(id);
  if(!el){
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(obj);
}

/* -------------------------------------------------------- announcement -- */
/* A strip above the header for a sale, a holiday closure or a new arrival.
   Off unless staff switch it on, and a visitor who dismisses it is not shown
   the same message again for the rest of the session. */
function paintAnnounce(a){
  var host = U.el('[data-announce]');
  if(!host) return;
  if(!a.enabled || !a.text){ host.remove(); return; }

  /* The key includes the text, so editing the message brings the bar back
     for someone who dismissed the previous one. */
  var key = 'sc_announce_' + String(a.text).length + '_' + String(a.text).slice(0,24);
  try{ if(sessionStorage.getItem(key)){ host.remove(); return; } }catch(e){}

  host.innerHTML =
    '<div class="announce" role="region" aria-label="Announcement">'+
      '<div class="announce-in wrap">'+
        (SC.icon[a.icon] || SC.icon.sparkle)+
        '<span>'+U.esc(a.text)+
          (a.link && a.linkText
            ? ' <a href="'+U.esc(a.link)+'">'+U.esc(a.linkText)+'</a>' : '')+
        '</span>'+
      '</div>'+
      '<button class="announce-x" aria-label="Dismiss this announcement">'+SC.icon.x+'</button>'+
    '</div>';

  host.querySelector('.announce-x').addEventListener('click',function(){
    try{ sessionStorage.setItem(key,'1'); }catch(e){}
    host.style.height = host.offsetHeight+'px';
    requestAnimationFrame(function(){
      host.style.transition = 'height .3s cubic-bezier(.22,1,.36,1), opacity .2s';
      host.style.height = '0';
      host.style.opacity = '0';
      host.style.overflow = 'hidden';
      setTimeout(function(){ host.remove(); },320);
    });
  });
}

/* -------------------------------------------------------------- header -- */
function paintHeader(biz,nav){
  var host = U.el('[data-header]');
  if(!host) return;

  var items = Array.isArray(nav.items) && nav.items.length ? nav.items : [
    {label:'Home',link:'index.html'},
    {label:'Stock',link:'inventory.html'},
    {label:'Contact',link:'contact.html'}
  ];
  var here = location.pathname.split('/').pop() || 'index.html';

  var mark = biz.logo
    ? '<span class="brand-mark"><img src="'+U.esc(biz.logo)+'" alt=""></span>'
    : '<span class="brand-mark">SC</span>';

  var tel = biz.phone || biz.mobile || '';

  host.innerHTML =
    '<div class="wrap hdr-in">'+
      '<a class="brand" href="index.html" aria-label="'+U.esc(biz.name||'Super Cars')+' home">'+
        mark+
        '<span class="brand-txt">'+
          '<b>'+U.esc(biz.shortName || biz.name || 'Super Cars')+'</b>'+
          '<span>'+U.esc(biz.address2 || 'Witbank')+'</span>'+
        '</span>'+
      '</a>'+
      '<nav class="nav" id="nav">'+
        items.map(function(it){
          var on = (it.link||'').split('?')[0] === here ? ' on' : '';
          return '<a class="'+on.trim()+'" href="'+U.esc(it.link)+'"'+(on?' aria-current="page"':'')+'>'+
                 U.esc(it.label)+'</a>';
        }).join('')+
      '</nav>'+
      '<div class="hdr-cta">'+
        (tel ? '<a class="hdr-tel" href="tel:'+U.esc(U.telHref(tel))+'">'+
               SC.icon.phone+'<span>'+U.esc(tel)+'</span></a>' : '')+
        '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav">'+
          SC.icon.menu+
        '</button>'+
      '</div>'+
    '</div>';

  var burger = U.el('#burger'), menu = U.el('#nav');
  burger.addEventListener('click',function(){
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.innerHTML = open ? SC.icon.x : SC.icon.menu;
  });
  /* A tap outside, or a resize back to desktop, closes it. */
  document.addEventListener('click',function(e){
    if(!menu.classList.contains('open')) return;
    if(menu.contains(e.target) || burger.contains(e.target)) return;
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
    burger.innerHTML = SC.icon.menu;
  });
  window.addEventListener('resize',U.debounce(function(){
    if(window.innerWidth > 1024 && menu.classList.contains('open')){
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      burger.innerHTML = SC.icon.menu;
    }
  },150));

  var shadow = function(){ host.classList.toggle('scrolled', window.scrollY > 8); };
  shadow();
  window.addEventListener('scroll',shadow,{passive:true});
}

/* -------------------------------------------------------------- footer -- */
function starRow(rating){
  var full = Math.round(Number(rating)||0), out = '';
  for(var i=1;i<=5;i++) out += '<span'+(i<=full?'':' class="off"')+'>'+SC.icon.starFill+'</span>';
  return out;
}

function paintFooter(biz,ftr,nav,fin){
  fin = fin || {};
  var host = U.el('[data-footer]');
  if(!host) return;

  var social = biz.social || {};
  /* The AutoTrader address is derived from the dealer ID when it is not set
     explicitly, so the ID is the only place that number is kept. */
  if(!social.autotrader && biz.autotraderId) social.autotrader = SC.autotraderUrl(biz);

  var socialMap = [
    ['facebook','fb','Facebook'], ['instagram','ig','Instagram'],
    ['tiktok','tiktok','TikTok'], ['autotrader','globe','AutoTrader'],
    ['carsza','globe','Cars.co.za']
  ].filter(function(x){ return social[x[0]]; });

  var cols = Array.isArray(ftr.columns) ? ftr.columns : [];

  host.innerHTML =
    '<div class="wrap">'+
      '<div class="ftr-top">'+
        '<div class="ftr-brand">'+
          '<a class="brand" href="index.html">'+
            (biz.logo ? '<span class="brand-mark"><img src="'+U.esc(biz.logo)+'" alt=""></span>'
                      : '<span class="brand-mark">SC</span>')+
            '<span class="brand-txt"><b>'+U.esc(biz.shortName||biz.name||'Super Cars')+'</b>'+
            '<span>'+U.esc(biz.address2||'Witbank')+'</span></span>'+
          '</a>'+
          (ftr.blurb ? '<p class="ftr-blurb">'+U.esc(ftr.blurb)+'</p>' : '')+

          /* the rating, because it is the strongest thing this business has */
          (biz.googleRating
            ? '<div class="ftr-rating">'+
                '<div><div class="score">'+U.esc(biz.googleRating)+'</div></div>'+
                '<div style="min-width:0">'+
                  '<div class="rating">'+starRow(biz.googleRating)+'</div>'+
                  '<small>'+U.esc(biz.googleReviews||0)+' Google reviews'+
                    (biz.autotraderRating
                      ? ' &middot; '+U.esc(biz.autotraderRating)+' on AutoTrader' : '')+
                  '</small>'+
                '</div>'+
              '</div>'
            : '')+

          (socialMap.length
            ? '<div class="ftr-social">'+socialMap.map(function(x){
                return '<a href="'+U.esc(social[x[0]])+'" target="_blank" rel="noopener noreferrer" '+
                       'aria-label="'+x[2]+'">'+SC.icon[x[1]]+'</a>';
              }).join('')+'</div>'
            : '')+

          /* what the business actually is, stated plainly */
          '<div class="ftr-badges">'+
            (biz.established
              ? '<span class="ftr-badge">'+SC.icon.award+'Trading since '+U.esc(biz.established)+'</span>' : '')+
            (fin.partner
              ? '<span class="ftr-badge">'+SC.icon.bank+U.esc(fin.partner)+'</span>' : '')+
            (biz.autotraderId
              ? '<span class="ftr-badge">'+SC.icon.globe+'AutoTrader dealer</span>' : '')+
          '</div>'+
        '</div>'+

        cols.map(function(c){
          return '<div class="ftr-col"><h4>'+U.esc(c.title||'')+'</h4><ul>'+
            (c.links||[]).map(function(l){
              return '<li><a href="'+U.esc(l.link)+'">'+U.esc(l.label)+'</a></li>';
            }).join('')+
          '</ul></div>';
        }).join('')+

        '<div class="ftr-col">'+
          '<h4>Find us</h4>'+
          '<div class="ftr-contact">'+
            (biz.addressFull ? '<div>'+SC.icon.pin+'<span>'+U.esc(biz.addressFull)+
              (biz.landmark ? '<br><span style="color:var(--text-inv-3)">'+U.esc(biz.landmark)+'</span>' : '')+
              '</span></div>' : '')+
            (biz.phone ? '<div>'+SC.icon.phone+'<a href="tel:'+U.esc(U.telHref(biz.phone))+'">'+U.esc(biz.phone)+'</a></div>' : '')+
            (biz.mobile ? '<div>'+SC.icon.wa+'<a href="tel:'+U.esc(U.telHref(biz.mobile))+'">'+U.esc(biz.mobile)+'</a></div>' : '')+
            (biz.email ? '<div>'+SC.icon.mail+'<a href="mailto:'+U.esc(biz.email)+'">'+U.esc(biz.email)+'</a></div>' : '')+
          '</div>'+

          /* opening hours, with today marked */
          (Array.isArray(biz.hours) && biz.hours.length
            ? '<h4 style="margin-top:22px">Opening hours</h4>'+
              '<div class="ftr-contact" style="gap:7px">'+
                biz.hours.map(function(h){
                  var today = h.day === new Date().toLocaleDateString('en-ZA',{weekday:'long'});
                  return '<div style="justify-content:space-between;gap:14px'+
                    (today?';color:#fff;font-weight:650':'')+'">'+
                    '<span>'+U.esc(h.day.slice(0,3))+'</span>'+
                    '<span>'+(h.closed ? 'Closed' : U.esc(h.open)+' – '+U.esc(h.close))+'</span>'+
                  '</div>';
                }).join('')+
              '</div>'
            : '')+

          (biz.mapEmbed
            ? '<div class="ftr-map" style="margin-top:20px">'+
                '<iframe title="Where to find us" loading="lazy" '+
                'referrerpolicy="no-referrer-when-downgrade" src="'+U.esc(biz.mapEmbed)+'"></iframe>'+
              '</div>'
            : '')+
        '</div>'+
      '</div>'+

      (ftr.legalNote || biz.legalName
        ? '<p class="ftr-legal">'+
          (biz.legalName ? U.esc(biz.legalName)+' trading as '+U.esc(biz.name||'')+'. ' : '')+
          U.esc(ftr.legalNote||'')+'</p>'
        : '')+

      '<div class="ftr-bot">'+
        '<span>&copy; '+new Date().getFullYear()+' '+U.esc(ftr.copyright||biz.name||'Super Cars Witbank')+'. All rights reserved.'+
          (biz.established ? ' Trading since '+U.esc(biz.established)+'.' : '')+'</span>'+
        '<span><a href="privacy.html">Privacy</a> &middot; <a href="terms.html">Terms</a></span>'+
      '</div>'+
    '</div>';
}

/* ---------------------------------------------------------- WhatsApp -- */
function paintWhatsApp(biz){
  var wa = U.waNumber(biz.whatsapp || biz.mobile);
  if(!wa) return;
  SC.wa = wa;

  /* Rewrites every wa.me link on the page to the number in the portal, so
     changing it there changes it everywhere at once. */
  U.els('a[href*="wa.me"]').forEach(function(a){
    a.href = a.getAttribute('href').replace(/wa\.me\/\d*/, 'wa.me/'+wa);
  });

  var host = U.el('[data-wa-float]');
  if(host){
    var msg = encodeURIComponent('Hello '+(biz.shortName||'Super Cars')+', I would like to enquire about a vehicle.');
    host.innerHTML = '<a class="wa-float" href="https://wa.me/'+wa+'?text='+msg+'" '+
      'target="_blank" rel="noopener noreferrer" aria-label="Chat to us on WhatsApp">'+SC.icon.wa+'</a>';
  }
}

/* The dealership's AutoTrader page. Built from the dealer ID so the number is
   stored once; a full address in the social settings still wins if one is set. */
SC.autotraderUrl = function(biz){
  if(!biz) return '';
  if(biz.social && biz.social.autotrader) return biz.social.autotrader;
  return biz.autotraderId ? 'https://www.autotrader.co.za/dealers/'+biz.autotraderId : '';
};

/* Builds a WhatsApp link for a specific vehicle. Used by the detail page
   and the vehicle cards. */
SC.waLink = function(text){
  if(!SC.wa) return '#';
  return 'https://wa.me/'+SC.wa+'?text='+encodeURIComponent(text||'');
};

/* --------------------------------------------- generic data-biz binding -- */
/* Any element carrying data-biz="phone" gets the value from the business
   record. Elements are found by attribute rather than by class or position,
   so a design change cannot silently break the binding, and an element
   without the attribute is left alone. */
function paintBusinessBindings(biz){
  U.els('[data-biz]').forEach(function(el){
    var key = el.dataset.biz;
    var val = biz[key];
    if(val === undefined || val === null || val === '') return;

    if(key === 'hours' && Array.isArray(val)) return paintHours(el,val);

    if(el.tagName === 'A'){
      if(key==='phone' || key==='mobile') el.href = 'tel:'+U.telHref(val);
      else if(key==='email' || key==='salesEmail') el.href = 'mailto:'+val;
      else if(key==='mapsUrl' || key==='website' || key==='googleUrl') el.href = val;
      if(!el.dataset.bizKeepText) el.textContent = val;
    }else if(el.tagName === 'IFRAME'){
      el.src = val;
    }else if(el.tagName === 'IMG'){
      el.src = val;
    }else{
      el.textContent = val;
    }
  });
}

function paintHours(el,hours){
  var todayName = new Date().toLocaleDateString('en-ZA',{weekday:'long'});
  el.innerHTML = hours.map(function(h){
    var today = h.day === todayName;
    var when = h.closed ? '<span class="shut">Closed</span>'
                        : '<span>'+U.esc(h.open)+' &ndash; '+U.esc(h.close)+'</span>';
    return '<div'+(today?' class="today"':'')+'><span>'+U.esc(h.day)+
           (today?' <small>(today)</small>':'')+'</span>'+when+'</div>';
  }).join('');
}

/* Whether the business is open right now. Used by the contact page. */
SC.openNow = function(biz){
  if(!Array.isArray(biz.hours)) return null;
  var now = new Date();
  var name = now.toLocaleDateString('en-ZA',{weekday:'long'});
  var today = biz.hours.filter(function(h){ return h.day===name; })[0];
  if(!today || today.closed) return {open:false,today:today};
  var mins = now.getHours()*60 + now.getMinutes();
  var toM = function(t){
    var p = String(t||'').split(':');
    return (Number(p[0])||0)*60 + (Number(p[1])||0);
  };
  return {open: mins >= toM(today.open) && mins < toM(today.close), today:today};
};

})();
