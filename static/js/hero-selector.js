document.addEventListener('DOMContentLoaded', () => {
  const heroForm = document.getElementById('hero-selector');
  if (!heroForm) return;

  const makeEl = document.getElementById('hero-car-make');
  const modelEl = document.getElementById('hero-car-model');
  const yearEl = document.getElementById('hero-car-year');

  // Style with NiceSelect if available (bind once and reuse instances)
  try {
    if (window.NiceSelect) {
      window.__heroMakeNS = window.NiceSelect.bind(makeEl);
      window.__heroModelNS = window.NiceSelect.bind(modelEl);
      window.__heroYearNS = window.NiceSelect.bind(yearEl);
    }
  } catch (_) {}

  // preload years
  const now = new Date();
  for (let i = 1990; i <= now.getFullYear(); i++) {
    yearEl.insertAdjacentHTML('beforeend', `<option value="${i}">${i}</option>`);
  }
  try { window.__heroYearNS && window.__heroYearNS.update && window.__heroYearNS.update(); } catch(_){ }

  const marksUrl = "https://api.auto.ria.com/categories/1/marks/";

  async function loadModels(makeId) {
    modelEl.innerHTML = '<option disabled selected value>Model</option>';
    try {
      const res = await fetch(`${marksUrl}${makeId}/models`);
      const models = await res.json();
      models.forEach((m) => {
        modelEl.insertAdjacentHTML('beforeend', `<option value="${m.name}">${m.name}</option>`);
      });
      try { window.__heroModelNS && window.__heroModelNS.update && window.__heroModelNS.update(); } catch(_){ }
    } catch (e) {
      // silent fail; keep empty
    }
  }

  makeEl.addEventListener('change', (e) => {
    const makeId = e.target.value;
    if (makeId) {
      loadModels(makeId);
    }
  });

  // helper: set select value and dispatch change
  function setSelectValue(select, value) {
    select.value = value;
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  }

  // wait until an option with given value exists
  function waitForOption(select, value, timeoutMs = 2000) {
    const start = Date.now();
    return new Promise((resolve) => {
      const check = () => {
        const has = Array.from(select.options).some((o) => o.value === value);
        if (has) return resolve(true);
        if (Date.now() - start > timeoutMs) return resolve(false);
        setTimeout(check, 50);
      };
      check();
    });
  }

  heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const makeId = makeEl.value;
    const makeName = makeEl.options[makeEl.selectedIndex]?.textContent || '';
    const modelName = modelEl.value;
    const year = yearEl.value;
    if (!makeId || !modelName || !year) return;

    // Persist selection for fallback prefill
    try {
      const data = { carMake: makeName, carModel: modelName, carYear: year };
      localStorage.setItem('counstructorUserData', JSON.stringify(data));
    } catch(_) {}

    // Redirect to configurator with URL params (configurator reads these to prefill)
    const params = new URLSearchParams({ make: makeName, model: modelName, year });
    window.location.href = `/configurator?${params.toString()}`;
  });
});


