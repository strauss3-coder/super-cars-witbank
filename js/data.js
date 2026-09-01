/* ==========================================================================
   SUPER CARS WITBANK  ·  Data layer
   --------------------------------------------------------------------------
   The website's only source of content. Every price, every phone number and
   every line of copy on this site comes through here from the portal's
   database. There is no second copy to keep in step.

   What it exposes on SC.data:
     vehicles()          published stock, newest and featured first
     vehicle(idOrSlug)   one vehicle
     testimonials()      published reviews
     settings()          all settings documents, keyed
     setting(key)        one settings document
     submitEnquiry(o)    contact / vehicle / test drive / reserve
     submitFinance(o)    finance application
     submitTradein(o)    trade-in request
     uploadTradeinPhoto  a photograph attached to a trade-in
     trackView(id)       records a vehicle detail page view

   Reads go through views (website_vehicles, website_testimonials), never the
   base tables, so a VIN, a cost price or an internal note cannot reach this
   file even if someone edits the request by hand.

   Outage behaviour: every successful read is cached in localStorage. If the
   database is unreachable the site serves the last good copy rather than an
   empty page. The cache is a fallback, never the source of truth.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC = window.SC || {};
var CFG = window.SC_CONFIG || {};

var URL_BASE = String(CFG.supabaseUrl||'').replace(/\/+$/,'');
var KEY = String(CFG.supabaseKey||'').trim();
var TTL = (Number(CFG.cacheMinutes)||5) * 60 * 1000;
var PREFIX = 'sc_cache_';

var configured = !!(URL_BASE && KEY &&
  URL_BASE.indexOf('YOUR-PROJECT') < 0 && KEY.indexOf('YOUR-PUBLISHABLE') < 0);

var headers = { apikey:KEY, Authorization:'Bearer '+KEY };
var warnedUnconfigured = false;

/* ---------------------------------------------------------------- cache -- */
function cacheGet(key){
  try{
    var raw = localStorage.getItem(PREFIX+key);
    if(!raw) return null;
    var box = JSON.parse(raw);
    return (box && box.data !== undefined) ? box : null;
  }catch(e){ return null; }
}
function cacheSet(key,data){
  try{
    localStorage.setItem(PREFIX+key,JSON.stringify({at:Date.now(),data:data}));
  }catch(e){ /* private mode or full storage. Not fatal. */ }
}

/* -------------------------------------------------------------- request -- */
/* The content built into js/fallback.js, in the shape a Supabase read would
   have returned. Used only when there is nothing better to show. */
function builtIn(cacheKey){
  var fb = (window.SC && SC.fallback) || null;
  if(!fb) return [];
  if(cacheKey === 'vehicles')     return fb.vehicles || [];
  if(cacheKey === 'testimonials') return fb.testimonials || [];
  if(cacheKey === 'settings'){
    return Object.keys(fb.settings || {}).map(function(k){
      return { key:k, value:fb.settings[k] };
    });
  }
  return [];
}

function get(path,cacheKey){
  /* No project set yet. This is a fresh copy of the site, so show the
     content built into fallback.js rather than a blank page. */
  if(!configured){
    if(!warnedUnconfigured){
      warnedUnconfigured = true;
      console.warn('[SC.data] No Supabase project is set in js/config.js, so the site is '+
        'showing the content built into js/fallback.js. Connect a project and the '+
        'database takes over.');
    }
    return Promise.resolve(builtIn(cacheKey));
  }

  var cached = cacheGet(cacheKey);
  if(cached && (Date.now()-cached.at) < TTL) return Promise.resolve(cached.data);

  return fetch(URL_BASE+'/rest/v1/'+path,{headers:headers})
    .then(function(res){
      if(!res.ok) throw new Error('Supabase '+res.status+' on '+path);
      return res.json();
    })
    .then(function(rows){
      /* An empty table is a real answer and is cached as one. It usually
         means the seed has not been run yet, so fall back for this read
         rather than showing an empty shop. */
      cacheSet(cacheKey,rows);
      if(!rows || !rows.length){
        var fb = builtIn(cacheKey);
        if(fb.length){
          console.warn('[SC.data] '+cacheKey+' came back empty from the database. '+
            'Showing the built-in content. Run database/02-seed.sql to load your own.');
          return fb;
        }
      }
      return rows;
    })
    .catch(function(err){
      console.error('[SC.data] '+err.message);
      /* The last good copy first, because it is this dealership's real data.
         Only if there is none do we fall back to what shipped with the site. */
      if(cached){
        console.warn('[SC.data] serving the last cached copy of '+cacheKey);
        return cached.data;
      }
      console.warn('[SC.data] no cached copy of '+cacheKey+', showing the built-in content');
      return builtIn(cacheKey);
    });
}

