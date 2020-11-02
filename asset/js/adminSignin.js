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
  console.log(url);

  const formdata = new FormData(form);
  const params = new URLSearchParams();

  // inputs.innerHTML= ""

  for (const pairs of formdata) {
    if (pairs[0] === 'email') {
      pairs[1] = pairs[1].toLowerCase();
    }

    params.append(pairs[0], pairs[1]);
  }

  try {
    const req = await fetch(`${url}admin/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const res = await req.json();
    const data = await res;

    if (data === undefined || req.status >= 400) {
      notiPanel.classList.add('failed');
      notiPanel.classList.remove('successful');
      notiPanel.style.display = 'flex';
      notification.innerHTML = `${res.message}`;
    } else {
      // console.log(data.Profile.role);
        notiPanel.classList.add('successful');
        notiPanel.classList.remove('failed');
        notiPanel.style.display = 'flex';
        notification.innerHTML = `Welcome Back Admin!`;
        API.setCookie('session_', `${res.Profile.token}`, 3);
        setTimeout(function () {
          window.location.href = '../admin/dashboard.html';
        }, 3000);
        return;
    }
  } catch (err) {
    console.log(err);
  }
});
