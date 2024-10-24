document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});

const saveButton = document.getElementById("saveButton");
const deleteButton = document.getElementById("deleteButton");

function loadData() {
  $.ajax({
    type: "get",
    url: "http://localhost:9001/api/category",
    contentType: "application/json",
    success: function (categoryResponse) {
      let categoryData = categoryResponse.data;
      populateTable(categoryData);
    },
  });
}

function populateTable(categories) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  categories.forEach((category, index) => {
    const isChecked = category.deleted ? "checked" : "";
    const row = document.createElement("tr");
    row.classList.add("align-middle");

    row.innerHTML = `
        <td >${index + 1}</td>
        <td >${category.slug}</td>
        <td >${category.name}</td>
        <td >${category.createdBy}</td>
        <td class="text-center">
            <input disabled type="checkbox" class="form-check-input" style="border: 1px solid #000;"
            name="deleted" autocomplete="off" ${isChecked}/>
        </td>
        <td>
            <button class="btn btn-warning" onclick="openForm('Edit Category','edit','${
              category.slug
            }')">Edit</button>
            <button class="btn btn-danger" onclick="openForm('Delete ${category.name} ?','delete','${

              category.slug
            }')">Delete</button>
        </td>
    `;

    tbody.appendChild(row);
  });
}

function openForm(title, type, slug = null) {
  deleteButton.classList.add("d-none");
  saveButton.classList.remove("d-none");
  $.ajax({
    type: "get",
    url: "/category/form",
    contentType: "html",
    success: function (categoryForm) {
      $("#categoryModal").modal("show");
      $(".modal-title").html(title);
      $(".modal-body").html(categoryForm);
    },
  });

  if (type === "add") {
    saveButton.textContent = "Save Changes";
    saveButton.onclick = function () {
      submitCategoryForm("POST", "http://localhost:9001/api/category");
    };
  } else if (type === "edit") {
    saveButton.textContent = "Update Category";
    loadForm(slug);
    saveButton.onclick = function () {
      submitCategoryForm(
        "PUT",
        `http://localhost:9001/api/category/slug=${slug}`
      );
    };
  } else if (type === "delete") {
    saveButton.classList.add("d-none");
    deleteButton.classList.remove("d-none");
    loadForm(slug, type);
    deleteButton.onclick = function () {
      submitCategoryForm(
        "DELETE",
        `http://localhost:9001/api/category/slug=${slug}`
      );
    };
  }
}

function submitCategoryForm(method, url) {
  const formData = new FormData(document.getElementById("categoryForm"));
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

function loadForm(slug, type = null) {
  $.ajax({
    type: "get",
    url: `http://localhost:9001/api/category/slug=${slug}`,
    contentType: "application/json",
    success: function (categoryResponse) {
      let categoryData = categoryResponse.data;
      populateForm(categoryData, type);
    },
  });
}

function populateForm(category, type = null) {
  // Set values for text inputs and hidden fields
  document.getElementById("categoryId").value = category.id;
  document.getElementById("name").value = category.name;
  document.getElementById("createdBy").value = category.createdBy;
  // Set checkbox value
  document.getElementById("isDeleted").checked = category.deleted;
  if (type === "delete") {
    document.getElementById("categoryId").disabled = true;
    document.getElementById("name").disabled = true;
    document.getElementById("createdBy").disabled = true;
    document.getElementById("isDeleted").disabled = true;
  }
}

function deleteForm() {
  saveButton.classList.add("d-none");
  deleteButton.classList.remove("d-none");
  $.ajax({
    type: "get",
    url: `/category/deleteForm`,
    contentType: `html`,
    success: function (categoryForm) {
      $("#myModal").modal("show");
      $(".modal-title").html("Delete Category");
      $(".modal-body").html(categoryForm);
    },
  });
}

function deleteCategory(id) {
  $.ajax({
    type: "get",
    url: `/category/delete/${id}`,
    contentType: `html`,
    success: function (response) {
      location.reload();
    },
  });
}
