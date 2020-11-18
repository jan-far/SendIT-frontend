import API from './host.js';

const form = document.querySelector('.form');
let url;
const notiPanel = document.querySelector('.noti-panel');
const notification = document.querySelector('.notification');
const span = document.querySelector('.close');

notiPanel.style.display = 'none';

span.onclick = () => {
  notiPanel.style.display = 'none';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  url = API.getHostUrl();

  const formdata = new FormData(form);
  const params = new URLSearchParams();

  for (const pairs of formdata) {
    if (pairs[0] === 'email') {
      pairs[1] = pairs[1].toLowerCase();
    }

    params.append(pairs[0], pairs[1]);
  }

  try {
    const req = await fetch(`${url}auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const res = await req.json();
    const data = await res;

    // Success funtion to enable the notification on successful execution
    const succ = () => {
      notiPanel.classList.add('successful');
      notiPanel.classList.remove('failed');
      notiPanel.style.display = 'flex';
      notification.innerHTML = `${data.message}`;
    }

    // Fail funtion to enable the notification on error
    const fail = () => {
      notiPanel.classList.remove('successful');
      notiPanel.classList.add('failed');
      notiPanel.style.display = 'flex';
      notification.innerHTML = `${data.message}`;
    }

    if (data === undefined || req.status === 400) {
      // On failed request
      setTimeout(() => {
        notiPanel.style.display = 'none';
      }, 3000, fail())
    } else {
      // console.log(data.Profile.role);
      if (res.Profile.role === 1) {
        // on successful request
        setTimeout(() => {
          notiPanel.style.display = 'none';
        }, 3000, succ());

        API.setCookie('session_', `${res.Profile.token}`, 3);

        setTimeout(function () {
          window.location.href = '../pages/dashboard.html';
        }, 3000);
      } else {
        //  on successful request
        setTimeout(() => {
          notiPanel.style.display = 'none';
        }, 3000, succ())

        API.setCookie('session_', `${res.Profile.token}`, 3);

        setTimeout(function () {
          window.location.href = '../admin';
        }, 3000);
      }
    }
  } catch (err) {
    console.log(err);
  }
});
