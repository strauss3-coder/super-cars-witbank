/* ==========================================================================
   SUPER CARS WITBANK  ·  Finance
   --------------------------------------------------------------------------
   The calculator and the application form.

   Every number the calculator uses -- the rate, the term options, the
   deposit and residual defaults, the initiation and service fees -- comes
   from the `finance` settings document. Change the rate in the portal when
   prime moves and every monthly figure on the site moves with it, including
   the "from R x per month" lines on the vehicle cards.

   The arithmetic is a standard instalment sale with an optional balloon:
   the residual is discounted back to today and taken off the amount the
   instalments have to repay, which is how a bank quotes it.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

var fin = {}, biz = {}, vehicles = [], picked = null;

/* Live calculator state. Seeded from the portal's defaults, then from the
   vehicle if the visitor arrived from a vehicle page. */
var calc = { price:0, depositPct:0, months:72, rate:11.75, residualPct:0 };

Promise.all([SC.site, SC.data.settings(), SC.data.vehicles()]).then(function(r){
  fin = r[1].finance || {};
  biz = r[1].business || {};
  vehicles = r[2].filter(function(v){ return !v.sold && v.price > 0 && v.financeEligible; });

  paintCopy();
  paintPartner();
  paintSteps();
  paintRequirements();

  calc.rate       = Number(fin.defaultRate)||11.75;
  calc.months     = Number(fin.defaultTermMonths)||72;
  calc.depositPct = Number(fin.defaultDepositPct)||0;
  calc.residualPct= Number(fin.defaultResidualPct)||0;

  /* Arrived from a vehicle page: preselect that car. */
  var want = U.params().v;
  if(want){
    picked = vehicles.filter(function(v){ return v.slug===want || v.id===want; })[0] || null;
  }
  calc.price = picked ? picked.price
              : (vehicles.length ? median(vehicles.map(function(v){ return v.price; })) : 250000);

  paintCalc();
  paintApply();
  SC.scan(document); SC.fadeImages(document);
}).catch(function(err){
  console.error('[finance] '+err.message);
  U.el('[data-calc]').innerHTML =
    '<div class="empty" style="grid-column:1/-1">'+SC.icon.warn+
    '<b>The calculator could not load</b>'+
    '<p>Please refresh the page, or telephone us and we will work the figure out with you.</p></div>';
});

function median(nums){
  var s = nums.slice().sort(function(a,b){ return a-b; });
  return s.length ? s[Math.floor(s.length/2)] : 250000;
}

/* ----------------------------------------------------------------- copy -- */
function paintCopy(){
  U.els('[data-fin]').forEach(function(el){
    var v = fin[el.dataset.fin];
    if(v) el.textContent = v;
  });
  U.els('[data-icon]').forEach(function(el){
    el.innerHTML = SC.icon[el.dataset.icon] || '';
  });
}

function paintPartner(){
  var host = U.el('[data-fin-partner]');
  if(!host) return;
  if(!fin.partner){ host.remove(); return; }
  host.innerHTML =
    '<div class="note-bar info">'+SC.icon.bank+
      '<div>We place applications with <b>'+U.esc(fin.partner)+'</b> and the other major '+
      'South African banks. Because we submit them ourselves, we usually know the same day '+
      'whether a deal will fly.</div>'+
    '</div>';
}

function paintSteps(){
  var host = U.el('[data-fin-steps]');
  if(!host) return;
  var steps = Array.isArray(fin.steps) ? fin.steps : [];
  /* Take the heading with it, so an empty list never leaves one dangling. */
  if(!steps.length){ (host.closest('[data-steps-block]')||host).remove(); return; }

  host.innerHTML = '<div class="stack" style="gap:12px">'+
    steps.map(function(s,i){
      return '<div class="why-item" data-reveal="'+(i%3)+'" style="padding:18px">'+
        '<span class="why-ic" style="font-weight:800;font-size:16px">'+(i+1)+'</span>'+
        '<div><b>'+U.esc(s.title||'')+'</b><p>'+U.esc(s.text||'')+'</p></div>'+
      '</div>';
    }).join('')+'</div>';
}

