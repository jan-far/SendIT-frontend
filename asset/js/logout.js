import API from './host.js';

const url = API.getHostUrl();
const loggedOut = document.querySelector('.logout');

loggedOut.addEventListener('click', async () => {
  if (window.location.pathname.indexOf('admin') === 1) {
    window.location.href = '../../pages/signin.html';
  } else {
    window.location.href = '../../index.html';
    try {
      const res = await fetch(`${url}logout`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // 'x-access-token': `${token}`,
        },
        method: 'GET',
      });
    } catch (err) {
      console.log('err');
      console.log(err);
    }
    console.log('logged out');
    API.setCookie('session_', '', 0);
  }
});
