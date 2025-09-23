import Pristine from './vendors/pristine/pristine.min.js';
import { Fancybox } from './vendors/fancybox/fancybox.umd.js';

import './works-slider';
import './modals';
import './burger';
import './timer';


document.addEventListener('DOMContentLoaded', function() {

  Fancybox.bind('[data-fancybox]', {});
  const toggleClass = (element, className) => element.classList.toggle(className);
  const addClass = (element, className) => element.classList.add(className);
  const removeClass = (element, className) => element.classList.remove(className);
  const updateImageSrc = () => {
    rugImage.src = `./static/images/price-constructor/color-combinations/${counstructorUserData.rugBackgroundColor}-${counstructorUserData.rugOutlineColor}.jpg`;
  };
  
  // Обработчики событий
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches('.advantage__item-desc')) {
      toggleClass(e.target, 'advantage__item-desc--active');
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    if (e.target.matches('.advantage__item-desc')) {
      toggleClass(e.target, 'advantage__item-desc--active');
    }
  });
  
  document.addEventListener('mouseup', (e) => {
    e.preventDefault();
    if (e.target.matches('.advantage__item-desc')) {
      const activeDesc = document.querySelector('.advantage__item-desc--active');
      if (activeDesc) {
        removeClass(activeDesc, 'advantage__item-desc--active');
      }
      addClass(e.target, 'advantage__item-desc--active');
    }
  });
  
  // Функции навигации
  const navigateTo = (nextId) => {
    document.querySelector('.price-constructor__nav--active').classList.remove('price-constructor__nav--active');
    document.querySelector('.price-constructor__mobile-nav--active').classList.remove('price-constructor__mobile-nav--active');
    addClass(document.querySelector(`.price-constructor__nav[data-step-id="${nextId}"]`), 'price-constructor__nav--active');
    addClass(document.querySelector(`.price-constructor__mobile-nav[data-step-id="${nextId}"]`), 'price-constructor__mobile-nav--active');
  };
  
  const slideNext = () => {
    const currentStepId = +document.querySelector('.price-constructor__step--active').dataset.stepId;
    if (currentStepId < 4) slideTo(currentStepId + 1);
  };
  
  const slidePrev = () => {
    const currentStepId = +document.querySelector('.price-constructor__step--active').dataset.stepId;
    if (currentStepId > 1) slideTo(currentStepId - 1);
  };
  
  const slideTo = (toStepId) => {
    if (toStepId == 4) {
      // Guard: ensure all selections are complete before navigating to order
      const required = [
        counstructorUserData.carMake,
        counstructorUserData.carModel,
        counstructorUserData.carYear,
        counstructorUserData.rugBackgroundColor,
        counstructorUserData.rugOutlineColor,
        counstructorUserData.setType
      ];
      const isComplete = required.every(Boolean);
      if (!isComplete) {
        alert('Please complete all selections: car, colors, and set.');
        return;
      }
      localStorage.setItem('counstructorUserData', JSON.stringify(counstructorUserData));
      window.location.href = 'order';
      return;
    }
    const currentTab = document.querySelector('.price-constructor__step--active');
    const newActiveTab = document.querySelector(`.price-constructor__step[data-step-id="${toStepId}"]`);
    removeClass(currentTab, 'price-constructor__step--active');
    addClass(newActiveTab, 'price-constructor__step--active');
    newActiveTab.scrollIntoView({ behavior: 'smooth' });
    navigateTo(toStepId);
  };
  
  // Обработка форм
  let counstructorUserData = {
    carMake: "",
    carModel: "",
    carYear: "",
    rugBackgroundColor: "beige",
    rugOutlineColor: "beige",
    setType: ""
  };
  
  
  const stepForms = document.querySelectorAll('.price-constructor__step[data-step-id]');
  const pristineStepForms = {};
  
  stepForms.forEach((stepForm) => {
    let pristineStepForm;

    if (stepForm.dataset.stepId == 3) {
        pristineStepForm = new Pristine(stepForm, {
            classTo: 'constructor-step__title',
            errorTextParent: 'constructor-step__title',
            errorTextTag: 'p',
            errorTextClass: 'form-help',
        });
    } else {
        pristineStepForm = new Pristine(stepForm, {
            classTo: 'form-field',
            errorClass: 'form-field--error',
            errorTextParent: 'form-field',
            errorTextTag: 'p',
            errorTextClass: 'form-help',
        });
    }

    stepForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (pristineStepForm.validate()) {
            slideNext();
        }
    });

    pristineStepForms[stepForm.dataset.stepId] = pristineStepForm;
});

  
  document.querySelector('.price-constructor__mobile-button--right').addEventListener('click', () => {
    const activeForm = document.querySelector('.price-constructor__step--active');
    if (pristineStepForms[activeForm.dataset.stepId].validate()) slideNext();
  });
  
  document.querySelector('.price-constructor__mobile-button--left').addEventListener('click', slidePrev);
  
  document.querySelectorAll('.price-constructor__nav').forEach((navButton) => {
    navButton.addEventListener('click', (e) => {
      const currentStepId = +document.querySelector('.price-constructor__step--active').dataset.stepId;
      const stepId = +e.target.dataset.stepId;
      if (currentStepId < stepId && !pristineStepForms[currentStepId].validate()) return;
      slideTo(stepId);
    });
  });
  
  // Инициализация селектов
  const carMakeSelectEl = document.getElementById('car-make');
  const carModelSelectEl = document.getElementById('car-model');
  const carYearSelectEl = document.getElementById('car-year');
  const bgColorSelectEl = document.getElementById('rug-background-color');
  const outlineColorSelectEl = document.getElementById('rug-outline-color');
  const rugImage = document.querySelector('[data-step-id="2"] .constructor-step__image img');
  
  NiceSelect.bind(carMakeSelectEl);
  const carModelSelect = NiceSelect.bind(carModelSelectEl);
  const carYearSelect = NiceSelect.bind(carYearSelectEl);
  NiceSelect.bind(bgColorSelectEl);
  NiceSelect.bind(outlineColorSelectEl);
  
  const marksUrl = "https://api.auto.ria.com/categories/1/marks/";
  
  const getModelsByMake = async (modelId) => {
    const res = await fetch(`${marksUrl}${modelId}/models`);
    return await res.json();
  };
  
  // Предзагрузка лет
 
    const now = new Date();
    for (let i = 1990; i <= now.getFullYear(); i++) {
      carYearSelectEl.insertAdjacentHTML('beforeend', `<option value="${i}">${i}</option>`);
    }
    carYearSelect.update();
  
  
  // Обработка ввода
  const handleCarSelect = (e) => {
    const { name, value } = e.target;
    counstructorUserData[name] = value;
    console.log(counstructorUserData);
  };
  
  
  
  carMakeSelectEl.addEventListener('change', async (e) => {
    const { value: makeId, options, selectedIndex } = e.target;
    counstructorUserData.carMake = options[selectedIndex].textContent;
    counstructorUserData.carModel = "";
  
    const models = await getModelsByMake(makeId);
    carModelSelectEl.innerHTML = `<option selected value disabled>Car model</option>`;
    models.forEach((model) => {
      carModelSelectEl.insertAdjacentHTML('beforeend', `<option value="${model.name}">${model.name}</option>`);
    });
    carModelSelect.update();
  });
  
  carModelSelectEl.addEventListener('change', handleCarSelect);
  carYearSelectEl.addEventListener('change', handleCarSelect);
  
  const handleColorSelect = (e) => {
    handleCarSelect(e);
    updateImageSrc();
  };
  
  bgColorSelectEl.addEventListener('change', handleColorSelect);
  outlineColorSelectEl.addEventListener('change', handleColorSelect);
  
  // Обработка выбора комплекта
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.card-step__button');
    if (!button) return;
  
    const setType = button.value;
    counstructorUserData[button.name] = setType;
    button.closest('.constructor-step').setTypeKit.setAttribute('value', setType);
  
    const activeSet = document.querySelector('.card-step--active');
    if (activeSet) removeClass(activeSet, 'card-step--active');
    addClass(button.closest('.card-step'), 'card-step--active');
  });
});