function paintRequirements(){
  var host = U.el('[data-requirements]');
  var sec = U.el('[data-req-sec]');
  if(!host || !sec) return;
  var list = Array.isArray(fin.requirements) ? fin.requirements : [];
  if(!list.length){ sec.remove(); return; }

  host.innerHTML = list.map(function(t){
    return '<li>'+SC.icon.check+'<span>'+U.esc(t)+'</span></li>';
  }).join('');
  sec.hidden = false;
}

/* ----------------------------------------------------------- calculator -- */
function paintCalc(){
  var host = U.el('[data-calc]');
  if(!host) return;

  var terms = Array.isArray(fin.termOptions) && fin.termOptions.length
    ? fin.termOptions : [12,24,36,48,60,72,84];
  var maxRes = Number(fin.maxResidualPct)||35;

  /* Price ceiling for the slider: a little above the dearest car we sell,
     rounded up, so the whole floor is reachable. */
  var top = vehicles.reduce(function(m,v){ return Math.max(m,v.price); },400000);
  var ceiling = Math.max(600000, Math.ceil((top*1.15)/50000)*50000);

  host.innerHTML =
    '<div class="calc-fields">'+
      (vehicles.length
        ? '<div class="field">'+
            '<label for="c-veh">Pick a vehicle, or set the price yourself</label>'+
            '<select id="c-veh">'+
              '<option value="">Set the price myself</option>'+
              vehicles.map(function(v){
                return '<option value="'+U.esc(v.id)+'"'+(picked&&picked.id===v.id?' selected':'')+'>'+
                  U.esc(v.fullTitle)+' — '+U.money(v.price)+'</option>';
              }).join('')+
            '</select>'+
          '</div>'
        : '')+

      slider('price','Vehicle price', 30000, ceiling, 5000, calc.price, U.money)+
      slider('depositPct','Deposit', 0, 50, 1, calc.depositPct, function(v){
        return v+'%  ('+U.money(calc.price*(v/100))+')';
      })+

      '<div class="crow">'+
        '<div class="top"><label for="c-months">Repayment term</label>'+
          '<b id="c-months-out">'+calc.months+' months</b></div>'+
        '<select id="c-months" class="inp" style="cursor:pointer">'+
          terms.map(function(t){
            return '<option value="'+t+'"'+(t===calc.months?' selected':'')+'>'+t+' months</option>';
          }).join('')+
        '</select>'+
      '</div>'+

      slider('rate','Interest rate', 6, 25, .25, calc.rate, function(v){
        return Number(v).toFixed(2)+'%';
      })+

      slider('residualPct','Balloon payment', 0, maxRes, 5, calc.residualPct, function(v){
        return v ? v+'%  ('+U.money(calc.price*(v/100))+' at the end)' : 'None';
      })+
    '</div>'+

    '<div class="calc-out" data-calc-out></div>';

  host.querySelectorAll('input[type=range]').forEach(function(el){
    el.addEventListener('input',function(){
      calc[el.dataset.k] = Number(el.value);
      /* A price change moves the rand values shown beside deposit and
         balloon, so those labels are repainted too. */
      paintSliderLabels();
      paintResult();
    });
  });

  var months = U.el('#c-months');
  months.addEventListener('change',function(){
    calc.months = Number(months.value);
    U.el('#c-months-out').textContent = calc.months + ' months';
    paintResult();
  });

  var vehSel = U.el('#c-veh');
  if(vehSel){
    vehSel.addEventListener('change',function(){
      picked = vehicles.filter(function(v){ return v.id === vehSel.value; })[0] || null;
      if(picked){
        calc.price = picked.price;
        var pr = U.el('input[data-k="price"]');
        pr.value = Math.min(Number(pr.max), calc.price);
      }
      paintSliderLabels();
      paintResult();
    });
  }

  paintResult();
}

function slider(key,label,min,max,step,val,fmt){
  return '<div class="crow">'+
    '<div class="top"><label for="c-'+key+'">'+U.esc(label)+'</label>'+
      '<b data-out="'+key+'">'+fmt(val)+'</b></div>'+
    '<input type="range" id="c-'+key+'" data-k="'+key+'" '+
      'min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" '+
      'aria-label="'+U.esc(label)+'">'+
    '<div class="scale"><span>'+fmtEdge(min)+'</span><span>'+fmtEdge(max)+'</span></div>'+
  '</div>';

  function fmtEdge(n){
    if(key==='price') return U.money(n);
    if(key==='rate')  return n+'%';
    return n+'%';
  }
}

