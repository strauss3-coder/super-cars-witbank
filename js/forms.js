/* ==========================================================================
   SUPER CARS WITBANK  ·  Forms and modals
   --------------------------------------------------------------------------
   Shared by the vehicle detail, finance, sell and contact pages, so every
   form on the site validates, reports and recovers the same way.

   Validation rules live on the markup as data attributes rather than in
   each page's script, so adding a field never means editing this file.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

/* ---------------------------------------------------------------- modal -- */
/* One modal at a time. Returns a close function so a caller can dismiss it
   from inside its own body, for example after a successful submit. */
SC.modal = function(opts){
  var lastFocus = document.activeElement;

  var root = document.createElement('div');
  root.className = 'sc-modal';
  root.setAttribute('role','dialog');
  root.setAttribute('aria-modal','true');
  root.setAttribute('aria-label', opts.title || 'Dialog');
  root.innerHTML =
    '<div class="sc-modal-scrim"></div>'+
    '<div class="sc-modal-box" role="document">'+
      '<div class="sc-modal-h">'+
        '<div><h3>'+U.esc(opts.title||'')+'</h3>'+
          (opts.sub ? '<p>'+U.esc(opts.sub)+'</p>' : '')+'</div>'+
        '<button class="sc-modal-x" aria-label="Close">'+SC.icon.x+'</button>'+
      '</div>'+
      '<div class="sc-modal-b">'+(opts.body||'')+'</div>'+
    '</div>';

  document.body.appendChild(root);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function(){ root.classList.add('on'); });

  function close(){
    root.classList.remove('on');
    document.body.style.overflow = '';
    document.removeEventListener('keydown',onKey);
    setTimeout(function(){
      root.remove();
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    },220);
  }
  function onKey(e){
    if(e.key === 'Escape') close();
    if(e.key === 'Tab') trap(e);
  }
  /* Keeps keyboard focus inside the dialog while it is open. */
  function trap(e){
    var f = U.els('a[href],button:not([disabled]),input:not([disabled]),select,textarea',root)
              .filter(function(el){ return el.offsetParent !== null; });
    if(!f.length) return;
    var first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  root.querySelector('.sc-modal-x').addEventListener('click',close);
  root.querySelector('.sc-modal-scrim').addEventListener('click',close);
  document.addEventListener('keydown',onKey);

  var body = root.querySelector('.sc-modal-b');
  if(opts.onMount) opts.onMount(body, close);

  var focusable = body.querySelector('input,select,textarea,button');
  if(focusable) focusable.focus();

  return close;
};

/* ----------------------------------------------------------- validation -- */
/* A field opts in by carrying data-req, data-email or data-phone. The error
   message is written next to the field, never in an alert. */
