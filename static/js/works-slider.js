
document.addEventListener('DOMContentLoaded', function() {
  const workExamplesSwiper = new Swiper(".work-examples-swiper", {
    slidesPerView: 1,
    centeredSlides: true,
    spaceBetween: 20,
    loop: true,
    grabCursor: true,
    effect: "coverflow",
    coverflowEffect: {
      rotate: 25,
      stretch: 0,
      depth: 100,
      modifier: 1,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".work-examples-swiper__pagination",
      clickable: true,
    },
    breakpoints: {
      540: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 4,
      },
    },
  });
  
  const swiper = new Swiper('.reviews__swiper', {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
})



