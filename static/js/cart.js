export const Cart = (() => {
  const KEY = 'evatech_cart_v1';
  const read = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));
  const total = () => read().reduce((s,i)=> s + (i.subtotal||0) * (i.qty||1), 0);
  return {
    add(item){
      const items = read();
      // Include product in the grouping key to avoid merging different product types
      const key = JSON.stringify({product:item.product, make:item.make, model:item.model, year:item.year, set:item.set, pattern:item.pattern, matColor:item.matColor, trimColor:item.trimColor, thirdRow:item.thirdRow, heelPad:item.heelPad, hybrid:item.hybrid});
      const idx = items.findIndex(x=> JSON.stringify({product:x.product, make:x.make, model:x.model, year:x.year, set:x.set, pattern:x.pattern, matColor:x.matColor, trimColor:x.trimColor, thirdRow:x.thirdRow, heelPad:x.heelPad, hybrid:x.hybrid}) === key);
      const qtyToAdd = Number(item.qty || 1);
      if (idx >= 0) { items[idx].qty = (items[idx].qty||1) + qtyToAdd; }
      else { items.push({...item, qty: qtyToAdd}); }
      write(items);
    },
    list: read,
    update(idx, qty){ const items = read(); if(items[idx]){ items[idx].qty = qty; write(items);} },
    remove(idx){ const items = read(); items.splice(idx,1); write(items); },
    clear(){ write([]); },
    total
  };
})();


