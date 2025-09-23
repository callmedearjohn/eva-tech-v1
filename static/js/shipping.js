
import Toastify from './vendors/toastify-js/toastify.js';

import './burger';

const counstructorUserData = JSON.parse(localStorage.getItem('counstructorUserData'));
document.addEventListener('DOMContentLoaded', function () {
  

  // Функция для получения и обновления номера заказа
  const getOrderNumber = () => {
    let orderNumber = parseInt(localStorage.getItem('orderNumber')) || 100;
    localStorage.setItem('orderNumber', ++orderNumber);
    return orderNumber;
  };

  const provinceSelect = document.getElementById('province');
  const shipingSpan = document.getElementById('shipping');
  const subtotal = document.querySelector('#subtotal');
  const totalSpan = document.querySelector('#total');
  const orderType = document.querySelector('#orderType');
  const orderCar = document.querySelector('#orderCar');
  const orderCarYear = document.querySelector('#orderCarYear');
  const orderSum = document.querySelector('.order__product-sum');
  const orderImg = document.querySelector('.order__product-img');

  const updateOrder = () => {
    const types = {
        'standart': { price: '99', imgUrl: 'static/images/price-constructor/sets/set-2.jpg' },
        'economy': { price: '59', imgUrl: 'static/images/price-constructor/sets/set-1.jpg' },
        'premium': { price: '180', imgUrl: 'static/images/price-constructor/sets/set-3.jpg' }
    };

    const selectedType = types[counstructorUserData.setType];
    
    if (selectedType) {
        orderImg.src = selectedType.imgUrl;
        orderSum.innerHTML = selectedType.price;
        subtotal.innerHTML = selectedType.price;
    }
    
    orderType.innerHTML = counstructorUserData.setType;
    orderCarYear.innerHTML = counstructorUserData.carYear;
    orderCar.innerHTML = counstructorUserData.carMake;
};


  const updateTotal = () => {
    const shipingValue = parseFloat(provinceSelect.value) || 0;
    const subtotalValue = parseFloat(subtotal.innerHTML) || 0;
    const totalValue = (subtotalValueAfterPromo || subtotalValue) + shipingValue;
    shipingSpan.innerHTML = shipingValue;
    subtotal.innerHTML = subtotalValueAfterPromo || subtotalValue;
    totalSpan.innerHTML = totalValue;
  };

  let subtotalValueAfterPromo = 0;
  updateOrder();
  updateTotal();

  NiceSelect.bind(provinceSelect);
  provinceSelect.addEventListener('change', updateTotal);

  document.getElementById('phone').addEventListener('input', function () {
    this.value = this.value.replace(/[^\d+]/g, '');
  });
  
  document.getElementById('first-name').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z]/g, '');
  });

  document.getElementById('last-name').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z]/g, '');
  });

  const promoBtn = document.querySelector('.promo__btn');
  let promoCheck = false,
  promoValue = '';

  function promoValid() {
  promoBtn.classList.add('promoValid');
  promoBtn.innerHTML = 'Promocode valid!'
  
  }


  promoBtn.addEventListener('click', async () => {
    const promoInput = document.querySelector('#promo');
    const promo = promoInput.value;
    const total = subtotal.innerHTML;
    document.querySelector('.promoInvalid').classList.add('hidden');

    try {
      const response = await fetch('promo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ promoCode: promo, totalAmount: total })
      });

      const result = await response.json();

      if (result.success) {
        subtotalValueAfterPromo = parseFloat(result.newTotal);
        updateTotal();
        promoInput.value = "";
        promoBtn.disabled = true;
        promoCheck = true;
        promoValue = promoInput.value;
        promoValid();
      } else {
        document.querySelector('.promoInvalid').classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  const form = document.querySelector('.modalBuy__form');
  const submitToast = {
    text: "Your message was sent successfully!",
    duration: -1,
    close: true,
    gravity: "bottom",
    position: "center",
    stopOnFocus: true,
    offset: { y: 100 },
    className: "order-toast"
  };

  const setPendingForm = (form) => {
    const submitButton = form.querySelector('[type="submit"]');
    const submitText = submitButton.textContent;
    submitButton.textContent = "Sending...";
    form.classList.add("form--pending-order");
    return submitText;
  };

  const unsetPendingForm = (form, submitText = "Send") => {
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.textContent = submitText;
    form.classList.remove("form--pending-order");
  };

  const sendPost = async (form, data) => {
    const submitText = setPendingForm(form);
    try {
      const response = await fetch("action.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      unsetPendingForm(form, submitText);
      if (response.ok) {
        const div = document.createElement("div");
        div.innerHTML = `
            Thank you for your order<br>
            Hi ${data.userName},<br>
            Thanks for your order. It’s on-hold until we confirm that payment has been received.<br>
            <span class="bold">Please send your payment total amount to evatech@GMAIL.COM. No need to write anything in the message. Secret Question: My order number ${data.orderNumber}<br>
            Secret Answer: Evatech</span><br>
            Product:<br>
            Car make - ${data.carMake}<br>
            Car model - ${data.carModel}<br>
            Car year - ${data.carYear}<br>
            Mat color - ${data.rugBackgroundColor}<br>
            Trim color - ${data.rugOutlineColor}<br>
            Set name - ${data.setType} (+ Footrest for a driver mat as a gift!)
        `;
        Toastify({
          ...submitToast,
          node: div
        }).showToast();
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      console.error(error);
      Toastify({ ...submitToast, text: "Something went wrong!" }).showToast();
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Toronto"
    }).format(now);
  };

  const getStatusPromo = () => promoCheck ? 'yes' : 'no';

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    const userName = `${document.querySelector('#first-name').value} ${document.querySelector('#last-name').value}`;
    const province = provinceSelect.options[provinceSelect.selectedIndex].text;
    const totalPrice = totalSpan.innerHTML;
    const shippingPrice = shipingSpan.innerHTML;
    const subtotalPrice = orderSum.innerHTML;
    const promoCodeValue = promoValue;


    await sendPost(form, {
      ...counstructorUserData,
      ...formValues,
      userName,
      totalPrice,
      province,
      promoCodeValue,
      subtotalPrice: subtotalPrice,
      shippingPrice: shippingPrice,
      promoCode: getStatusPromo(),
      orderNumber: getOrderNumber(),
      date: getCurrentDate()
    });
  });
});
