document.addEventListener("DOMContentLoaded", (event) => {
  loadData();
});

// The reason the onsubmit event was not invoked
// when calling form.submit() directly is that this method
// bypasses the event handlers associated with
// the form's submission process. As a result, any validation or
//  custom logic defined in the onsubmit event does not execute.

// To fix this, we can create and dispatch a new submit event
// manually. This allows us to trigger the onsubmit event handler,
// ensuring that any associated logic runs before actually submitting the form.
// If the event is not canceled (defaultPrevented is false)
// , we can then proceed to call form.submit() to submit the form.
document.getElementById("saveButton").addEventListener("click", function () {
  const form = document.getElementById("categoryForm");
  if (form.checkValidity()) {
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    form.dispatchEvent(submitEvent);
    if (!submitEvent.defaultPrevented) {
      form.submit();
    }
  } else {
    form.reportValidity();
  }
});

document.getElementById("deleteButton").addEventListener("click", function () {
  const categoryId = document.getElementById("deleteCategoryId").value; // Get the category ID
  // deleteCategory(categoryId);
});

function loadData() {
  $.ajax({
    type: "get",
    url: "http://localhost:9001/api/category",
    contentType: "application/json",
    success: function (categoryResponse) {
      console.log(categoryResponse);
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
            id="isDeleted" name="deleted" autocomplete="off" ${isChecked}/>
        </td>
        <td>
            <button class="btn btn-warning" onclick="editCategory(${category.id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
        </td>
    `;

    tbody.appendChild(row);
  });
}

function openForm() {
  deleteButton.classList.add("d-none");
  saveButton.classList.remove("d-none");
  $.ajax({
    type: "get",
    url: "/category/form",
    contentType: "html",
    success: function (categoryForm) {
      $("#categoryModal").modal("show");
      $(".modal-title").html("Category Form");
      $(".modal-body").html(categoryForm);
    },
  });
}

function saveCategory() {
  const form = document.getElementById("categoryForm");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const dataJson = JSON.stringify(data);
  $.ajax({
    type: "post",
    url: "http://localhost:9001/api/category",
    data: dataJson,
    contentType: "application/json",
    success: function (categoryResponse) {
      console.log(categoryResponse);
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
    },
  });
}

function editCategory(id) {
  openForm();
  $.ajax({
    type: "get",
    url: `http://localhost:9001/api/category/${id}`,
    contentType: "application/json",
    success: function (categoryResponse) {
      console.log(categoryResponse);
      let categoryData = categoryResponse.data;
      populateForm(categoryData);
    },
  });
}

function populateForm(category) {
    // Set values for text inputs and hidden fields
    document.getElementById("categoryId").value = category.id;
    document.getElementById("name").value = category.name;
    document.getElementById("createdBy").value = category.createdBy;
    document.getElementById("createdAt").value = category.createdAt;
    
    // Set checkbox value
    document.getElementById("isDeleted").checked = category.deleted;
}