import tingle from './vendors/tingle/tingle.min.js';

const ekonomModalContent = document.getElementById("ekonom-modal");
const standartModalContent = document.getElementById("standart-modal");
const premiumModalContent = document.getElementById("premium-modal");
const thrustModalContent = document.getElementById("footrest-modal");
const thrustModalContentGift = document.getElementById("footrest-modal-gift");

const setModalOptions = {
  closeMethods: ["overlay", "button", "escape"],
  closeLabel: "Close",
  cssClass: ["modal"],
};

const ekonomSetModal = new tingle.modal(setModalOptions);
const standartModal = new tingle.modal(setModalOptions);
const premiumModal = new tingle.modal(setModalOptions);
const thrustModal = new tingle.modal(setModalOptions);
const thrustModalGift = new tingle.modal(setModalOptions);

ekonomSetModal.setContent(ekonomModalContent.outerHTML);
standartModal.setContent(standartModalContent.outerHTML);
premiumModal.setContent(premiumModalContent.outerHTML);
thrustModal.setContent(thrustModalContent.outerHTML);
thrustModalGift.setContent(thrustModalContentGift.outerHTML);

const setModals = {
  "ekonom-modal": ekonomSetModal,
  "standart-modal": standartModal,
  "premium-modal": premiumModal,
  "footrest-modal": thrustModal,
  "footrest-modal-gift": thrustModalGift,
};



document.addEventListener("click", (e) => {
  // Проверяем, был ли клик на элементе с классом .shopNow-btn
  const myCloseButton = e.target.closest(".shopNow-btn");
  if (myCloseButton) {
      thrustModalGift.close();
      return; // Прерываем выполнение функции после закрытия модального окна
  }

  // Иначе, проверяем клик на элементе с атрибутом data-modal-id
  const target = e.target.closest("[data-modal-id]");
  if (!target || e.target.closest("[data-modal-ignore]")) return;

  const modalId = target.dataset.modalId;

  // Открываем соответствующее модальное окно
  if (setModals[modalId]) {
      setModals[modalId].open();
  }
});

