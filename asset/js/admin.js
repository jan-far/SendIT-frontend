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
const user = {};
let cell0;
let tbl, tbl1, tbl2;
let usr;
let id;

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
}

// Insert new table data
function insertnewRow(x, y, data, d) {
  // Gte the Node list of all Table element
  tbl = document.querySelectorAll('table')

  // If a table tilte is not Empty
  if (tbl[x].title !== "") {
    // Assign param Y
    if (y == `${undefined}#${undefined}`) {
      console.log('won de')
      return;
    }
    tbl = y;
  } else {
    // set the TITLE attribute from the param D, which is the user detail
    tbl[x].setAttribute('title', `${d.Profile.firstname} ${d.Profile.lastname}`);
    tbl = tbl[x].localName + '#' + tbl[x].id;
  }

  // Get th table body
  const table = document.querySelector(`${tbl}`).getElementsByTagName('tbody')[0];
  
  // Insert new table row
  const newRow = table.insertRow(table.length);

  cell0 = newRow.insertCell(0);

  let z = document.querySelectorAll('table');
  console.log(z[x].rowsIndex )
  cell0.innerHTML = z[x].id;
    cell0.setAttribute('rowspan', `${x}`)

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
  cell6.innerHTML = data.status;

  const cell7 = newRow.insertCell(7);
  cell7.innerHTML = '<button class="edit" onclick="Edit(this)">Edit</button>';

  tbl = document.querySelectorAll('table')
}

// Get all users data
async function getParcels() {
  try {
    const res = await fetch(`${url}/admin/parcels`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-access-token': `${token}`,
      },
      method: 'GET',
    });
    const result = await res.json();
    const data = result;

    for (let w = 0; w < data.rowCount; w++) {
      id = data.rows[w].owner_id;
      user[w] = id;
    }

    return { res, result };
  } catch (err) {
    console.log(err);
  }
};

// Get User
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
}

window.addEventListener('load', async () => {
  // myOrder.innerHTML += Table();

  const { res, result } = await getParcels();
  const rqst = res;
  const data = result;

  if (rqst.statusCode === 400 || !token) {
    window.location.href = ('../admin');
  }

  if (!rqst) {
    console.log('error occured');
  } else if (data.rows === [] || data.rowCount === 0) {
    console.log('an empty data');

    // disable table and mobiles
    pTable.classList.add('disable')
    pMobile.classList.add('disable')
    pBody.innerHTML = 'NO PARCEL ORDER HAS BEEN MADE! ';
  } else {
    // console.log(Object.keys(user).length)

    for (let i = 0; i < Object.keys(user).length; i++) {
      if (user[i] === data.rows[i].owner_id) {
        usr = await getUser(user[i]);

        // console.log(usr.Profile.id, id)

        // if (usr.Profile.id) {
        if (tbl == undefined) {
          myOrder.innerHTML += Table(usr)
        } else if (tbl[i - 1] == undefined) {
          // tbl1 = document.querySelectorAll('table');
          tbl.forEach((userT, index) => {
            // console.log(userT.id, `a${user[index].toString().split('-')[4]}`, index)
            if (userT.id == `a${user[index].toString().split('-')[4]}`) {
              // console.log(tbl2, index)
              tbl2 = tbl2[index].localName + '#' + tbl2[index].id;
              insertnewRow(index, tbl2, data.rows[i], usr);
            }
            return;
          })
          return;
        } else if (tbl[i - 1].id !== `a${user[i].toString().split('-')[4]}`) {
          // console.log(tbl[i - 1].id);
          myOrder.innerHTML += Table(usr)
        } else if (tbl[i - 1].id == `a${user[i].toString().split('-')[4]}`) {
          // console.log('already exist')
          // console.log(i)
          insertnewRow(i - 1, tbl2, data.rows[i], usr);
        }

        tbl2 = document.querySelectorAll('table');
        const fullName = `${usr.Profile.firstname} ${usr.Profile.lastname}`;

        // console.log(tbl2[i])
        if (tbl2[i] == undefined) {
          continue;
        } else if (tbl2[i].title !== '') {
          tbl2 = tbl2[i].localName + '#' + tbl2[i].id;
          insertnewRow(i, tbl2, data.rows[i], usr);
        }
        tbl2[i].setAttribute('id', `a${user[i].toString().split('-')[4]}`);
        // console.log(tbl2[i].id);
        tbl2 = tbl2[i].localName + '#' + tbl2[i].id;
        insertnewRow(i, tbl2, data.rows[i], usr);
        // }
      }
    }

    // for (let i = 0; i < data.rowCount; i++) {
    //   // cell0.innerHTML = i
    //   tbl = document.querySelectorAll('table')
    //   console.log(tbl[i].getElementsByTagName('tbody')[0])
    // }

  }

})

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
    resetForm();
  }
});

//  Update the form data
async function updateParcel() {
  const currentParcel = JSON.parse(API.getCookie('parcels'));
  row = sessionStorage.getItem('selected');

  const c = row;
  // console.log(selectedRow, row);

  formData = new FormData(form);
  search = new URLSearchParams();

  for (const pair of formData) {
    if (width <= 480) {
      if (selectedRow.childNodes[11].className) {
        // selectedRow.childNodes[5].textContent.split(':')[1] = pair[1]
        // console.log(selectedRow.childNodes[7])
        selectedRow.childNodes[7].innerHTML = `Destination: ${pair[1].toString().trim()}`
        // parcelHolder[row].destination = pair[1]
      }
    }
    else if (selectedRow.cells[7].childNodes[0].className) {
      selectedRow.cells[3].innerHTML = pair[1]
      // parcelHolder[row].destination = pair[1]
      // console.log(parcelHolder[row].destination)
    };
    // }

    search.append(pair[0], pair[1].trim());
    console.log(pair[0], pair[1]);
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
      // console.log(result)
      console.log('Updated');
      resetForm()
    }
  } catch (err) {
    console.log(err);
  }
}

// Table
function Table(data) {
  return (`
<div class="my-order">
<table border="1">
    <caption>USER: ${data.Profile.firstname} ${data.Profile.lastname}</caption>
    <thead>
    <tr>
            <th>S/N</th>
            <th>Recipient</th>
            <th>weight</th>
            <th>City of Destination</th>
            <th>Pickup location</th>
            <th>Recipient Phone number</th>
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
}