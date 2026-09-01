/* ==========================================================================
   SUPER CARS WITBANK  ·  Inventory
   --------------------------------------------------------------------------
   Filtering, searching, sorting and paging over the published stock.

   How it works
     One read. Every vehicle the public may see arrives in a single request
     and all filtering happens in the browser, so changing a filter is
     instant and costs nothing.

     The filter panel is built FROM the stock, not from a fixed list. Only
     makes, bodies, fuels and transmissions that actually exist are offered,
     each with the number of matches, so a visitor can never pick a
     combination that returns an empty page.

     State lives in the query string. That makes a filtered view something
     you can bookmark, share or reach from a link on the home page, and the
     back button behaves the way people expect.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

var PER_PAGE = 12;

var all = [];        /* every published vehicle */
var fin = {};        /* finance defaults, for the "from R x p/m" line */
var state = {
  make:[], model:[], body:[], fuel:[], trans:[], status:[],
  min:'', max:'', minYear:'', maxYear:'', maxKm:'',
  q:'', sort:'newest', view:'grid', page:1
};

var els = {
  results:U.el('[data-results]'),
  filters:U.el('[data-filters]'),
  panel:U.el('#filters'),
  chips:U.el('[data-chips]'),
  count:U.el('[data-count]'),
  pager:U.el('[data-pager]'),
  q:U.el('#q'),
  sort:U.el('#sort'),
  stockLine:U.el('[data-stock-line]')
};

/* Icons that sit inside static markup. */
U.el('[data-search-icon]').innerHTML = SC.icon.search;
U.el('[data-filter-icon]').innerHTML = SC.icon.filter;
U.els('[data-view]').forEach(function(b){
  b.innerHTML = b.dataset.view==='grid' ? SC.icon.grid : SC.icon.list;
});

els.results.innerHTML = SC.cardSkeletons(6);

/* ----------------------------------------------------------------- boot -- */
readUrl();

Promise.all([SC.site, SC.data.settings(), SC.data.vehicles()]).then(function(r){
  fin = r[1].finance || {};
  all = r[2];

  /* Work out the instalment once per vehicle rather than on every re-render. */
  all.forEach(function(v){
    if(v.price > 0 && !v.installment) v.installment = SC.instalment(v.price, fin);
  });

  if(els.stockLine){
    var live = all.filter(function(v){ return !v.sold; }).length;
    els.stockLine.textContent = live
      ? live + ' vehicle' + (live===1?'':'s') + ' on our floor in eMalahleni, updated as stock changes.'
      : 'Our floor is being restocked. Please telephone us for what is arriving.';
  }

  bind();
  paintFilters();
  apply();
}).catch(function(err){
  console.error('[inventory] '+err.message);
  els.results.innerHTML =
    '<div class="empty" style="grid-column:1/-1">'+SC.icon.warn+
    '<b>Stock could not be loaded</b>'+
    '<p>Something went wrong reaching our system. Please refresh the page, or telephone us and we will tell you exactly what is available.</p>'+
    '</div>';
  els.count.textContent = '';
});

