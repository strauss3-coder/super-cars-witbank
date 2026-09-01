/* ==========================================================================
   SUPER CARS WITBANK  ·  Vehicle card
   One renderer, used by the home page, the inventory grid and the related
   vehicles strip, so a card looks and behaves the same everywhere.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

/* The link a card points at. Slug when the portal has set one, id otherwise,
   so a vehicle is always reachable even before staff fill in the SEO fields. */
SC.vehicleHref = function(v){
  return 'vehicle.html?v=' + encodeURIComponent(v.slug || v.id);
};

/* The four specs shown on a card, in the order buyers scan them. Anything
   the portal has not captured is left out rather than shown as a blank. */
SC.cardSpecs = function(v){
  var out = [];
  if(v.year)         out.push({i:'cal',   t:v.year});
  if(v.mileage)      out.push({i:'gauge', t:U.km(v.mileage)});
  if(v.transmission) out.push({i:'gear',  t:v.transmission});
  if(v.fuel)         out.push({i:'fuel',  t:v.fuel});
  return out;
};

/* AutoTrader's market value badges carry a meaning, so they are coloured by
   it rather than all shown as good news. "High Price" in green would be
   actively misleading. */
SC.badgeTone = function(badge){
  var b = String(badge||'').toLowerCase();
  if(b.indexOf('great') > -1) return 'ok';
  if(b.indexOf('high')  > -1) return 'line';
  return 'info';
};

SC.vehicleCard = function(v,opts){
  opts = opts || {};
  var img = v.images[0] || '';
  var href = SC.vehicleHref(v);

  var tags = [];
  if(v.sold)              tags.push('<span class="badge dark">Sold</span>');
  else if(v.reserved)     tags.push('<span class="badge warn">Reserved</span>');
  else if(v.featured)     tags.push('<span class="badge red">Featured</span>');
  if(v.priceBadge)        tags.push('<span class="badge '+SC.badgeTone(v.priceBadge)+'">'+
                                     U.esc(v.priceBadge)+'</span>');

  /* A vehicle with no price is one staff have not finished capturing. It
     shows "Price on request" rather than R0, which would be a lie. */
  var price = v.price > 0
    ? '<b>'+U.money(v.price)+'</b>'
    : '<b class="poa">Price on request</b>';

  var instal = v.price > 0 && v.installment > 0
    ? '<small>From '+U.money(v.installment)+' p/m</small>'
    : '';

  return ''+
  '<article class="veh'+(opts.wide?' wide':'')+'"'+(opts.reveal!=null?' data-reveal="'+opts.reveal+'"':'')+'>'+
    '<a class="veh-img" href="'+href+'" aria-label="'+U.esc(v.fullTitle)+'">'+
      (img
        ? '<img src="'+U.esc(img)+'" alt="'+U.esc(v.fullTitle)+'" loading="lazy" decoding="async" width="800" height="600">'
        : '<div class="sk" style="width:100%;height:100%"></div>')+
      (tags.length ? '<div class="veh-tags">'+tags.join('')+'</div>' : '')+
      (v.images.length > 1
        ? '<span class="veh-count">'+SC.icon.camera+v.images.length+'</span>' : '')+
      (v.sold ? '<div class="veh-sold"><span>SOLD</span></div>' : '')+
    '</a>'+
    '<div class="veh-b">'+
      '<h3><a href="'+href+'">'+U.esc(v.title)+'</a></h3>'+
      (v.variant ? '<p class="veh-var">'+U.esc(v.variant)+'</p>' : '')+
      '<div class="veh-specs">'+
        SC.cardSpecs(v).map(function(s){
          return '<span>'+SC.icon[s.i]+U.esc(s.t)+'</span>';
        }).join('')+
      '</div>'+
      '<div class="veh-foot">'+
        '<div class="veh-price">'+price+instal+'</div>'+
        '<a class="veh-go" href="'+href+'" aria-label="View '+U.esc(v.fullTitle)+'">'+SC.icon.arrowR+'</a>'+
      '</div>'+
    '</div>'+
  '</article>';
};

/* Placeholder cards shown while the first read is in flight, so the page
   does not jump when the real cards arrive. */
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

/* The estimated monthly instalment shown on cards and on the detail page.
   Uses the same rate, term and deposit that the Finance page uses, so a
   figure never disagrees with itself across the site. */
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
  /* Standard instalment loan with a balloon: the residual is discounted back
     to today and removed from the amount the instalments have to repay. */
  var pmt = (principal - residual/f) * (i*f)/(f-1);
  return Math.round(pmt + svc);
};

})();
