/* ==========================================================================
   SUPER CARS WITBANK  ·  Vehicle detail
   --------------------------------------------------------------------------
   Gallery, specifications, description, features, service history, a finance
   estimate, and the four ways a buyer can act: WhatsApp, enquire, book a
   test drive, or reserve.

   Every figure on this page comes from the vehicle record in the portal. A
   specification the portal has not captured is left out rather than shown
   as a blank row, because an empty "Power: —" reads as missing information
   while its absence reads as a spec that does not apply.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;
var host = U.el('[data-vehicle]');
var key = U.params().v || '';

var vehicle = null, biz = {}, fin = {};

Promise.all([SC.site, SC.data.settings(), SC.data.vehicles()]).then(function(r){
  biz = r[1].business || {};
  fin = r[1].finance  || {};
  var all = r[2];

  vehicle = all.filter(function(v){ return v.slug === key; })[0] ||
            all.filter(function(v){ return v.id === key; })[0] || null;

  if(!vehicle){ notFound(); return; }

  if(vehicle.price > 0 && !vehicle.installment){
    vehicle.installment = SC.instalment(vehicle.price, fin);
  }

  paintHead();
  render();
  gallery();
  actions();
  related(all);

  SC.data.trackView(vehicle.id);
  SC.reveal();
}).catch(function(err){
  console.error('[vehicle] '+err.message);
  host.innerHTML = '<div class="empty">'+SC.icon.warn+
    '<b>This vehicle could not be loaded</b>'+
    '<p>Something went wrong reaching our system. Please refresh, or telephone us and we will tell you about it directly.</p>'+
    '<a class="btn btn-out btn-sm" href="inventory.html">Back to stock</a></div>';
});

/* --------------------------------------------------------------- header -- */
function paintHead(){
  var title = vehicle.metaTitle || (vehicle.fullTitle + ' for sale in Witbank');
  document.title = title + ' | Super Cars Witbank';
  document.body.dataset.titleSet = '1';

  var desc = vehicle.metaDescription ||
    (vehicle.fullTitle + (vehicle.mileage ? ', ' + U.km(vehicle.mileage) : '') +
     (vehicle.price ? ', ' + U.money(vehicle.price) : '') +
     '. Available now at Super Cars Witbank, 75 Watermeyer Street, eMalahleni.');

  var m = U.el('meta[name="description"]');
  if(!m){ m = document.createElement('meta'); m.name='description'; document.head.appendChild(m); }
  m.content = desc;

  /* Breadcrumb tail */
  var crumbs = U.el('[data-crumbs]');
  if(crumbs){
    crumbs.insertAdjacentHTML('beforeend',
      '<span aria-hidden="true">/</span><span>'+U.esc(vehicle.title)+'</span>');
  }

  /* Product structured data, so the listing can show a price in search
     results. Only emitted when there is a real price to state. */
  if(vehicle.price > 0){
    SC.ldJson({
      '@context':'https://schema.org',
      '@type':'Car',
      name:vehicle.fullTitle,
      description:vehicle.description || desc,
      image:vehicle.images.slice(0,6),
      brand:{'@type':'Brand',name:vehicle.make},
      model:vehicle.model,
      vehicleModelDate:vehicle.year ? String(vehicle.year) : undefined,
      mileageFromOdometer:vehicle.mileage
        ? {'@type':'QuantitativeValue',value:vehicle.mileage,unitCode:'KMT'} : undefined,
      fuelType:vehicle.fuel || undefined,
      vehicleTransmission:vehicle.transmission || undefined,
      color:vehicle.colour || undefined,
      offers:{
        '@type':'Offer',
        price:String(vehicle.price),
        priceCurrency:'ZAR',
        availability: vehicle.sold ? 'https://schema.org/SoldOut'
                    : vehicle.reserved ? 'https://schema.org/LimitedAvailability'
                    : 'https://schema.org/InStock',
        seller:{'@type':'AutoDealer',name:biz.name||'Super Cars Witbank'}
      }
    },'ld-vehicle');
  }
}

function notFound(){
  document.title = 'Vehicle not found | Super Cars Witbank';
  host.innerHTML = '<div class="empty" style="margin-block:40px">'+SC.icon.car+
    '<b>That vehicle is no longer listed</b>'+
    '<p>It may have been sold, or the link may be out of date. Our current stock is all here.</p>'+
    '<div class="row" style="justify-content:center;margin-top:6px">'+
      '<a class="btn btn-pri" href="inventory.html">Browse current stock</a>'+
      '<a class="btn btn-out" href="contact.html">Tell us what you are after</a>'+
    '</div></div>';
}

