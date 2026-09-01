/* ==========================================================================
   SUPER CARS WITBANK  ·  Legal pages
   --------------------------------------------------------------------------
   Privacy policy and terms of use, both driven by the `legal` settings
   document so staff can amend them in the portal without touching a file.

   The body is stored as plain text with a light markdown flavour, because
   a rich text editor in the portal would let a paste from Word inject
   markup into the page. Only headings, bold, links and lists are honoured;
   everything else is escaped.
   ========================================================================== */
(function(){
'use strict';

var SC = window.SC, U = SC.U;
var which = window.SC_LEGAL === 'terms' ? 'terms' : 'privacy';

Promise.all([SC.site, SC.data.settings()]).then(function(r){
  var legal = r[1].legal || {};

  var title   = legal[which+'Title'];
  var body    = legal[which+'Body'];
  var updated = legal[which+'Updated'];

  if(title){
    U.el('[data-legal-title]').textContent = title;
    document.title = title + ' | Super Cars Witbank';
  }

  var stamp = U.el('[data-legal-updated]');
  if(updated && stamp) stamp.textContent = 'Last updated ' + U.date(updated);
  else if(stamp) stamp.remove();

  var host = U.el('[data-legal-body]');
  if(body){
    host.innerHTML = U.markdown(body);
  }else{
    /* Nothing in the portal yet. Say so plainly rather than showing an
       empty page that looks broken. */
    host.innerHTML = '<div class="empty">'+SC.icon.doc+
      '<b>This document is being prepared</b>'+
      '<p>Please telephone us and we will answer any question about how we handle '+
      'your information or the terms on which we sell.</p></div>';
  }
}).catch(function(err){
  console.error('[legal] '+err.message);
  U.el('[data-legal-body]').innerHTML =
    '<div class="empty">'+SC.icon.warn+'<b>This page could not be loaded</b>'+
    '<p>Please refresh, or telephone us with your question.</p></div>';
});

})();