function post(table,row){
  if(!configured) return Promise.reject(new Error('The website is not connected to its database yet.'));
  return fetch(URL_BASE+'/rest/v1/'+table,{
    method:'POST',
    headers:{
      apikey:KEY,
      Authorization:'Bearer '+KEY,
      'Content-Type':'application/json',
      Prefer:'return=minimal'
    },
    body:JSON.stringify(row)
  }).then(function(res){
    if(res.ok) return true;
    return res.text().then(function(t){
      throw new Error(t || ('The message could not be sent (status '+res.status+').'));
    });
  });
}

function newId(p){
  return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
}

/* --------------------------------------------------- row -> site shape -- */
/* The website works with a slightly friendlier shape than the database row.
   Mapping here means neither side has to be rewritten to suit the other. */
function toVehicle(row,i){
  var title = [row.year, row.make, row.model].filter(Boolean).join(' ');
  var tag = row.sold ? 'Sold' : row.reserved ? 'Reserved' : row.featured ? 'Featured' : '';
  return {
    id:row.id,
    stock:row.stock||'',
    make:row.make||'',
    model:row.model||'',
    variant:row.variant||'',
    title:title || (row.make+' '+row.model).trim() || 'Vehicle',
    fullTitle:(title+' '+(row.variant||'')).trim(),
    year:row.year,
    mileage:Number(row.mileage)||0,
    transmission:row.transmission||'',
    fuel:row.fuel||'',
    body:row.body||'',
    colour:row.colour||'',
    engine:row.engine||'',
    powerKw:row.power_kw,
    seats:row.seats,
    fuelUse:row.fuel_use,
    co2:row.co2,
    zeroTo100:row.zero_to_hundred,
    doors:row.doors,
    price:Number(row.price)||0,
    priceBadge:row.price_badge||'',
    installment:Number(row.installment)||0,
    financeEligible:row.finance_eligible !== false,
    description:row.description||'',
    features:Array.isArray(row.features)?row.features:[],
    images:Array.isArray(row.images)?row.images:[],
    video:row.video||'',
    serviceHistory:row.service_history||'',
    condition:row.condition||'',
    status:row.status||'available',
    featured:!!row.featured,
    promoted:!!row.promoted,
    reserved:!!row.reserved,
    sold:!!row.sold,
    slug:row.slug||'',
    metaTitle:row.meta_title||'',
    metaDescription:row.meta_description||'',
    views:Number(row.views)||0,
    sortOrder:typeof row.sort_order==='number'?row.sort_order:i,
    createdAt:row.created_at
  };
}

function toTestimonial(r){
  return {
    id:r.id,
    name:r.name||'',
    vehicle:r.vehicle||'',
    location:r.location||'',
    rating:Number(r.rating)||5,
    review:r.review||'',
    photo:r.photo||'',
    source:r.source||'Direct',
    /* Only a review that genuinely came from Google carries the Google badge. */
    isGoogle:String(r.source||'').toLowerCase()==='google',
    featured:!!r.featured
  };
}

/* ----------------------------------------------------------- public API -- */
var once = {};
function memo(key,fn){
  if(!once[key]) once[key] = fn();
  return once[key];
}

