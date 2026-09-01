/* ==========================================================================
   SUPER CARS WITBANK  ·  Compare
   --------------------------------------------------------------------------
   Pick up to three cars, then see them beside each other.

   Two decisions worth stating:

     Three, not four. On a phone a fourth column makes every figure
     unreadable, and a buyer choosing between four cars is really choosing
     between two.

     The winning figure in each row is marked. Cheapest, fewest kilometres,
     newest, most economical. A comparison that does not point anything out
     is just three lists side by side, which the buyer could already see.

   The selection lives in this browser only, and survives a page change so a
   car can be added from the stock list and another from the home page.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;
var KEY = 'sc_compare';
var MAX = 3;

var ids = read();
var all = [];   /* filled once the vehicle list resolves */

function read(){
  try{ return (JSON.parse(localStorage.getItem(KEY)||'[]')||[]).slice(0,MAX); }
  catch(e){ return []; }
}
function write(){
  try{ localStorage.setItem(KEY,JSON.stringify(ids)); }catch(e){}
}

/* ---------------------------------------------------------------- api -- */
SC.compare = {
  ids:function(){ return ids.slice(); },
  has:function(id){ return ids.indexOf(id) > -1; },

  toggle:function(id){
    var i = ids.indexOf(id);
    if(i > -1){
      ids.splice(i,1);
    }else{
      if(ids.length >= MAX){
        SC.toast('err','Three at a time',
          'Remove one before adding another. More than three side by side stops being readable.');
        return false;
      }
      ids.push(id);
    }
    write();
    paintTray();
    paintButtons();
    return i < 0;
  },

  clear:function(){ ids = []; write(); paintTray(); paintButtons(); },

  /* The page that owns the vehicle list hands it over, so this file never
     fetches anything itself. */
  attach:function(list){ all = list || []; paintTray(); paintButtons(); }
};

function chosen(){
  return ids.map(function(id){
    return all.filter(function(v){ return v.id === id; })[0];
  }).filter(Boolean);
}

/* -------------------------------------------------------------- tray -- */
function paintTray(){
  var host = U.el('[data-compare-tray]');
  if(!host) return;

  var picked = chosen();
  if(picked.length < 1){
    var open = U.el('.cmp-tray',host);
    if(open) open.classList.remove('on');
    setTimeout(function(){ if(!chosen().length) host.innerHTML = ''; },420);
    return;
  }

  host.innerHTML =
    '<div class="cmp-tray" role="region" aria-label="Vehicles you are comparing">'+
      '<div class="cmp-thumbs">'+
        picked.map(function(v){
          return v.images[0]
            ? '<img src="'+U.esc(v.images[0])+'" alt="'+U.esc(v.title)+'">'
            : '';
        }).join('')+
      '</div>'+
      '<b>'+picked.length+' to compare</b>'+
      '<button class="btn btn-pri btn-sm" data-cmp-open '+
        (picked.length < 2 ? 'disabled title="Pick one more"' : '')+'>'+
        SC.icon.scales+'Compare</button>'+
      '<button class="btn btn-inv btn-sm" data-cmp-clear aria-label="Clear comparison">'+
        SC.icon.x+'</button>'+
    '</div>';

  requestAnimationFrame(function(){
    var t = U.el('.cmp-tray',host);
    if(t) t.classList.add('on');
  });
}

/* Keeps every compare button on the page showing the right state. */
function paintButtons(){
  U.els('[data-compare]').forEach(function(b){
    var on = SC.compare.has(b.dataset.compare);
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? 'Remove from compare' : 'Add to compare');
    b.title = on ? 'In your comparison' : 'Compare';
  });
}
SC.compare.refreshButtons = paintButtons;

/* ------------------------------------------------------------- table -- */
/* Marks the best value in a row. `dir` says which way is better, and rows
   where every car is the same are left unmarked rather than crowning an
   arbitrary winner. */
