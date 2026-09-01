/* ==========================================================================
   SUPER CARS WITBANK  ·  Contact
   --------------------------------------------------------------------------
   The enquiry form, the contact card and an honest "open now" indicator
   worked out from the opening hours in the portal.

   The form offers the vehicle list so an enquiry can be attached to a
   specific car, which is what makes it land in the portal already knowing
   what the customer is asking about.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

Promise.all([SC.site, SC.data.settings(), SC.data.vehicles()]).then(function(r){
  var biz = r[1].business || {};
  var vehicles = r[2].filter(function(v){ return !v.sold; });

  paintOpenNow(biz);
  paintDetails(biz);
  paintForm(biz, vehicles);
  SC.reveal();
}).catch(function(err){
  console.error('[contact] '+err.message);
  U.el('[data-contact-form]').innerHTML =
    '<div class="empty">'+SC.icon.warn+'<b>The form could not load</b>'+
    '<p>Please telephone us on 013 692 7628 and we will help you directly.</p></div>';
});

/* Says whether the dealership is open right now, and when it next opens if
   it is not. Worked out from the hours in the portal, so changing them
   there changes this. */
function paintOpenNow(biz){
  var host = U.el('[data-open-now]');
  if(!host) return;
  var state = SC.openNow(biz);
  if(!state){ host.remove(); return; }

  if(state.open){
    host.innerHTML =
      '<span class="hero-badge"><i class="dot"></i>Open now &middot; closes '+
      U.esc(state.today.close)+'</span>';
  }else{
    var next = nextOpening(biz);
    host.innerHTML =
      '<span class="hero-badge" style="border-color:rgba(255,255,255,.14)">'+
      '<i class="dot" style="background:var(--text-inv-3);animation:none"></i>'+
      'Closed now'+(next ? ' &middot; opens '+U.esc(next) : '')+'</span>';
  }
}

function nextOpening(biz){
  if(!Array.isArray(biz.hours)) return '';
  var order = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var todayIdx = new Date().getDay();

  for(var step=0; step<8; step++){
    var name = order[(todayIdx + step) % 7];
    var day = biz.hours.filter(function(h){ return h.day === name; })[0];
    if(!day || day.closed) continue;

    if(step === 0){
      /* Still today, but before opening time. */
      var now = new Date().getHours()*60 + new Date().getMinutes();
      var p = String(day.open).split(':');
      if(now < (Number(p[0])||0)*60 + (Number(p[1])||0)) return 'today at ' + day.open;
      continue;
    }
    return (step === 1 ? 'tomorrow' : name) + ' at ' + day.open;
  }
  return '';
}

function paintDetails(biz){
  var host = U.el('[data-details]');
  if(!host) return;

  var waText = 'Hello '+(biz.shortName||'Super Cars')+', I would like to ask about a vehicle.';

  host.innerHTML =
    '<div class="info-card" data-reveal>'+
      (biz.addressFull
        ? row('pin','Visit us','<p>'+U.esc(biz.addressFull)+'</p>',
            [biz.landmark ? U.esc(biz.landmark) : '',
             biz.mapsUrl ? '<a href="'+U.esc(biz.mapsUrl)+'" target="_blank" '+
               'rel="noopener noreferrer" style="color:var(--red)">Get directions</a>' : ''
            ].filter(Boolean).join(' &middot; '))
        : '')+
      (biz.phone
        ? row('phone','Telephone',
            '<a href="tel:'+U.esc(U.telHref(biz.phone))+'">'+U.esc(biz.phone)+'</a>'+
            (biz.phoneAlt ? '<br><a href="tel:'+U.esc(U.telHref(biz.phoneAlt))+'">'+
              U.esc(biz.phoneAlt)+'</a>' : '')) : '')+
      (biz.mobile
        ? row('wa','WhatsApp','<a href="'+SC.waLink(waText)+'" target="_blank" '+
            'rel="noopener noreferrer">'+U.esc(biz.mobile)+'</a>'+
            (biz.mobileAlt ? '<br><a href="tel:'+U.esc(U.telHref(biz.mobileAlt))+'">'+
              U.esc(biz.mobileAlt)+'</a>' : ''),
            'Usually the quickest way to reach us.') : '')+
      (biz.email
        ? row('mail','Email','<a href="mailto:'+U.esc(biz.email)+'">'+U.esc(biz.email)+'</a>') : '')+
    '</div>'+

    (Array.isArray(biz.hours) && biz.hours.length
      ? '<div class="info-card" data-reveal="1">'+
          '<div><b style="display:block;font-size:11.5px;font-weight:750;letter-spacing:.08em;'+
          'text-transform:uppercase;color:var(--text-3);margin-bottom:12px">Opening hours</b>'+
          '<div class="hours">'+hoursHtml(biz.hours)+'</div></div>'+
        '</div>'
      : '')+

    (biz.mobile
      ? '<a class="btn btn-wa btn-lg btn-block" href="'+SC.waLink(waText)+'" '+
        'target="_blank" rel="noopener noreferrer">'+SC.icon.wa+'Chat to us on WhatsApp</a>'
      : '');

  function row(icon,label,value,extra){
    return '<div class="info-row"><span class="ic">'+SC.icon[icon]+'</span>'+
      '<div style="min-width:0"><b>'+label+'</b>'+value+
      (extra ? '<p class="tiny" style="margin-top:4px">'+extra+'</p>' : '')+
    '</div></div>';
  }
}

