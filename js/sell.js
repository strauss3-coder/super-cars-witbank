/* ==========================================================================
   SUPER CARS WITBANK  ·  Sell / trade in
   --------------------------------------------------------------------------
   A valuation request with photographs.

   Photographs are the awkward part. They are resized in the browser before
   they leave the phone, because a modern handset produces 4 MB files and a
   seller on a mobile connection will abandon the form long before eight of
   those upload. Each one is uploaded as it is chosen rather than all at
   submit time, so by the time the seller finishes typing the pictures are
   already there and pressing send is instant.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;

var sell = {}, maxPhotos = 8;
var photos = [];      /* {id, url, thumb, busy} */

Promise.all([SC.site, SC.data.settings()]).then(function(r){
  sell = r[1].sell || {};
  maxPhotos = Number(sell.maxPhotos)||8;

  paintCopy();
  paintPoints();
  paintSteps();
  paintForm();
  SC.scan(document); SC.fadeImages(document);
}).catch(function(err){
  console.error('[sell] '+err.message);
  U.el('[data-sell-form]').innerHTML =
    '<div class="empty">'+SC.icon.warn+'<b>The form could not load</b>'+
    '<p>Please refresh, or send us the details on WhatsApp and we will value it that way.</p></div>';
});

function paintCopy(){
  U.els('[data-sell]').forEach(function(el){
    var v = sell[el.dataset.sell];
    if(v) el.textContent = v;
  });
}

function paintPoints(){
  var host = U.el('[data-points]');
  if(!host) return;
  var list = Array.isArray(sell.points) ? sell.points : [];
  /* Take the heading with it, so an empty list never leaves one dangling. */
  if(!list.length){ (host.closest('[data-points-block]')||host).remove(); return; }
  host.innerHTML = list.map(function(t){
    return '<li>'+SC.icon.check+'<span>'+U.esc(t)+'</span></li>';
  }).join('');
}

function paintSteps(){
  var host = U.el('[data-steps]');
  if(!host) return;
  var steps = Array.isArray(sell.steps) ? sell.steps : [];
  if(!steps.length){ (host.closest('[data-steps-block]')||host).remove(); return; }
  host.innerHTML = '<div class="stack" style="gap:12px">'+
    steps.map(function(s,i){
      return '<div class="why-item" data-reveal="'+(i%3)+'" style="padding:18px">'+
        '<span class="why-ic" style="font-weight:800;font-size:16px">'+(i+1)+'</span>'+
        '<div><b>'+U.esc(s.title||'')+'</b><p>'+U.esc(s.text||'')+'</p></div></div>';
    }).join('')+'</div>';
}

