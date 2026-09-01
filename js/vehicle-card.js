/* ==========================================================================
   SUPER CARS WITBANK  ·  Vehicle card
   --------------------------------------------------------------------------
   One renderer, used by the home page, the inventory grid and the related
   strip, so a card looks and behaves the same everywhere.

   Everything on the card is real. The heart genuinely saves (and the stock
   page can filter to saved), compare genuinely opens a side-by-side, and
   WhatsApp opens a message that already names the car. Nothing here is a
   decorative button that does not do its job.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

/* A car counts as a new arrival for this many days. */
var NEW_DAYS = 30;

/* ------------------------------------------------------------- saved -- */
/* Kept in this browser. A wishlist is a convenience, not an account, so it
   deliberately never leaves the device. */
var SAVED_KEY = 'sc_saved';

SC.saved = {
  all:function(){
    try{ return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); }
    catch(e){ return []; }
  },
  has:function(id){ return SC.saved.all().indexOf(id) > -1; },
  toggle:function(id){
    var list = SC.saved.all();
    var i = list.indexOf(id);
    if(i > -1) list.splice(i,1); else list.push(id);
    try{ localStorage.setItem(SAVED_KEY, JSON.stringify(list)); }catch(e){}
    document.dispatchEvent(new CustomEvent('sc:saved',{detail:{id:id,on:i < 0}}));
    return i < 0;
  }
};

/* --------------------------------------------------------------- link -- */
SC.vehicleHref = function(v){
  return 'vehicle.html?v=' + encodeURIComponent(v.slug || v.id);
};

/* The four specs buyers scan first. Anything not captured is left out
   rather than shown as a blank. */
SC.cardSpecs = function(v){
  var out = [];
  if(v.year)         out.push({i:'cal',   t:v.year});
  if(v.mileage)      out.push({i:'gauge', t:U.km(v.mileage)});
  if(v.transmission) out.push({i:'gear',  t:v.transmission});
  if(v.fuel)         out.push({i:'fuel',  t:v.fuel});
  return out;
};

/* AutoTrader's market badges carry a meaning, so they are coloured by it
   rather than all shown as good news. "High Price" in green would mislead. */
SC.badgeTone = function(badge){
  var b = String(badge||'').toLowerCase();
  if(b.indexOf('great') > -1) return 'ok';
  if(b.indexOf('high')  > -1) return 'line';
  return 'info';
};

/* "Just in" has to mean something. A ribbon on every card is decoration, so a
   vehicle qualifies only if it is BOTH recent in absolute terms AND among the
   newest few on the floor. Whoever loads the list calls markNewArrivals once;
   until they do, nothing is marked, which is the safe default. */
var newIds = {};

SC.markNewArrivals = function(list){
  newIds = {};
  var recent = (list||[])
    .filter(function(v){
      if(v.sold || !v.createdAt) return false;
      var age = (Date.now() - new Date(v.createdAt).getTime()) / 86400000;
      return age >= 0 && age <= NEW_DAYS;
    })
    .sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });

  /* At most a quarter of the floor, and never more than four. */
  recent.slice(0, Math.min(4, Math.max(1, Math.ceil((list||[]).length / 4))))
    .forEach(function(v){ newIds[v.id] = true; });
};

SC.isNew = function(v){ return !!newIds[v.id]; };

