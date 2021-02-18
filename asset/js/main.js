const sidenav = document.querySelector('.sidemenu');

const toggler = (x) => {
  x.classList.toggle('change');
  sidenav.classList.toggle('active');
};
