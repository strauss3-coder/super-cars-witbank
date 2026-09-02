/* ==========================================================================
   SUPER CARS WITBANK  ·  About
   Every block on this page comes from the `about` settings document, which
   the portal's Website Content module writes. A block the portal has left
   empty removes its whole section, so the page never shows a heading with
   nothing under it.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

Promise.all([SC.site, SC.data.settings()]).then(function(r){
  var about = r[1].about || {};
  var biz   = r[1].business || {};

  U.els('[data-about]').forEach(function(el){
    var v = about[el.dataset.about];
    if(v) el.textContent = v;
  });

  paintPhoto('[data-story-photo]',about.storyImage,
    'The dealership on Watermeyer Street','Trading from the same premises since 1999.');
  paintPhoto('[data-location-photo]',about.locationImage,
    'Under the canopy at Super Cars Witbank','Every vehicle prepared before it is listed.');
  paintStory(about);
  paintRating(biz);
  paintOwner(about);
  paintValues(about);
  paintTimeline(about);
  paintTeam(about);
  paintLocation(biz);

  SC.scan(document); SC.fadeImages(document);
}).catch(function(err){ console.error('[about] '+err.message); });

/* A framed photograph, dropped entirely when the portal has no image for it. */
function paintPhoto(sel,src,alt,caption){
  var host = U.el(sel);
  if(!host) return;
  if(!src){ host.remove(); return; }
  host.innerHTML =
    '<figure class="photo-frame" data-anim="left">'+
      '<img src="'+U.esc(src)+'" alt="'+U.esc(alt)+'" loading="lazy" decoding="async">'+
      (caption ? '<figcaption>'+U.esc(caption)+'</figcaption>' : '')+
    '</figure>';
}

function paintStory(about){
  var host = U.el('[data-story]');
  if(!host) return;
  if(!about.story){ host.remove(); return; }
  host.innerHTML = about.story.split(/\n{2,}/).map(function(p){
    return '<p>'+U.esc(p.trim())+'</p>';
  }).join('');
}

function paintRating(biz){
  var host = U.el('[data-rating]');
  if(!host) return;
  if(!biz.googleRating){ host.remove(); return; }

  var full = Math.round(biz.googleRating);
  var stars = '';
  for(var i=1;i<=5;i++) stars += '<span'+(i<=full?'':' class="off"')+'>'+SC.icon.starFill+'</span>';

  host.innerHTML =
    '<div class="rating-hero" data-reveal>'+
      '<div><div class="score">'+U.esc(biz.googleRating)+'</div><div class="of">out of 5</div></div>'+
      '<div class="stack" style="gap:8px;min-width:0">'+
        '<div class="rating">'+stars+'</div>'+
        '<p class="small" style="margin:0">'+U.esc(biz.googleReviews||0)+
          ' customers have rated us on Google.</p>'+
        (biz.googleUrl
          ? '<a class="btn btn-out btn-sm" style="justify-self:start" href="'+U.esc(biz.googleUrl)+'" '+
            'target="_blank" rel="noopener noreferrer">Read them</a>' : '')+
      '</div>'+
    '</div>';
}

/* The owner block is optional: the portal has fields for it, and until a
   name is filled in there is nothing honest to show. */
function paintOwner(about){
  var host = U.el('[data-owner]');
  if(!host) return;
  if(!about.ownerName){ host.remove(); return; }

  host.innerHTML =
    '<div class="info-card" data-reveal="1">'+
      '<div class="info-row" style="align-items:center">'+
        (about.ownerPhoto
          ? '<span class="tm-av" style="width:56px;height:56px">'+
            '<img src="'+U.esc(about.ownerPhoto)+'" alt=""></span>'
          : '<span class="tm-av" style="width:56px;height:56px">'+
            U.esc(U.initials(about.ownerName))+'</span>')+
        '<div><b>'+U.esc(about.ownerName)+'</b>'+
        '<p style="font-size:14px;color:var(--text-2);font-weight:500">'+
          U.esc(about.ownerRole||'')+'</p></div>'+
      '</div>'+
      (about.ownerQuote
        ? '<p class="prose" style="font-size:15px;font-style:italic">'+
          '&ldquo;'+U.esc(about.ownerQuote)+'&rdquo;</p>' : '')+
    '</div>';
}

