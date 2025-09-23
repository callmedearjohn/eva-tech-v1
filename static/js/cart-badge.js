(function(){
  function getCount(){
    try{
      const items = JSON.parse(localStorage.getItem('evatech_cart_v1')||'[]');
      return items.reduce((n,i)=> n + (i.qty||1), 0);
    }catch(_){ return 0; }
  }
  function render(){
    var count = getCount();
    var els = document.querySelectorAll('[data-cart-count]');
    for (var i=0;i<els.length;i++) els[i].textContent = String(count);
  }
  window.addEventListener('storage', function(e){ if(e.key==='evatech_cart_v1') render(); });
  document.addEventListener('DOMContentLoaded', render);
  window.updateCartBadge = render;
})();