function hoursHtml(hours){
  var todayName = new Date().toLocaleDateString('en-ZA',{weekday:'long'});
  return hours.map(function(h){
    var today = h.day === todayName;
    var when = h.closed ? '<span class="shut">Closed</span>'
                        : '<span>'+U.esc(h.open)+' &ndash; '+U.esc(h.close)+'</span>';
    return '<div'+(today?' class="today"':'')+'><span>'+U.esc(h.day)+
      (today?' <small style="color:var(--text-3)">(today)</small>':'')+'</span>'+when+'</div>';
  }).join('');
}

/* ----------------------------------------------------------------- form -- */
function paintForm(biz,vehicles){
  var host = U.el('[data-contact-form]');
  if(!host) return;

  /* Arriving from a vehicle link preselects that car. */
  var want = U.params().v;

  host.innerHTML =
    '<form class="form" novalidate data-contact-pair>'+
      '<div class="field">'+
        '<label for="c-name">Your name<span class="req">*</span></label>'+
        '<input class="inp" id="c-name" name="name" data-req autocomplete="name">'+
      '</div>'+

      '<div class="frow">'+
        '<div class="field">'+
          '<label for="c-phone">Telephone</label>'+
          '<input class="inp" id="c-phone" name="phone" type="tel" data-phone '+
            'inputmode="tel" autocomplete="tel">'+
        '</div>'+
        '<div class="field">'+
          '<label for="c-email">Email address</label>'+
          '<input class="inp" id="c-email" name="email" type="email" data-email autocomplete="email">'+
        '</div>'+
      '</div>'+

      '<div class="field">'+
        '<label for="c-kind">What is this about?</label>'+
        '<select id="c-kind" name="kind">'+
          '<option value="general">A general question</option>'+
          '<option value="vehicle">A vehicle on your floor</option>'+
          '<option value="finance">Finance</option>'+
          '<option value="testdrive">Booking a test drive</option>'+
        '</select>'+
      '</div>'+

      (vehicles.length
        ? '<div class="field" data-veh-field hidden>'+
            '<label for="c-vehicle">Which vehicle?</label>'+
            '<select id="c-vehicle" name="vehicle">'+
              '<option value="">Not sure yet</option>'+
              vehicles.map(function(v){
                return '<option value="'+U.esc(v.id)+'"'+
                  ((want && (v.slug===want||v.id===want))?' selected':'')+'>'+
                  U.esc(v.fullTitle)+'</option>';
              }).join('')+
            '</select>'+
          '</div>'
        : '')+

      '<div class="field">'+
        '<label for="c-message">Your message<span class="req">*</span></label>'+
        '<textarea class="ta" id="c-message" name="message" rows="5" data-req '+
          'placeholder="Tell us what you are after and we will come back to you."></textarea>'+
      '</div>'+

      '<button class="btn btn-pri btn-lg btn-block" type="submit">Send the message</button>'+
      '<p class="tiny" style="text-align:center">We use your details to answer this message '+
      'and nothing else. See our <a href="privacy.html" style="color:var(--red)">privacy policy</a>.</p>'+
    '</form>';

  var form = host.querySelector('form');
  var kind = U.el('#c-kind',form);
  var vehField = U.el('[data-veh-field]',form);

  /* The vehicle picker only appears when it is relevant, so a general
     question is not cluttered by a list of cars. */
  function syncVehField(){
    if(!vehField) return;
    var k = kind.value;
    vehField.hidden = !(k === 'vehicle' || k === 'testdrive');
  }
  kind.addEventListener('change',syncVehField);

  if(want && vehField){ kind.value = 'vehicle'; }
  syncVehField();

  SC.handleForm(form,{
    busyText:'Sending…',
    successTitle:'Your message is with us',
    successText:'We will come back to you shortly, usually the same day. '+
                'If it is urgent, telephone us and we will pick up.',
    submit:function(d){
      var v = vehicles.filter(function(x){ return x.id === d.vehicle; })[0];
      return SC.data.submitEnquiry({
        name:d.name, phone:d.phone, email:d.email,
        vehicle: v ? v.fullTitle : '',
        vehicleId: v ? v.id : '',
        kind:d.kind || 'general',
        source:'Contact page',
        message:d.message
      });
    }
  });
}

})();