function paintValues(about){
  var host = U.el('[data-values]');
  var sec  = U.el('[data-values-sec]');
  if(!host || !sec) return;
  var list = Array.isArray(about.values) ? about.values : [];
  if(!list.length){ sec.remove(); return; }

  host.innerHTML = list.map(function(v,i){
    return '<div class="why-item" data-reveal="'+(i%2)+'">'+
      '<span class="why-ic">'+SC.icon.check+'</span>'+
      '<div><b>'+U.esc(v.title||'')+'</b><p>'+U.esc(v.text||'')+'</p></div></div>';
  }).join('');
  sec.hidden = false;
}

function paintTimeline(about){
  var host = U.el('[data-timeline]');
  var sec  = U.el('[data-timeline-sec]');
  if(!host || !sec) return;
  var list = Array.isArray(about.timeline) ? about.timeline : [];
  if(!list.length){ sec.remove(); return; }

  host.innerHTML = list.map(function(t,i){
    return '<div data-reveal="'+(i%4)+'" style="border-top:2px solid var(--red);padding-top:16px">'+
      '<b style="display:block;font-size:26px;font-weight:850;letter-spacing:-.03em;'+
        'color:var(--red)">'+U.esc(t.year||'')+'</b>'+
      '<b style="display:block;font-size:15.5px;font-weight:730;margin:8px 0 6px">'+
        U.esc(t.title||'')+'</b>'+
      '<p class="small" style="margin:0">'+U.esc(t.text||'')+'</p>'+
    '</div>';
  }).join('');
  sec.hidden = false;
}

function paintTeam(about){
  var host = U.el('[data-team]');
  var sec  = U.el('[data-team-sec]');
  if(!host || !sec) return;
  var list = Array.isArray(about.team) ? about.team : [];
  /* No team members captured yet. The section removes itself rather than
     inventing people. */
  if(!list.length){ sec.remove(); return; }

  host.innerHTML = list.map(function(m,i){
    return '<div class="tm" data-reveal="'+(i%4)+'" style="align-items:center;text-align:center">'+
      '<span class="tm-av" style="width:74px;height:74px;font-size:22px;margin-inline:auto">'+
        (m.photo ? '<img src="'+U.esc(m.photo)+'" alt="">' : U.esc(U.initials(m.name)))+
      '</span>'+
      '<div><b style="display:block;font-size:16px;font-weight:740">'+U.esc(m.name||'')+'</b>'+
      '<span class="small">'+U.esc(m.role||'')+'</span></div>'+
      (m.bio ? '<p class="tm-quote" style="text-align:center">'+U.esc(m.bio)+'</p>' : '')+
    '</div>';
  }).join('');
  sec.hidden = false;
}

function paintLocation(biz){
  var host = U.el('[data-location-card]');
  if(!host) return;

  host.innerHTML =
    '<div class="info-card" style="margin-top:8px">'+
      (biz.addressFull
        ? '<div class="info-row"><span class="ic">'+SC.icon.pin+'</span>'+
          '<div><b>Address</b><p>'+U.esc(biz.addressFull)+'</p></div></div>' : '')+
      (biz.phone
        ? '<div class="info-row"><span class="ic">'+SC.icon.phone+'</span>'+
          '<div><b>Telephone</b><a href="tel:'+U.esc(U.telHref(biz.phone))+'">'+
          U.esc(biz.phone)+'</a></div></div>' : '')+
      (Array.isArray(biz.hours) && biz.hours.length
        ? '<div><b style="display:block;font-size:11.5px;font-weight:750;letter-spacing:.08em;'+
          'text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Opening hours</b>'+
          '<div class="hours">'+hoursHtml(biz.hours)+'</div></div>' : '')+
      (biz.mapsUrl
        ? '<a class="btn btn-dark btn-block" href="'+U.esc(biz.mapsUrl)+'" '+
          'target="_blank" rel="noopener noreferrer">Get directions</a>' : '')+
    '</div>';
}

function hoursHtml(hours){
  var todayName = new Date().toLocaleDateString('en-ZA',{weekday:'long'});
  return hours.map(function(h){
    var today = h.day === todayName;
    var when = h.closed ? '<span class="shut">Closed</span>'
                        : '<span>'+U.esc(h.open)+' &ndash; '+U.esc(h.close)+'</span>';
    return '<div'+(today?' class="today"':'')+'><span>'+U.esc(h.day)+'</span>'+when+'</div>';
  }).join('');
}

})();
