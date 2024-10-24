document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});

const saveButton = document.getElementById("saveButton");
const deleteButton = document.getElementById("deleteButton");

function loadData() {
  $.ajax({
    type: "get",
    url: "http://localhost:9001/api/product",
    contentType: "application/json",
    success: function (productResponse) {
      let productData = productResponse.data;
      populateTable(productData);
    },
  });
}

function populateTable(products) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  products.forEach((product, index) => {
    const isChecked = product.deleted ? "checked" : "";
    const row = document.createElement("tr");
    row.classList.add("align-middle");

    row.innerHTML = `
          <td >${index + 1}</td>
          <td >${product.slug}</td>
          <td >${product.name}</td>
          <td >${product.category.name}</td>
          <td >${product.createdBy}</td>
          <td class="text-center">
              <input disabled type="checkbox" class="form-check-input" style="border: 1px solid #000;"
              name="deleted" autocomplete="off" ${isChecked}/>
          </td>
          <td>
              <button class="btn btn-warning" onclick="openForm('Edit Product','edit','${
                product.id
              }')">Edit</button>
              <button class="btn btn-danger" onclick="openForm('Delete ${
                product.name
              } ?','delete','${product.id}')">Delete</button>
          </td>
        `;

    tbody.appendChild(row);
  });
}

function openForm(title, type, id = null) {
  deleteButton.classList.add("d-none");
  saveButton.classList.remove("d-none");
  $.ajax({
    type: "get",
    url: "/product/form",
    contentType: "html",
    success: function (productForm) {
      $("#productModal").modal("show");
      $(".modal-title").html(title);
      $(".modal-body").html(productForm);
    },
  });

  if (type === "add") {
    saveButton.textContent = "Save Changes";
    loadCategory();
    saveButton.onclick = function () {
      submitProductForm("POST", "http://localhost:9001/api/product");
    };
  } else if (type === "edit") {
    saveButton.textContent = "Update Product";
    loadForm(id);
    saveButton.onclick = function () {
      submitProductForm("PUT", `http://localhost:9001/api/product/${id}`);
    };
  } else if (type === "delete") {
    saveButton.classList.add("d-none");
    deleteButton.classList.remove("d-none");
    loadForm(id, type);
    deleteButton.onclick = function () {
      submitProductForm("DELETE", `http://localhost:9001/api/product/${id}`);
    };
  }
}

function submitProductForm(method, url) {
  const formData = new FormData(document.getElementById("productForm"));
  const data = Object.fromEntries(formData.entries());
  if (data.deleted === undefined) {
    data.deleted = false;
  } else {
    data.deleted = true;
  }
  const dataJson = JSON.stringify(data);
  $.ajax({
    type: method,
    url: url,
    data: dataJson,
    contentType: "application/json",
    success: function (response) {
      window.location.reload();
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
      alert("Error submitting form");
    },
  });
}

function loadForm(id, type = null) {
  $.ajax({
    type: "get",
    url: `http://localhost:9001/api/product/${id}`,
    contentType: "application/json",
    success: function (productResponse) {
      let productData = productResponse.data;
      loadCategory(productData.categoryId);
      populateForm(productData, type);
    },
  });
}

function loadCategory(categoryId = null) {
  $.ajax({
    type: "GET",
    url: "http://localhost:9001/api/category",
    contentType: "application/json",
    success: function (response) {
      $("#categoryId").empty();
      $("#categoryId").append(
        `<option value="" selected disabled hidden>Choose here</option>`
      );
      $.each(response.data, function (index, category) {
        const isSelected = categoryId === category.id ? "selected" : "";
        $("#categoryId").append(
          `<option value="${category.id}" ${isSelected}> ${category.name}</option>`
        );
      });
    },
  });
}

function populateForm(product, type = null) {
  // Set values for text inputs and hidden fields
  document.getElementById("productId").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("createdBy").value = product.createdBy;
  // Set checkbox value
  document.getElementById("isDeleted").checked = product.deleted;
  if (type === "delete") {
    document.getElementById("productId").disabled = true;
    document.getElementById("categoryId").disabled = true;
    document.getElementById("name").disabled = true;
    document.getElementById("createdBy").disabled = true;
    document.getElementById("isDeleted").disabled = true;
  }
}
