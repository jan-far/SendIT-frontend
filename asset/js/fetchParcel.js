let selectedRow;

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
  selectedRow = td.parentElement.parentElement;
  sessionStorage.setItem('selected', selectedRow.cells[0].innerHTML);

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
}

function Delete(td) {
  if (confirm('Are you sure to delete this record?')) {
    row = td.parentElement.parentElement;
    document.getElementById('parcelTable').deleteRow(row.rowIndex);
    refresh();
    deleteParcel(td);
  }
}

const url = getHostUrl();
const token = getCookie('session_');
const parcels = {};
let cell0;
let formData;
let search;

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

async function deleteParcel(td) {
  const currentParcel = JSON.parse(getCookie('parcels'));
  row = td.parentElement.parentElement;
  refresh()
  const c = row.cells[0].innerHTML;
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

  } catch (err) {
    console.log(err);
  }
}

async function refresh() {
  const result = await getParcels()
  const data = result;

  for (let i = 0; i < data.rowCount; i++) {
    parcels[i] = data.rows[i].id;
    cell0.innerHTML = i + 1;
    // console.log(cell0.innerHTML);
  }
  // API.setCookie('parcels', JSON.stringify(parcels), 1);
}
