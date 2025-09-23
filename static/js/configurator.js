document.addEventListener('DOMContentLoaded', () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // Vehicle selects
  const makeEl = $('#cfg-make');
  const modelEl = $('#cfg-model');
  const yearEl = $('#cfg-year');

  // Config selects
  const matColorEl = $('#cfg-mat-color');
  const trimColorEl = $('#cfg-trim-color');
  const patternOverlay = document.getElementById('pattern-overlay');
  const matSwatchList = document.getElementById('mat-swatch-list');
  const trimSwatchList = document.getElementById('trim-swatch-list');
  const matSelectedLabel = document.getElementById('mat-color-selected');
  const trimSelectedLabel = document.getElementById('trim-color-selected');

  // Options
  const heelPadEl = $('#cfg-heelpad');
  const thirdRowEl = $('#cfg-third-row');
  const thirdRowNote = $('#third-row-note');

  // Summary
  const summaryVehicleEl = $('#summary-vehicle');
  const summaryListEl = $('#summary-list');
  const summarySubtotalEl = $('#summary-subtotal');
  const freeShipEl = $('#free-shipping');
  const addBtn = $('#summary-add');
  const buyBtn = $('#summary-buy');
  const vehicleSummaryEl = document.getElementById('cfg-vehicle-summary');
  const qtyMinusBtn = document.getElementById('qty-minus');
  const qtyPlusBtn = document.getElementById('qty-plus');
  const qtyInput = document.getElementById('qty-input');
  const requireVehicleMsg = document.getElementById('require-vehicle-msg');

  const PRICES = { front: 59, full: 139, complete: 219 };

  const state = {
    make: '', model: '', year: '',
    set: 'front', pattern: 'honeycomb',
    matColor: '', trimColor: '',
    heelPad: false, thirdRow: false,
    thirdRowEligible: false,
    qty: 1,
    subtotal: 0
  };

  // NiceSelect binding if available (bind once, then call update())
  let __cfgMakeNS, __cfgModelNS, __cfgYearNS, __cfgMatNS, __cfgTrimNS;
  try {
    if (window.NiceSelect) {
      __cfgMakeNS = window.NiceSelect.bind(makeEl);
      __cfgModelNS = window.NiceSelect.bind(modelEl);
      __cfgYearNS  = window.NiceSelect.bind(yearEl);
      __cfgMatNS   = window.NiceSelect.bind(matColorEl);
      __cfgTrimNS  = window.NiceSelect.bind(trimColorEl);
    }
  } catch(_) {}

  // Years
  const now = new Date();
  for (let y = 1990; y <= now.getFullYear(); y++) {
    yearEl.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
  }
  try { __cfgYearNS && __cfgYearNS.update && __cfgYearNS.update(); } catch(_){}

  // Makes & models via same API used on homepage script
  const marksUrl = 'https://api.auto.ria.com/categories/1/marks/';
  async function loadMakes() {
    // Reuse existing static options from homepage for stability
    const homepageMake = document.getElementById('car-make');
    if (homepageMake) {
      makeEl.innerHTML = homepageMake.innerHTML;
      try { __cfgMakeNS && __cfgMakeNS.update && __cfgMakeNS.update(); } catch(_){}
    } else {
      // Fallback: inject full static makes list (mirrors homepage select)
      makeEl.innerHTML = [
        '<option disabled selected value>Make</option>',
        '<option value="98">Acura</option>',
        '<option value="3">Alfa Romeo</option>',
        '<option value="5">Aston Martin</option>',
        '<option value="6">Audi</option>',
        '<option value="8">Bentley</option>',
        '<option value="9">BMW</option>',
        '<option value="109">Bugatti</option>',
        '<option value="110">Buick</option>',
        '<option value="11">Cadillac</option>',
        '<option value="13">Chevrolet</option>',
        '<option value="14">Chrysler</option>',
        '<option value="118">Dodge</option>',
        '<option value="22">Ferrari</option>',
        '<option value="23">Fiat</option>',
        '<option value="3444">Fisker</option>',
        '<option value="24">Ford</option>',
        '<option value="2604">Genesis</option>',
        '<option value="123">GMC</option>',
        '<option value="28">Honda</option>',
        '<option value="127">Hummer</option>',
        '<option value="29">Hyundai</option>',
        '<option value="128">Infiniti</option>',
        '<option value="30">Isuzu</option>',
        '<option value="31">Jaguar</option>',
        '<option value="32">Jeep</option>',
        '<option value="33">Kia</option>',
        '<option value="35">Lamborghini</option>',
        '<option value="37">Land Rover</option>',
        '<option value="38">Lexus</option>',
        '<option value="135">Lincoln</option>',
        '<option value="6317">Lucid</option>',
        '<option value="45">Maserati</option>',
        '<option value="46">Maybach</option>',
        '<option value="47">Mazda</option>',
        '<option value="3101">McLaren</option>',
        '<option value="48">Mercedes-Benz</option>',
        '<option value="144">Mercury</option>',
        '<option value="49">MG</option>',
        '<option value="147">MINI</option>',
        '<option value="52">Mitsubishi</option>',
        '<option value="55">Nissan</option>',
        '<option value="6131">Polestar</option>',
        '<option value="149">Pontiac</option>',
        '<option value="59">Porsche</option>',
        '<option value="4369">Ram</option>',
        '<option value="63">Rolls-Royce</option>',
        '<option value="65">Saab</option>',
        '<option value="331">Saturn</option>',
        '<option value="3268">Scion</option>',
        '<option value="70">Skoda</option>',
        '<option value="71">Smart</option>',
        '<option value="75">Subaru</option>',
        '<option value="76">Suzuki</option>',
        '<option value="2233">Tesla</option>',
        '<option value="79">Toyota</option>',
        '<option value="84">Volkswagen</option>',
        '<option value="85">Volvo</option>'
      ].join('');
      try { __cfgMakeNS && __cfgMakeNS.update && __cfgMakeNS.update(); } catch(_){}
    }
  }
  async function loadModelsByMake(makeId) {
    modelEl.innerHTML = '<option selected disabled>Model</option>';
    try {
      const res = await fetch(`${marksUrl}${makeId}/models`);
      const models = await res.json();
      models.forEach(m => modelEl.insertAdjacentHTML('beforeend', `<option value="${m.name}">${m.name}</option>`));
    } catch(_) {}
    try { __cfgModelNS && __cfgModelNS.update && __cfgModelNS.update(); } catch(_){}
  }

  // Colors from JSON (fallback to defaults)
  async function loadColors() {
    try {
      const res = await fetch('static/data/colors.json');
      const data = await res.json();
      matColorEl.innerHTML = '<option selected disabled>Choose</option>' + data.matColors.map(c=>`<option value="${c}">${c}</option>`).join('');
      trimColorEl.innerHTML = '<option selected disabled>Choose</option>' + data.trimColors.map(c=>`<option value="${c}">${c}</option>`).join('');
      try { buildSwatches(matSwatchList, data.matColors, 'mat'); buildSwatches(trimSwatchList, data.trimColors, 'trim'); } catch(_){}
    } catch (e) {
      const mats = ['Black','Grey','Blue','Brown','Red','Beige'];
      const trims = ['Black','Blue','Red','Grey','Beige','Brown'];
      matColorEl.innerHTML = '<option selected disabled>Choose</option>' + mats.map(c=>`<option value="${c.toLowerCase()}">${c}</option>`).join('');
      trimColorEl.innerHTML = '<option selected disabled>Choose</option>' + trims.map(c=>`<option value="${c.toLowerCase()}">${c}</option>`).join('');
      try { buildSwatches(matSwatchList, mats.map(c=>c.toLowerCase()), 'mat'); buildSwatches(trimSwatchList, trims.map(c=>c.toLowerCase()), 'trim'); } catch(_){}
    }
    try {
      __cfgMatNS && __cfgMatNS.update && __cfgMatNS.update();
      __cfgTrimNS && __cfgTrimNS.update && __cfgTrimNS.update();
    } catch(_){ }
  }

  function buildSwatches(container, colors, type){
    if (!container) return;
    container.innerHTML = '';
    const colorToHex = { black:'#000000', gray:'#d9d9d9', grey:'#d9d9d9', blue:'#2b61c8', brown:'#8a5b3c', red:'#ff1a13', beige:'#dcc48e', purple:'#6f1d8a', orange:'#ffa000', yellow:'#ffee00', sand:'#d7c190', cyan:'#4db3c8', green:'#2c7a0b', navy:'#0d2a52' };
    colors.forEach((c)=>{
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'swatch';
      sw.title = c;
      sw.style.backgroundColor = colorToHex[c] || c;
      sw.setAttribute('data-color', c);
      sw.addEventListener('click', ()=>{
        container.querySelectorAll('.swatch').forEach(s=> s.classList.remove('is-selected'));
        sw.classList.add('is-selected');
        if (type === 'mat') {
          state.matColor = c;
          matColorEl.value = c;
          if (matSelectedLabel) matSelectedLabel.textContent = c.charAt(0).toUpperCase()+c.slice(1);
        } else {
          state.trimColor = c;
          trimColorEl.value = c;
          if (trimSelectedLabel) trimSelectedLabel.textContent = c.charAt(0).toUpperCase()+c.slice(1);
        }
        syncSummary();
      });
      container.appendChild(sw);
    });
  }

  // 3rd row eligibility
  let eligible = [];
  async function loadEligibility() {
    try {
      const res = await fetch('static/data/third-row-eligible.json');
      eligible = await res.json();
    } catch (e) { eligible = []; }
  }

  function updateEligibility() {
    const hasMakeAndModel = Boolean(state.make && state.model);
    if (!hasMakeAndModel) {
      state.thirdRowEligible = false;
      thirdRowEl.disabled = true;
      thirdRowEl.checked = false;
      thirdRowNote.style.display = 'none';
      return;
    }
    const key = `${state.make}|${state.model}`.toLowerCase();
    state.thirdRowEligible = eligible.includes(key);
    thirdRowEl.disabled = !state.thirdRowEligible;
    if (!state.thirdRowEligible) {
      thirdRowEl.checked = false;
    }
    thirdRowNote.style.display = state.thirdRowEligible ? 'none' : 'block';
  }

  function calcSubtotal() {
    let subtotal = PRICES[state.set];
    if (state.thirdRow && state.thirdRowEligible && state.set !== 'complete') {
      subtotal += 40; // nominal surcharge for 3rd row when not included
    }
    state.subtotal = subtotal;
    const total = subtotal * Math.max(1, Number(state.qty || 1));
    summarySubtotalEl.textContent = String(total);
    freeShipEl.style.display = subtotal >= 100 ? 'block' : 'none';
    if (vehicleSummaryEl) {
      const mm = [state.make, state.model, state.year].filter(Boolean).join(' ');
      vehicleSummaryEl.textContent = `Make/Model/Price: ${mm || '—'}${mm? ' — ' : ''}${subtotal}$`;
    }
  }

  function syncSummary() {
    summaryVehicleEl.textContent = `Vehicle: ${state.make || '—'} ${state.model || ''} ${state.year || ''}`.trim();
    summaryListEl.innerHTML = '';
    const setNames = { front: 'Front only (2 mats)', full: 'Full interior', complete: 'Complete set' };
    const items = [];
    items.push(`${setNames[state.set]}`);
    if (state.thirdRow && state.set !== 'complete') items.push('3rd row add-on');
    items.push(`Pattern: ${state.pattern}`);
    items.push(`Mat: ${state.matColor || '—'}`);
    items.push(`Trim: ${state.trimColor || '—'}`);
    if (state.heelPad) items.push('Heel pad (free)');
    items.forEach(t=>{ const li=document.createElement('li'); li.className='property-list__item'; li.textContent=t; summaryListEl.appendChild(li); });
    calcSubtotal();

    // preview updates: color and pattern overlay
    try {
      const colorMap = { black:'#111', gray:'#7a7a7a', blue:'#124b9a', brown:'#6b4a2e', red:'#b32121', beige:'#d2b48c' };
      const bg = colorMap[state.matColor] || '#222';
      if (patternOverlay) {
        patternOverlay.style.backgroundColor = bg;
        if (state.pattern === 'diamond') {
          patternOverlay.style.backgroundImage = 'radial-gradient(currentColor 1px, transparent 1px), radial-gradient(currentColor 1px, transparent 1px)';
          patternOverlay.style.backgroundSize = '16px 16px';
          patternOverlay.style.backgroundPosition = '0 0, 8px 8px';
          patternOverlay.style.opacity = .28;
        } else {
          patternOverlay.style.backgroundImage = 'radial-gradient(currentColor 2px, transparent 2px)';
          patternOverlay.style.backgroundSize = '14px 14px';
          patternOverlay.style.backgroundPosition = '0 0';
          patternOverlay.style.opacity = .22;
        }
      }
    } catch(_){}

    // gallery swap by color
    try {
      const mainImg = document.getElementById('preview-image');
      const thumbs = document.querySelectorAll('.configurator__thumbnails img');
      if (state.matColor) {
        const base = `./static/images/price-constructor/color-combinations/${state.matColor}-${state.trimColor||state.matColor}.jpg`;
        if (mainImg) mainImg.src = base;
        thumbs.forEach((t, idx)=>{ t.src = base.replace('.jpg', idx===0? '.jpg' : idx===1? '.jpg' : '.jpg'); });
      }
    } catch(_) {}
  }

  // Listeners
  makeEl.addEventListener('change', async (e)=>{
    const makeId = e.target.value;
    state.make = e.target.options[e.target.selectedIndex]?.textContent || '';
    await loadModelsByMake(makeId);
    state.model = '';
    updateEligibility();
    syncSummary();
  });
  modelEl.addEventListener('change', (e)=>{ state.model = e.target.value; updateEligibility(); syncSummary(); });
  yearEl.addEventListener('change', (e)=>{ state.year = e.target.value; syncSummary(); });
  matColorEl.addEventListener('change', (e)=>{ state.matColor = e.target.value; if(matSelectedLabel) matSelectedLabel.textContent = state.matColor.charAt(0).toUpperCase()+state.matColor.slice(1); try { const c=matSwatchList?.querySelector(`[data-color="${state.matColor}"]`); matSwatchList?.querySelectorAll('.swatch').forEach(s=>s.classList.remove('is-selected')); c&&c.classList.add('is-selected'); } catch(_){ } syncSummary(); });
  trimColorEl.addEventListener('change', (e)=>{ state.trimColor = e.target.value; if(trimSelectedLabel) trimSelectedLabel.textContent = state.trimColor.charAt(0).toUpperCase()+state.trimColor.slice(1); try { const c=trimSwatchList?.querySelector(`[data-color="${state.trimColor}"]`); trimSwatchList?.querySelectorAll('.swatch').forEach(s=>s.classList.remove('is-selected')); c&&c.classList.add('is-selected'); } catch(_){ } syncSummary(); });
  $$('input[name="set"]').forEach(r=> r.addEventListener('change', (e)=>{ state.set = e.target.value; syncSummary(); }));
  $$('input[name="pattern"]').forEach(r=> r.addEventListener('change', (e)=>{ state.pattern = e.target.value; syncSummary(); }));
  heelPadEl.addEventListener('change', (e)=>{ state.heelPad = e.target.checked; syncSummary(); });
  thirdRowEl.addEventListener('change', (e)=>{ state.thirdRow = e.target.checked; syncSummary(); });

  // Quantity controls
  if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
    const clamp = (n)=> Math.max(1, Math.min(99, Number.isFinite(n)? n : 1));
    qtyMinusBtn.addEventListener('click', ()=>{ qtyInput.value = clamp(Number(qtyInput.value)-1); state.qty = Number(qtyInput.value); calcSubtotal(); });
    qtyPlusBtn.addEventListener('click', ()=>{ qtyInput.value = clamp(Number(qtyInput.value)+1); state.qty = Number(qtyInput.value); calcSubtotal(); });
    qtyInput.addEventListener('input', ()=>{ state.qty = clamp(Number(qtyInput.value)); qtyInput.value = state.qty; calcSubtotal(); });
  }

  // Prefill from URL or localStorage
  (function prefill(){
    const params = new URLSearchParams(location.search);
    const ls = JSON.parse(localStorage.getItem('counstructorUserData')||'{}');
    state.make = params.get('make') || ls.carMake || state.make;
    state.model = params.get('model') || ls.carModel || state.model;
    state.year = params.get('year') || ls.carYear || state.year;
    if (state.year) {
      yearEl.value = state.year;
      try { __cfgYearNS && __cfgYearNS.update && __cfgYearNS.update(); } catch(_){}
    }
    loadMakes().then(()=>{
      const homepageMake = document.getElementById('car-make');
      if (homepageMake) {
        // find makeId by text
        const option = Array.from(makeEl.options).find(o=>o.textContent===state.make);
        if (option) {
          makeEl.value = option.value;
          const evt = new Event('change', {bubbles:true});
          makeEl.dispatchEvent(evt);
          // after models load, set model
          setTimeout(()=>{
            if (state.model) {
              modelEl.value = state.model;
              try { __cfgModelNS && __cfgModelNS.update && __cfgModelNS.update(); } catch(_){ }
              const ev2 = new Event('change', { bubbles: true });
              modelEl.dispatchEvent(ev2);
            }
          }, 800);
        }
      }
    });
  })();

  loadColors();
  loadEligibility();
  syncSummary();

  // Cart actions
  function toCartItem(){
    return { ...state };
  }
  function ensureVehicleSelected(){
    const ok = Boolean(state.make && state.model && state.year);
    if (!ok) {
      alert('Please select Make, Model and Year first.');
    }
    return ok;
  }
  addBtn.addEventListener('click', async ()=>{
    if (!ensureVehicleSelected()) return;
    const module = await import('./cart.js');
    module.Cart.add({ ...toCartItem() });
    window.location.href = '/cart.html';
  });
  buyBtn.addEventListener('click', async ()=>{
    if (!ensureVehicleSelected()) return;
    const module = await import('./cart.js');
    module.Cart.add({ ...toCartItem() });
    window.location.href = '/order.html';
  });

  // modal open on thumbnail click
  (function enableModal(){
    const thumbs = document.querySelectorAll('.configurator__thumbnails img, .configurator__main-image img');
    function openModal(src){
      if (window.tingle) {
        const modal = new tingle.modal({ footer: false, closeMethods: ['overlay','escape','button'] });
        modal.setContent(`<img src="${src}" style="max-width:100%;height:auto;display:block;margin:0 auto;" alt="">`);
        modal.open();
      } else {
        // fallback
        const w = window.open(src, '_blank'); if (w) w.focus();
      }
    }
    thumbs.forEach(el=> el.addEventListener('click', ()=> openModal(el.src)));
  })();
});


