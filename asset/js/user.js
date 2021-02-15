import API from './host.js';
const token = API.getCookie('session_');
const url = 'http://127.0.0.1:3001/api/v1/';

async function isLoggedIn() {
  if (!token) return false;

  // Checks validity of token
  try {
    const res = await fetch(`${url}users`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'GET',
    });
    const result = await res.json();
    if (res.status === 200) {
      API.setCookie('session_', result.Token, 1);
      return true;
    } else {
      sessionStorage.clear();
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

async function autoRedirect() {
  const validLogin = await isLoggedIn();

  if (!validLogin) {
    console.log('invalid');
    window.location.href = ('../pages/redirect.html');
  }
}

autoRedirect();
