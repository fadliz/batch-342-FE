document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});

const saveButton = document.getElementById("saveButton");
const deleteButton = document.getElementById("deleteButton");

function loadData() {
  $.ajax({
    type: "get",
    url: "http://localhost:9001/api/variant",
    contentType: "application/json",
    success: function (variantResponse) {
      let variantData = variantResponse.data;
      populateTable(variantData);
    },
  });
}

function populateTable(variants) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  variants.forEach((variant, index) => {
    const isChecked = variant.deleted ? "checked" : "";
    const row = document.createElement("tr");
    row.classList.add("align-middle");

    row.innerHTML = `
        <td >${index + 1}</td>
        <td >${variant.slug}</td>
        <td >${variant.name}</td>
        <td >${variant.product.name}</td>
        <td >${variant.description}</td>
        <td >${variant.price}</td>
        <td >${variant.stock}</td>
        <td >${variant.createdBy}</td>
        <td class="text-center">
            <input disabled type="checkbox" class="form-check-input" style="border: 1px solid #000;"
            name="deleted" autocomplete="off" ${isChecked}/>
        </td>
        <td>
            <button class="btn btn-warning" onclick="openForm('Edit Variant','edit','${
              variant.id
            }')">Edit</button>
            <button class="btn btn-danger" onclick="openForm('Delete ${
              variant.name
            } ?','delete','${variant.id}')">Delete</button>
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
    url: "/variant/form",
    contentType: "html",
    success: function (variantForm) {
      $("#variantModal").modal("show");
      $(".modal-title").html(title);
      $(".modal-body").html(variantForm);
    },
  });

  if (type === "add") {
    saveButton.textContent = "Save Changes";
    loadCategory();
    saveButton.onclick = function () {
      submitVariantForm("POST", "http://localhost:9001/api/variant");
    };
  } else if (type === "edit") {
    saveButton.textContent = "Update Variant";
    loadForm(id);
    saveButton.onclick = function () {
      submitVariantForm("PUT", `http://localhost:9001/api/variant/${id}`);
    };
  } else if (type === "delete") {
    saveButton.classList.add("d-none");
    deleteButton.classList.remove("d-none");
    loadForm(id, type);
    deleteButton.onclick = function () {
      submitVariantForm("DELETE", `http://localhost:9001/api/variant/${id}`);
    };
  }
}

function submitVariantForm(method, url) {
  const formData = new FormData(document.getElementById("variantForm"));
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
    url: `http://localhost:9001/api/variant/${id}`,
    contentType: "application/json",
    success: function (variantResponse) {
      let variantData = variantResponse.data;
      loadCategory(variantData.product.categoryId);
      loadProducts(variantData.product.categoryId, variantData.productId);
      populateForm(variantData, type);
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

function loadProducts(categoryId, productId = null) {
  $.ajax({
    type: "GET",
    url: `http://localhost:9001/api/product/categoryId=${categoryId}`,
    contentType: "application/json",
    success: function (response) {
      $("#productId").empty();
      $("#productId").append(
        `<option value="" selected disabled hidden>Choose here</option>`
      );
      $.each(response.data, function (index, product) {
        const isSelected = productId === product.id ? "selected" : "";
        $("#productId").append(
          `<option value="${product.id}" ${isSelected}> ${product.name}</option>`
        );
      });
    },
  });
}

function populateForm(variant, type = null) {
  // Set values for text inputs and hidden fields
  document.getElementById("variantId").value = variant.id;
  document.getElementById("name").value = variant.name;
  document.getElementById("description").value = variant.description;
  document.getElementById("price").value = variant.price;
  document.getElementById("stock").value = variant.stock;
  document.getElementById("createdBy").value = variant.createdBy;
  // Set checkbox value
  document.getElementById("isDeleted").checked = variant.deleted;
  if (type === "delete") {
    document.getElementById("variantId").disabled = true;
    document.getElementById("categoryId").disabled = true;
    document.getElementById("productId").disabled = true;
    document.getElementById("name").disabled = true;
    document.getElementById("description").disabled = true;
    document.getElementById("price").disabled = true;
    document.getElementById("stock").disabled = true;
    document.getElementById("createdBy").disabled = true;
    document.getElementById("isDeleted").disabled = true;
  }
}