/* ------------------------------------------------------------- url sync -- */
function readUrl(){
  var p = U.params();
  ['make','model','body','fuel','trans','status'].forEach(function(k){
    if(p[k]) state[k] = p[k].split(',').filter(Boolean);
  });
  ['min','max','minYear','maxYear','maxKm','q','sort'].forEach(function(k){
    if(p[k]) state[k] = p[k];
  });
  if(p.view === 'list') state.view = 'list';
  if(p.page) state.page = Math.max(1, Number(p.page)||1);

  if(els.q) els.q.value = state.q;
  if(els.sort) els.sort.value = state.sort;
  U.els('[data-view]').forEach(function(b){
    var on = b.dataset.view === state.view;
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function writeUrl(replace){
  var qs = new URLSearchParams();
  ['make','model','body','fuel','trans','status'].forEach(function(k){
    if(state[k].length) qs.set(k, state[k].join(','));
  });
  ['min','max','minYear','maxYear','maxKm','q'].forEach(function(k){
    if(state[k]) qs.set(k, state[k]);
  });
  if(state.sort !== 'newest') qs.set('sort', state.sort);
  if(state.view !== 'grid')   qs.set('view', state.view);
  if(state.page > 1)          qs.set('page', state.page);

  var url = location.pathname + (qs.toString() ? '?'+qs : '');
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
}

window.addEventListener('popstate',function(){
  state = { make:[],model:[],body:[],fuel:[],trans:[],status:[],
            min:'',max:'',minYear:'',maxYear:'',maxKm:'',
            q:'',sort:'newest',view:'grid',page:1 };
  readUrl();
  paintFilters();
  apply(true);
});

/* -------------------------------------------------------------- filters -- */
/* Counts are worked out against everything EXCEPT the group being counted,
   so ticking a second make still shows how many that make would add rather
   than showing zero because the first make excludes it. */
function countFor(group,value){
  var probe = Object.assign({},state);
  probe[group] = [];
  return match(probe).filter(function(v){
    if(group==='make')  return v.make===value;
    if(group==='model') return v.model===value;
    if(group==='body')  return v.body===value;
    if(group==='fuel')  return v.fuel===value;
    if(group==='trans') return v.transmission===value;
    if(group==='status'){
      if(value==='Available') return !v.sold && !v.reserved;
      if(value==='Reserved')  return v.reserved && !v.sold;
      if(value==='Sold')      return v.sold;
      if(value==='Featured')  return v.featured && !v.sold;
      if(value==='Promoted')  return v.promoted && !v.sold;
    }
    return false;
  }).length;
}

function paintFilters(){
  if(!all.length){ els.filters.innerHTML = ''; return; }

  var groups = [
    {key:'make',  label:'Make',         values:uniq(all.map(function(v){ return v.make; })).sort()},
    {key:'body',  label:'Body type',    values:uniq(all.map(function(v){ return v.body; })).sort()},
    {key:'fuel',  label:'Fuel',         values:uniq(all.map(function(v){ return v.fuel; })).sort()},
    {key:'trans', label:'Transmission', values:uniq(all.map(function(v){ return v.transmission; })).sort()},
    {key:'status',label:'Availability', values:['Available','Reserved','Featured','Promoted','Sold']}
  ];

  /* Models are only offered once a make is chosen. Showing every model in
     stock at once would be a wall of names with no useful structure. */
  if(state.make.length){
    var models = uniq(all.filter(function(v){ return state.make.indexOf(v.make)>-1; })
                         .map(function(v){ return v.model; })).sort();
    if(models.length > 1){
      groups.splice(1,0,{key:'model',label:'Model',values:models});
    }
  }

  var html = groups.map(function(g){
    var opts = g.values.map(function(val){
      var n = countFor(g.key,val);
      if(!n && state[g.key].indexOf(val) < 0) return '';   /* nothing to find */
      var on = state[g.key].indexOf(val) > -1;
      return '<label class="fopt">'+
        '<input type="checkbox" data-group="'+g.key+'" value="'+U.esc(val)+'"'+(on?' checked':'')+'>'+
        '<span>'+U.esc(val)+'</span><span class="n">'+n+'</span>'+
      '</label>';
    }).filter(Boolean).join('');
    if(!opts) return '';
    return '<div class="fgroup"><span class="flabel">'+g.label+'</span>'+
           '<div class="fopts">'+opts+'</div></div>';
  }).join('');

  html +=
    '<div class="fgroup"><span class="flabel">Price</span>'+
      '<div class="frange">'+
        '<input type="number" inputmode="numeric" data-range="min" placeholder="Min" value="'+U.esc(state.min)+'" aria-label="Minimum price">'+
        '<span>to</span>'+
        '<input type="number" inputmode="numeric" data-range="max" placeholder="Max" value="'+U.esc(state.max)+'" aria-label="Maximum price">'+
      '</div>'+
    '</div>'+
    '<div class="fgroup"><span class="flabel">Year</span>'+
      '<div class="frange">'+
        '<input type="number" inputmode="numeric" data-range="minYear" placeholder="From" value="'+U.esc(state.minYear)+'" aria-label="Earliest year">'+
        '<span>to</span>'+
        '<input type="number" inputmode="numeric" data-range="maxYear" placeholder="To" value="'+U.esc(state.maxYear)+'" aria-label="Latest year">'+
      '</div>'+
    '</div>'+
    '<div class="fgroup"><span class="flabel">Maximum mileage</span>'+
      '<div class="frange">'+
        '<input type="number" inputmode="numeric" data-range="maxKm" placeholder="e.g. 120000" value="'+U.esc(state.maxKm)+'" aria-label="Maximum mileage">'+
        '<span>km</span>'+
      '</div>'+
    '</div>';

  els.filters.innerHTML = html;
}

/* ------------------------------------------------------------ filtering -- */
function match(s){
  s = s || state;
  var q = s.q.trim().toLowerCase();
  var terms = q ? q.split(/\s+/) : [];

  return all.filter(function(v){
    if(s.make.length  && s.make.indexOf(v.make) < 0) return false;
    if(s.model.length && s.model.indexOf(v.model) < 0) return false;
    if(s.body.length  && s.body.indexOf(v.body) < 0) return false;
    if(s.fuel.length  && s.fuel.indexOf(v.fuel) < 0) return false;
    if(s.trans.length && s.trans.indexOf(v.transmission) < 0) return false;

    if(s.status.length){
      var ok = s.status.some(function(st){
        if(st==='Available') return !v.sold && !v.reserved;
        if(st==='Reserved')  return v.reserved && !v.sold;
        if(st==='Sold')      return v.sold;
        if(st==='Featured')  return v.featured && !v.sold;
        if(st==='Promoted')  return v.promoted && !v.sold;
        return false;
      });
      if(!ok) return false;
    }

    /* A vehicle with no price yet is excluded from a price filter rather
       than treated as costing nothing. */
    if(s.min && (!v.price || v.price < Number(s.min))) return false;
    if(s.max && (!v.price || v.price > Number(s.max))) return false;
    if(s.minYear && (!v.year || v.year < Number(s.minYear))) return false;
    if(s.maxYear && (!v.year || v.year > Number(s.maxYear))) return false;
    if(s.maxKm && v.mileage > Number(s.maxKm)) return false;

    if(terms.length){
      var hay = [v.make,v.model,v.variant,v.year,v.body,v.fuel,v.transmission,
                 v.colour,v.stock,v.description].join(' ').toLowerCase();
      /* Every word must appear somewhere, so "white polo" narrows rather
         than widening the way an OR search would. */
      if(!terms.every(function(t){ return hay.indexOf(t) > -1; })) return false;
    }
    return true;
  });
}

function sortList(list){
  var by = state.sort;
  return list.slice().sort(function(a,b){
    /* Sold stock always sinks, whatever else is asked for. */
    if(a.sold !== b.sold) return a.sold ? 1 : -1;
    switch(by){
      case 'price-asc':  return (a.price||Infinity) - (b.price||Infinity);
      case 'price-desc': return (b.price||0) - (a.price||0);
      case 'year-desc':  return (b.year||0) - (a.year||0);
      case 'year-asc':   return (a.year||Infinity) - (b.year||Infinity);
      case 'km-asc':     return (a.mileage||Infinity) - (b.mileage||Infinity);
      default:
        if(a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
}

function apply(skipUrl){
  var list = sortList(match());
  var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if(state.page > pages) state.page = pages;

  var start = (state.page - 1) * PER_PAGE;
  var slice = list.slice(start, start + PER_PAGE);

  els.results.className = 'veh-grid';
  if(state.view === 'list') els.results.style.gridTemplateColumns = 'minmax(0,1fr)';
  else els.results.style.gridTemplateColumns = '';

  els.results.innerHTML = slice.length
    ? slice.map(function(v,i){
        return SC.vehicleCard(v,{wide:state.view==='list', reveal:i%4});
      }).join('')
    : emptyState();

  els.count.textContent = list.length
    ? 'Showing ' + (start+1) + '–' + Math.min(start+PER_PAGE, list.length) +
      ' of ' + list.length + ' vehicle' + (list.length===1?'':'s')
    : '';

  paintChips();
  paintPager(pages, list.length);
  if(!skipUrl) writeUrl(true);
  SC.reveal(els.results);
}

function emptyState(){
  return '<div class="empty" style="grid-column:1/-1">'+SC.icon.search+
    '<b>Nothing matches those filters</b>'+
    '<p>Try widening the price range or clearing a filter. If you tell us what you are after we will look out for it.</p>'+
    '<div class="row" style="justify-content:center;margin-top:6px">'+
      '<button class="btn btn-out btn-sm" data-clear-all type="button">Clear all filters</button>'+
      '<a class="btn btn-pri btn-sm" href="contact.html">Tell us what you want</a>'+
    '</div>'+
  '</div>';
}

/* ---------------------------------------------------------------- chips -- */
function paintChips(){
  var chips = [];
  ['make','model','body','fuel','trans','status'].forEach(function(k){
    state[k].forEach(function(v){
      chips.push(chip(k, v, v));
    });
  });
  if(state.min) chips.push(chip('min','', 'From '+U.money(state.min)));
  if(state.max) chips.push(chip('max','', 'Up to '+U.money(state.max)));
  if(state.minYear) chips.push(chip('minYear','', state.minYear+' or newer'));
  if(state.maxYear) chips.push(chip('maxYear','', state.maxYear+' or older'));
  if(state.maxKm) chips.push(chip('maxKm','', 'Under '+U.km(state.maxKm)));
  if(state.q) chips.push(chip('q','', '"'+state.q+'"'));

  els.chips.hidden = !chips.length;
  els.chips.innerHTML = chips.join('') + (chips.length > 1
    ? '<button class="btn btn-ghost btn-sm" data-clear-all type="button">Clear all</button>' : '');

  var badge = U.el('[data-filter-count]');
  if(badge) badge.textContent = chips.length ? '('+chips.length+')' : '';
}

function chip(group,value,label){
  return '<span class="chip">'+U.esc(label)+
    '<button data-remove="'+group+'" data-value="'+U.esc(value)+'" '+
    'aria-label="Remove filter '+U.esc(label)+'">'+SC.icon.x+'</button></span>';
}

/* ---------------------------------------------------------------- pager -- */
function paintPager(pages,total){
  if(pages <= 1 || !total){ els.pager.innerHTML = ''; return; }

  var p = state.page;
  var nums = [];
  for(var i=1;i<=pages;i++){
    if(i===1 || i===pages || Math.abs(i-p) <= 1) nums.push(i);
    else if(nums[nums.length-1] !== '…') nums.push('…');
  }

  els.pager.innerHTML =
    '<button data-page="'+(p-1)+'"'+(p===1?' disabled':'')+' aria-label="Previous page">'+SC.icon.chevL+'</button>'+
    nums.map(function(n){
      if(n==='…') return '<span class="gap">…</span>';
      return '<button data-page="'+n+'"'+(n===p?' class="on" aria-current="page"':'')+'>'+n+'</button>';
    }).join('')+
    '<button data-page="'+(p+1)+'"'+(p===pages?' disabled':'')+' aria-label="Next page">'+SC.icon.chevR+'</button>';
}

/* -------------------------------------------------------------- binding -- */
function bind(){
  /* Filter checkboxes and range inputs. Delegated, because paintFilters()
     replaces this markup whenever the available options change. */
  U.on(els.filters,'change','input[data-group]',function(e,input){
    var g = input.dataset.group, v = input.value;
    var i = state[g].indexOf(v);
    if(input.checked && i < 0) state[g].push(v);
    if(!input.checked && i > -1) state[g].splice(i,1);
    /* Clearing a make must clear the models that belonged to it. */
    if(g==='make' && !state.make.length) state.model = [];
    state.page = 1;
    paintFilters();
    apply();
  });

  var ranged = U.debounce(function(){ paintFilters(); apply(); },380);
  U.on(els.filters,'input','input[data-range]',function(e,input){
    state[input.dataset.range] = input.value.trim();
    state.page = 1;
    ranged();
  });

  els.q.addEventListener('input',U.debounce(function(){
    state.q = els.q.value;
    state.page = 1;
    paintFilters();
    apply();
  },260));

  els.sort.addEventListener('change',function(){
    state.sort = els.sort.value;
    state.page = 1;
    apply();
  });

  U.els('[data-view]').forEach(function(b){
    b.addEventListener('click',function(){
      state.view = b.dataset.view;
      U.els('[data-view]').forEach(function(x){
        var on = x === b;
        x.classList.toggle('on',on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
  });

  /* Chip removal, empty-state and header "clear" all share one handler. */
  U.on(document,'click','[data-remove]',function(e,b){
    var g = b.dataset.remove, v = b.dataset.value;
    if(Array.isArray(state[g])){
      var i = state[g].indexOf(v);
      if(i > -1) state[g].splice(i,1);
      if(g==='make' && !state.make.length) state.model = [];
    }else{
      state[g] = '';
      if(g==='q') els.q.value = '';
    }
    state.page = 1;
    paintFilters();
    apply();
  });

  U.on(document,'click','[data-clear-all]',function(){
    state.make=[]; state.model=[]; state.body=[]; state.fuel=[];
    state.trans=[]; state.status=[];
    state.min=''; state.max=''; state.minYear=''; state.maxYear='';
    state.maxKm=''; state.q=''; state.page=1;
    els.q.value = '';
    paintFilters();
    apply();
  });

  U.on(els.pager,'click','[data-page]',function(e,b){
    var n = Number(b.dataset.page);
    if(!n || n === state.page) return;
    state.page = n;
    apply();
    writeUrl();
    /* Scroll to the top of the results, not the top of the document, so the
       reader keeps their place in the page. */
    var top = els.results.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({top:top, behavior:'smooth'});
  });

  /* Mobile filter drawer. */
  var open  = U.el('[data-open-filters]');
  var close = U.el('[data-close-filters]');
  if(close) close.innerHTML = SC.icon.x;
  if(open) open.addEventListener('click',function(){
    els.panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  if(close) close.addEventListener('click',shut);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && els.panel.classList.contains('open')) shut();
  });
  function shut(){
    els.panel.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function uniq(arr){
  return arr.filter(function(v,i,a){ return v && a.indexOf(v)===i; });
}

})();
