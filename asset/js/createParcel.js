import API from './host.js';

const url = API.getHostUrl();
const token = API.getCookie('session_');
const form = document.querySelector('form');
const submit = document.querySelector('#submit');
const record = document.querySelector('.order-record');
const modal = document.querySelector('.bg-modal');
const pTable = document.querySelector('#parcelTable')
const pBody = document.querySelector('.parcelBody');
const createOrder = document.querySelector('.create-order');
const sel = document.querySelector('#pFormat');
const pMobile = document.querySelector('.parcelFormat');
const parcelFormat = document.querySelector('#pFormat');
const parcelTemp = document.querySelector('.parcelTemp');
const table = document.getElementById('parcelTable').getElementsByTagName('tbody')[0]
const notiPanel = document.querySelector('.noti-panel');
const notification = document.querySelector('.notification');
const span = document.querySelector('.closeNote');
const parcels = {};
let parcelHolder = {};
let cell0;
let formData;
let search;
let row;
let width;
let l;

notiPanel.style.display = 'none';

span.onclick = () => {
  notiPanel.style.display = 'none';
};

let count = 0;
// const l = Object.keys(JSON.parse(API.getCookie('parcels'))).length
let option = `<option value="0">Orders</option>`
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

//  Event listener to close popup
document.querySelector('.close').addEventListener("click", () => {
  // modal.style.display = "none";
  // nav.style.display = "grid"
  resetForm();
});

// Insert new table data
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

// Get parcels from the server
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
    //     records(data.rowCount, count, (data.rowCount - count));
    //   }
    //   API.setCookie('parcels', JSON.stringify(parcels), 1);
    // }
  } catch (err) {
    console.log(err);
  }
}

//  ON windows load
window.addEventListener('load', async () => {
  const result = await getParcels()
  const data = result
  width = window.innerWidth
  resetForm()

  if (!result) {
    console.log('error occured');
  } else if (data.rows === [] || data.rowCount === 0) {
    // console.log('an empty data');

    // disable table and mobiles
    pTable.classList.add('disable')
    pMobile.classList.add('disable')
    pBody.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
    records(0, 0, 0);
  } else {
    // Enable table and mobiles
    pTable.classList.remove('disable')
    pMobile.classList.remove('disable')

    // loop throught the data
    for (let i = 0; i < data.rowCount; i++) {
      // save data gotten to browser db
      // localStorage.setItem(`data${i + 1}`, JSON.stringify(data.rows[i]))

      // save data to the parcelHolder object 
      parcelHolder[`${i + 1}`] = data.rows[i]

      // insert into table rows
      insertnewRow(data.rows[i]);

      if (data.rows[i].status === "delivered") {
        const index = i + 1
        let editCell = table.childNodes[index].childNodes[7].firstChild
        editCell.setAttribute('disabled', true);
        editCell.classList.add('disabled');
        // console.log(table.childNodes[index].childNodes[7].firstChild.disabled)
      }
      // console.log(data.rows[i]);

      // save up parcels id
      parcels[i] = data.rows[i].id;
      cell0.innerHTML = i + 1;

      // Assign values to the option ta for mobile view
      option += `<option value="${i + 1}">${i + 1}</option>`

      // Count the parcels that are yet to be delivered
      if (data.rows[i].status !== 'delivered') {
        count += 1;
      } else {
        count = 0;
      }

      records(data.rowCount, count, (data.rowCount - count));
    }
    // console.log(parcelHolder)

    // ---------------------------------------------------------------------
    // MOBILE: display the select options
    parcelFormat.innerHTML = option;

    // listen to change in option selected
    parcelFormat.addEventListener('change', () => {
      sessionStorage.setItem('selected', parcelFormat.value)

      // const item = JSON.parse(localStorage.getItem(`data${sel.value}`));
      const item = parcelHolder[`${sel.value}`]

      // display the saved data
      if (item == null) {
        parcelTemp.style.backgroundColor = 'unset'
        parcelTemp.innerHTML = " "
      } else {
        parcelTemp.style.backgroundColor = 'lightsalmon'
        parcelTemp.innerHTML = pFormat(item);
      }
    })
    API.setCookie('parcels', JSON.stringify(parcels), 1);
  }
});

// Window resize event
window.addEventListener("resize", () => {
  width = window.innerWidth
})

//  Reeset form data
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
  // selectedRow = null;
  // nav.style.display = "grid";
  modal.style.display = "none";
}

