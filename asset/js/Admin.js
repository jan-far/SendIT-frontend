const url = getHostUrl();
const token = getCookie('session_');
const form = document.querySelector('form');
const submit = document.querySelector('#submit');
const myOrder = document.querySelector('.my-order');
const record = document.querySelector('.order-record');
const modal = document.querySelector('.bg-modal');
const pTable = document.querySelector('#parcelTable')
const pBody = document.querySelector('.parcelBody');
const sel = document.querySelector('#pFormat');
const pMobile = document.querySelector('.parcelFormat');
const parcelFormat = document.querySelector('#pFormat');
const parcelTemp = document.querySelector('.parcelTemp');
const parcels = {};
const user = [];
let cell0;
let count = 0;
let usr;
let id;

//  Event listener to close popup
document.querySelector('.close').addEventListener("click", () => {
  modal.style.display = "none";
});

function getHostUrl() {
  if (window.location.host.indexOf('localhost') === 0 ||
    window.location.host.indexOf('127.0.0.1') === 0) {
    return 'http://127.0.0.1:3000/api/v1/';
  }
  return 'https://sendit-postgres.herokuapp.com/api/v1/';
};

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
};

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/; Secure`;
  return document.cookie;
};

// Insert new table data
function insertnewRow(data) {
  // Get th table body
  const table = document.getElementById('parcelTable').getElementsByTagName('tbody')[0];

  // Insert new table row
  const newRow = table.insertRow(table.length);

  cell0 = newRow.insertCell(0);

  const cell1 = newRow.insertCell(1);
  cell1.innerHTML = data.recipient;

  const cell2 = newRow.insertCell(2);
  cell2.innerHTML = data.phone;

  const cell3 = newRow.insertCell(3);
  cell3.innerHTML = data.destination;

  const cell4 = newRow.insertCell(4);
  cell4.innerHTML = data.location;

  const cell5 = newRow.insertCell(5);
  cell5.innerHTML = data.status;

  const cell6 = newRow.insertCell(6);
  cell6.innerHTML = '<button class="edit" onclick="Edit(this)">Edit</button>';
};

// Get the user parcel
async function getParcel(_id) {
  try {
    const res = await fetch(`${url}/admin/parcels/${_id}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'GET',
    });
    const { rows, rowCount } = await res.json();
    return { rows, rowCount, res };
  } catch (err) {
    console.log(err);
  }
};