/* ----------------------------------------------------------------- form -- */
function paintForm(){
  var host = U.el('[data-sell-form]');
  if(!host) return;

  var years = [];
  var thisYear = new Date().getFullYear();
  for(var y = thisYear + 1; y >= 1990; y--) years.push(y);

  host.innerHTML =
    '<form class="form" novalidate data-contact-pair>'+

      '<div class="frow">'+
        field('name','Your name','text',true,'name')+
        field('phone','Telephone','tel',true,'tel')+
      '</div>'+
      field('email','Email address','email',false,'email')+

      '<div style="height:1px;background:var(--line);margin-block:6px"></div>'+

      '<div class="frow">'+
        field('make','Make','text',true,'off','For example, Volkswagen')+
        field('model','Model','text',true,'off','For example, Polo Vivo')+
      '</div>'+

      '<div class="frow">'+
        field('variant','Variant or trim','text',false,'off','For example, 1.4 Trendline')+
        '<div class="field">'+
          '<label for="s-year">Year<span class="req">*</span></label>'+
          '<select id="s-year" name="year" data-req>'+
            '<option value="">Choose a year</option>'+
            years.map(function(y){ return '<option>'+y+'</option>'; }).join('')+
          '</select>'+
        '</div>'+
      '</div>'+

      '<div class="frow">'+
        field('mileage','Mileage (km)','number',true,'off')+
        '<div class="field">'+
          '<label for="s-trans">Transmission</label>'+
          '<select id="s-trans" name="transmission">'+
            ['Manual','Automatic','Other'].map(function(o){
              return '<option>'+o+'</option>'; }).join('')+
          '</select>'+
        '</div>'+
      '</div>'+

      '<div class="frow">'+
        '<div class="field">'+
          '<label for="s-fuel">Fuel</label>'+
          '<select id="s-fuel" name="fuel">'+
            ['Petrol','Diesel','Hybrid','Electric'].map(function(o){
              return '<option>'+o+'</option>'; }).join('')+
          '</select>'+
        '</div>'+
        '<div class="field">'+
          '<label for="s-cond">Overall condition</label>'+
          '<select id="s-cond" name="condition">'+
            ['Excellent','Very good','Good','Fair','Needs work'].map(function(o){
              return '<option>'+o+'</option>'; }).join('')+
          '</select>'+
        '</div>'+
      '</div>'+

      '<div class="frow">'+
        field('expected','What you hope to get (R)','number',false,'off','Optional. It helps us be straight with you.')+
        '<div class="field">'+
          '<label for="s-finance">Is there finance outstanding?</label>'+
          '<select id="s-finance" name="hasFinanceSelect">'+
            '<option value="no">No, it is paid off</option>'+
            '<option value="yes">Yes, there is a settlement</option>'+
            '<option value="unsure">I am not sure</option>'+
          '</select>'+
          '<span class="hint">We settle outstanding finance with your bank directly.</span>'+
        '</div>'+
      '</div>'+

      /* ---- photographs ---- */
      '<div class="field">'+
        '<label>Photographs</label>'+
        '<span class="hint">'+U.esc(sell.formNote||'')+'</span>'+
        '<div class="drop" data-drop tabindex="0" role="button" '+
             'aria-label="Add photographs of your car">'+
          SC.icon.camera+
          '<b>Add photographs</b>'+
          '<span>Up to '+maxPhotos+' pictures. Tap to choose, or drag them here.</span>'+
        '</div>'+
        '<input type="file" accept="image/*" multiple hidden data-file>'+
        '<div class="thumbs" data-thumbs hidden></div>'+
      '</div>'+

      '<div class="field">'+
        '<label for="s-message">Anything else?</label>'+
        '<textarea class="ta" id="s-message" name="message" rows="3" '+
          'placeholder="Service history, recent work, marks or damage we should know about."></textarea>'+
      '</div>'+

      '<div class="field check">'+
        '<input type="checkbox" id="s-consent" name="consent">'+
        '<label for="s-consent">Super Cars Witbank may contact me about this valuation. '+
        'I have read the <a href="privacy.html" style="color:var(--red)">privacy policy</a>.</label>'+
      '</div>'+

      '<button class="btn btn-pri btn-lg btn-block" type="submit">Get my valuation</button>'+
      '<p class="tiny" style="text-align:center">A valuation is an indication based on what you '+
      'send us. It is not binding and is subject to us seeing the car.</p>'+
    '</form>';

  var form = host.querySelector('form');
  wireUploader(form);

  SC.handleForm(form,{
    busyText:'Sending…',
    successTitle:'We have your car',
    successText:'We will look at what it is worth in this market and come back to you, '+
                'usually the same day. If we need another photograph we will ask.',
    submit:function(d){
      return SC.data.submitTradein({
        name:d.name, phone:d.phone, email:d.email,
        make:d.make, model:d.model, variant:d.variant,
        year:d.year, mileage:d.mileage,
        transmission:d.transmission, fuel:d.fuel,
        condition:d.condition,
        hasFinance: d.hasFinanceSelect === 'yes',
        expected:d.expected,
        message:d.message +
          (d.hasFinanceSelect === 'unsure' ? '\n\n[Seller is unsure whether finance is outstanding.]' : ''),
        images:photos.filter(function(p){ return p.url; }).map(function(p){ return p.url; })
      });
    }
  });
}

