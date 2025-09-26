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
  const thirdRowContainer = document.getElementById('third-row-container');

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

  let PRICES = { front: 59, full: 139, complete: 219, premium_plus: 259 };
  const THIRD_ROW_SURCHARGE = 50;

  const state = {
    make: '', model: '', year: '',
    set: 'front', pattern: 'diamond',
    matColor: '', trimColor: '',
    heelPad: false, thirdRow: false,
    thirdRowEligible: false,
    hybrid: false,
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
    // Hide top vehicle banner for simple products
    try { const vt = document.querySelector('.vehicle-top'); if (vt) vt.style.display = 'none'; } catch(_){ }
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
    // Update Description tab content for Carsbag and Home products
    try {
      const descPane = document.getElementById('tab0');
      if (descPane) {
        if (paramsProduct === 'carsbag') {
          descPane.innerHTML = [
            '<p><strong>EVA CarsBag — the trunk organizer that keeps chaos on lockdown</strong></p>',
            '<p>Meet your new go-to cargo companion. Built from waterproof, odourless EVA with rigid walls, CarsBag keeps tools, emergency gear, detailing supplies, and groceries contained and upright — no leaks, no smells, no mess. Rinses clean in seconds and dries fast.</p>',
            '<p><strong>Stays put. Even when you don’t.</strong><br>A non-slip hook-and-loop base (rear attachment for carpeted trunks) prevents sliding in corners and hard braking, so your load doesn’t go flying. Safer, tidier, smarter.</p>',
            '<p><strong>Designed for real life</strong><br> • Two sizes: Medium for everyday essentials; Large for full toolkits and bulkier items. (Pick based on how you roll.)<br> • Zippered lid + reinforced carry handles — toss it in, zip it up, lift it out.<br> • Collapsible when empty to save space — folds flat in seconds.<br> • Optional divider to separate fluids and tools.<br> • Style it to match your mats with colour trims that actually look good in your trunk.</p>',
            '<p><strong>What it loves to carry</strong><br>Jump starter, compressor, tow strap, tools, washer fluid, cleaning kit, first-aid and roadside gear — plus the random weekend stuff that usually rolls around.</p>'
          ].join('');
        } else if (paramsProduct === 'home') {
          descPane.innerHTML = [
            '<p><strong>EVA Multi-Use Mat — one mat, many messes solved</strong></p>',
            '<p>Meet the all-season mat that traps mess before it spreads. Made from waterproof, odourless EVA, the deep rhombus cells lock in mud, sand, water and small debris below foot level, keeping surfaces clean and dry from winter slush to summer rain.</p>',
            '<p><strong>Why it’s better</strong><br> • All-season, all-purpose: stays elastic from −50 °C to +50 °C; won’t crack in cold or get soggy in heat.<br> • Waterproof & low-maintenance: closed-cell EVA doesn’t absorb water or odours; liquid stays contained until you pour it out.<br> • Rinse-and-go clean: shake to empty dry debris, then rinse — no special cleaners needed; dries quickly.<br> • Comfort & quiet: lightweight, slightly springy surface softens steps and adds a touch of sound dampening.<br> • Looks the part: pick colour trims that match your space.</p>',
            '<p><strong>Smart uses (beyond the door)</strong><br> • Pet zone: as a litter-catcher under cat boxes (traps granules) and a splash guard under food/water bowls.<br> • Kitchen & laundry: under dish racks to catch drips, by the sink, or as a floor protector near washers.<br> • Plants & hobbies: under planters to contain water/soil; as a craft or utility mat to keep floors clean.<br> • Entry & garage: mudrooms, balconies, patio doors, workshop corners — anywhere mess appears.</p>',
            '<p><strong>Set-up tips</strong><br> • On very smooth floors (polished tile/vinyl), add a non-slip underlay for extra grip.<br> • For kitchen use, place under racks or bowls; avoid direct contact with hot cookware straight from the oven/stove.</p>',
            '<p><strong>Sizes</strong><br>Available in multiple sizes; custom cuts on request to fit your space.</p>'
          ].join('');
        }
      }
    } catch(_){ }
    // Hide Before/After section for simple products (no relevance for bags/home)
    try { const ba = document.querySelector('.evabeforeafter'); if (ba) ba.style.display = 'none'; } catch(_){ }
    // Hide Options block (gift/third-row) for simple products
    try {
      const optionsBlock = document.querySelector('.gift-block')?.closest('.cfg-block');
      if (optionsBlock) optionsBlock.style.display = 'none';
    } catch(_){ }
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
    // Adjust upsell for simple products
    try {
      const list = document.querySelector('.upsell__list');
      if (list) {
        const itemCarMats = [
          '<div class="upsell__item">',
          '  <a href="configurator" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit;">',
          '    <img class="upsell__thumb" src="./static/images/work-examples/1.jpg" alt="EVA Car Mats">',
          '    <div class="upsell__info">',
          '      <div class="upsell__name">EVA Car Mats</div>',
          '      <div class="upsell__meta">Custom-fit interior</div>',
          '    </div>',
          '  </a>',
          '  <a class="button upsell__btn" href="configurator">Add</a>',
          '</div>'
        ].join('');
        const itemCarBags = [
          '<div class="upsell__item">',
          '  <a href="configurator?product=carsbag" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit;">',
          '    <img class="upsell__thumb" src="./static/images/car-bags/bag-1.jpg" alt="EVA Carsbag">',
          '    <div class="upsell__info">',
          '      <div class="upsell__name">EVA Carsbag</div>',
          '      <div class="upsell__meta">Sizes M / L</div>',
          '    </div>',
          '  </a>',
          '  <a class="button upsell__btn" href="configurator?product=carsbag">Add</a>',
          '</div>'
        ].join('');
        const itemHomeMat = [
          '<div class="upsell__item">',
          '  <a href="configurator?product=home" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit;">',
          '    <img class="upsell__thumb" src="./static/images/home-mats/mat-1.jpg" alt="EVA Home Mat">',
          '    <div class="upsell__info">',
          '      <div class="upsell__name">EVA Home Mat</div>',
          '      <div class="upsell__meta">Sizes S / M / L / XL</div>',
          '    </div>',
          '  </a>',
          '  <a class="button upsell__btn" href="configurator?product=home">Add</a>',
          '</div>'
        ].join('');

        if (paramsProduct === 'carsbag') {
          list.innerHTML = itemCarMats + itemHomeMat; // show Car Mats and Home Mat on Carsbag product
        } else if (paramsProduct === 'home') {
          list.innerHTML = itemCarBags + itemCarMats; // show both Carsbag and Car Mats
        }
      }
    } catch(_){ }
    // Adjust "Description / Specifications / Advantages" tab titles for simple products
    try {
      const tabs = document.querySelectorAll('.nav.nav-tabs .nav-link');
      if (tabs && tabs.length >= 3) {
        if (paramsProduct === 'carsbag') {
          tabs[0].textContent = 'Description';
          tabs[1].textContent = 'Specifications';
          tabs[2].textContent = 'Advantages';
        } else if (paramsProduct === 'home') {
          tabs[0].textContent = 'Description';
          tabs[1].textContent = 'Specifications';
          tabs[2].textContent = 'Advantages';
        }
      }
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
  for (let y = now.getFullYear(); y >= 1990; y--) {
    yearEl.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
  }
  try { __cfgYearNS && __cfgYearNS.update && __cfgYearNS.update(); } catch(_){ }

  // Makes & models via same API used on homepage script
  const marksUrl = 'https://api.auto.ria.com/categories/1/marks/';
  async function loadMakes() {
    // Reuse existing static options from homepage for stability
    const homepageMake = document.getElementById('car-make');
    if (homepageMake) {
      makeEl.innerHTML = homepageMake.innerHTML;
      try { __cfgMakeNS && __cfgMakeNS.update && __cfgMakeNS.update(); } catch(_){ }
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
      try { __cfgMakeNS && __cfgMakeNS.update && __cfgMakeNS.update(); } catch(_){ }
    }
  }
  async function loadModelsByMake(makeId) {
    modelEl.innerHTML = '<option selected disabled>Model</option>';
    try {
      const res = await fetch(`${marksUrl}${makeId}/models`);
      const models = await res.json();
      models.forEach(m => modelEl.insertAdjacentHTML('beforeend', `<option value="${m.name}">${m.name}</option>`));
    } catch(_) {}
    try { __cfgModelNS && __cfgModelNS.update && __cfgModelNS.update(); } catch(_){ }
  }

  // Allowed colors (filter any sources to these lists)
  // Sync with available layered assets in static/images/price-constructor/mats/*.png
  const ALLOWED_MAT_COLORS = [
    'black','gray','grey','blue','darkblue','brown','red','orange','yellow','beige',
    'salad','violet','pink','bronze','white'
  ];
  const ALLOWED_TRIM_COLORS = [
    'black','light-grey','darkgray','lightgray','grey','gray',
    'orange','red','blue','yellow','brown',
    'darkblue','darkgreen','salad','biruz','gold','pink','violet','velvet'
  ];

  // Colors from JSON (fallback to defaults)
  async function loadColors() {
    try {
      const res = await fetch('static/data/colors.json');
      const data = await res.json();
      const mats = (data.matColors||[]).map(String).map(s=>s.toLowerCase()).filter(c=> ALLOWED_MAT_COLORS.includes(c));
      const trims = (data.trimColors||[]).map(String).map(s=>s.toLowerCase()).filter(c=> ALLOWED_TRIM_COLORS.includes(c));
      matColorEl.innerHTML = '<option selected disabled>Choose</option>' + mats.map(c=>`<option value="${c}">${c}</option>`).join('');
      trimColorEl.innerHTML = '<option selected disabled>Choose</option>' + trims.map(c=>`<option value="${c}">${c}</option>`).join('');
      try { buildSwatches(matSwatchList, mats, 'mat'); buildSwatches(trimSwatchList, trims, 'trim'); } catch(_){ }
    } catch (e) {
      const mats = ALLOWED_MAT_COLORS;
      const trims = ALLOWED_TRIM_COLORS;
      matColorEl.innerHTML = '<option selected disabled>Choose</option>' + mats.map(c=>`<option value="${c}">${c}</option>`).join('');
      trimColorEl.innerHTML = '<option selected disabled>Choose</option>' + trims.map(c=>`<option value="${c}">${c}</option>`).join('');
      try { buildSwatches(matSwatchList, mats, 'mat'); buildSwatches(trimSwatchList, trims, 'trim'); } catch(_){ }
    }
    try {
      __cfgMatNS && __cfgMatNS.update && __cfgMatNS.update();
      __cfgTrimNS && __cfgTrimNS.update && __cfgTrimNS.update();
    } catch(_){ }
  }

  function buildSwatches(container, colors, type){
    if (!container) return;
    container.innerHTML = '';
    const colorToHex = {
      black:'#000000', gray:'#d9d9d9', grey:'#d9d9d9', 'light-grey':'#e5e5e5', lightgray:'#e5e5e5', darkgray:'#777777',
      blue:'#2b61c8', darkblue:'#124b9a',
      brown:'#8a5b3c', red:'#ff1a13', orange:'#ffa000', yellow:'#ffee00',
      beige:'#dcc48e', sand:'#d7c190',
      green:'#2c7a0b', darkgreen:'#185c2e', salad:'#7bc96f',
      cyan:'#4db3c8', biruz:'#2bb3a3',
      pink:'#ff5e9c', violet:'#6f1d8a', navy:'#0d2a52', gold:'#d4af37',
      velvet:'#333333'
    };
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

  // Map UI colors to asset filenames
  function getMatAssetKey(color){
    const n = String(color || '').toLowerCase();
    const map = {
      'black': 'black',
      'gray': 'gray',
      'grey': 'gray',
      'blue': 'blue',
      'darkblue': 'darkblue',
      'brown': 'brown',
      'red': 'red',
      'orange': 'orange',
      'yellow': 'yellow',
      'beige': 'beige',
      'salad': 'salad',
      'violet': 'violet',
      'pink': 'pink',
      'bronze': 'bronze',
      'white': 'white'
    };
    return map[n] || '';
  }
  function getTrimAssetKey(color){
    const n = String(color || '').toLowerCase();
    const map = {
      'black': 'black',
      'light-grey': 'lightgray',
      'grey': 'darkgray',
      'gray': 'darkgray',
      'orange': 'orange',
      'red': 'red',
      'blue': 'blue',
      'yellow': 'yellow',
      'violet': 'violet',
      'violete': 'violet',
      'velvet': 'black'
    };
    return map[n] || '';
  }

  // Ensure layered preview images exist and are styled
  function ensurePreviewLayers(){
    const container = document.querySelector('.configurator__main-image');
    if (!container) return { container: null, matLayer: null, trimLayer: null };
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    let matLayer = document.getElementById('mat-layer');
    let trimLayer = document.getElementById('trim-layer');
    // If wrappers exist, style them; else, fallback to absolute positioning
    const matWrap = matLayer?.parentElement;
    const trimWrap = trimLayer?.parentElement;
    if (matWrap && matWrap.classList.contains('mat-layer-wrap')) {
      matWrap.style.position = 'absolute';
      matWrap.style.left = '0';
      matWrap.style.top = '0';
      matWrap.style.right = '0';
      matWrap.style.bottom = '0';
      matWrap.style.zIndex = '3';
    }
    if (trimWrap && trimWrap.classList.contains('trim-layer-wrap')) {
      trimWrap.style.position = 'absolute';
      trimWrap.style.left = '0';
      trimWrap.style.top = '0';
      trimWrap.style.right = '0';
      trimWrap.style.bottom = '0';
      trimWrap.style.zIndex = '4';
    }
    if (matLayer) {
      matLayer.style.width = '100%';
      matLayer.style.height = 'auto';
      matLayer.style.pointerEvents = 'none';
      matLayer.style.display = 'none';
    }
    if (trimLayer) {
      trimLayer.style.width = '100%';
      trimLayer.style.height = 'auto';
      trimLayer.style.pointerEvents = 'none';
      trimLayer.style.display = 'none';
    }
    return { container, matLayer, trimLayer };
  }

  // Update preview using layered PNG assets for mats and trims; fallback to combo photos, then overlay tint
  function updatePreviewByColors(){
    try {
      if (simpleMode) return; // only for car mats
      // base image is not used; layered assets only
      const { matLayer, trimLayer } = ensurePreviewLayers();
      const matKey = getMatAssetKey(state.matColor);
      const trimKey = getTrimAssetKey(state.trimColor);

      // If we have both keys, try to load layered assets
      if (matKey || trimKey) {
        const baseMatSrc = matKey ? `./static/images/price-constructor/mats/${matKey}.png` : '';
        const baseTrimSrc = trimKey ? `./static/images/price-constructor/trims/${trimKey}.png` : '';

        let anyApplied = false;
        const tryLoad = (layer, src, onDone)=>{
          if (!layer || !src) { onDone && onDone(false); return; }
          const img = new Image();
          img.onload = function(){ layer.src = src; layer.style.display = ''; onDone && onDone(true); };
          img.onerror = function(){ layer.style.display = 'none'; onDone && onDone(false); };
          img.src = src;
        };

        let pending = 0;
        const done = (ok)=>{ anyApplied = anyApplied || ok; pending--; if (pending === 0) finalize(); };
        function finalize(){
          if (anyApplied && patternOverlay) patternOverlay.style.display = 'none';
          if (!anyApplied && patternOverlay) patternOverlay.style.display = '';
        }
        pending = 2;
        tryLoad(matLayer, baseMatSrc, done);
        tryLoad(trimLayer, baseTrimSrc, done);
        return; // layered approach only
      }

      // No combo photo fallback; show overlay tint when layers unavailable
      if (patternOverlay) patternOverlay.style.display = '';
    } catch(_) {}
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
    try { updateEligibility(); } catch(_){ }
  }

  function ensurePremiumPlusOption(){
    return;
    try {
      // Show Premium+ only for car mats (not for Carsbag or Home mats)
      if (simpleMode) return;
      const setsRow = document.querySelector('.cfg-sets');
      if (!setsRow) return;
      let premiumLabel = setsRow.querySelector('input[name="set"][value="premium_plus"]')?.closest('label') || null;
      if (state.thirdRowEligible) {
        if (!premiumLabel) {
          const html = [
            '<label class="cfg-radio" data-premium-plus>',
            '  <input type="radio" name="set" value="premium_plus">',
            '  <span>',
            '    <strong>Premium + — Front & 2d row & 3d row & Trunk</strong>',
            '    <span class="price-line"><span class="price-old">269$</span><span>259$</span><span class="badge-promo">Promo</span></span>',
            '  </span>',
            '</label>'
          ].join('');
          setsRow.insertAdjacentHTML('beforeend', html);
          // bind listener
          const input = setsRow.querySelector('input[name="set"][value="premium_plus"]');
          if (input) input.addEventListener('change', (e)=>{ state.set = e.target.value; state.thirdRow = true; try { if (thirdRowEl){ thirdRowEl.checked = true; thirdRowEl.disabled = true; } } catch(_){} try { updateThirdRowLabel(); } catch(_){} syncSummary(); });
        }
      } else if (premiumLabel) {
        // If currently selected, fallback to 'complete'
        const selected = setsRow.querySelector('input[name="set"][value="premium_plus"]')?.checked;
        premiumLabel.remove();
        if (selected) {
          const fallback = setsRow.querySelector('input[name="set"][value="complete"]');
          if (fallback) { fallback.checked = true; state.set = 'complete'; }
        }
        try { if (thirdRowEl) { thirdRowEl.disabled = true; thirdRowEl.checked = false; } } catch(_){}
      }
    } catch(_){ }
  }

  function updateEligibility() {
    const hasVehicle = Boolean(state.make && state.model && state.year);
    if (!hasVehicle) {
      state.thirdRowEligible = false;
      if (thirdRowEl) thirdRowEl.disabled = true;
      if (thirdRowEl) thirdRowEl.checked = false;
      if (thirdRowNote) thirdRowNote.style.display = 'none';
      if (thirdRowContainer) thirdRowContainer.style.display = 'none';
      try { ensurePremiumPlusOption(); } catch(_){}
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
    if (thirdRowContainer) thirdRowContainer.style.display = ok ? '' : 'none';
    try { ensurePremiumPlusOption(); } catch(_){}
    try { updateThirdRowLabel(); } catch(_){ }
  }

  function updateThirdRowLabel(){
    const labelSpan = thirdRowEl?.closest('label')?.querySelector('span');
    if (!labelSpan) return;
    const base = '3rd row';
    if (!state.thirdRowEligible) {
      labelSpan.textContent = `${base} (eligible models only)`;
      return;
    }
    if (state.set === 'complete' || state.set === 'premium_plus') {
      labelSpan.textContent = `${base} (included)`;
    } else {
      labelSpan.textContent = `${base} (+${THIRD_ROW_SURCHARGE}$)`;
    }
  }

  function calcSubtotal() {
    let subtotal = PRICES[state.set];
    if (state.thirdRow && state.thirdRowEligible && state.set !== 'complete' && state.set !== 'premium_plus') {
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
      : { front: 'Front only (2 mats)', full: 'Full interior', complete: 'Complete set', premium_plus: 'Premium Plus — Full interior + Trunk' };
    const items = [];
    items.push(`${setNames[state.set]}`);
    if (!simpleMode) {
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

    // preview updates: color-combo image if available; otherwise pattern overlay tint
    try { updatePreviewByColors(); } catch(_) {}
    // pattern overlay tint (active only if not hidden by updatePreviewByColors)
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
    } catch(_){ }

    // Keep gallery as in-car photos; do not swap to isolated color-combo images
  }

  // Inline validation helpers for vehicle selects
  function getNiceSelectWrap(el){
    const sib = el && el.nextElementSibling;
    return sib && sib.classList && sib.classList.contains('nice-select') ? sib : null;
  }
  function setInvalid(el, invalid){
    if (!el) return;
    el.classList.toggle('cfg-invalid', Boolean(invalid));
    const wrap = getNiceSelectWrap(el);
    if (wrap) wrap.classList.toggle('cfg-invalid', Boolean(invalid));
  }
  function focusInvalid(el){
    if (!el) return;
    const wrap = getNiceSelectWrap(el) || el;
    try { wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_){ }
    try { el.focus && el.focus(); } catch(_){ }
    try { wrap.classList.add('cfg-shake'); setTimeout(()=> wrap.classList.remove('cfg-shake'), 500); if (wrap !== el) wrap.click(); } catch(_){ }
  }

  // Listeners
  if (makeEl) makeEl.addEventListener('change', async (e)=>{
    const makeId = e.target.value;
    state.make = e.target.options[e.target.selectedIndex]?.textContent || '';
    await loadModelsByMake(makeId);
    state.model = '';
    updateEligibility();
    syncSummary();
    setInvalid(makeEl, false);
    if (requireVehicleMsg) requireVehicleMsg.style.display = 'none';
  });
  if (modelEl) modelEl.addEventListener('change', (e)=>{ state.model = e.target.value; updateEligibility(); syncSummary(); setInvalid(modelEl, false); if (requireVehicleMsg) requireVehicleMsg.style.display = 'none'; });
  if (yearEl) yearEl.addEventListener('change', (e)=>{ state.year = e.target.value; updateEligibility(); syncSummary(); setInvalid(yearEl, false); if (requireVehicleMsg) requireVehicleMsg.style.display = 'none'; });
  if (matColorEl) matColorEl.addEventListener('change', (e)=>{ state.matColor = e.target.value; if(matSelectedLabel) matSelectedLabel.textContent = state.matColor.charAt(0).toUpperCase()+state.matColor.slice(1); try { const c=matSwatchList?.querySelector(`[data-color="${state.matColor}"]`); matSwatchList?.querySelectorAll('.swatch').forEach(s=>s.classList.remove('is-selected')); c&&c.classList.add('is-selected'); } catch(_){ } syncSummary(); });
  if (trimColorEl) trimColorEl.addEventListener('change', (e)=>{ state.trimColor = e.target.value; if(trimSelectedLabel) trimSelectedLabel.textContent = state.trimColor.charAt(0).toUpperCase()+state.trimColor.slice(1); try { const c=trimSwatchList?.querySelector(`[data-color="${state.trimColor}"]`); trimSwatchList?.querySelectorAll('.swatch').forEach(s=>s.classList.remove('is-selected')); c&&c.classList.add('is-selected'); } catch(_){ } syncSummary(); });
  $$('input[name="set"]').forEach(r=> r.addEventListener('change', (e)=>{ state.set = e.target.value; try { updateThirdRowLabel(); } catch(_){} syncSummary(); }));
  $$('input[name="pattern"]').forEach(r=> r.addEventListener('change', (e)=>{ state.pattern = e.target.value; syncSummary(); }));
  if (heelPadEl) heelPadEl.addEventListener('change', (e)=>{ state.heelPad = e.target.checked; syncSummary(); });
  if (thirdRowEl) thirdRowEl.addEventListener('change', (e)=>{ state.thirdRow = e.target.checked; syncSummary(); });
  const hybridEl = document.getElementById('cfg-hybrid');
  if (hybridEl) hybridEl.addEventListener('change', (e)=>{ state.hybrid = e.target.checked; syncSummary(); });

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
      try { __cfgYearNS && __cfgYearNS.update && __cfgYearNS.update(); } catch(_){ }
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
    // clear previous marks
    [makeEl, modelEl, yearEl].forEach((el)=> setInvalid(el, false));
    if (requireVehicleMsg) requireVehicleMsg.style.display = 'none';

    const missing = [];
    if (!state.make) missing.push(makeEl);
    if (!state.model) missing.push(modelEl);
    if (!state.year) missing.push(yearEl);

    if (missing.length) {
      missing.forEach((el)=> setInvalid(el, true));
      if (requireVehicleMsg) requireVehicleMsg.style.display = '';
      focusInvalid(missing[0]);
      return false;
    }
    return true;
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
    // Build a temporary checkout-only cart for PayPal
    const item = toCartItem();
    const qty = Math.max(1, Number(state.qty||1));
    const price = Number(item.subtotal||0);
    const subtotal = price * qty;
    const shipping = subtotal >= 100 ? 0 : 22;
    const taxRate = 0; // optional: fetch tax like cart page if needed
    const tax = +((subtotal * (taxRate||0) / 100)).toFixed(2);
    const total = (subtotal + shipping + tax).toFixed(2);

    if (!window.paypal || !window.paypal.Buttons) {
      // Fallback to cart if SDK not loaded
      const module = await import('./cart.js');
      module.Cart.add({ ...toCartItem() });
      window.location.href = '/cart';
      return;
    }
    // Create a lightweight container for the popup if not present
    let container = document.getElementById('paypal-quickbuy');
    if (!container) {
      container = document.createElement('div');
      container.id = 'paypal-quickbuy';
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.background = 'rgba(0,0,0,.4)';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.overflowY = 'auto';
      container.style.webkitOverflowScrolling = 'touch';
      container.style.zIndex = '9999';
      container.innerHTML = '<div id="paypal-quickbuy-inner" style="background:#fff;padding:16px;border-radius:10px; min-width:320px; max-width:420px; width:90%; max-height:90vh; overflow:auto; -webkit-overflow-scrolling:touch;"><div style="position:sticky; top:0; background:#fff; padding-bottom:10px; margin:-16px -16px 10px -16px; border-bottom:1px solid #eee; border-top-left-radius:10px; border-top-right-radius:10px; display:flex;justify-content:space-between;align-items:center;"><strong style="padding-left:16px;">Fast checkout</strong><button type="button" id="paypal-quickbuy-close" style="width:auto;background:none;border:0;font-size:20px;cursor:pointer;line-height:1; padding:10px 12px;">×</button></div><div style="padding:0 0 8px 0"><div id="paypal-quickbuy-button"></div></div><p class="note" style="font-size:12px;color:#666;margin-top:10px;">PayPal will ask for your shipping address.</p></div>';
      document.body.appendChild(container);
      container.addEventListener('click', (e)=>{ if (e.target === container) container.remove(); });
      const closeBtn = document.getElementById('paypal-quickbuy-close');
      if (closeBtn) closeBtn.addEventListener('click', ()=> container.remove());
    }
    const mount = document.getElementById('paypal-quickbuy-button');
    if (mount) mount.innerHTML = '';

    paypal.Buttons({
      style: { layout: 'vertical' },
      createOrder: function(data, actions) {
        // For PayPal to collect shipping address, request shipping in the purchase unit
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'CAD',
              value: total,
              breakdown: {
                item_total: { currency_code: 'CAD', value: subtotal.toFixed(2) },
                shipping: { currency_code: 'CAD', value: shipping.toFixed(2) },
                tax_total: { currency_code: 'CAD', value: tax.toFixed(2) }
              }
            },
            items: [{
              name: (item.product === 'mats' ? `${item.make} ${item.model} ${item.year}` : (item.product === 'carsbag' ? 'EVA Carsbag' : 'EVA Home Mat')).slice(0,127),
              unit_amount: { currency_code: 'CAD', value: (price).toFixed(2) },
              quantity: String(qty)
            }],
            shipping: { // request shipping address in experience flow
              type: 'SHIPPING'
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(async function(details) {
          const payload = {
            formName:'paypal',
            paypalOrderId: details.id,
            payerEmail: details.payer?.email_address || '',
            payerName: `${details.payer?.name?.given_name||''} ${details.payer?.name?.surname||''}`.trim(),
            shipTo: {
              name: details.purchase_units?.[0]?.shipping?.name?.full_name || '',
              line1: details.purchase_units?.[0]?.shipping?.address?.address_line_1 || '',
              line2: details.purchase_units?.[0]?.shipping?.address?.address_line_2 || '',
              city: details.purchase_units?.[0]?.shipping?.address?.admin_area_2 || '',
              state: details.purchase_units?.[0]?.shipping?.address?.admin_area_1 || '',
              postal: details.purchase_units?.[0]?.shipping?.address?.postal_code || '',
              country: details.purchase_units?.[0]?.shipping?.address?.country_code || ''
            },
            items: [{ ...item, qty, subtotal: price }],
            subtotal, shipping, addons: [], addonsTotal: 0, tax, total: Number(total), discountPercent: 0, discountAmount: 0, promoCode: ''
          };
          try { await fetch('action.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); } catch(_) {}
          try { const modal = document.getElementById('paypal-quickbuy'); modal && modal.remove(); } catch(_) {}
          alert('Payment captured. Thank you! A confirmation email has been sent.');
        });
      },
      onCancel: function(){ try { const modal = document.getElementById('paypal-quickbuy'); modal && modal.remove(); } catch(_) {} },
      onError: function(){ try { const modal = document.getElementById('paypal-quickbuy'); modal && modal.remove(); } catch(_) {} }
    }).render('#paypal-quickbuy-button');
  });

  // Mobile lightbox with swipe + gentle animation
  (function enableMobileLightbox(){
    const mql = window.matchMedia('(max-width: 768px)');
    const lightbox = document.getElementById('mobile-lightbox');
    const closeBtn = lightbox ? lightbox.querySelector('.mobile-lightbox__close') : null;
    const wrap = lightbox ? lightbox.querySelector('.swiper-wrapper') : null;
    let swiper;

    function getGallerySources(){
      const imgs = Array.from(document.querySelectorAll('.configurator__thumbnails img'));
      return imgs.map(i=> i.src);
    }
    function openAt(index){
      if (!lightbox || !wrap) return;
      const srcs = getGallerySources();
      wrap.innerHTML = srcs.map(s=> `<div class="swiper-slide"><img src="${s}" alt=""></div>`).join('');
      if (swiper) { try { swiper.destroy(true, true); } catch(_){} swiper = null; }
      swiper = new Swiper('.mobile-lightbox__swiper', {
        initialSlide: Math.max(0, Math.min(index, srcs.length-1)),
        navigation: { nextEl: '.mobile-lightbox .swiper-button-next', prevEl: '.mobile-lightbox .swiper-button-prev' },
        spaceBetween: 12
      });
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
    }
    function close(){
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      if (swiper) { try { swiper.destroy(true, true); } catch(_){} swiper = null; }
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (lightbox) lightbox.addEventListener('click', (e)=>{ if (e.target === lightbox) close(); });

    // Hook thumbnail clicks on mobile only
    function bindThumbs(){
      const thumbs = document.querySelectorAll('.configurator__thumbnails img, .configurator__main-image img');
      thumbs.forEach((el, idx)=>{
        el.addEventListener('click', (ev)=>{
          if (mql.matches) {
            ev.preventDefault();
            openAt(idx);
          } else {
            // desktop: keep existing tingle fallback (if present)
            if (window.tingle) {
              const modal = new tingle.modal({ footer:false, closeMethods:['overlay','escape','button'] });
              modal.setContent(`<img src="${el.src}" style="max-width:100%;height:auto;display:block;margin:0 auto;" alt="">`);
              modal.open();
            } else {
              const w = window.open(el.src, '_blank'); if (w) w.focus();
            }
          }
        });
      });
    }
    bindThumbs();
  })();
});


