import Toastify from './vendors/toastify-js/toastify.js';
import Pristine from './vendors/pristine/pristine.min.js';
import './burger';





// Обработка отправки форм
const feedbackForm = document.getElementById('feedback-form');
const feedbackPristine = new Pristine(feedbackForm, {
  classTo: "form-field",
  errorClass: "form-field--error",
  errorTextParent: "form-field",
  errorTextTag: "p",
  errorTextClass: "form-help",
});


const submitToast = {
  text: "Your message was sent successfully!",
  duration: 6000,
  close: true,
  gravity: "bottom",
  position: "center",
  stopOnFocus: true,
  offset: {
    y: 50,
  },
  className: "form-submit-toast",
};

function setPendingForm(form) {
  const submitButton = form.querySelector('[type="submit"]');
  const submitText = submitButton.textContent;
  submitButton.textContent = "Sending...";
  form.classList.add("form--pending");

  return submitText;
}

function unsetPendingForm(form, submitText = "Send") {
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.textContent = submitText;
  form.classList.remove("form--pending");
}

async function sendPost(form, data) {
  const submitText = setPendingForm(form);

  return fetch("action.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      unsetPendingForm(form, submitText);
      if (res.ok) {
        Toastify({
          ...submitToast,
          text: `Your ${data.formName == "feedback" ? "message" : "request"
            } was sent successfully!`,
        }).showToast();
      } else throw new Error("Something went wrong");
    })
    .catch((err) => {
      console.log(err);
      Toastify({
        ...submitToast,
        text: "Something went wrong!",
      }).showToast();
    });
}

function getCurrentDate() {
  const now = new Date();

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(now);
}

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const valid = feedbackPristine.validate();

  if (!valid) return;

  const userEmail = e.target["userEmail"];
  const userName = e.target["userName"];
  const userMessage = e.target["userMessage"];

  const formData = new FormData(feedbackForm);
  const formValues = Object.fromEntries(formData.entries());

  const res = await sendPost(feedbackForm, {
    ...formValues,
    date: getCurrentDate(),
  });

  userName.value = "";
  userEmail.value = "";
  userMessage.value = "";
});