/* --------------------------------------------------------------- card -- */
SC.vehicleCard = function(v,opts){
  opts = opts || {};
  var img  = v.images[0] || '';
  var alt  = v.images[1] || '';
  var href = SC.vehicleHref(v);
  var isSaved = SC.saved.has(v.id);

  /* status first, then the market badge. Never more than two, or the
     photograph disappears behind labels. */
  var tags = [];
  if(v.sold)              tags.push('<span class="badge dark">Sold</span>');
  else if(v.reserved)     tags.push('<span class="badge warn">Reserved</span>');
  else if(v.featured)     tags.push('<span class="badge red">Featured</span>');
  if(v.priceBadge)        tags.push('<span class="badge '+SC.badgeTone(v.priceBadge)+'">'+
                                     U.esc(v.priceBadge)+'</span>');

  var ribbon = (!v.sold && !v.featured && SC.isNew(v))
    ? '<span class="veh-ribbon red">Just in</span>' : '';

  /* A vehicle with no price is one staff have not finished capturing. It
     says so, rather than showing R0. */
  var price = v.price > 0
    ? '<b>'+U.money(v.price)+'</b>'
    : '<b class="poa">Price on request</b>';

  var finance = (v.price > 0 && v.installment > 0 && v.financeEligible && !v.sold)
    ? '<span class="veh-fin">'+SC.icon.bank+'from '+U.money(v.installment)+' p/m</span>'
    : '';

  var waText = 'Hello Super Cars, I am interested in the '+v.fullTitle+
               (v.stock ? ' (stock '+v.stock+')' : '')+'.';
  /* site.js publishes waLink once the business details have loaded. Guarding
     it means a card can be rendered before that, and in a test, without the
     whole card failing over one button. */
  var waHref = SC.waLink ? SC.waLink(waText) : '';

  /* Quick actions are hidden for a sold car: there is nothing to enquire
     about and a WhatsApp button would only waste the buyer's time. */
  var quick = v.sold ? '' :
    '<div class="veh-quick">'+
      (waHref
        ? '<a class="wa" href="'+waHref+'" target="_blank" rel="noopener noreferrer" '+
          'aria-label="WhatsApp us about the '+U.esc(v.fullTitle)+'">'+SC.icon.wa+'WhatsApp</a>'
        : '')+
      '<a href="'+href+'" aria-label="View the '+U.esc(v.fullTitle)+'">'+SC.icon.arrowR+'Details</a>'+
    '</div>';

  var tools = v.sold ? '' :
    '<div class="veh-tools">'+
      '<button class="veh-tool'+(isSaved?' on saved':'')+'" data-save="'+U.esc(v.id)+'" '+
        'aria-pressed="'+(isSaved?'true':'false')+'" '+
        'aria-label="'+(isSaved?'Remove from saved':'Save this vehicle')+'" '+
        'title="'+(isSaved?'Saved':'Save this vehicle')+'">'+
        (isSaved ? SC.icon.heartFill : SC.icon.heart)+'</button>'+
      '<button class="veh-tool" data-compare="'+U.esc(v.id)+'" '+
        'aria-label="Add to compare" title="Compare">'+SC.icon.scales+'</button>'+
    '</div>';

  return ''+
  '<article class="veh'+(opts.wide?' wide':'')+'" data-veh="'+U.esc(v.id)+'"'+
    (opts.anim!==false?' data-anim="up"'+(opts.delay!=null?' data-delay="'+opts.delay+'"':''):'')+'>'+
    '<div class="veh-img">'+
      '<a href="'+href+'" aria-label="'+U.esc(v.fullTitle)+'" style="display:block;height:100%">'+
        (img
          ? '<img src="'+U.esc(img)+'" alt="'+U.esc(v.fullTitle)+'" loading="lazy" '+
            'decoding="async" width="800" height="600">'+
            (alt ? '<img class="alt" src="'+U.esc(alt)+'" alt="" loading="lazy" '+
                   'decoding="async" width="800" height="600" aria-hidden="true">' : '')
          : '<div class="sk" style="width:100%;height:100%"></div>')+
      '</a>'+
      (tags.length ? '<div class="veh-tags">'+tags.join('')+'</div>' : '')+
      ribbon+ tools+
      (v.images.length > 1
        ? '<span class="veh-count">'+SC.icon.camera+v.images.length+'</span>' : '')+
      quick+
      (v.sold ? '<div class="veh-sold"><span>SOLD</span></div>' : '')+
    '</div>'+
    '<div class="veh-b">'+
      '<h3><a href="'+href+'">'+U.esc(v.title)+'</a></h3>'+
      (v.variant ? '<p class="veh-var">'+U.esc(v.variant)+'</p>' : '')+
      '<div class="veh-specs">'+
        SC.cardSpecs(v).map(function(s){
          return '<span>'+SC.icon[s.i]+U.esc(s.t)+'</span>';
        }).join('')+
      '</div>'+
      '<div class="veh-foot">'+
        '<div class="veh-price">'+price+finance+'</div>'+
        '<a class="veh-go" href="'+href+'" aria-label="View '+U.esc(v.fullTitle)+'" '+
          'tabindex="-1">'+SC.icon.arrowR+'</a>'+
      '</div>'+
    '</div>'+
  '</article>';
};

