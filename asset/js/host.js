function getHostUrl() {
  if (window.location.host.indexOf('127.0.0.1') === 0 ||
    window.location.host.indexOf('localhost') === 0) {
    return 'http://127.0.0.1:3001/api/v1/';
  }
  return 'https://sendit-postgres.herokuapp.com/api/v1/';
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/; Secure`;
  return document.cookie;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

const url = getHostUrl();
const token = getCookie('session_');

async function isLoggedIn() {
  if (!token) return false;

  // Checks validity of token
  const res = await fetch(`${url}users`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-access-token': token,
    },
    method: 'GET',
  });
  const result = await res.json();
  // return result;

  if (result.message === 'invalid token') return false;

  if (window.location.pathname.indexOf('admin') === 1) {
    if (result.Profile.role === 1) {
      return false;
    }
    return true;
  } else {
    if (result.Profile.role === 2) return false;
    return true;
  }
}

async function autoRedirect() {
  const validLogin = await isLoggedIn();

  if (!validLogin) {
    console.log('invalid');
    window.location.href = ('../pages/redirect.html');
  }
}

function logOut() {
  const now = new Date(0);
  // console.log('now', now);
  const expireTime = now.getTime();
  now.setTime(expireTime);
  document.cookie = `${document.cookie};expires=${now.toUTCString()};path=/`;
  // console.log('clear', document.cookie)
}

export default {
  setCookie,
  getCookie,
  getHostUrl,
  autoRedirect,
  logOut,
};
