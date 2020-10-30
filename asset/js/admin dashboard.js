import API from './host.js';

const url = API.getHostUrl();
let profileDetails = document.querySelector('.user-profile');
const record = document.querySelector('.order-record');
const profileInfo = document.querySelector('.profile-info');
const token = API.getCookie('session_');
const pTable = document.querySelector('#parcelTable')
const pBody = document.querySelector('.parcelBody');

API.autoRedirect();
let count = 0;

// Get User
async function getUsers() {
  try {
    const res = await fetch(`${url}/admin/users`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'GET',
    });
    const result = await res.json();
    return result;
  } catch (err) {
    console.log(err);
  }
}

// On Window load
window.onload = async () => {
  try {
    const { rows, rowCount } = await getUsers();

    if (!rows) {
      console.log('error occured');
    } else if (rows === [] || rowCount === 0) {
      profileDetails.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
    } else {
      for (let i = 0; i < rowCount; i += 1) {
        if (rows[i].role === 1) {
          profileDetails.innerHTML+=UserFormat(rows[i])
        }

        if (rows[i].status !== 'delivered') {
          count += 1;
        }
        records(rows, count, (rowCount - count));
      }
    }
  } catch (err) {
    console.log(err);
  }
};

function records(total, pedinging, delivered) {
  return `
  <div class="pending">
      Pending Order: ${pedinging}
  </div>
  <div class="delivered">
      Order Delivered: ${delivered}
  </div>
  <div class="total">
      My total Order: ${total.rowCount}
  </div>
  `;
};

// User format
function UserFormat(data) {
  return (` 
    <div class=userInfo id=${data.id}>
      <p class='recipient'>Full Name: ${data.firstname} ${data.lastname}</p>
      <p class='phone'>Phone Number: ${data.phone}</p>
      <p class='weight'>Email: ${data.email}</p>
      <p class='location'>Location: ${data.location}</p>
      <button onclick="getId(this.parentElement.id)" >Edit</button>
    </div>
  `)
}