function best(list,pick,dir){
  var vals = list.map(pick).filter(function(n){ return typeof n === 'number' && n > 0; });
  if(vals.length < 2) return null;
  var b = dir === 'low' ? Math.min.apply(null,vals) : Math.max.apply(null,vals);
  if(vals.every(function(n){ return n === b; })) return null;
  return b;
}

function openTable(){
  var list = chosen();
  if(list.length < 2) return;

  var rows = [
    {label:'Price',        get:function(v){ return v.price; },
     fmt:function(v){ return v.price ? U.money(v.price) : '—'; }, dir:'low'},
    {label:'From, monthly',get:function(v){ return v.installment; },
     fmt:function(v){ return v.installment ? U.money(v.installment)+' p/m' : '—'; }, dir:'low'},
    {label:'Year',         get:function(v){ return v.year; },
     fmt:function(v){ return v.year || '—'; }, dir:'high'},
    {label:'Mileage',      get:function(v){ return v.mileage; },
     fmt:function(v){ return v.mileage ? U.km(v.mileage) : '—'; }, dir:'low'},
    {label:'Fuel use',     get:function(v){ return v.fuelUse; },
     fmt:function(v){ return v.fuelUse ? v.fuelUse+' l/100km' : '—'; }, dir:'low'},
    {label:'Power',        get:function(v){ return v.powerKw; },
     fmt:function(v){ return v.powerKw ? v.powerKw+' kW' : '—'; }, dir:'high'},
    {label:'Seats',        get:function(v){ return v.seats; },
     fmt:function(v){ return v.seats || '—'; }, dir:'high'},
    {label:'Transmission', fmt:function(v){ return v.transmission || '—'; }},
    {label:'Fuel',         fmt:function(v){ return v.fuel || '—'; }},
    {label:'Body',         fmt:function(v){ return v.body || '—'; }},
    {label:'Colour',       fmt:function(v){ return v.colour || '—'; }},
    {label:'Service history', fmt:function(v){ return v.serviceHistory || '—'; }},
    {label:'Stock number', fmt:function(v){ return v.stock || '—'; }}
  ];

  var body = rows.map(function(r){
    var b = r.get ? best(list,r.get,r.dir) : null;
    return '<tr><td>'+U.esc(r.label)+'</td>'+
      list.map(function(v){
        var win = (b !== null && r.get && r.get(v) === b);
        return '<td'+(win?' class="best"':'')+'>'+
          (win ? SC.icon.check : '')+r.fmt(v)+'</td>';
      }).join('')+
    '</tr>';
  }).join('');

  SC.modal({
    title:'Side by side',
    sub:'The better figure in each row is marked.',
    body:
      '<div style="overflow-x:auto">'+
        '<table class="cmp-table">'+
          '<thead><tr><th></th>'+
            list.map(function(v){
              return '<th class="cmp-head">'+
                (v.images[0] ? '<img src="'+U.esc(v.images[0])+'" alt="" loading="lazy">' : '')+
                '<a href="'+SC.vehicleHref(v)+'" style="font-weight:730;font-size:14.5px">'+
                  U.esc(v.title)+'</a>'+
                (v.variant?'<div style="font-size:12px;color:var(--text-3);font-weight:500">'+
                  U.esc(v.variant)+'</div>':'')+
              '</th>';
            }).join('')+
          '</tr></thead>'+
          '<tbody>'+body+'</tbody>'+
        '</table>'+
      '</div>'+
      '<p class="tiny" style="margin-top:14px">Monthly figures are estimates on our standard '+
      'terms. Specifications not captured for a vehicle are shown as a dash rather than guessed.</p>',
    onMount:function(el,close){
      U.on(el,'click','a[href^="vehicle.html"]',function(){ close(); });
    }
  });
}

/* ------------------------------------------------------------ wiring -- */
document.addEventListener('click',function(e){
  if(e.target.closest('[data-cmp-open]'))  return openTable();
  if(e.target.closest('[data-cmp-clear]')) return SC.compare.clear();
});

})();
