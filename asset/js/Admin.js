const url = getHostUrl();
const token = getCookie('session_');
const form = document.querySelector('form');
const submit = document.querySelector('#submit');
const myOrder = document.querySelector('.my-order');
const record = document.querySelector('.order-record');
const modal = document.querySelector('.bg-modal');
const pTable = document.querySelector('#parcelTable')
const pBody = document.querySelector('.parcelBody');
const createOrder = document.querySelector('.create-order');
const sel = document.querySelector('#pFormat');
const pMobile = document.querySelector('.parcelFormat');
const parcelFormat = document.querySelector('#pFormat');
const parcelTemp = document.querySelector('.parcelTemp');
// const table = document.getElementById('parcelTable').getElementsByTagName('tbody')[0]
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
  console.log('remote host');
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
    const res = await fetch(`${url}/admin/parcel/${_id}`, {
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
  const id = getCookie('id')
  const { rows, rowCount, res } = await getParcel(id);

  if (res.statusCode === 400 || !token) {
    window.location.href = ('../admin');
  }

  if (!res) {
    console.log('error occured');
  } else if (rows === [] || rowCount === 0) {
    console.log('an empty data');
    records(0, 0, 0);
    myOrder.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
  } else {
    usr = await getUser(id)
    myOrder.innerHTML = Table(usr.rows[0])
    for (let i = 0; i < rowCount; i++) {
        insertnewRow(rows[i])
        cell0.innerHTML = i + 1;

      // Count the parcels that are yet to be delivered
      if (rows[i].status !== 'delivered') {
        count += 1;
      } else {
        count = 0;
      }
    }

    records(rowCount, count, (rowCount - count));
  }
});

// Form handler
form.addEventListener('submit', async () => {
  if (submit.value !== 'Update Destination') {
    // l = Object.keys(JSON.parse(API.getCookie('parcels'))).length

    // Get the total number of available table row
    l = table.childElementCount;

    // Get user body params from form
    formData = new FormData(form);
    search = new URLSearchParams();

    // loop through the data and append to searchParams
    for (const pair of formData) {
      search.append(pair[0], pair[1]);
      // console.log(pair[0], pair[1]);
    }

    try {
      const signup = await fetch(`${url}parcels`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-access-token': `${token}`,
        },
        method: 'POST',
        body: search,
      });
      const res = await signup.json();
      const data = await res;
      modal.style.display = "none";
      resetForm();

      if (!res || signup.status === 400) {
        console.log(data.message);
      } else if (pBody.innerHTML === 'NO PARCEL ORDER HAS BEEN MADE! ' || pBody.textContent === 'NO PARCEL ORDER HAS BEEN MADE! ') {
        // Insert the data created to start
        insertnewRow(data.Parcel);

        // Start with the initial index
        cell0.innerHTML = `${l + 1}`;

        // display the table and hide the 
        pTable.style.display = 'block'
        pBody.style.display = 'none';

        // Record the data
        records(1, 1, 0);
      } else {
        insertnewRow(data.Parcel);
        cell0.innerHTML = `${l + 1}`;

        // console.log(data)

        // MObile
        // Assign values to the option ta for mobile view
        option += `<option value="${l + 1}">${l + 1}</option>`

        parcelHolder[`${l + 1}`] = data.Parcel
        refresh();
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  } else {
    updateParcel();
    // resetForm();
  }
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

//  Update the form data
async function updateParcel() {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = sessionStorage.getItem('selected');

  const c = row;

  formData = new FormData(form);
  search = new URLSearchParams();

  for (const pair of formData) {
    if (pair[0] === 'location') {
      selectedRow.cells[4].innerHTML = pair[1]
    };

    if (pair[0] === 'status') {
      selectedRow.cells[5].innerHTML = pair[1]
    }

    search.append(pair[0], pair[1].trim());
    console.log(pair[0], pair[1]);
  }

  console.log(currentParcel)
  try {
    const res = await fetch(`${url}parcels/${currentParcel[c - 1]}/destination`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'PUT',
      body: search,
    });
    const result = await res.json();

    if (result) {
      // console.log(result)
      console.log('Updated');
      // resetForm()
    }
  } catch (err) {
    console.log(err);
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

// Re-arrange the serial number of the DOM
function regroup(i, rc, ti) {
  for (let j = (i + 1); j < rc; j++) {
    ti.rows[j].cells[0].innerHTML = j - 1
  }
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