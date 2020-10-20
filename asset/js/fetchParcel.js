let selectedRow;
const modal = document.querySelector('.bg-modal');
const nav = document.querySelector('nav');
const table = document.getElementById('parcelTable')
const url = getHostUrl();
const token = getCookie('session_');
const parcels = {};
let cell0;
let formData;
let search;

function autocompletePlace() {
  const input = document.querySelector('.place')
  const autocomplete = new google.maps.places.Autocomplete(input);
}

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
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
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

  // refresh();
}

async function Delete(td) {
  // Get the parcels from the server
  const req = await getParcels();
  const data = req

  // LOOP throught the data
  for (let i = 0; i < data.rowCount; i++) {
    parcels[i] = data.rows[i].id;
  }

  // Set new cokkies off the new parcel ID
  setCookie('parcels', JSON.stringify(parcels), 1);

  // Prompt user for comfirmation
  if (confirm('Are you sure to delete this record?')) {
    row = td.parentElement.parentElement;

    let tCount = table.rows.length;

    // re-arrange the serial number
    regroup(row.rowIndex, tCount, table)
    
    // Delete the parcel from the DB
    deleteParcel(td);

    // Delete the parcel from the DOM
    document.getElementById('parcelTable').deleteRow(row.rowIndex);
  }
}

async function deleteParcel(td) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = td.parentElement.parentElement;

  const c = row.rowIndex;
  console.log(c, );
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

  } catch (err) {
    console.log(err);
  }
}

async function refresh() {
  const table = document.getElementById('parcelTable')
  // .getElementsByTagName('tbody')[0];
  let tCount = table.rows.length;
  let tIndex = parseInt(sessionStorage.getItem('selected'));

  regroup(tIndex, tCount, table)

}

// Re-arrange the serial number of the DOM
function regroup(i, rc, ti) {
  for (let j = (i + 1); j < rc; j++) {
    ti.rows[j].cells[0].innerHTML = j - 1
  }
};

// Handle the mobile layout DOM
function mEdit(td) {
  modal.style.display = "initial";
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
}

function mDelete(td) {
  if (confirm('Are you sure to delete this record?')) {
    row = td.parentElement.parentElement;
    document.getElementById('parcelTable').deleteRow(row.rowIndex);
    // refresh();
    mdeleteParcel(td);
  }
};

async function mdeleteParcel(td) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = td.parentElement.parentElement;

  const c = row.rowIndex;

  // console.log(c, currentParcel);
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
    refresh()

  } catch (err) {
    console.log(err);
  }
}