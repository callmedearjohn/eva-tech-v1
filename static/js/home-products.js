import { Cart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  const bagBtn = document.querySelector('[data-add-bag]');
  const homeBtn = document.querySelector('[data-add-home]');
  if (bagBtn) {
    bagBtn.addEventListener('click', ()=>{
      Cart.add({ make:'accessory', model:'storage-bag', year:'', set:'bag', pattern:'', matColor:'', trimColor:'', heelPad:false, thirdRow:false, subtotal:15, qty:1 });
      window.location.href = 'cart';
    });
  }
  if (homeBtn) {
    homeBtn.addEventListener('click', ()=>{
      Cart.add({ make:'home', model:'mat', year:'', set:'home-mat', pattern:'', matColor:'', trimColor:'', heelPad:false, thirdRow:false, subtotal:39, qty:1 });
      window.location.href = 'cart';
    });
  }
});


