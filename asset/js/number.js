const input = document.querySelector('#phone');
const IntNumber = window.intlTelInput(input, {
  nationalMode: true,
  utilsScript: '../asset/js/utils.js',
});

window.intlTelInput(input, {
  preferredCountries: ['ng'],
});

IntNumber.promise.then(function () {
  console.log("Initialised!");
});

function autocompletePlace() {
  const input = document.querySelector('.place');
  const autocomplete = new google.maps.places.Autocomplete(input);
}