//  Update the form data
async function updateParcel() {
  const currentParcel = JSON.parse(API.getCookie('parcels'));
  row = sessionStorage.getItem('selected');

  const c = row;
  // console.log(selectedRow, row);

  formData = new FormData(form);
  search = new URLSearchParams();

  for (const pair of formData) {
    // if (width <= 480) {
    //   if (selectedRow.childNodes[11].className) {
    //     // selectedRow.childNodes[5].textContent.split(':')[1] = pair[1]
    //     // console.log(selectedRow.childNodes[7])
    //     selectedRow.childNodes[7].innerHTML = `Destination: ${pair[1].toString().trim()}`
    //     // parcelHolder[row].destination = pair[1]
    //   }
    // }
    // else 
    if (selectedRow.cells[7].childNodes[0].className) {
      selectedRow.cells[3].innerHTML = pair[1].toLowerCase().trim()
      // parcelHolder[row].destination = pair[1]
      // console.log(parcelHolder[row].destination)
    };
    // }

    search.append(pair[0], pair[1].toLowerCase().trim());
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

    // Success funtion to enable the notification on successful execution
    const succ = () => {
      notiPanel.classList.add('successful');
      notiPanel.classList.remove('failed');
      notiPanel.style.display = 'flex';
      notification.innerHTML = `${result.message}`;
    }

    // Fail funtion to enable the notification on error
    const fail = () => {
      notiPanel.classList.remove('successful');
      notiPanel.classList.add('failed');
      notiPanel.style.display = 'flex';
      notification.innerHTML = `${result.message}`;
    }

    if (res.status === 200) {
      // set timeout to remove displat after 5sec
      setTimeout(() => {
        notiPanel.style.display = 'none';
      }, 5000, succ())
      // console.log(result)
      // console.log('Updated');
      resetForm()
    } else {
      // set timeout to remove displat after 5sec
      setTimeout(() => {
        notiPanel.style.display = 'none';
      }, 5000, fail())
      resetForm()
    }
  } catch (err) {
    console.log(err);
  }
}

// On form submit
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

      if (!res || signup.status === 400) {
        console.log(data.message);

        // set timeout to remove display after 5sec
        setTimeout(() => {
          notiPanel.style.display = 'none';
        }, 5000, (() => {
          notiPanel.classList.remove('successful');
          notiPanel.classList.add('failed');
          notiPanel.style.display = 'flex';
          notification.innerHTML = 'rror Creating parcel. Please try again!';
        }))

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

        console.log(data)

        // set timeout to remove displat after 5sec
        setTimeout(() => {
          notiPanel.style.display = 'none';
        }, 5000, succ())

      } else {
        insertnewRow(data.Parcel);
        cell0.innerHTML = `${l + 1}`;

        // console.log(data)

        // set timeout to remove displat after 5sec
        setTimeout(() => {
          notiPanel.style.display = 'none';
        }, 5000, succ())

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
    resetForm();
  }
});

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
}

// Refresh function to make increament base on order status
async function refresh() {
  const pending = parseInt(record.childNodes[1].textContent.split(':')[1].trim());
  const delivered = parseInt(record.childNodes[3].textContent.split(':')[1].trim());
  const total = parseInt(record.childNodes[5].textContent.split(':')[1].trim());

  let recount = 0;
  const result = await getParcels()
  const data = result;

  for (let i = 0; i < data.rowCount; i++) {
    parcels[i] = data.rows[i].id;

    // For mobile
    // if (width <= 480) {
    //   // save data to the parcelHolder object 
    //   parcelHolder[`${i + 1}`] = data.rows[i]
    //   // console.log('new parcel', parcelHolder)

    //   option += `<option value="${i + 1}">${i + 1}</option>`

    // }

    if (data.rows[i].status == 'delivered') {
      return records(total, pending - 1, delivered + 1)
    } else if (data.rows[i].status == 'processed') {
      return records(total + 1, pending + 1, delivered);
    } else {
      return records(total + 1, pending + 1, delivered);
    }
  }
  API.setCookie('parcels', JSON.stringify(parcels), 1);
}

// Mobile view data format
function pFormat(data) {
  return (` 
    <div >
      <div >
          <details>
              <summary class='temp'>Recipient</summary>
              <p class='recipient'>Name: ${data.recipient}</p>
              <p class='phone'>Phone Number: ${data.phone}</p>
          </details>
      </div>
      <p class='weight'>Weight: ${data.weight}</p>
      <p class='location'>Location: ${data.location}</p>
      <p class='destination'>Destination: ${data.destination}</p>
      <p class='phone'>Phone: ${data.phone}</p>
      <p>Price: ${data.weight * 2}</p>
      <button class='mEdit' onclick="mEdit(this)" >Edit</button>
      <button onclick="mDelete(this)" >Cancel Order</button>
    </div>
  `)
}
