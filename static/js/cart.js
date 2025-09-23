export const Cart = (() => {
  const KEY = 'evatech_cart_v1';
  const read = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));
  const total = () => read().reduce((s,i)=> s + (i.subtotal||0) * (i.qty||1), 0);
  return {
    add(item){
      const items = read();
      const key = JSON.stringify({make:item.make, model:item.model, year:item.year, set:item.set, pattern:item.pattern, matColor:item.matColor, trimColor:item.trimColor, thirdRow:item.thirdRow, heelPad:item.heelPad});
      const idx = items.findIndex(x=> JSON.stringify({make:x.make, model:x.model, year:x.year, set:x.set, pattern:x.pattern, matColor:x.matColor, trimColor:x.trimColor, thirdRow:x.thirdRow, heelPad:x.heelPad}) === key);
      if (idx >= 0) { items[idx].qty = (items[idx].qty||1) + 1; }
      else { items.push({...item, qty: 1}); }
      write(items);
    },
    list: read,
    update(idx, qty){ const items = read(); if(items[idx]){ items[idx].qty = qty; write(items);} },
    remove(idx){ const items = read(); items.splice(idx,1); write(items); },
    clear(){ write([]); },
    total
  };
})();