/* Repaints the value beside each slider. Kept separate because a price
   change alters the deposit and balloon labels as well as its own. */
function paintSliderLabels(){
  set('price', U.money(calc.price));
  set('depositPct', calc.depositPct+'%  ('+U.money(calc.price*(calc.depositPct/100))+')');
  set('rate', Number(calc.rate).toFixed(2)+'%');
  set('residualPct', calc.residualPct
    ? calc.residualPct+'%  ('+U.money(calc.price*(calc.residualPct/100))+' at the end)'
    : 'None');

  function set(k,text){
    var el = U.el('[data-out="'+k+'"]');
    if(el) el.textContent = text;
  }
}

function result(){
  var price    = calc.price;
  var deposit  = price * (calc.depositPct/100);
  var residual = price * (calc.residualPct/100);
  var init     = Number(fin.initiationFee)||0;
  var svc      = Number(fin.monthlyServiceFee)||0;
  var n        = calc.months;
  var i        = (calc.rate/100)/12;

  var principal = price - deposit + init;
  var monthly;

  if(i <= 0){
    monthly = (principal - residual)/n;
  }else{
    var f = Math.pow(1+i,n);
    monthly = (principal - residual/f) * (i*f)/(f-1);
  }

  var instalment = monthly + svc;
  var totalPaid  = instalment*n + deposit + residual;

  return {
    deposit:deposit, residual:residual, principal:principal,
    instalment:instalment, totalPaid:totalPaid,
    interest: totalPaid - price - init - (svc*n)
  };
}

function paintResult(){
  var host = U.el('[data-calc-out]');
  if(!host) return;
  var r = result();

  host.innerHTML =
    '<div class="lab">Estimated monthly</div>'+
    '<div class="big">'+U.money(r.instalment)+'</div>'+
    '<div class="per">for '+calc.months+' months</div>'+
    '<div class="kv">'+
      row('Deposit', U.money(r.deposit))+
      row('Financed', U.money(r.principal))+
      (r.residual ? row('Balloon at the end', U.money(r.residual)) : '')+
      row('Total of payments', U.money(r.totalPaid))+
    '</div>'+
    '<a class="btn btn-pri btn-block" href="#apply" data-jump>Apply with these figures</a>'+
    '<p class="note">Includes a '+U.money(Number(fin.monthlyServiceFee)||0)+' monthly service fee and '+
    'a '+U.money(Number(fin.initiationFee)||0)+' initiation fee added to the amount financed. '+
    'An estimate only. Not a quotation and not an offer of credit.</p>';

  function row(k,v){ return '<div><span>'+U.esc(k)+'</span><b>'+U.esc(v)+'</b></div>'; }

  /* Jumping to the form carries the calculator's figures into it, so the
     visitor does not retype what they have just chosen. */
  var jump = host.querySelector('[data-jump]');
  jump.addEventListener('click',function(){
    fillFromCalc();
  });
}

function fillFromCalc(){
  var r = result();
  set('deposit', Math.round(r.deposit));
  set('monthlyBudget', Math.round(r.instalment));
  var term = U.el('[name="termMonths"]');
  if(term) term.value = calc.months;
  if(picked){
    var veh = U.el('[name="vehicle"]');
    if(veh) veh.value = picked.id;
  }
  function set(name,val){
    var el = U.el('[name="'+name+'"]');
    if(el) el.value = val;
  }
}

