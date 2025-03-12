
const formFields = document.querySelectorAll('input[type="text"], input[type="email"], textarea');

function appel() {
  formFields.forEach(field => {
    if (field.value.trim() === '') {
      field.classList.add('erreur');
    }
  });
}

formFields.forEach(field => {
  field.addEventListener('focus', function() {
    this.classList.remove('erreur');
  });
});
