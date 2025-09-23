

const socailBtn = document.querySelector('.social-btn'),
socailList = document.querySelector('.social__list'),
socailArow = document.querySelector('#arow'),
menu = document.querySelector('.header__menu-mobile');


socailBtn.addEventListener('click', () => {
  if (socailList.classList.contains('fadeIn')) {
    socailList.classList.remove('fadeIn');
    socailList.classList.add('fadeOut');
    socailArow.classList.remove('rotate');  
  } else {
    socailList.classList.remove('fadeOut');
    socailList.classList.add('fadeIn');
    socailArow.classList.add('rotate');  
  }
})


document.addEventListener('click', (e) => {
  if (e.target.matches('.burger-btn')) {
    menu.classList.add('header__menu-mobile--active');
    document.body.style.overflow = 'hidden';
  } else if (e.target.matches('.close-btn')) {
    menu.classList.remove('header__menu-mobile--active');
    document.body.style.overflow = '';
  }
})