// Get a user
async function getUser(_id) {
  try {
    const res = await fetch(`${url}/admin/user/${_id}`, {
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
};

// on window load
window.addEventListener('load', async () => {
  //  get user Id 
  const id = getCookie('id')

  // Query parcels owned by user Id
  const { rows, rowCount, res } = await getParcel(id);

  // if error or no token, redirect to login page
  if (res.statusCode === 400 || !token) {
    window.location.href = ('../admin');
  }

  // if not Res 
  if (!res) {
    console.log('error occured');
  } else if (rows === [] || rowCount === 0) {
    records(0, 0, 0);
    myOrder.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
  } else {
    usr = await getUser(id)
    if (usr.statusCode > 300) {
      window.location.href = "../index.html"
    }

    myOrder.innerHTML = Table(usr.rows[0])
    for (let i = 0; i < rowCount; i++) {
      // Save up parcel id
      parcels[i] = rows[i].id;
      insertnewRow(rows[i])
      cell0.innerHTML = i + 1;

      // Count the parcels that are yet to be delivered
      if (rows[i].status != 'delivered') {
        count += 1;
      } else {
        count;
      }
    }
    // console.log(myOrder.childNodes[1].childNodes[1].childNodes[2])

    records(rowCount, count, (rowCount - count));
  }
  setCookie('parcels', JSON.stringify(parcels), 1);
});

// Reset
function reset() {
  modal.style.display = "none";
}

const sub = document.querySelector('#status')
sub.addEventListener('change', (e) => {
  if (selectedRow.cells[5].textContent === e.target.value.toLowerCase().trim()) {
   ;
    return;
  } else {
    if (e.target.value.toLowerCase().trim() === 'delivered') {
      refresh(e.target.value.toLowerCase().trim())
      // console.log('delivered')
    } else if (e.target.value.toLowerCase().trim() === 'processing') {
      refresh(e.target.value.toLowerCase().trim())
      // console.log('processing')
    } else {
      // console.log(e.target.value)
      return;
    }
  }
})

// Form handler
form.addEventListener('submit', async (e) => {
  Updates();
  reset();
  refresh();
});

// Edit the specified form data
function Edit(td) {
  modal.style.display = "flex";
  selectedRow = td.parentElement.parentElement;
  sessionStorage.setItem('selected', selectedRow.rowIndex);

  document.querySelector('#recipient').setAttribute('disabled', true);
  document.querySelector('#destination').setAttribute('disabled', true);
  document.querySelector('#phone').setAttribute('disabled', true);

  document.querySelector('#recipient').value = selectedRow.cells[1].innerHTML;
  document.querySelector('#phone').value = selectedRow.cells[2].innerHTML;
  document.getElementById('destination').value = selectedRow.cells[3].innerHTML;
  document.querySelector('#pickup').value = selectedRow.cells[4].innerHTML;
  document.querySelector('#status').value = selectedRow.cells[5].innerHTML;

  document.querySelector('#submit').value = 'Update Destination';
};

// update users status and 
async function UpdateStatus(data) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = sessionStorage.getItem('selected');
  const c = row;

  try {
    const res = await fetch(`${url}parcels/${currentParcel[c - 1]}/status`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'PUT',
      body: data,
    });
    const result = await res.json();
    return result;

  } catch (err) {
    console.log(err);
  }
};

// Update current parcel location
async function UpdateLocation(data) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = sessionStorage.getItem('selected');
  const c = row;

  try {
    const res = await fetch(`${url}parcels/${currentParcel[c - 1]}/presentLocation`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'PUT',
      body: data,
    });
    const result = await res.json();
    return result;

  } catch (err) {
    console.log(err);
  }
};

//  Update the form data
async function Updates() {
  formData = new FormData(form);
  search = new URLSearchParams();

  for (const pair of formData) {
    if (pair[0] === 'location') {
      selectedRow.cells[4].innerHTML = pair[1].toLowerCase().trim();
      search.append(pair[0], pair[1].toLowerCase().trim());

      const result = await UpdateLocation(search);
      console.log(result.message)
    };

    if (pair[0] === 'status') {
      selectedRow.cells[5].innerHTML = pair[1].toLowerCase().trim();
      search.append(pair[0], pair[1].toLowerCase().trim());

      const result = await UpdateStatus(search);
      console.log(result.message)
    }
  }
};

// Table
function Table(data) {
  return (`
<div class='my-order'>
<caption>USER: ${data.firstname} ${data.lastname}</caption>
<table border="1" id=parcelTable>
    <thead>
    <tr>
            <th>S/N</th>
            <th>Recipient</th>
            <th>Recipient Phone number</th>
            <th>City of Destination</th>
            <th>Pickup location</th>
            <th>Status</th>
            <th></th>
        </tr>
    
    <tbody>

    </tbody>
</table>
<p class="parcelBody"></p>
<div class="parcelFormat">
    <select id="pFormat"></select>
    <div class="parcelTemp"></div>
</div>
</div>
`);
};

// database records function handler
function records(total, pending, delivered) {
  record.innerHTML = `
  <div class="pending">
      Pending Order: ${pending}
  </div>
  <div class="delivered">
      Order Delivered: ${delivered}
  </div>
  <div class="total">
      My total Order: ${total}
  </div>
  `;
};

// Refresh function to make decreament base on order status
async function refresh(val) {
  const pending = parseInt(record.childNodes[1].textContent.split(':')[1].trim());
  const delivered = parseInt(record.childNodes[3].textContent.split(':')[1].trim());
  const total = parseInt(record.childNodes[5].textContent.split(':')[1].trim());

  if (val == 'delivered') {
    // console.log('delivered')
    return records(total, pending - 1, delivered + 1);
  } else if (val == 'processing') {
    // console.log('processing')
    return records(total, pending + 1, delivered - 1 )
  }
}