/* --------------------------------------------------------------- render -- */
function render(){
  var v = vehicle;

  var tags = [];
  if(v.sold)          tags.push('<span class="badge dark">Sold</span>');
  else if(v.reserved) tags.push('<span class="badge warn">Reserved</span>');
  else                tags.push('<span class="badge ok">Available</span>');
  if(v.featured)      tags.push('<span class="badge red">Featured</span>');
  if(v.priceBadge)    tags.push('<span class="badge '+SC.badgeTone(v.priceBadge)+'">'+
                                U.esc(v.priceBadge)+'</span>');
  if(v.stock)         tags.push('<span class="badge line">Stock '+U.esc(v.stock)+'</span>');

  var price = v.price > 0
    ? '<b>'+U.money(v.price)+'</b>'
    : '<b style="font-size:26px;color:var(--text-2)">Price on request</b>';

  var pm = (v.price > 0 && v.installment && v.financeEligible)
    ? '<span class="pm">or about <strong>'+U.money(v.installment)+'</strong> per month</span>'
    : '';

  host.innerHTML =
  '<div class="vd-layout">'+

    /* ---- left column ---- */
    '<div>'+
      galleryHtml(v)+

      (v.description
        ? box('About this vehicle','<div class="prose">'+
            v.description.split(/\n{2,}/).map(function(p){
              return '<p>'+U.esc(p.trim())+'</p>';
            }).join('')+'</div>')
        : '')+

      specsBox(v)+

      (v.features.length
        ? box('Features and specification',
            '<ul class="feat-list">'+v.features.map(function(f){
              return '<li>'+SC.icon.check+'<span>'+U.esc(f)+'</span></li>';
            }).join('')+'</ul>')
        : '')+

      (v.serviceHistory || v.condition
        ? box('Condition and history',
            '<div class="specs" style="border-radius:var(--r-sm);overflow:hidden">'+
              (v.serviceHistory ? spec('wrench','Service history',v.serviceHistory) : '')+
              (v.condition ? spec('shield','Overall condition',v.condition) : '')+
            '</div>')
        : '')+

      (v.video ? box('Video', videoHtml(v.video)) : '')+
    '</div>'+

    /* ---- right column ---- */
    '<div class="vd-side-sticky">'+
      '<div class="vd-head">'+
        '<div class="row" style="gap:6px">'+tags.join('')+'</div>'+
        '<h1>'+U.esc(v.title)+'</h1>'+
        (v.variant ? '<p class="lead" style="margin:0">'+U.esc(v.variant)+'</p>' : '')+
        '<div class="vd-price">'+price+pm+'</div>'+
      '</div>'+

      quickSpecs(v)+

      '<div class="vd-box"><div class="vd-box-b">'+
        (v.sold ? soldNotice() : buyActions(v))+
      '</div></div>'+

      (v.price > 0 && v.financeEligible && !v.sold ? financeBox(v) : '')+

      dealerBox()+
    '</div>'+
  '</div>';
}

function box(title,body){
  return '<div class="vd-box"><div class="vd-box-h"><h3>'+U.esc(title)+'</h3></div>'+
         '<div class="vd-box-b">'+body+'</div></div>';
}
function spec(icon,label,value){
  return '<div class="spec">'+SC.icon[icon]+
    '<div class="t"><b>'+U.esc(value)+'</b><span>'+U.esc(label)+'</span></div></div>';
}

/* The six figures a buyer checks first, shown directly under the price. */
function quickSpecs(v){
  var rows = [];
  if(v.year)         rows.push(spec('cal','Model year',v.year));
  if(v.mileage)      rows.push(spec('gauge','Mileage',U.km(v.mileage)));
  if(v.transmission) rows.push(spec('gear','Transmission',v.transmission));
  if(v.fuel)         rows.push(spec('fuel','Fuel type',v.fuel));
  if(!rows.length) return '';
  return '<div class="vd-box"><div class="specs">'+rows.join('')+'</div></div>';
}