/* ---------------------------------------------------------- application -- */
function paintApply(){
  var host = U.el('[data-apply]');
  if(!host) return;

  var terms = Array.isArray(fin.termOptions) && fin.termOptions.length
    ? fin.termOptions : [36,48,60,72,84];

  host.innerHTML =
    '<form class="form" novalidate data-contact-pair>'+

      '<div class="frow">'+
        field('name','Your full name','text',true,'name')+
        field('idNumber','South African ID number','text',false,'off',
              'The bank needs this to check your credit profile.')+
      '</div>'+

      '<div class="frow">'+
        field('phone','Telephone','tel',true,'tel')+
        field('email','Email address','email',false,'email')+
      '</div>'+

      '<div class="field">'+
        '<label for="f-vehicle">Which vehicle?</label>'+
        '<select id="f-vehicle" name="vehicle">'+
          '<option value="">I am not sure yet</option>'+
          vehicles.map(function(v){
            return '<option value="'+U.esc(v.id)+'"'+(picked&&picked.id===v.id?' selected':'')+'>'+
              U.esc(v.fullTitle)+' — '+U.money(v.price)+'</option>';
          }).join('')+
        '</select>'+
      '</div>'+

      '<div class="frow">'+
        '<div class="field">'+
          '<label for="f-employment">Employment status</label>'+
          '<select id="f-employment" name="employment">'+
            ['Permanently employed','Contract','Self employed','Pensioner','Other']
              .map(function(o){ return '<option>'+o+'</option>'; }).join('')+
          '</select>'+
        '</div>'+
        field('employer','Employer','text',false,'organization')+
      '</div>'+

      '<div class="frow">'+
        field('income','Gross monthly income (R)','number',true,'off')+
        field('deposit','Deposit available (R)','number',false,'off')+
      '</div>'+

      '<div class="frow">'+
        field('monthlyBudget','Monthly instalment you are comfortable with (R)','number',false,'off')+
        '<div class="field">'+
          '<label for="f-term">Preferred term</label>'+
          '<select id="f-term" name="termMonths">'+
            terms.map(function(t){
              return '<option value="'+t+'"'+(t===(Number(fin.defaultTermMonths)||72)?' selected':'')+'>'+
                t+' months</option>';
            }).join('')+
          '</select>'+
        '</div>'+
      '</div>'+

      '<div class="field">'+
        '<label for="f-message">Anything else we should know?</label>'+
        '<textarea class="ta" id="f-message" name="message" rows="3" '+
          'placeholder="For example, a trade-in you want to put towards the deal."></textarea>'+
      '</div>'+

      '<div class="field check">'+
        '<input type="checkbox" id="f-consent" name="consent" data-req '+
          'data-req-msg="Please tick this so we may send your application">'+
        '<label for="f-consent">I agree that Super Cars Witbank may use these details to place a '+
        'finance application with a bank on my behalf, and I have read the '+
        '<a href="privacy.html" style="color:var(--red)">privacy policy</a>.</label>'+
      '</div>'+

      '<button class="btn btn-pri btn-lg btn-block" type="submit">Send my application</button>'+
    '</form>';

  var form = host.querySelector('form');

  /* A checkbox holds no value, so validate() cannot read it the way it reads
     a text field. Enforced here instead, before the shared handler runs. */
  form.addEventListener('submit',function(e){
    var cb = U.el('#f-consent',form);
    if(!cb.checked){
      e.preventDefault();
      e.stopImmediatePropagation();
      var slot = cb.parentElement.querySelector('.err') || (function(){
        var s = document.createElement('span');
        s.className = 'err';
        cb.parentElement.appendChild(s);
        return s;
      })();
      slot.textContent = 'Please tick this so we may send your application';
      slot.classList.add('on');
      cb.focus();
    }
  },true);

  SC.handleForm(form,{
    busyText:'Sending your application…',
    successTitle:'Your application is with us',
    successText:'We will look at it and telephone you, usually the same day. '+
                'Have your ID, payslip and three months of bank statements ready.',
    submit:function(d){
      var v = vehicles.filter(function(x){ return x.id === d.vehicle; })[0];
      return SC.data.submitFinance({
        name:d.name, phone:d.phone, email:d.email, idNumber:d.idNumber,
        vehicle: v ? v.fullTitle : '',
        vehicleId: v ? v.id : '',
        employment:d.employment, employer:d.employer,
        income:d.income, deposit:d.deposit,
        monthlyBudget:d.monthlyBudget, termMonths:d.termMonths,
        message:d.message
      });
    }
  });
}

function field(name,label,type,req,autocomplete,hint){
  var id = 'f-'+name;
  return '<div class="field">'+
    '<label for="'+id+'">'+U.esc(label)+(req?'<span class="req">*</span>':'')+'</label>'+
    '<input class="inp" id="'+id+'" name="'+name+'" type="'+type+'"'+
      (req?' data-req':'')+
      (type==='email'?' data-email':'')+
      (type==='tel'?' data-phone inputmode="tel"':'')+
      (type==='number'?' inputmode="numeric" min="0"':'')+
      ' autocomplete="'+autocomplete+'">'+
    (hint?'<span class="hint">'+U.esc(hint)+'</span>':'')+
  '</div>';
}

})();
