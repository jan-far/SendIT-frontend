const input = document.querySelector('#phone');
const IntNumber = window.intlTelInput(input, {
    utilsScript: '../asset/js/utils.js',
  });
  
  window.intlTelInput(input, {
    preferredCountries: ['ng'],
  });

  IntNumber.promise.then(function() {
    console.log("Initialised!");
  });