/* The full table. Anything the portal has not captured is simply absent. */
function specsBox(v){
  var rows = [];
  if(v.year)          rows.push(spec('cal','Model year',v.year));
  if(v.mileage)       rows.push(spec('gauge','Mileage',U.km(v.mileage)));
  if(v.transmission)  rows.push(spec('gear','Transmission',v.transmission));
  if(v.fuel)          rows.push(spec('fuel','Fuel type',v.fuel));
  if(v.body)          rows.push(spec('car','Body type',v.body));
  if(v.colour)        rows.push(spec('paint','Colour',v.colour));
  if(v.engine)        rows.push(spec('car','Engine',v.engine));
  if(v.powerKw)       rows.push(spec('bolt','Maximum power',v.powerKw+' kW'));
  if(v.seats)         rows.push(spec('seat','Seats',v.seats));
  if(v.doors)         rows.push(spec('door','Doors',v.doors));
  if(v.fuelUse)       rows.push(spec('fuel','Fuel consumption',v.fuelUse+' l/100km'));
  if(v.co2)           rows.push(spec('co2','CO₂ emissions',v.co2+' g/km'));
  if(v.zeroTo100)     rows.push(spec('bolt','0 to 100 km/h',v.zeroTo100+' seconds'));
  if(v.stock)         rows.push(spec('tag','Stock number',v.stock));

  if(!rows.length) return '';

  var note = (v.fuelUse || v.co2)
    ? '<p class="tiny" style="margin-top:14px">Fuel consumption and emissions are the '+
      'manufacturer\'s test figures and will differ in real driving conditions.</p>'
    : '';

  return '<div class="vd-box"><div class="vd-box-h"><h3>Specifications</h3></div>'+
    '<div class="specs">'+rows.join('')+'</div>'+
    (note ? '<div class="vd-box-b tight">'+note+'</div>' : '')+
  '</div>';
}

function videoHtml(url){
  var id = (url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)||[])[1];
  if(id){
    return '<div style="aspect-ratio:16/9;border-radius:var(--r-sm);overflow:hidden">'+
      '<iframe style="width:100%;height:100%;border:0" loading="lazy" '+
      'src="https://www.youtube-nocookie.com/embed/'+U.esc(id)+'" '+
      'title="Vehicle video" allowfullscreen></iframe></div>';
  }
  return '<a class="btn btn-out" href="'+U.esc(url)+'" target="_blank" rel="noopener noreferrer">Watch the video</a>';
}

/* --------------------------------------------------------------- gallery -- */
function galleryHtml(v){
  if(!v.images.length){
    return '<div class="vd-box"><div class="vd-box-b">'+
      '<div class="empty" style="border:0;padding:40px 20px">'+SC.icon.camera+
      '<b>Photographs coming</b><p>We are still photographing this one. '+
      'Telephone us and we will send you pictures directly.</p></div></div></div>';
  }
  return '<div class="gal">'+
    '<div class="gal-main" data-gal-main tabindex="0" role="button" '+
         'aria-label="Open photograph full size">'+
      '<img src="'+U.esc(v.images[0])+'" alt="'+U.esc(v.fullTitle)+'" '+
           'width="800" height="600" fetchpriority="high">'+
      (v.images.length > 1
        ? '<button class="gal-nav prev" data-gal="-1" aria-label="Previous photograph">'+SC.icon.chevL+'</button>'+
          '<button class="gal-nav next" data-gal="1" aria-label="Next photograph">'+SC.icon.chevR+'</button>'+
          '<span class="gal-idx" data-gal-idx>1 / '+v.images.length+'</span>'
        : '')+
      (v.sold ? '<div class="veh-sold"><span>SOLD</span></div>' : '')+
    '</div>'+
    (v.images.length > 1
      ? '<div class="gal-thumbs" data-gal-thumbs>'+
          v.images.map(function(src,i){
            return '<button class="gal-thumb'+(i===0?' on':'')+'" data-gal-to="'+i+'" '+
              'aria-label="Photograph '+(i+1)+'">'+
              '<img src="'+U.esc(src)+'" alt="" loading="lazy" width="200" height="150"></button>';
          }).join('')+
        '</div>'
      : '')+
  '</div>';
}

function gallery(){
  var v = vehicle;
  if(!v.images.length) return;

  var i = 0;
  var main = U.el('[data-gal-main]');
  var img = main.querySelector('img');
  var idx = U.el('[data-gal-idx]');

  function show(n){
    i = (n + v.images.length) % v.images.length;
    img.src = v.images[i];
    img.alt = v.fullTitle + ' — photograph ' + (i+1);
    if(idx) idx.textContent = (i+1) + ' / ' + v.images.length;
    U.els('[data-gal-to]').forEach(function(b){
      b.classList.toggle('on', Number(b.dataset.galTo) === i);
    });
  }

  U.on(document,'click','[data-gal]',function(e,b){
    e.stopPropagation();
    show(i + Number(b.dataset.gal));
  });
  U.on(document,'click','[data-gal-to]',function(e,b){ show(Number(b.dataset.galTo)); });

  main.addEventListener('click',function(){ SC.lightbox(v.images,i); });
  main.addEventListener('keydown',function(e){
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); SC.lightbox(v.images,i); }
    if(e.key==='ArrowLeft') show(i-1);
    if(e.key==='ArrowRight') show(i+1);
  });

  /* Swipe, because most of this traffic is on a phone. */
  var x0 = null;
  main.addEventListener('touchstart',function(e){ x0 = e.touches[0].clientX; },{passive:true});
  main.addEventListener('touchend',function(e){
    if(x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 44) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  },{passive:true});

  /* Preload the next photograph so stepping through feels instant. */
  if(v.images.length > 1){
    var pre = new Image();
    pre.src = v.images[1];
  }
}

