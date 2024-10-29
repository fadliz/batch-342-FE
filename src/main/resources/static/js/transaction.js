const newOrderBtn = document.getElementById("newOrderBtn");
const paymentBtn = document.getElementById("paymentBtn");
const transactionBtn = document.getElementById("transactionBtn");
const payButton = document.getElementById("payButton");
let variantData = [];
let timeout;

document.addEventListener("DOMContentLoaded", (event) => {
  loadVariants();
});

function openNewOrderModal() {
  $("#orderModal").modal("show");
}

function openPaymentModal() {
  $("#paymentModal").modal("show");
  populatePaymentModal();
  payButton.onclick = function () {
    submitPaymentForm();
    payButton.classList.add("disabled");
  };
}

function startTransaction() {
  newOrderBtn.classList.remove("disabled");
  transactionBtn.classList.add("disabled");
  populateTable(variantData);
  generateReference();
}

function loadVariants() {
  $.ajax({
    type: "get",
    url: "http://localhost:9001/api/variant",
    contentType: "application/json",
    success: function (variantResponse) {
      variantData = variantResponse.data;
    },
  }).responseText;
}

function populateTable(variants) {
  let tbody = document.getElementById("orderBody");
  tbody.innerHTML = "";

  variants.forEach((variant, index) => {
    let row = document.createElement("tr");
    row.classList.add("align-middle");

    row.innerHTML = `
          <td>
              <button class="btn btn-warning" id="starBtn" value="${variant.id}" onclick="moveToTable(this, this.value)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
                  <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
              </svg>
              </button>
          </td>
          <td >${variant.slug}</td>
          <td >${variant.name}</td>
          <td >${variant.price}</td>
          <td >${variant.stock}</td>
        `;

    tbody.appendChild(row);
  });
}

function moveToTable(btn, variantId) {
  let deleteRow = btn.closest("tr");
  deleteRow.classList.add("d-none");

  let tbody = document.getElementById("orderTableInput");
  let inputRow = document.createElement("tr");
  inputRow.classList.add("align-middle");
  let variant = variantData.find((v) => v.id === parseInt(variantId));
  inputRow.innerHTML = `
          <td >
            <input required disabled type="text" class="form-control form-control-sm" autocomplete="off" placeholder="${
              variant.name
            }"/>
          </td>
          <td >
            <input required disabled type="text" class="form-control form-control-sm" autocomplete="off" placeholder="${
              variant.price
            }"/>
          <td>
            <input required type="number" id="quantity" name="quantity" class="form-control form-control-sm" autocomplete="off" value=1 min=1
            max=${variant.stock} placeholder="Input Quantity" onchange="loadAmount(${
              variant.price
            }, this)" onkeyup="loadAmount(${variant.price}, this)"/>
          </td>
          <td >
            <input readonly required type="number" id="price" name="price" class="form-control form-control-sm" autocomplete="off" value="${
              variant.price
            }" placeholder="Amount"/>
          </td>
          <td>
              <input required hidden type="number" id="variantId" name="variantId" value="${parseInt(
                variantId
              )}"/>
              <button class="btn btn-danger btn-sm" onclick="moveBack(${variantId}, this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                viewBox="0 0 24 24"><path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 
                1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 
                1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 
                .901.73 2 1.631 2h5.712z"/></svg>
              </button>
          </td>
        `;

  tbody.appendChild(inputRow);
  loadTotal();
  checkPaymentBtn();
}

function moveBack(variantId, delBtn) {
  let ordersTable = document.querySelectorAll('button[id="starBtn"]');
  ordersTable.forEach((orders) => {
    if (orders.value == variantId) {
      orders.closest("tr").classList.remove("d-none");
    }
  });
  let delTableRow = delBtn.closest("tr");
  delTableRow.remove();
  loadTotal();
  checkPaymentBtn();
}

function generateReference() {
  $.ajax({
    type: "get",
    url: "http://localhost:9001/api/order-header/ref",
    contentType: "application/json",
    success: function (referenceJson) {
      document.getElementById("generatedReference").value = referenceJson.data;
    },
  });
}

function enforceMinMax(el) {
  if (el.value != "") {
    if (parseInt(el.value) < parseInt(el.min)) {
      el.value = el.min;
    }
    if (parseInt(el.value) > parseInt(el.max)) {
      el.value = el.max;
    }
  }
  return el.value;
}

function loadAmount(price, product) {
  let quantity = enforceMinMax(product);
  product.closest("tr").querySelector("#price").value = quantity * price;
  loadTotal();
}

function loadTotal() {
  let quantityInputs = document.querySelectorAll('input[name="quantity"]');
  let priceInputs = document.querySelectorAll('input[name="price"]');
  let totalQuantity = 0;
  let totalAmount = 0;
  quantityInputs.forEach((quantity) => {
    totalQuantity +=
      parseInt(quantity.value) > 0 ? parseInt(quantity.value) : 0;
  });

  priceInputs.forEach((prices) => {
    totalAmount += parseInt(prices.value);
  });

  document.getElementById("totalQty").value = totalQuantity;
  document.getElementById("amount").value = totalAmount;
}

function checkPaymentBtn() {
  let currentAmount = document.getElementById("amount").value;
  if (parseInt(currentAmount) != 0) {
    paymentBtn.classList.remove("disabled");
  } else {
    paymentBtn.classList.add("disabled");
  }
}

function getTableData() {
  let table = document.getElementById("orderTable");
  let data = [];
  let arr = Array.from(table.rows);
  arr.forEach((row, index) => {
    if (index === 0 || index === arr.length - 1) return;
    let rowData = {};
    let cells = row.querySelectorAll("td input"); // Select only <td> with <input>

    // Loop through each cell to get input values
    cells.forEach((input) => {
      if (input.name === "") return;
      rowData[`${input.name}`] = input.value;
    });
    data.push(rowData);
  });
  return data;
}

function populatePaymentModal() {
  $("#bill").val(document.getElementById("amount").value);
}

function loadChange(payment) {
  let bill = $("#bill").val();
  $("#change").val(payment - bill);
  if (payment - bill >= 0) {
    payButton.classList.remove("disabled");
  } else {
    payButton.classList.add("disabled");
  }
}

function submitPaymentForm() {
  processTransaction("POST", "http://localhost:9001/api/transaction");
}

// TODO: Combine order header and order detail into one transaction
// TODO: get variants stock from repository
// TODO: add how many stock left from transaction if succesful to transaction payload

function processTransaction(method, url) {
  const formData = new FormData(document.getElementById("paymentForm"));
  let genReference = document.getElementById("generatedReference");
  formData.append("createdBy", "Admin");
  formData.append("reference", genReference.value);
  const data = Object.fromEntries(formData.entries());
  if (data.deleted === undefined) {
    data.deleted = false;
  } else {
    data.deleted = true;
  }

  const tabData = getTableData().entries();
  let orderDetails = [];
  tabData.forEach((data) => {
    data[1]["createdBy"] = "Admin";
    if (data[1]["price"] > 0) {
      orderDetails.push(data[1]);
    }
  });

  const jsonData = {
    orderHeader: data,
    orderDetails: orderDetails,
  };

  $.ajax({
    type: method,
    url: url,
    data: JSON.stringify(jsonData),
    contentType: "application/json",
    success: function (response) {
      console.log(response);
      timeout = setTimeout(function () {
        window.location.reload(1);
      }, 3000);
      // window.location.reload();
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
      alert("Error submitting form");
    },
  });
  $("#reference").val(genReference.value);
  $("#paymentModalLabel").html("Payment: Terima Kasih!");
}
