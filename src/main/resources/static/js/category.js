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

// document.getElementById("saveButton").addEventListener("click", function () {
//   const form = document.getElementById("categoryForm");
//   const modalTitle = document.getElementById("categoryModalLabel");
//   if (form.checkValidity()) {
//     if (modalTitle === "Add Category") {
//       saveCategory();
//     } else if (modalTitle === "Edit Category") {
//       editCategory();
//     }
//   } else {
//     form.reportValidity();
//   }
// });

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
            name="deleted" autocomplete="off" ${isChecked}/>
        </td>
        <td>
            <button class="btn btn-warning" onclick="openForm('Edit Category','edit','${category.slug}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteCategory('${category.slug}')">Delete</button>
        </td>
    `;

    tbody.appendChild(row);
  });
}

function openForm(title,type, slug = null) {
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
    loadEditForm(slug);
    saveButton.onclick = function () {
      submitCategoryForm("PUT", `http://localhost:9001/api/category/slug=${slug}`);
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
  console.log(dataJson);
  console.log(data.deleted)
  $.ajax({
    type: method,
    url: url,
    data: dataJson,
    contentType: "application/json",
    success: function (response) {
      console.log(response);
      window.location.reload();
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseText);
      alert("Error submitting form");
    }
  });
}

function loadEditForm(slug) {
  $.ajax({
    type: "get",
    url: `http://localhost:9001/api/category/slug=${slug}`,
    contentType: "application/json",
    success: function (categoryResponse) {
      console.log(categoryResponse);
      let categoryData = categoryResponse.data;
      populateEditForm(categoryData);
    },
  });
  
}

function populateEditForm(category) {
    // Set values for text inputs and hidden fields
    document.getElementById("categoryId").value = category.id;
    document.getElementById("name").value = category.name;
    document.getElementById("createdBy").value = category.createdBy;
    document.getElementById("createdAt").value = category.createdAt;
    
    // Set checkbox value
    document.getElementById("isDeleted").checked = category.deleted;
}