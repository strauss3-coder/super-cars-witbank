/* ==========================================================================
   SUPER CARS WITBANK  ·  Reviews
   --------------------------------------------------------------------------
   Lists the reviews staff have published through the portal.

   The headline rating comes from the Google Business Profile figure in the
   business settings, and the cards come from the testimonials table. Those
   are two different things and the page says so: the 4.8 is what Google
   holds, the cards are the reviews staff have chosen to reproduce here.

   Until staff publish their first review the grid shows an honest prompt
   pointing at the real Google reviews, rather than invented quotes.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

var host = U.el('[data-reviews]');
host.innerHTML = '<div class="sk" style="height:220px;border-radius:var(--r-lg)"></div>'+
                 '<div class="sk" style="height:220px;border-radius:var(--r-lg)"></div>'+
                 '<div class="sk" style="height:220px;border-radius:var(--r-lg)"></div>';

Promise.all([SC.site, SC.data.settings(), SC.data.testimonials()]).then(function(r){
  var biz = r[1].business || {};
  var list = r[2];

  paintRating(biz, list);
  paintReviews(list, biz);
  paintReviewLink(biz);
  SC.scan(document); SC.fadeImages(document);
}).catch(function(err){
  console.error('[testimonials] '+err.message);
  host.innerHTML = '<div class="empty" style="grid-column:1/-1">'+SC.icon.warn+
    '<b>Reviews could not be loaded</b><p>Please refresh the page.</p></div>';
});

function paintRating(biz,list){
  var slot = U.el('[data-rating]');
  if(!slot) return;
  if(!biz.googleRating){ slot.remove(); return; }

  var full = Math.round(biz.googleRating);
  var stars = '';
  for(var i=1;i<=5;i++) stars += '<span'+(i<=full?'':' class="off"')+'>'+SC.icon.starFill+'</span>';

  slot.innerHTML =
    '<div class="rating-hero">'+
      '<div><div class="score">'+U.esc(biz.googleRating)+'</div><div class="of">out of 5</div></div>'+
      '<div class="stack" style="gap:8px;min-width:0;flex:1">'+
        '<div class="rating">'+stars+'</div>'+
        '<p class="small" style="margin:0">Our Google rating, from '+
          U.esc(biz.googleReviews||0)+' customer reviews'+
          (list.length ? '. '+list.length+' of them are reproduced below.' : '.')+
        '</p>'+
      '</div>'+
      (biz.googleUrl
        ? '<a class="btn btn-out" href="'+U.esc(biz.googleUrl)+'" target="_blank" '+
          'rel="noopener noreferrer">See all on Google</a>' : '')+
    '</div>'+

    /* The AutoTrader dealer rating is a separate score from a separate set of
       customers, so it is shown as its own figure rather than blended in. */
    (biz.autotraderRating
      ? '<div class="rating-hero" style="margin-top:14px;background:var(--paper)">'+
          '<div><div class="score" style="font-size:clamp(32px,4vw,44px)">'+
            U.esc(biz.autotraderRating)+'</div><div class="of">out of 5</div></div>'+
          '<div class="stack" style="gap:6px;min-width:0;flex:1">'+
            '<b style="font-size:15px">On AutoTrader</b>'+
            '<p class="small" style="margin:0">From '+U.esc(biz.autotraderReviews||0)+
              ' dealer reviews.</p>'+
          '</div>'+
          (SC.autotraderUrl(biz)
            ? '<a class="btn btn-out btn-sm" href="'+U.esc(SC.autotraderUrl(biz))+'" '+
              'target="_blank" rel="noopener noreferrer">View on AutoTrader</a>' : '')+
        '</div>'
      : '');

  /* Structured data for the aggregate rating is emitted by site.js on every
     page, so it is not repeated here. */
}

function paintReviews(list,biz){
  if(!list.length){
    host.innerHTML =
      '<div class="empty" style="grid-column:1/-1">'+SC.icon.star+
        '<b>Our reviews live on Google</b>'+
        '<p>We have '+U.esc(biz.googleReviews||0)+' reviews averaging '+
          U.esc(biz.googleRating||'')+' out of 5. We are in the middle of bringing them '+
          'across to this page. In the meantime you can read every one of them on Google.</p>'+
        (biz.googleUrl
          ? '<a class="btn btn-pri btn-sm" href="'+U.esc(biz.googleUrl)+'" target="_blank" '+
            'rel="noopener noreferrer">Read our Google reviews</a>' : '')+
      '</div>';
    return;
  }
  host.innerHTML = list.map(function(t,i){ return card(t,i%3); }).join('');
}

/* Same card shape the home page uses. Kept here as well as in home.js would
   duplicate it, so home.js publishes it on SC and this page reuses it when
   it is present, falling back to its own copy when the home script is not
   loaded on this page. */
function card(t,reveal){
  if(SC.testimonialCard) return SC.testimonialCard(t,reveal);

  var stars = '';
  for(var i=1;i<=5;i++){
    stars += '<span'+(i<=t.rating?'':' class="off"')+'>'+SC.icon.starFill+'</span>';
  }
  var av = t.photo ? '<img src="'+U.esc(t.photo)+'" alt="" loading="lazy">'
                   : U.esc(U.initials(t.name));

  return '<article class="tm" data-reveal="'+reveal+'">'+
    '<div class="rating" aria-label="'+t.rating+' out of 5">'+stars+'</div>'+
    '<p class="tm-quote">'+U.esc(t.review)+'</p>'+
    '<div class="tm-who">'+
      '<span class="tm-av">'+av+'</span>'+
      '<div style="min-width:0"><b>'+U.esc(t.name)+'</b>'+
      '<span>'+U.esc([t.vehicle,t.location].filter(Boolean).join(' · '))+'</span></div>'+
      (t.isGoogle ? '<span class="badge line tm-src">Google</span>' : '')+
    '</div>'+
  '</article>';
}

function paintReviewLink(biz){
  var a = U.el('[data-review-link]');
  if(!a) return;
  if(!biz.googleUrl){ a.closest('.cta').remove(); return; }
  a.href = biz.googleUrl;
}

})();
