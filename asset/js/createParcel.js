import API from './host.js';

const url = API.getHostUrl();
const token = API.getCookie('session_');
const form = document.querySelector('form');
const submit = document.querySelector('#submit');
const record = document.querySelector('.order-record');
const modal = document.querySelector('.bg-modal');
const pTable = document.querySelector('#parcelTable')
const pBody = document.querySelector('.parcelBody');
const createOrder = document.querySelector('.create-order')
const parcels = {};
let cell0;
let formData;
let search;
let row;

let count = 0;
const l = Object.keys(JSON.parse(API.getCookie('parcels'))).length
API.autoRedirect();

// const input = document.querySelector('#phone');
// const IntNumber = window.intlTelInput(input, {
//   nationalMode: true,
//   utilsScript: './utils.js',
// });

// window.intlTelInput(input, {
//   preferredCountries: ['ng'],
// });

createOrder.addEventListener("click", () => {
	modal.style.display = "flex";
});

document.querySelector('.close').addEventListener("click", () => {
	modal.style.display = "none";
});

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
  cell7.innerHTML = '<button class="edit" onclick="Edit(this)">Edit</button>';

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

    // if (!result) {
    //   console.log('error occured');
    // } else if (data.rows === [] || data.rowCount === 0) {
    //   console.log('an empty data');
    //   // pBody.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
    // } else {
    //   for (let i = 0; i < data.rowCount; i++) {
    //     insertnewRow(data.rows[i]);
    //     // console.log(data.rows[i]);
    //     parcels[i] = data.rows[i].id;
    //     cell0.innerHTML = i + 1;
    //     // console.log(cell0.innerHTML);
    //     if (data.rows[i].status !== 'delivered') {
    //       count += 1;
    //     }
    //     records(data, count, (data.rowCount - count));
    //   }
    //   API.setCookie('parcels', JSON.stringify(parcels), 1);
    // }
  } catch (err) {
    console.log(err);
  }
}

window.addEventListener('load', async () => {
  const result = await getParcels()
  const data = result

  if (!result) {
    console.log('error occured');
  } else if (data.rows === [] || data.rowCount === 0) {
    console.log('an empty data');
    pTable.classList.add('disable')
    pBody.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
  } else {
    pTable.classList.remove('disable')
    for (let i = 0; i < data.rowCount; i++) {
      insertnewRow(data.rows[i]);
      // console.log(data.rows[i]);
      parcels[i] = data.rows[i].id;
      cell0.innerHTML = i + 1;
      // console.log(cell0.innerHTML);
      if (data.rows[i].status !== 'delivered') {
        count += 1;
      }
      records(data, count, (data.rowCount - count));
    }
    API.setCookie('parcels', JSON.stringify(parcels), 1);
  }
});

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

async function updateParcel() {
  const currentParcel = JSON.parse(API.getCookie('parcels'));
  row = sessionStorage.getItem('selected');

  const c = row;
  console.log(selectedRow, row);

  formData = new FormData(form);
  search = new URLSearchParams();

  for (const pair of formData) {
    search.append(pair[0], pair[1]);
    selectedRow.cells[3].innerHTML = pair[1]
    // console.log(pair[0], pair[1]);
  }

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
      console.log('Updated');
      resetForm()
    }
  } catch (err) {
    console.log(err);
  }
}

form.addEventListener('submit', async () => {
  if (submit.value !== 'Update Destination') {
    // insertnewRow(readFormData());
    // cell0.innerHTML =  `${l + 1}`
    console.log(cell0);

    formData = new FormData(form);
    search = new URLSearchParams();

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
      console.log(data)
      resetForm();

      if (!res) {
        console.log('error occured');
      } else if (data.rows === [] || data.rowCount === 0) {
        console.log('an empty data');
        // pBody.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
      } else {
        insertnewRow(data.Parcel);
        cell0.innerHTML = `${l + 1}`
        refresh()
        // parcels[l + 1] = data.Parcel.id;
        return;
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  } else {
    updateParcel();
    resetForm();
  }
});

function records(total, pending, delivered) {
  record.innerHTML = `
  <div class="pending">
      Pending Order: ${pending}
  </div>
  <div class="delivered">
      Order Delivered: ${delivered}
  </div>
  <div class="total">
      My total Order: ${total.rowCount}
  </div>
  `;
}

async function refresh() {
  const result = await getParcels()
  const data = result;

  for (let i = 0; i < data.rowCount; i++) {
    parcels[i] = data.rows[i].id;
    // cell0.innerHTML = i + 1;
    // console.log(cell0.innerHTML);
    if (data.rows[i].status !== 'delivered') {
      // count += 1;
      records(data, count + 1, (0));
    } 
    records(data, count, (data.rowCount - count))
  }
  API.setCookie('parcels', JSON.stringify(parcels), 1);
}