SC.data = {
  configured:configured,
  url:URL_BASE,

  vehicles:function(){
    return memo('vehicles',function(){
      return get('website_vehicles?select=*','vehicles').then(function(rows){
        return (rows||[]).map(toVehicle);
      });
    });
  },

  /* Accepts a slug or an id, because detail links prefer the slug and
     internal links sometimes only have the id. */
  vehicle:function(key){
    return SC.data.vehicles().then(function(list){
      if(!key) return null;
      var k = String(key);
      return list.filter(function(v){ return v.slug===k; })[0] ||
             list.filter(function(v){ return v.id===k; })[0] || null;
    });
  },

  testimonials:function(){
    return memo('testimonials',function(){
      return get('website_testimonials?select=*','testimonials').then(function(rows){
        return (rows||[]).map(toTestimonial);
      });
    });
  },

  settings:function(){
    return memo('settings',function(){
      return get('site_settings?select=key,value','settings').then(function(rows){
        var out = {};
        (rows||[]).forEach(function(r){ out[r.key] = r.value; });
        return out;
      });
    });
  },

  setting:function(key){
    return SC.data.settings().then(function(all){ return all[key] || {}; });
  },

  /* ------------------------------------------------------------ writes -- */
  /* A visitor may insert into these three tables and read none of them, so
     one customer can never see another's details. */
  submitEnquiry:function(o){
    return post('enquiries',{
      id:newId('e'),
      name:o.name||'', phone:o.phone||'', email:o.email||'',
      vehicle:o.vehicle||'', vehicle_id:o.vehicleId||'',
      kind:o.kind||'general',
      source:o.source||'Website',
      message:o.message||'',
      status:'unread'
    });
  },

  submitFinance:function(o){
    return post('finance_applications',{
      id:newId('f'),
      name:o.name||'', phone:o.phone||'', email:o.email||'',
      id_number:o.idNumber||'',
      vehicle:o.vehicle||'', vehicle_id:o.vehicleId||'',
      employment:o.employment||'', employer:o.employer||'',
      income:Number(o.income)||0,
      deposit:Number(o.deposit)||0,
      monthly_budget:Number(o.monthlyBudget)||0,
      term_months:Number(o.termMonths)||72,
      message:o.message||'',
      status:'new'
    });
  },

  submitTradein:function(o){
    return post('tradein_requests',{
      id:newId('t'),
      name:o.name||'', phone:o.phone||'', email:o.email||'',
      make:o.make||'', model:o.model||'', variant:o.variant||'',
      year:Number(o.year)||null,
      mileage:Number(o.mileage)||0,
      transmission:o.transmission||'', fuel:o.fuel||'',
      condition:o.condition||'',
      has_finance:!!o.hasFinance,
      expected:Number(o.expected)||0,
      message:o.message||'',
      images:o.images||[],
      status:'new'
    });
  },

  /* Photographs of a car a member of the public wants to sell. The tradein
     bucket is the only one anonymous visitors may write to. */
  uploadTradeinPhoto:function(file){
    if(!configured) return Promise.reject(new Error('Not connected'));
    var ext = (file.name.split('.').pop()||'jpg').toLowerCase().replace('jpeg','jpg');
    var path = new Date().getFullYear()+'/'+newId('p').replace(/^p_/,'')+'.'+ext;
    return fetch(URL_BASE+'/storage/v1/object/tradein/'+path,{
      method:'POST',
      headers:{ apikey:KEY, Authorization:'Bearer '+KEY, 'Content-Type':file.type||'image/jpeg' },
      body:file
    }).then(function(res){
      if(!res.ok) throw new Error('That photograph could not be uploaded.');
      return URL_BASE+'/storage/v1/object/public/tradein/'+path;
    });
  },

  /* Records that a vehicle detail page was opened. A database trigger bumps
     the vehicle's view counter, which is what the portal's Analytics module
     reads. Deliberately silent: a blocked request must never break the page,
     and it is fired once per vehicle per session so a refresh is not a view. */
  trackView:function(vehicleId){
    if(!configured || !vehicleId) return;
    try{
      var seen = sessionStorage.getItem('sc_seen_'+vehicleId);
      if(seen) return;
      sessionStorage.setItem('sc_seen_'+vehicleId,'1');
    }catch(e){ /* private mode: track anyway */ }
    fetch(URL_BASE+'/rest/v1/vehicle_views',{
      method:'POST',
      headers:{
        apikey:KEY, Authorization:'Bearer '+KEY,
        'Content-Type':'application/json', Prefer:'return=minimal'
      },
      body:JSON.stringify({ vehicle_id:vehicleId })
    }).catch(function(){});
  }
};

})();
