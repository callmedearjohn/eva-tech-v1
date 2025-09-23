
import { Fancybox } from './vendors/fancybox/fancybox.umd.js';

import './burger';

document.addEventListener('DOMContentLoaded', function() {
  const swiper = new Swiper('.reviews__swiper', {
    slidesPerView: 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  Fancybox.bind('[data-fancybox]', {});
  document.addEventListener('click', (e) => {
    if (e.target.closest('.faq__item-title')) {
      const title = e.target.closest('.faq__item-title');
      const content = title.nextElementSibling;
      const isOpened = title.classList.toggle('opened');
  
      if (content) {
        content.style.transition = 'height 0.3s ease-out';
        content.style.height = isOpened ? content.scrollHeight + 'px' : '0';
      }
    }
  });
  
});


