document.addEventListener('DOMContentLoaded', function(){
  try{
    const bar = document.getElementById('free-ship-home');
    if(!bar) return;
    const cart = JSON.parse(localStorage.getItem('evatech_cart_v1')||'[]');
    const subtotal = cart.reduce((s,i)=> s + (i.subtotal||0) * (i.qty||1), 0);
    if (subtotal >= 100) bar.style.display = 'block';
  }catch(_){ }
});


