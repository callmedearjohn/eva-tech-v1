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

  let PRICES = { front: 59, full: 139, complete: 219 };
  const THIRD_ROW_SURCHARGE = 40;

  const state = {
    make: '', model: '', year: '',
    set: 'front', pattern: 'diamond',
    matColor: '', trimColor: '',
    heelPad: false, thirdRow: false,
    thirdRowEligible: false,
    qty: 1,
    subtotal: 0
  };
  // Simple modes for non-vehicle products (EVA Carsbag / EVA Home Mat)
  const paramsProduct = new URLSearchParams(location.search).get('product');
  const simpleMode = paramsProduct === 'carsbag' || paramsProduct === 'home';
  const productLabel = paramsProduct === 'carsbag' ? 'EVA Carsbag' : paramsProduct === 'home' ? 'EVA Home Mat' : 'EVA Car Mats';

  if (simpleMode) {
    try { const titleEl = document.querySelector('.section__title'); if (titleEl) titleEl.textContent = `Configure ${productLabel}`; } catch(_){ }
    try { const vehicleBlock = document.getElementById('cfg-make')?.closest('.cfg-block'); if (vehicleBlock) vehicleBlock.style.display = 'none'; if (requireVehicleMsg) requireVehicleMsg.style.display='none'; } catch(_){ }
    try {
      const setBlock = document.querySelector('.cfg-sets')?.closest('.cfg-block');
      const setTitle = setBlock?.querySelector('.cfg-title');
      if (setTitle) setTitle.textContent = 'Configuration size';
      const setRow = document.querySelector('.cfg-sets');
      if (setRow) {
        const sizeParam = (new URLSearchParams(location.search).get('size')||'').toLowerCase();
        if (paramsProduct === 'carsbag') {
          // Cars Bags: 2 sizes (M, L)
          PRICES = { front: 49, full: 69 };
          const initial = (sizeParam==='full' ? 'full' : 'front');
          state.set = initial;
          setRow.innerHTML = [
            `<label class="cfg-radio"><input type="radio" name="set" value="front" ${initial==='front'?'checked':''}><span>M — 49$</span></label>`,
            `<label class="cfg-radio"><input type="radio" name="set" value="full" ${initial==='full'?'checked':''}><span>L — 69$</span></label>`
          ].join('');
        } else if (paramsProduct === 'home') {
          // Home mats: 4 sizes (S, M, L, XL)
          PRICES = { front: 24, full: 29, complete: 34, xl: 39 };
          const allowed = ['front','full','complete','xl'];
          const initial = allowed.includes(sizeParam) ? sizeParam : 'front';
          state.set = initial;
          setRow.innerHTML = [
            `<label class="cfg-radio"><input type="radio" name="set" value="front" ${initial==='front'?'checked':''}><span>S (11.5 × 19.5) — 24$</span></label>`,
            `<label class="cfg-radio"><input type="radio" name="set" value="full" ${initial==='full'?'checked':''}><span>M (15.5 × 23.5) — 29$</span></label>`,
            `<label class="cfg-radio"><input type="radio" name="set" value="complete" ${initial==='complete'?'checked':''}><span>L (19.5 × 26) — 34$</span></label>`,
            `<label class="cfg-radio"><input type="radio" name="set" value="xl" ${initial==='xl'?'checked':''}><span>XL (24 × 32) — 39$</span></label>`
          ].join('');
        }
        // Rebind listeners for newly injected radios
        document.querySelectorAll('input[name="set"]').forEach(r=> r.addEventListener('change', (e)=>{ state.set = e.target.value; syncSummary(); }));
      }
    } catch(_){ }
    try { const patternBlock = document.querySelector('.cfg-patterns')?.closest('.cfg-block'); if (patternBlock) patternBlock.style.display='none'; } catch(_){ }
    try { const optionsBlock = document.getElementById('cfg-heelpad')?.closest('.cfg-block'); if (optionsBlock) optionsBlock.style.display='none'; } catch(_){ }
    // Show trim color for simple products (Carsbag/Home)
    try { const trimGroup = document.getElementById('cfg-trim-color')?.closest('.color-group'); if (trimGroup) trimGroup.style.display=''; } catch(_){ }
    try { if (summaryVehicleEl) summaryVehicleEl.textContent = `Product: ${productLabel}`; if (vehicleSummaryEl) vehicleSummaryEl.textContent = `${productLabel}`; } catch(_){ }
    try {
      const preview = document.getElementById('preview-image');
      const thumbsWrap = document.querySelector('.configurator__thumbnails');
      const carsbagImgs = [
        './static/images/car-bags/bag-1.jpg',
        './static/images/car-bags/bag-2.jpg',
        './static/images/car-bags/bag-3.jpg',
        './static/images/car-bags/bag-4.jpg',
        './static/images/car-bags/bag-5.jpg',
        './static/images/car-bags/bag-6.jpg'
      ];
      const homeImgs = [
        './static/images/home-mats/mat-1.jpg',
        './static/images/home-mats/mat-2.jpg',
        './static/images/home-mats/mat-3.jpg',
        './static/images/home-mats/mat-4.jpg'
      ];
      const imgs = paramsProduct === 'carsbag' ? carsbagImgs : homeImgs;
      if (preview) preview.src = imgs[0];
      if (thumbsWrap) {
        thumbsWrap.innerHTML = imgs.map(src=>`<img src="${src}" alt="thumb">`).join('');
      }
      if (patternOverlay) patternOverlay.style.display='none';
    } catch(_){ }
  }

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
      const data = await res.json();
      // Normalize to array of { make, model, from, to } rules
      eligible = Array.isArray(data)
        ? (typeof data[0] === 'string'
            // backward compatibility: ["make|model"] → wide-open year range
            ? data.map((s) => {
                const parts = String(s || '').split('|');
                return {
                  make: (parts[0] || '').trim().toLowerCase(),
                  model: (parts[1] || '').trim().toLowerCase(),
                  from: 1900,
                  to: 3000
                };
              })
            // new schema: array of objects
            : data.map((r) => ({
                make: String(r.make || '').trim().toLowerCase(),
                model: String(r.model || '').trim().toLowerCase(),
                from: Number(r.from) || 1900,
                to: Number(r.to) || 3000
              })))
        : [];
    } catch (e) { eligible = []; }
    // Re-evaluate eligibility when data arrives
    try { updateEligibility(); } catch(_){}
  }

  function updateEligibility() {
    const hasVehicle = Boolean(state.make && state.model && state.year);
    if (!hasVehicle) {
      state.thirdRowEligible = false;
      if (thirdRowEl) thirdRowEl.disabled = true;
      if (thirdRowEl) thirdRowEl.checked = false;
      if (thirdRowNote) thirdRowNote.style.display = 'none';
      return;
    }
    const make = String(state.make).toLowerCase();
    const model = String(state.model).toLowerCase();
    const year = Number(state.year);
    const rules = (eligible || []).filter((r) => r.make === make && r.model === model);
    const ok = rules.some((r) => year >= r.from && year <= r.to);
    state.thirdRowEligible = ok;
    if (thirdRowEl) {
      thirdRowEl.disabled = !ok;
      if (!ok) thirdRowEl.checked = false;
    }
    if (thirdRowNote) thirdRowNote.style.display = ok ? 'none' : 'block';
    try { updateThirdRowLabel(); } catch(_){}
  }

  function updateThirdRowLabel(){
    const labelSpan = thirdRowEl?.closest('label')?.querySelector('span');
    if (!labelSpan) return;
    const base = '3rd row';
    if (!state.thirdRowEligible) {
      labelSpan.textContent = `${base} (eligible models only)`;
      return;
    }
    if (state.set === 'complete') {
      labelSpan.textContent = `${base} (included)`;
    } else {
      labelSpan.textContent = `${base} (+${THIRD_ROW_SURCHARGE}$)`;
    }
  }

  function calcSubtotal() {
    let subtotal = PRICES[state.set];
    if (state.thirdRow && state.thirdRowEligible && state.set !== 'complete') {
      subtotal += THIRD_ROW_SURCHARGE; // nominal surcharge for 3rd row when not included
    }
    state.subtotal = subtotal;
    const total = subtotal * Math.max(1, Number(state.qty || 1));
    summarySubtotalEl.textContent = String(total);
    freeShipEl.style.display = subtotal >= 100 ? 'block' : 'none';
    if (vehicleSummaryEl) {
      const hasVehicle = Boolean(state.make && state.model && state.year);
      const mm = hasVehicle ? [state.make, state.model, state.year].join(' ') : '—';
      vehicleSummaryEl.textContent = `Make/Model/Price: ${mm}${hasVehicle? ' - ' : ' '}${hasVehicle? subtotal+'$' : ''}`.trim();
    }
  }

  function syncSummary() {
    if (simpleMode) {
      summaryVehicleEl.textContent = `Product: ${productLabel}`;
    } else {
      summaryVehicleEl.textContent = `Vehicle: ${state.make || '—'} ${state.model || ''} ${state.year || ''}`.trim();
    }
    summaryListEl.innerHTML = '';
    const setNames = simpleMode
      ? (paramsProduct === 'carsbag'
          ? { front: 'Size: M', full: 'Size: L' }
          : { front: 'Size: S (11.5 × 19.5)', full: 'Size: M (15.5 × 23.5)', complete: 'Size: L (19.5 × 26)', xl: 'Size: XL (24 × 32)' })
      : { front: 'Front only (2 mats)', full: 'Full interior', complete: 'Complete set' };
    const items = [];
    items.push(`${setNames[state.set]}`);
    if (!simpleMode) {
      if (state.thirdRow) {
        if (state.set === 'complete') {
          items.push('3rd row included');
        } else {
          items.push(`3rd row add-on (+${THIRD_ROW_SURCHARGE}$)`);
        }
      }
      items.push(`Pattern: ${state.pattern}`);
    }
    items.push(`Mat: ${state.matColor || '—'}`);
    // Always show trim selection (enabled for simple products too)
    items.push(`Trim: ${state.trimColor || '—'}`);
    if (!simpleMode) {
      if (state.heelPad) items.push('Heel pad (free)');
    }
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

    // gallery swap by color (only for car mats)
    if (!simpleMode) {
      try {
        const mainImg = document.getElementById('preview-image');
        const thumbs = document.querySelectorAll('.configurator__thumbnails img');
        if (state.matColor) {
          const baseList = [
            `./static/images/price-constructor/color-combinations/${state.matColor}-${state.trimColor||state.matColor}.jpg`,
            `./static/images/price-constructor/color-combinations/${state.matColor}-${state.matColor}.jpg`,
            `./static/images/price-constructor/color-combinations/${state.matColor}-black.jpg`,
            `./static/images/work-examples/1.jpg`
          ];
          function tryNext(list){
            if (!list.length) return;
            const src = list[0];
            if (mainImg) mainImg.src = src;
            if (mainImg) {
              mainImg.onerror = () => tryNext(list.slice(1));
              mainImg.onload = () => { thumbs.forEach(t=> t.src = src); };
            }
          }
          tryNext(baseList);
        }
      } catch(_) {}
    }
  }

  // Listeners
  if (makeEl) makeEl.addEventListener('change', async (e)=>{
    const makeId = e.target.value;
    state.make = e.target.options[e.target.selectedIndex]?.textContent || '';
    await loadModelsByMake(makeId);
    state.model = '';
    updateEligibility();
    syncSummary();
  });
  if (modelEl) modelEl.addEventListener('change', (e)=>{ state.model = e.target.value; updateEligibility(); syncSummary(); });
  if (yearEl) yearEl.addEventListener('change', (e)=>{ state.year = e.target.value; updateEligibility(); syncSummary(); });
  if (matColorEl) matColorEl.addEventListener('change', (e)=>{ state.matColor = e.target.value; if(matSelectedLabel) matSelectedLabel.textContent = state.matColor.charAt(0).toUpperCase()+state.matColor.slice(1); try { const c=matSwatchList?.querySelector(`[data-color="${state.matColor}"]`); matSwatchList?.querySelectorAll('.swatch').forEach(s=>s.classList.remove('is-selected')); c&&c.classList.add('is-selected'); } catch(_){ } syncSummary(); });
  if (trimColorEl) trimColorEl.addEventListener('change', (e)=>{ state.trimColor = e.target.value; if(trimSelectedLabel) trimSelectedLabel.textContent = state.trimColor.charAt(0).toUpperCase()+state.trimColor.slice(1); try { const c=trimSwatchList?.querySelector(`[data-color="${state.trimColor}"]`); trimSwatchList?.querySelectorAll('.swatch').forEach(s=>s.classList.remove('is-selected')); c&&c.classList.add('is-selected'); } catch(_){ } syncSummary(); });
  $$('input[name="set"]').forEach(r=> r.addEventListener('change', (e)=>{ state.set = e.target.value; try { updateThirdRowLabel(); } catch(_){} syncSummary(); }));
  $$('input[name="pattern"]').forEach(r=> r.addEventListener('change', (e)=>{ state.pattern = e.target.value; syncSummary(); }));
  if (heelPadEl) heelPadEl.addEventListener('change', (e)=>{ state.heelPad = e.target.checked; syncSummary(); });
  if (thirdRowEl) thirdRowEl.addEventListener('change', (e)=>{ state.thirdRow = e.target.checked; syncSummary(); });

  // Quantity controls
  if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
    const clamp = (n)=> Math.max(1, Math.min(99, Number.isFinite(n)? n : 1));
    qtyMinusBtn.addEventListener('click', ()=>{ qtyInput.value = clamp(Number(qtyInput.value)-1); state.qty = Number(qtyInput.value); calcSubtotal(); });
    qtyPlusBtn.addEventListener('click', ()=>{ qtyInput.value = clamp(Number(qtyInput.value)+1); state.qty = Number(qtyInput.value); calcSubtotal(); });
    qtyInput.addEventListener('input', ()=>{ state.qty = clamp(Number(qtyInput.value)); qtyInput.value = state.qty; calcSubtotal(); });
  }

  // Prefill from URL, fallback to localStorage saved on homepage submit
  (function prefill(){
    const params = new URLSearchParams(location.search);
    const urlMake = params.get('make');
    const urlModel = params.get('model');
    const urlYear = params.get('year');
    // fallback from localStorage
    let ls = {};
    try { ls = JSON.parse(localStorage.getItem('counstructorUserData')||'{}'); } catch(_){ ls = {}; }
    state.make = urlMake || ls.carMake || '';
    state.model = urlModel || ls.carModel || '';
    state.year = urlYear || ls.carYear || '';
    if (state.year) {
      yearEl.value = state.year;
      try { __cfgYearNS && __cfgYearNS.update && __cfgYearNS.update(); } catch(_){}
    }
    loadMakes().then(()=>{
      const normalize = (s)=> String(s||'').toLowerCase().trim();
      // Select make by visible text (preferred) or by value fallback
      let makeOpt = Array.from(makeEl.options).find(o=> normalize(o.textContent)===normalize(state.make))
        || Array.from(makeEl.options).find(o=> normalize(o.value)===normalize(state.make));
      if (makeOpt) {
        makeEl.value = makeOpt.value;
        state.make = makeOpt.textContent || makeOpt.value;
        try { __cfgMakeNS && __cfgMakeNS.update && __cfgMakeNS.update(); } catch(_){ }
        // Load models for this make (avoid double fetching and race)
        Promise.resolve(loadModelsByMake(makeOpt.value)).then(()=>{
          if (!state.model) return;
          const normalize = (s)=> String(s||'').toLowerCase().trim();
          let modelOpt = Array.from(modelEl.options).find(o=> normalize(o.textContent)===normalize(state.model))
            || Array.from(modelEl.options).find(o=> normalize(o.value)===normalize(state.model));
          if (!modelOpt) {
            // Inject the model if API didn't return it
            modelEl.insertAdjacentHTML('beforeend', `<option value="${state.model}">${state.model}</option>`);
            modelOpt = Array.from(modelEl.options).find(o=> normalize(o.value)===normalize(state.model));
          }
          if (modelOpt) {
            modelEl.value = modelOpt.value || modelOpt.textContent;
            state.model = modelOpt.value || modelOpt.textContent;
            updateEligibility();
            syncSummary();
            try { __cfgModelNS && __cfgModelNS.update && __cfgModelNS.update(); } catch(_){ }
          }
        });
      }
    });
  })();

  loadColors();
  // Heel pad gift preselected (checkbox may be hidden/removed)
  try { if (heelPadEl) { heelPadEl.checked = true; } state.heelPad = true; } catch(_){ }
  loadEligibility();
  syncSummary();

  // Cart actions
  function toCartItem(){
    if (simpleMode) {
      return {
        product: paramsProduct,
        set: state.set,
        matColor: state.matColor || '',
        trimColor: state.trimColor || '',
        qty: Math.max(1, Number(state.qty||1)),
        subtotal: PRICES[state.set] || 0
      };
    }
    return { product: 'mats', ...state };
  }
  function ensureVehicleSelected(){
    if (simpleMode) return true;
    const ok = Boolean(state.make && state.model && state.year);
    if (!ok) {
      alert('Please select Make, Model and Year first.');
    }
    return ok;
  }
  function ensureColorsSelected(){
    const missing = [];
    if (!state.matColor) missing.push('Mat color');
    if (!state.trimColor) missing.push('Trim color');
    if (missing.length) {
      alert(`Please select: ${missing.join(', ')}.`);
      return false;
    }
    return true;
  }
  addBtn.addEventListener('click', async ()=>{
    if (!ensureVehicleSelected() || !ensureColorsSelected()) return;
    const module = await import('./cart.js');
    module.Cart.add({ ...toCartItem() });
    window.location.href = '/cart';
  });
  buyBtn.addEventListener('click', async ()=>{
    if (!ensureVehicleSelected() || !ensureColorsSelected()) return;
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