/* --------------------------------------------------------------- actions -- */
function soldNotice(){
  return '<div class="note-bar warn" style="margin-bottom:14px">'+SC.icon.info+
    '<div><b>This one has been sold.</b> Tell us what you were looking for and '+
    'we will let you know when something similar arrives.</div></div>'+
    '<div class="vd-actions">'+
      '<a class="btn btn-pri btn-block" href="inventory.html">See what is available</a>'+
      '<button class="btn btn-out btn-block" data-act="enquire">Ask us to find one</button>'+
    '</div>';
}

function buyActions(v){
  var waText = 'Hello '+(biz.shortName||'Super Cars')+', I am interested in the '+
               v.fullTitle + (v.stock ? ' (stock '+v.stock+')' : '') +
               ' listed at '+(v.price ? U.money(v.price) : 'the advertised price')+'.';

  return '<div class="vd-actions">'+
    '<a class="btn btn-wa btn-lg btn-block" href="'+SC.waLink(waText)+'" '+
      'target="_blank" rel="noopener noreferrer">'+SC.icon.wa+'WhatsApp us about this car</a>'+
    (biz.phone
      ? '<a class="btn btn-dark btn-block" href="tel:'+U.esc(U.telHref(biz.phone))+'">'+
        SC.icon.phone+'Call '+U.esc(biz.phone)+'</a>' : '')+
    '<button class="btn btn-out btn-block" data-act="testdrive">'+SC.icon.key+'Book a test drive</button>'+
    '<button class="btn btn-out btn-block" data-act="reserve">'+SC.icon.tag+'Reserve this vehicle</button>'+
    '<button class="btn btn-ghost btn-block" data-act="enquire">Ask a question</button>'+
  '</div>';
}

function financeBox(v){
  var dep = Math.round(v.price * ((Number(fin.defaultDepositPct)||0)/100));
  return '<div class="vd-box">'+
    '<div class="vd-box-h"><h3>Finance estimate</h3></div>'+
    '<div class="vd-box-b">'+
      '<div class="kv" style="display:grid;gap:10px;font-size:14px">'+
        kv('Purchase price',U.money(v.price))+
        kv('Deposit ('+(Number(fin.defaultDepositPct)||0)+'%)',U.money(dep))+
        kv('Term',(Number(fin.defaultTermMonths)||72)+' months')+
        kv('Interest rate',(Number(fin.defaultRate)||11.75)+'% linked')+
      '</div>'+
      '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">'+
        '<div class="tiny">Estimated monthly instalment</div>'+
        '<div style="font-size:28px;font-weight:850;letter-spacing:-.03em;margin-top:2px">'+
          U.money(v.installment)+'</div>'+
      '</div>'+
      '<a class="btn btn-pri btn-block" style="margin-top:16px" '+
        'href="finance.html?v='+encodeURIComponent(v.slug||v.id)+'">Apply for finance</a>'+
      '<p class="tiny" style="margin-top:12px">An estimate to help you budget. It is not a '+
      'quotation and not an offer of credit. Your rate is set by the bank.</p>'+
    '</div>'+
  '</div>';
}

function kv(k,v){
  return '<div style="display:flex;justify-content:space-between;gap:12px">'+
         '<span style="color:var(--text-2)">'+U.esc(k)+'</span><b>'+U.esc(v)+'</b></div>';
}

function dealerBox(){
  return '<div class="vd-box"><div class="vd-box-b">'+
    '<div class="info-row" style="align-items:center">'+
      '<span class="ic">'+SC.icon.pin+'</span>'+
      '<div style="min-width:0">'+
        '<b>Come and see it</b>'+
        '<p style="font-size:14px;font-weight:600">'+U.esc(biz.addressFull||'')+'</p>'+
      '</div>'+
    '</div>'+
    (biz.mapsUrl
      ? '<a class="btn btn-out btn-sm btn-block" style="margin-top:14px" '+
        'href="'+U.esc(biz.mapsUrl)+'" target="_blank" rel="noopener noreferrer">Get directions</a>'
      : '')+
  '</div></div>';
}

