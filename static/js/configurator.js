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

  const PRICES = { front: 59, full: 139, complete: 219 };

  const state = {
    make: '', model: '', year: '',
    set: 'front', pattern: 'honeycomb',
    matColor: '', trimColor: '',
    heelPad: false, thirdRow: false,
    thirdRowEligible: false
  };

  // NiceSelect binding if available
  try {
    if (window.NiceSelect) {
      window.NiceSelect.bind(makeEl);
      window.NiceSelect.bind(modelEl);
      window.NiceSelect.bind(yearEl);
      window.NiceSelect.bind(matColorEl);
      window.NiceSelect.bind(trimColorEl);
    }
  } catch(_) {}

  // Years
  const now = new Date();
  for (let y = 1990; y <= now.getFullYear(); y++) {
    yearEl.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
  }

  // Makes & models via same API used on homepage script
  const marksUrl = 'https://api.auto.ria.com/categories/1/marks/';
  async function loadMakes() {
    // Reuse existing static options from homepage for stability
    const homepageMake = document.getElementById('car-make');
    if (homepageMake) {
      makeEl.innerHTML = homepageMake.innerHTML;
      if (window.NiceSelect) window.NiceSelect.bind(makeEl);
    }
  }
  async function loadModelsByMake(makeId) {
    modelEl.innerHTML = '<option selected disabled>Model</option>';
    const res = await fetch(`${marksUrl}${makeId}/models`);
    const models = await res.json();
    models.forEach(m => modelEl.insertAdjacentHTML('beforeend', `<option value="${m.name}">${m.name}</option>`));
    if (window.NiceSelect) window.NiceSelect.bind(modelEl);
  }

  // Colors from JSON (fallback to defaults)
  async function loadColors() {
    try {
      const res = await fetch('static/data/colors.json');
      const data = await res.json();
      matColorEl.innerHTML = '<option selected disabled>Choose</option>' + data.matColors.map(c=>`<option value="${c}">${c}</option>`).join('');
      trimColorEl.innerHTML = '<option selected disabled>Choose</option>' + data.trimColors.map(c=>`<option value="${c}">${c}</option>`).join('');
    } catch (e) {
      const mats = ['Black','Grey','Blue','Brown','Red','Beige'];
      const trims = ['Black','Blue','Red','Grey','Beige','Brown'];
      matColorEl.innerHTML = '<option selected disabled>Choose</option>' + mats.map(c=>`<option value="${c.toLowerCase()}">${c}</option>`).join('');
      trimColorEl.innerHTML = '<option selected disabled>Choose</option>' + trims.map(c=>`<option value="${c.toLowerCase()}">${c}</option>`).join('');
    }
    if (window.NiceSelect) { window.NiceSelect.bind(matColorEl); window.NiceSelect.bind(trimColorEl); }
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
    const key = `${state.make}|${state.model}`.toLowerCase();
    state.thirdRowEligible = eligible.includes(key);
    thirdRowEl.disabled = !state.thirdRowEligible;
    thirdRowEl.checked = state.thirdRowEligible ? thirdRowEl.checked : false;
    thirdRowNote.style.display = state.thirdRowEligible ? 'none' : 'block';
  }

  function calcSubtotal() {
    let subtotal = PRICES[state.set];
    if (state.thirdRow && state.thirdRowEligible && state.set !== 'complete') {
      subtotal += 40; // nominal surcharge for 3rd row when not included
    }
    summarySubtotalEl.textContent = String(subtotal);
    state.subtotal = subtotal;
    freeShipEl.style.display = subtotal >= 100 ? 'block' : 'none';
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
  matColorEl.addEventListener('change', (e)=>{ state.matColor = e.target.value; syncSummary(); });
  trimColorEl.addEventListener('change', (e)=>{ state.trimColor = e.target.value; syncSummary(); });
  $$('input[name="set"]').forEach(r=> r.addEventListener('change', (e)=>{ state.set = e.target.value; syncSummary(); }));
  $$('input[name="pattern"]').forEach(r=> r.addEventListener('change', (e)=>{ state.pattern = e.target.value; syncSummary(); }));
  heelPadEl.addEventListener('change', (e)=>{ state.heelPad = e.target.checked; syncSummary(); });
  thirdRowEl.addEventListener('change', (e)=>{ state.thirdRow = e.target.checked; syncSummary(); });

  // Prefill from URL or localStorage
  (function prefill(){
    const params = new URLSearchParams(location.search);
    const ls = JSON.parse(localStorage.getItem('counstructorUserData')||'{}');
    state.make = params.get('make') || ls.carMake || state.make;
    state.model = params.get('model') || ls.carModel || state.model;
    state.year = params.get('year') || ls.carYear || state.year;
    if (state.year) yearEl.value = state.year;
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
          setTimeout(()=>{ modelEl.value = state.model; }, 800);
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
  addBtn.addEventListener('click', async ()=>{
    const module = await import('./cart.js');
    module.Cart.add({ ...toCartItem() });
    window.location.href = '/cart';
  });
  buyBtn.addEventListener('click', async ()=>{
    const module = await import('./cart.js');
    module.Cart.add({ ...toCartItem() });
    window.location.href = '/order';
  });
});