/* ------------------------------------------------------------ uploader -- */
function wireUploader(form){
  var drop   = U.el('[data-drop]',form);
  var input  = U.el('[data-file]',form);
  var thumbs = U.el('[data-thumbs]',form);

  drop.addEventListener('click',function(){ input.click(); });
  drop.addEventListener('keydown',function(e){
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); input.click(); }
  });

  ['dragenter','dragover'].forEach(function(ev){
    drop.addEventListener(ev,function(e){
      e.preventDefault(); drop.classList.add('over');
    });
  });
  ['dragleave','drop'].forEach(function(ev){
    drop.addEventListener(ev,function(e){
      e.preventDefault(); drop.classList.remove('over');
    });
  });
  drop.addEventListener('drop',function(e){ take(e.dataTransfer.files); });
  input.addEventListener('change',function(){ take(input.files); input.value = ''; });

  U.on(thumbs,'click','[data-drop-photo]',function(e,b){
    var id = b.dataset.dropPhoto;
    photos = photos.filter(function(p){ return p.id !== id; });
    paintThumbs();
  });

  function take(files){
    var list = Array.prototype.slice.call(files||[]);
    var room = maxPhotos - photos.length;

    if(room <= 0){
      SC.toast('err','That is enough photographs',
        'We can take '+maxPhotos+'. Remove one if you would rather send a different picture.');
      return;
    }
    if(list.length > room){
      SC.toast('err','Only '+room+' more',
        'We have taken the first '+room+' and left the rest.');
      list = list.slice(0,room);
    }

    list.forEach(function(file){
      if(!/^image\//.test(file.type)){
        SC.toast('err','That is not a picture', file.name + ' was skipped.');
        return;
      }
      var rec = { id:'p'+Date.now()+Math.random().toString(36).slice(2,6), busy:true, url:'', thumb:'' };
      photos.push(rec);
      paintThumbs();

      shrink(file).then(function(blob){
        rec.thumb = URL.createObjectURL(blob);
        paintThumbs();
        return SC.data.uploadTradeinPhoto(
          new File([blob], file.name.replace(/\.\w+$/,'')+'.jpg', {type:'image/jpeg'}));
      }).then(function(url){
        rec.url = url;
        rec.busy = false;
        paintThumbs();
      }).catch(function(err){
        console.error('[sell] '+err.message);
        photos = photos.filter(function(p){ return p.id !== rec.id; });
        paintThumbs();
        SC.toast('err','That photograph did not upload',
          'Please try it again, or send it to us on WhatsApp instead.');
      });
    });
  }

  function paintThumbs(){
    thumbs.hidden = !photos.length;
    thumbs.innerHTML = photos.map(function(p){
      return '<div class="thumb">'+
        (p.thumb ? '<img src="'+p.thumb+'" alt="">' : '<div class="sk" style="width:100%;height:100%"></div>')+
        (p.busy
          ? '<div style="position:absolute;inset:0;display:grid;place-items:center;'+
            'background:rgba(14,17,22,.42)"><span class="spin"></span></div>'
          : '<button type="button" data-drop-photo="'+p.id+'" aria-label="Remove photograph">'+
            SC.icon.x+'</button>')+
      '</div>';
    }).join('');

    drop.querySelector('span').textContent = photos.length
      ? photos.length + ' of ' + maxPhotos + ' added. Tap to add more.'
      : 'Up to '+maxPhotos+' pictures. Tap to choose, or drag them here.';
  }
}

/* Resizes a photograph in the browser so a 4 MB phone picture becomes a
   200 KB upload. The seller is usually on mobile data, and a form that
   takes a minute to send is a form that gets abandoned. */
function shrink(file,maxW,quality){
  maxW = maxW || 1600;
  quality = quality || 0.82;
  return new Promise(function(resolve,reject){
    var fr = new FileReader();
    fr.onerror = function(){ reject(new Error('Could not read that file')); };
    fr.onload = function(){
      var img = new Image();
      img.onerror = function(){ reject(new Error('Could not read that picture')); };
      img.onload = function(){
        try{
          var scale = Math.min(1, maxW/img.width);
          var c = document.createElement('canvas');
          c.width  = Math.round(img.width*scale);
          c.height = Math.round(img.height*scale);
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);
          c.toBlob(function(blob){
            /* Canvas refused, which happens on some older browsers. Send the
               original rather than failing the upload outright. */
            resolve(blob || file);
          },'image/jpeg',quality);
        }catch(e){ resolve(file); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

function field(name,label,type,req,autocomplete,hint){
  var id = 's-'+name;
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