/* ------------------------------------------------------- enquiry modals -- */
function actions(){
  U.on(host,'click','[data-act]',function(e,b){
    var kind = b.dataset.act;
    var copy = {
      testdrive:{
        title:'Book a test drive',
        sub:'Tell us when suits you and we will have the car ready.',
        cta:'Request the booking',
        ok:'Your test drive request is in',
        okText:'We will telephone you to confirm a time. The car will be ready when you arrive.',
        placeholder:'When would suit you? For example, Saturday morning.'
      },
      reserve:{
        title:'Reserve this vehicle',
        sub:'We will hold it while you arrange the paperwork.',
        cta:'Request a hold',
        ok:'We have your reservation request',
        okText:'One of us will telephone you shortly to confirm what is needed to hold the car.',
        placeholder:'Anything we should know?'
      },
      enquire:{
        title:'Ask about this vehicle',
        sub:'Any question at all. We will answer honestly.',
        cta:'Send the question',
        ok:'Your question has been sent',
        okText:'We will come back to you shortly, usually the same day.',
        placeholder:'What would you like to know?'
      }
    }[kind];
    if(!copy) return;

    openEnquiry(kind, copy);
  });
}

function openEnquiry(kind,copy){
  var v = vehicle;

  SC.modal({
    title:copy.title,
    sub:copy.sub,
    body:
      '<div class="note-bar info" style="margin-bottom:18px">'+SC.icon.car+
        '<div><b>'+U.esc(v.fullTitle)+'</b>'+
        (v.price ? '<br>'+U.money(v.price) : '')+
        (v.stock ? ' &middot; Stock '+U.esc(v.stock) : '')+'</div></div>'+
      '<form class="form" novalidate data-contact-pair>'+
        '<div class="field">'+
          '<label for="m-name">Your name<span class="req">*</span></label>'+
          '<input class="inp" id="m-name" name="name" data-req autocomplete="name">'+
        '</div>'+
        '<div class="frow">'+
          '<div class="field">'+
            '<label for="m-phone">Telephone</label>'+
            '<input class="inp" id="m-phone" name="phone" type="tel" data-phone autocomplete="tel" inputmode="tel">'+
          '</div>'+
          '<div class="field">'+
            '<label for="m-email">Email</label>'+
            '<input class="inp" id="m-email" name="email" type="email" data-email autocomplete="email">'+
          '</div>'+
        '</div>'+
        '<div class="field">'+
          '<label for="m-msg">Message</label>'+
          '<textarea class="ta" id="m-msg" name="message" rows="3" '+
            'placeholder="'+U.esc(copy.placeholder)+'"></textarea>'+
        '</div>'+
        '<button class="btn btn-pri btn-block" type="submit">'+U.esc(copy.cta)+'</button>'+
        '<p class="tiny" style="text-align:center">We use your details to answer this enquiry '+
        'and nothing else. See our <a href="privacy.html" style="color:var(--red)">privacy policy</a>.</p>'+
      '</form>',
    onMount:function(body){
      SC.handleForm(body.querySelector('form'),{
        busyText:'Sending…',
        successTitle:copy.ok,
        successText:copy.okText,
        submit:function(d){
          return SC.data.submitEnquiry({
            name:d.name, phone:d.phone, email:d.email,
            vehicle:v.fullTitle + (v.stock ? ' (stock '+v.stock+')' : ''),
            vehicleId:v.id,
            kind:kind,
            source:'Vehicle page',
            message:d.message
          });
        }
      });
    }
  });
}

/* --------------------------------------------------------------- related -- */
/* Same body type first, then the same make, then anything at a similar
   price. Never the car being viewed, and never something already sold. */
function related(all){
  var sec = U.el('[data-related-sec]');
  var slot = U.el('[data-related]');
  if(!sec || !slot) return;

  var v = vehicle;
  var pool = all.filter(function(x){ return x.id !== v.id && !x.sold; });

  var scored = pool.map(function(x){
    var score = 0;
    if(x.body === v.body) score += 3;
    if(x.make === v.make) score += 2;
    if(v.price && x.price && Math.abs(x.price - v.price) / v.price < 0.35) score += 2;
    if(x.featured) score += 1;
    return {v:x, score:score};
  }).sort(function(a,b){ return b.score - a.score; });

  var list = scored.slice(0,4).map(function(s){ return s.v; });
  if(!list.length){ sec.remove(); return; }

  slot.innerHTML = list.map(function(x,i){
    if(x.price > 0 && !x.installment) x.installment = SC.instalment(x.price, fin);
    return SC.vehicleCard(x,{reveal:i%4});
  }).join('');
  sec.hidden = false;
}

})();
