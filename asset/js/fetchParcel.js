let selectedRow;
const modal = document.querySelector('.bg-modal');
const nav = document.querySelector('nav');
const table = document.getElementById('parcelTable');
const record = document.querySelector('.order-record');
const pBody = document.querySelector('.parcelBody');
const pTable = document.querySelector('#parcelTable');
const parcelFormat = document.querySelector('#pFormat');
const url = getHostUrl();
const token = getCookie('session_');
const parcels = {};
let option = `<option value="0">Orders</option>`
let selected = sessionStorage.getItem('selected');
let cell0;
let formData;
let search;
let width;
let tCount;
let l;

function autocompletePlace() {
  const input = document.querySelector('.place')
  const autocomplete = new google.maps.places.Autocomplete(input);
}

// Window resize event
window.addEventListener("resize", () => {
  width = window.innerWidth
})

function getHostUrl() {
  if (window.location.host.indexOf('localhost') === 0 ||
    window.location.host.indexOf('127.0.0.1') === 0) {
    return 'http://127.0.0.1:3000/api/v1/';
  }
  console.log('remote host');
  return 'https://sendit-postgres.herokuapp.com/api/v1/';
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

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/; Secure`;
  return document.cookie;
}

function insertnewRow(data) {
  const table = document.getElementById('parcelTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow(table.length);

  cell0 = newRow.insertCell(0);

  const cell1 = newRow.insertCell(1);
  cell1.innerHTML = data.recipient;

  const cell2 = newRow.insertCell(2);
  cell2.innerHTML = data.weight;

  const cell3 = newRow.insertCell(3);
  cell3.innerHTML = data.destination;

  const cell4 = newRow.insertCell(4);
  cell4.innerHTML = data.location;

  const cell5 = newRow.insertCell(5);
  cell5.innerHTML = data.phone;

  const cell6 = newRow.insertCell(6);
  cell6.innerHTML = data.weight * 2;

  const cell7 = newRow.insertCell(7);
  cell7.innerHTML = '<button onclick="onFOrmSubmit(this)">Edit</button>';

  const cell8 = newRow.insertCell(8);
  cell8.innerHTML = '<button onclick="Delete(this)" >Cancel Order</button>';
}

// Get all parcels
async function getParcels() {
  try {
    const res = await fetch(`${url}parcels`, {
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

// Get a percel
async function getAParcel(id) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = id.parentElement.parentElement;

  const c = row.rowIndex;

  try {
    const res = await fetch(`${url}parcels/${currentParcel[c - 1]}`, {
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

// Reset all form column
function resetForm() {
  document.querySelector('#recipient').removeAttribute('disabled', true);
  document.querySelector('#weight').removeAttribute('disabled', true);
  document.querySelector('#pickup').removeAttribute('disabled', true);
  document.querySelector('#phone').removeAttribute('disabled', true);

  document.querySelector('#recipient').value = '';
  document.querySelector('#weight').value = '';
  document.querySelector('#destination').value = '';
  document.querySelector('#pickup').value = '';
  document.querySelector('#phone').value = '';
  document.querySelector('#submit').value = 'Create Oder';
  selectedRow = null;
}

// Edit the specified form data
function Edit(td) {
  modal.style.display = "flex";
  selectedRow = td.parentElement.parentElement;
  sessionStorage.setItem('selected', selectedRow.rowIndex);

  document.querySelector('#recipient').setAttribute('disabled', true);
  document.querySelector('#weight').setAttribute('disabled', true);
  document.querySelector('#pickup').setAttribute('disabled', true);
  document.querySelector('#phone').setAttribute('disabled', true);

  document.querySelector('#recipient').value = selectedRow.cells[1].innerHTML;
  document.querySelector('#weight').value = selectedRow.cells[2].innerHTML;
  document.getElementById('destination').value = selectedRow.cells[3].innerHTML;
  document.querySelector('#pickup').value = selectedRow.cells[4].innerHTML;
  document.querySelector('#phone').value = selectedRow.cells[5].innerHTML;

  document.querySelector('#submit').value = 'Update Destination';

  // const table = document.getElementById('parcelTable').getElementsByTagName('tbody')[0]
  // console.log(table.childElementCount, table)
  // console.log(selectedRow.rowIndex)

  // refresh(td);
}

// Delete data from DB and selected row
async function Delete(td) {
  // Get the parcels from the server
  const req = await getParcels();
  const data = req
  // Get the total number of available table row

  // LOOP throught the data
  for (let i = 0; i < data.rowCount; i++) {
    parcels[i] = data.rows[i].id;

    // Assign values to the option ta for mobile view
    option += `<option value="${i + 1}">${i + 1}</option>`

    // if (pBody.innerHTML === 'NO PARCEL ORDER HAS BEEN MADE! ' || pBody.textContent === 'NO PARCEL ORDER HAS BEEN MADE! ') {
    //   pTable.style.display = 'block'
    //   pBody.innerHTML = 'none';
    // }
  }
  
  parcelFormat.innerHTML = option;

  // Set new cokkies off the new parcel ID
  setCookie('parcels', JSON.stringify(parcels), 1);

  // Prompt user for comfirmation
  if (confirm('Are you sure to delete this record?')) {
    row = td.parentElement.parentElement;

    tCount = table.rows.length;

    // Refresh order data
    refresh(td)
    l = tCount - 1;

    if (l <= 1 ) {
      pBody.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
      pBody.style.display = 'flex';
      pTable.style.display = 'none';
    }

    // re-arrange the serial number
    regroup(row.rowIndex, tCount, table)

    // Delete the parcel from the DB
    deleteParcel(td);

    // Delete the parcel from the DOM
    document.getElementById('parcelTable').deleteRow(row.rowIndex);
  }
}

// Delete te selected data from DB 
async function deleteParcel(td) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = td.parentElement.parentElement;

  const c = row.rowIndex;
  // console.log(c, );
  try {
    const res = await fetch(`${url}parcels/${currentParcel[c - 1]}/cancel`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'DELETE',
    });
    const result = await res.json();
    const data = await result;

    // console.log(data);

  } catch (err) {
    console.log(err);
  }
}

// Refresh function to make decreament base on order status
async function refresh(td) {
  const pending = record.childNodes[1].textContent.split(':')[1]
  const delivered = record.childNodes[3].textContent.split(':')[1];
  const total = record.childNodes[5].textContent.split(':')[1];

  const result = await getAParcel(td)
  const data = result;

  if (data.status !== 'delivered') {
    // if (width <= 480) {
    //   return console.log('Screen 480: Not delivered')
    // }
    return records(total - 1, pending - 1, 0);
  } else {
    // if (width <= 480) {
    //   return console.log('Screen 480: delivered')
    // }
    records((total - 1), pending, delivered - 1);
  }

  console.log(pending, delivered, total)
}

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

// Handle the mobile layout DOM
// For form edit
function mEdit(td) {
  modal.style.display = "flex";
  selectedRow = td.parentElement;

  document.querySelector('#recipient').setAttribute('disabled', true);
  document.querySelector('#weight').setAttribute('disabled', true);
  document.querySelector('#pickup').setAttribute('disabled', true);
  document.querySelector('#phone').setAttribute('disabled', true);

  document.querySelector('#recipient').value = document.querySelector('.recipient').textContent.split(':')[1];
  document.querySelector('#weight').value = document.querySelector('.weight').textContent.split(':')[1];
  document.getElementById('destination').value = document.querySelector('.destination').textContent.split(':')[1];
  document.querySelector('#pickup').value = document.querySelector('.location').textContent.split(':')[1];
  document.querySelector('#phone').value = document.querySelector('.phone').textContent.split(':')[1];

  document.querySelector('#submit').value = 'Update Destination';

  // refresh(td)
  mDelete(td)
};

// For row delete
async function mDelete(td) {
  // delete parcelHolder[selected]
  // mdeleteParcel(td);

  // Get the parcels from the server
  const req = await getParcels();
  const data = req

  // LOOP throught the data
  for (let i = 0; i < data.rowCount; i++) {
    parcels[i] = data.rows[i].id;

    // Assign values to the option ta for mobile view
    option += `<option value="${i + 1}">${i + 1}</option>`
  }  
  // parcelFormat.innerHTML = option;

  // Set new cokkies off the new parcel ID
  setCookie('parcels', JSON.stringify(parcels), 1);

  if (confirm('Are you sure to delete this record?')) {
    row = td.parentElement.parentElement.parentElement.childNodes[1].innerHTML
    // document.getElementById('parcelTable').deleteRow(row.rowIndex);
    // refresh(td);

    // if (width <= 480) {
      if (td.parentElement.parentElement.parentElement.childNodes[1]) {
        // selectedRow.childNodes[5].textContent.split(':')[1] = pair[1]

        // delete td.parentElement.parentElement.parentElement.childNodes[1].childNodes[selected + 1]
        console.log('deleted')

        parcelFormat.remove(selected)
      }
    // }
  }
  console.log(td.parentElement.parentElement.parentElement.childNodes[1].childNodes)
  // console.log(td.parentElement.parentElement.parentElement.childNodes[1].childNodes[selected + 1])
};

// For data delete
async function mdeleteParcel(td) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = sessionStorage.getItem('selected');

  const c = row;

  try {
    const res = await fetch(`${url}parcels/${currentParcel[c - 1]}/cancel`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'DELETE',
    });
    const result = await res.json();
    const data = await result;

    console.log(data);
    // refresh(td)

  } catch (err) {
    console.log(err);
  }
}