SC.validate = function(form){
  var ok = true, firstBad = null;

  U.els('[data-req],[data-email],[data-phone]',form).forEach(function(el){
    var val = (el.value||'').trim();
    var msg = '';

    if(el.hasAttribute('data-req') && !val){
      msg = el.dataset.reqMsg || 'This is needed';
    }else if(val && el.hasAttribute('data-email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)){
      msg = 'That does not look like an email address';
    }else if(val && el.hasAttribute('data-phone')){
      var digits = val.replace(/[^0-9]/g,'');
      /* South African numbers: 10 digits local, or 11 with the 27 prefix. */
      if(digits.length < 9 || digits.length > 13) msg = 'Please check the telephone number';
    }

    setError(el,msg);
    if(msg){ ok = false; if(!firstBad) firstBad = el; }
  });

  /* At least one of telephone or email, so we can actually reply. */
  var pair = U.el('[data-contact-pair]',form);
  if(pair){
    var phone = U.el('[name="phone"]',form);
    var email = U.el('[name="email"]',form);
    if(phone && email && !phone.value.trim() && !email.value.trim()){
      setError(phone,'Give us a telephone number or an email address');
      ok = false;
      if(!firstBad) firstBad = phone;
    }
  }

  if(firstBad){
    firstBad.focus();
    firstBad.scrollIntoView({block:'center',behavior:'smooth'});
  }
  return ok;
};

function setError(el,msg){
  el.classList.toggle('bad',!!msg);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  var slot = el.parentElement.querySelector('.err');
  if(!slot){
    slot = document.createElement('span');
    slot.className = 'err';
    el.parentElement.appendChild(slot);
  }
  slot.textContent = msg;
  slot.classList.toggle('on',!!msg);
}

/* Clears an error the moment the visitor starts fixing it. */
SC.liveClear = function(form){
  U.on(form,'input','[data-req],[data-email],[data-phone]',function(e,el){
    if(el.classList.contains('bad')) setError(el,'');
  });
};

/* --------------------------------------------------------------- submit -- */
/* Wraps a form so it cannot be submitted twice, shows a spinner while the
   request is in flight, and replaces itself with a confirmation when the
   request succeeds. */
SC.handleForm = function(form,opts){
  if(!form) return;
  SC.liveClear(form);

  var busy = false;

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(busy) return;
    if(!SC.validate(form)) return;

    var btn = form.querySelector('[type="submit"]');
    var label = btn ? btn.innerHTML : '';
    busy = true;
    if(btn){
      btn.setAttribute('aria-busy','true');
      btn.innerHTML = '<span class="spin"></span>'+(opts.busyText||'Sending…');
    }

    var data = {};
    new FormData(form).forEach(function(v,k){ data[k] = typeof v==='string' ? v.trim() : v; });
    /* Checkboxes report nothing when unticked, so read them explicitly. */
    U.els('input[type="checkbox"]',form).forEach(function(cb){ data[cb.name] = cb.checked; });

    Promise.resolve(opts.submit(data))
      .then(function(){
        var panel = document.createElement('div');
        panel.className = 'sent';
        panel.setAttribute('role','status');
        panel.innerHTML =
          '<span class="ic">'+SC.icon.check+'</span>'+
          '<b>'+U.esc(opts.successTitle||'Thank you, we have it')+'</b>'+
          '<p>'+U.esc(opts.successText||'We will be in touch shortly.')+'</p>'+
          (opts.successExtra||'');
        form.replaceWith(panel);
        panel.scrollIntoView({block:'center',behavior:'smooth'});
        if(opts.onSuccess) opts.onSuccess(panel);
      })
      .catch(function(err){
        console.error('[form] '+err.message);
        busy = false;
        if(btn){ btn.removeAttribute('aria-busy'); btn.innerHTML = label; }
        SC.toast('err','That did not send',
          'Please try again, or telephone us and we will take the details over the phone.');
      });
  });
};

/* ---------------------------------------------------- modal styles once -- */
/* Kept with the component that needs them rather than in the stylesheet,
   because nothing else on the site uses a modal. */
var css = document.createElement('style');
css.textContent = [
  '.sc-modal{position:fixed;inset:0;z-index:250;display:grid;place-items:center;padding:clamp(12px,4vw,32px);opacity:0;pointer-events:none;transition:opacity .22s var(--ease)}',
  '.sc-modal.on{opacity:1;pointer-events:auto}',
  '.sc-modal-scrim{position:absolute;inset:0;background:rgba(8,10,13,.62);backdrop-filter:blur(3px)}',
  '.sc-modal-box{position:relative;background:var(--paper);border-radius:var(--r-lg);width:min(560px,100%);max-height:88dvh;display:flex;flex-direction:column;box-shadow:var(--sh-4);transform:translateY(12px) scale(.98);transition:transform .26s var(--ease-out)}',
  '.sc-modal.on .sc-modal-box{transform:none}',
  '.sc-modal-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-bottom:1px solid var(--line)}',
  '.sc-modal-h h3{font-size:18px;font-weight:760;letter-spacing:-.015em}',
  '.sc-modal-h p{font-size:13.5px;color:var(--text-2);margin-top:4px}',
  '.sc-modal-x{width:34px;height:34px;border-radius:var(--r-sm);border:1px solid var(--line-2);display:grid;place-items:center;flex-shrink:0;transition:background .16s,border-color .16s}',
  '.sc-modal-x:hover{background:var(--paper-2);border-color:var(--ink)}',
  '.sc-modal-x svg{width:15px;height:15px}',
  '.sc-modal-b{padding:22px;overflow-y:auto}'
].join('');
document.head.appendChild(css);

})();