/* Placeholders while the first read is in flight, so the page does not jump
   when the real cards arrive. */
SC.cardSkeletons = function(n){
  var one =
    '<div class="sk-card">'+
      '<div class="sk sk-img"></div>'+
      '<div class="sk-b">'+
        '<div class="sk" style="height:17px;width:78%"></div>'+
        '<div class="sk" style="height:13px;width:52%"></div>'+
        '<div class="sk" style="height:13px;width:88%"></div>'+
        '<div class="sk" style="height:24px;width:44%;margin-top:6px"></div>'+
      '</div>'+
    '</div>';
  return new Array(n||4).fill(one).join('');
};

/* ------------------------------------------------------- card actions -- */
/* Delegated once, at the document, so cards rendered at any time work. */
document.addEventListener('click',function(e){
  var save = e.target.closest('[data-save]');
  if(save){
    e.preventDefault();
    var on = SC.saved.toggle(save.dataset.save);
    save.classList.toggle('on',on);
    save.classList.toggle('saved',on);
    save.setAttribute('aria-pressed', on ? 'true' : 'false');
    save.setAttribute('aria-label', on ? 'Remove from saved' : 'Save this vehicle');
    save.title = on ? 'Saved' : 'Save this vehicle';
    save.innerHTML = on ? SC.icon.heartFill : SC.icon.heart;
    return;
  }
  var cmp = e.target.closest('[data-compare]');
  if(cmp && SC.compare){
    e.preventDefault();
    SC.compare.toggle(cmp.dataset.compare);
  }
});

/* Keeps every heart on the page in step when one is toggled, because the
   same vehicle can appear in more than one row. */
document.addEventListener('sc:saved',function(e){
  U.els('[data-save="'+e.detail.id+'"]').forEach(function(b){
    b.classList.toggle('on',e.detail.on);
    b.classList.toggle('saved',e.detail.on);
    b.setAttribute('aria-pressed', e.detail.on ? 'true' : 'false');
    b.innerHTML = e.detail.on ? SC.icon.heartFill : SC.icon.heart;
  });
});

/* --------------------------------------------------------- instalment -- */
/* The estimate shown on cards and on the detail page. Uses the same rate,
   term and deposit the finance page uses, so a figure never disagrees with
   itself across the site. */
SC.instalment = function(price,fin){
  fin = fin || {};
  var rate    = Number(fin.defaultRate)||11.75;
  var months  = Number(fin.defaultTermMonths)||72;
  var depPct  = Number(fin.defaultDepositPct)||0;
  var resPct  = Number(fin.defaultResidualPct)||0;
  var svc     = Number(fin.monthlyServiceFee)||0;
  var init    = Number(fin.initiationFee)||0;

  var deposit  = price * (depPct/100);
  var residual = price * (resPct/100);
  var principal = price - deposit + init;
  var i = (rate/100)/12;

  if(i <= 0 || months <= 0) return Math.round((principal - residual)/Math.max(months,1) + svc);

  var f = Math.pow(1+i,months);
  /* Standard instalment sale with a balloon: the residual is discounted back
     to today and removed from what the instalments have to repay. */
  var pmt = (principal - residual/f) * (i*f)/(f-1);
  return Math.round(pmt + svc);
};

})();
