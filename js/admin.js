function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = '../html/adminlogin.html'; // Replace with your login page filename.
}

if (!sessionStorage.getItem('adminLoggedIn')) {
  window.location.href = '../html/adminlogin.html';
}

document.querySelectorAll('.nav-link.active-sts').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    // Get the target attribute from data-target or data-bs-target
    const targetAttr = this.getAttribute('data-target') || this.getAttribute('data-bs-target');
    if (!targetAttr) return;

    // Remove the '#' if it exists in the attribute value
    const targetId = targetAttr.startsWith('#') ? targetAttr.substring(1) : targetAttr;

    // Hide all content sections (assuming sections have the class "section" and "features")
    document.querySelectorAll('.section.features').forEach(section => {
      section.classList.add('d-none');
    });

    // Show the selected section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.remove('d-none');
    }

    // Update active class on nav links
    document.querySelectorAll('.nav-link.active-sts').forEach(item => {
      item.classList.remove('active');
    });
    this.classList.add('active');
  });
});

// Fetch plans data and populate modal options and tables
function fetchPlansData() {
  fetch('http://localhost:8087/api/plans')
    .then(response => response.json())
    .then(data => {
      // Populate category & benefits dropdowns in the plan modal
      populateModalOptions();

      // Populate tables for active & inactive plans
      populateTable(
        data,
        'activePlansTable',
        'STATUS_ACTIVE',
        `
          <button class="btn btn-sm btn-success" onclick="openEditPlanModal('mbplan001')">
              <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button id="deactive" class="btn btn-sm btn-danger mx-2 my-2">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `
      );

      populateTable(
        data,
        'deactivatedPlansTable',
        'STATUS_INACTIVE',
        `
          <button id="active" class="btn btn-sm btn-success mx-2 my-2">
            <i class="fa-solid fa-square-check"></i>
          </button>
          <button id="delete" class="btn btn-sm btn-danger mx-2 my-2">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `
      );
    })
    .catch(err => console.error('Error fetching plans:', err));
}

// Function to fetch categories from the backend
function fetchCategoriesData() {
  fetch("http://localhost:8087/api/category")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(categories => {
      populateCategoriesTables(categories);
    })
    .catch(error => console.error("Error fetching categories:", error));
}

function populateCategoriesTables(categories) {
  const activeTbody = document.querySelector("#activeCategoriesTable tbody");
  const deactivatedTbody = document.querySelector("#deactivatedCategoriesTable tbody");
  activeTbody.innerHTML = "";
  deactivatedTbody.innerHTML = "";

  // Loop through the categories and create table rows
  categories.forEach(category => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category.categoryId}</td>
      <td>${category.categoryName}</td>
      <td>${category.status}</td>
      <td>${category.createdOn}</td>
      <td>${category.updatedOn}</td>
      <td>
        ${category.status === "STATUS_ACTIVE"
        ? `
              <button class="btn btn-sm btn-info edit-category"  onclick='openEditCategoryModal(${JSON.stringify(category)})' data-id="${category.categoryId}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button id="deactivateCategory" class="btn btn-sm btn-warning" data-id="${category.categoryId}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `
        : `
              <button id="activateCategory" class="btn btn-sm btn-info" data-id="${category.categoryId}">
                <i class="fa-solid fa-square-check"></i>
              </button>
              <button id="deleteCategory" class="btn btn-sm btn-warning" data-id="${category.categoryId}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `
      }
      </td>
    `;
    // Append the row to the appropriate table based on status
    if (category.status === "STATUS_ACTIVE") {
      activeTbody.appendChild(row);
    } else {
      deactivatedTbody.appendChild(row);
    }
  });
}

// Call the fetch function on page load
document.addEventListener("DOMContentLoaded", fetchCategoriesData);


// Submit handler for the category form (for both add and edit)
document.getElementById("categoryForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const categoryId = document.getElementById("categoryId").value.trim();
  const categoryName = document.getElementById("categoryName").value.trim();

  // Build the category object
  const categoryData = {
    categoryName: categoryName
  };

  // Determine the API endpoint and method based on whether categoryId exists
  let url = "http://localhost:8087/api/category";
  let method = "POST";

  if (categoryId !== "") {
    url += `/${encodeURIComponent(categoryId)}`;
    method = "PUT";
  }

  fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to ${categoryId ? 'update' : 'add'} category`);
      }
    })
    .then(data => {
      console.log("Category processed successfully:", data);
      closeCategoryModal();
      fetchCategoriesData();
    })
    .catch(error => console.error("Error processing category:", error));
});

// Helper function to open the modal in "Add" mode
function openAddCategoryModal() {
  document.getElementById("categoryModalLabel").textContent = "Add Category";
  document.getElementById("saveCategoryBtn").textContent = "Add Category";
  // Clear the form fields
  document.getElementById("categoryId").value = "";
  document.getElementById("categoryName").value = "";

  // Show the modal using Bootstrap 5 API
  const modalElement = document.getElementById("categoryModal");
  const categoryModal = new bootstrap.Modal(modalElement);
  categoryModal.show();
}

// Helper function to open the modal in "Edit" mode
function openEditCategoryModal(category) {
  // Assume "category" is an object with categoryId and categoryName properties
  document.getElementById("categoryModalLabel").textContent = "Edit Category";
  document.getElementById("saveCategoryBtn").textContent = "Update Category";
  document.getElementById("categoryId").value = category.categoryId;
  document.getElementById("categoryName").value = category.categoryName;

  // Show the modal
  const modalElement = document.getElementById("categoryModal");
  const categoryModal = new bootstrap.Modal(modalElement);
  categoryModal.show();
}

// Helper function to close the category modal
function closeCategoryModal() {
  const modalElement = document.getElementById("categoryModal");
  const categoryModal = bootstrap.Modal.getInstance(modalElement);
  if (categoryModal) {
    categoryModal.hide();
  }
}
document.addEventListener("DOMContentLoaded", fetchPlansData);

// Deactivate a plan from the Active Plans table
document.getElementById('activeCategoriesTable').addEventListener('click', function (event) {
  if (event.target.closest('#deactivateCategory')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();

    fetch(`http://localhost:8087/api/category/deactivate/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify()
    })
      .then(response => {
        // If the response has no content, return an empty object
        if (response.status === 204 || !response.headers.get('content-length')) {
          return {};
        }
        return response.json();
      })
      .then(data => {
        console.log('Plan deactivated successfully:', data);
        // Animate removal
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        // Optionally, refresh the table data
        fetchCategoriesData();
      })
      .catch(err => console.error('Error deactivating plan:', err));
  }
});

// Activate a plan from the Deactivated Plans table
document.getElementById('deactivatedCategoriesTable').addEventListener('click', function (event) {
  if (event.target.closest('#activateCategory')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();
    const plan = { status: "STATUS_ACTIVE" };

    fetch(`http://localhost:8087/api/category/activate/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    })
      .then(response => {
        if (response.status === 204 || !response.headers.get('content-length')) {
          return {};
        }
        return response.json();
      })
      .then(data => {
        console.log('Plan activated successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchCategoriesData();
      })
      .catch(err => console.error('Error activating plan:', err));
  }
});

// Delete a plan from the Deactivated Plans table
document.getElementById('deactivatedCategoriesTable').addEventListener('click', function (event) {
  if (event.target.closest('#deleteCategory')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();
    const plan = { status: "STATUS_INACTIVE" };

    fetch(`http://localhost:8087/api/category/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    })
      .then(response => {
        if (response.status === 204 || !response.headers.get('content-length')) {
          return {};
        }
        return response.json();
      })
      .then(data => {
        console.log('Plan deleted successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchCategoriesData();
      })
      .catch(err => console.error('Error deleting plan:', err));
  }
});


function populateModalOptions() {

  fetch("http://localhost:8087/api/category")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(categories => {
      const categorySelect = document.getElementById("planCategory");
      categorySelect.innerHTML = "";
      const uniqueCategories = [...new Set(categories.map(category => category.categoryId))];
      uniqueCategories.forEach(categoryId => {
        const option = document.createElement("option");
        option.value = categoryId;
        const cat = categories.find(category => category.categoryId === categoryId);
        option.textContent = cat ? cat.categoryName : "";
        categorySelect.appendChild(option);
      });
    })
    .catch(error => console.error("Error fetching categories:", error));



  // Example: Populate OTT benefits dropdown (if exists)
  fetch("http://localhost:8087/api/benefits")
    .then(response => response.json())
    .then(benefits => {
      const ottDropdown = document.getElementById("ottDetails");
      if (ottDropdown) {
        ottDropdown.innerHTML = ""; // Clear existing options
        benefits.forEach(benefit => {
          const option = document.createElement("option");
          option.value = benefit.benefitsId;
          option.textContent = benefit.benefitsName || "Unnamed Benefit";
          ottDropdown.appendChild(option);
        });
      }
    })
    .catch(error => console.error("Error fetching OTT benefits:", error));
}

function populateTable(data, tableId, statusFilter, actionsHtml) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = "";
  data.forEach(plan => {
    if (plan.status === statusFilter) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${plan.planId}</td>
        <td>${plan.planName}</td>
        <td>${plan.category ? plan.category.categoryName : "N/A"}</td>
        <td>${plan.planPrice}</td>
        <td>${plan.validity}</td>
        <td>${plan.description}</td>
        <td>${plan.createdAt}</td>
        <td>${plan.updatedAt}</td>
        <td>${(plan.benefits && plan.benefits.length) ? plan.benefits.map(b => b.benefitsName).join(', ') : 'None'}</td>
        <td>${actionsHtml}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}
fetchPlansData();

document.getElementById('activePlansTable').addEventListener('click', function (event) {
  if (event.target.closest('#deactive')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();
    const plan = { status: "STATUS_INACTIVE" };

    fetch(`http://localhost:8087/api/plans/deactivate/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Plan deactivated successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchPlansData();
      })
      .catch(err => console.error('Error deactivating plan:', err));
  }
});

// Event delegation for activating a plan from #deactivatedPlansTable
document.getElementById('deactivatedPlansTable').addEventListener('click', function (event) {
  if (event.target.closest('#active')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();
    const plan = { status: "STATUS_ACTIVE" };

    fetch(`http://localhost:8087/api/plans/activate/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Plan activated successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchPlansData();
      })
      .catch(err => console.error('Error activating plan:', err));
  }
});

// Event delegation for deleting a plan from #deactivatedPlansTable
document.getElementById('deactivatedPlansTable').addEventListener('click', function (event) {
  if (event.target.closest('#delete')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();
    const plan = { status: "STATUS_INACTIVE" };

    fetch(`http://localhost:8087/api/plans/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Plan deleted successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchPlansData();
      })
      .catch(err => console.error('Error deleting plan:', err));
  }
});

document.getElementById('planForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const planId = document.getElementById('planId').value.trim();
  const planData = {
    planName: document.getElementById('planName').value.trim(),
    category: {
      categoryId: document.getElementById('planCategory').value.trim()
    },
    planPrice: parseFloat(document.getElementById('planPrice').value),
    validity: parseInt(document.getElementById('planValidity').value),
    description: document.getElementById('planDescription').value.trim(),
    benefits: gatherSelectedBenefits()
  };

  // Decide if we are adding or updating
  let url = 'http://localhost:8087/api/plans';
  let method = 'POST';

  if (planId) {
    // If planId is present, update the plan
    url += `/${encodeURIComponent(planId)}`;
    method = 'PUT';
  }

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(planData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to add plan");
      }
      // If the server returns 204 or an empty body, skip .json()
      if (response.status === 204 || !response.headers.get('content-length')) {
        return {}; // Return an empty object or do something else
      }
      fetchPlansData();
    })
    .then(data => {
      console.log("Plan Processed successfully:", data);
      const modalElement = document.getElementById('planModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    })
    .catch(error => {
      console.error("Error adding plan:", error);
    })
});

// Example: gather selected benefits from a multi-select or checkboxes
function gatherSelectedBenefits() {
  // Example if you have a multi-select with id "ottDetails"
  const benefitsSelect = document.getElementById('ottDetails');
  const selected = Array.from(benefitsSelect.selectedOptions).map(opt => ({
    benefitsId: opt.value,
    benefitsName: opt.textContent.trim()
  }));
  return selected;
}
function openAddPlanModal() {
  document.getElementById('planModalLabel').textContent = "Add New Plan";
  document.getElementById('addPlanBtn').textContent = "Add Plan";
  // Clear hidden planId
  document.getElementById('planId').value = "";
  // Clear other fields
  document.getElementById('planName').value = "";
  document.getElementById('planCategory').value = "";
  document.getElementById('planPrice').value = "";
  document.getElementById('planValidity').value = "";
  document.getElementById('planDescription').value = "";
  // If you have benefits checkboxes or multi-select, clear them
  // Show the modal
  const planModal = new bootstrap.Modal(document.getElementById('planModal'));
  planModal.show();
}
function openEditPlanModal(planId) {
  document.getElementById('planModalLabel').textContent = "Edit Plan";
  document.getElementById('addPlanBtn').textContent = "Update Plan";

  // Fetch the existing plan data
  fetch(`http://localhost:8087/api/plans/${encodeURIComponent(planId)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch plan for editing");
      }
      return response.json();
    })
    .then(plan => {
      // Populate the hidden planId
      document.getElementById('planId').value = plan.planId;
      // Populate other fields
      document.getElementById('planName').value = plan.planName;
      document.getElementById('planCategory').value = plan.category ? plan.category.categoryId : "";
      document.getElementById('planPrice').value = plan.planPrice;
      document.getElementById('planValidity').value = plan.validity;
      document.getElementById('planDescription').value = plan.description;
      // If you have benefits, set them in your multi-select or checkboxes
      // Then show the modal
      const planModal = new bootstrap.Modal(document.getElementById('planModal'));
      planModal.show();
    })
    .catch(err => console.error('Error fetching plan for edit:', err));
}

function fetchBenefitsData() {
  fetch("http://localhost:8087/api/benefits")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(benefits => {
      const tbody = document.querySelector("#benefitsTable tbody");
      tbody.innerHTML = ""; // Clear existing rows

      benefits.forEach(benefit => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${benefit.benefitsId}</td>
          <td>${benefit.benefitsName}</td>
          <td>${benefit.icon || ""}</td>
          <td>
            <button class="btn btn-sm btn-info edit-benefit" onclick='openEditBenefitModal(${JSON.stringify(benefit)})' data-id="${benefit.benefitsId}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-benefit" data-id="${benefit.benefitsId}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => console.error("Error fetching benefits:", error));
}

// Call fetchBenefitsData on page load
document.addEventListener("DOMContentLoaded", fetchBenefitsData);

// 2. Add/Edit Benefit Modal: Form Submission Handler
document.getElementById("benefitForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Retrieve form values
  const benefitId = document.getElementById("benefitId").value.trim();
  const benefitName = document.getElementById("benefitName").value.trim();
  const benefitIcon = document.getElementById("benefitIcon").value.trim();

  // Build benefit data object
  const benefitData = {
    benefitsName: benefitName,
    icon: benefitIcon
  };

  // Determine API endpoint and method based on presence of benefitId
  let url = "http://localhost:8087/api/benefits";
  let method = "POST";
  if (benefitId !== "") {
    url += `/${encodeURIComponent(benefitId)}`;
    method = "PUT";
  }

  fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(benefitData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to ${benefitId ? "update" : "add"} benefit`);
      }
      // Handle possible empty response body
      if (response.status === 204 || !response.headers.get("content-length")) {
        return {};
      }
    })
    .then(data => {
      console.log("Benefit processed successfully:", data);
      closeBenefitModal();
      fetchBenefitsData(); // Refresh the benefits table
    })
    .catch(error => console.error("Error processing benefit:", error));
});

// 3. Helper Functions for Opening and Closing the Benefit Modal

function openAddBenefitModal() {
  document.getElementById("benefitModalLabel").textContent = "Add New Benefit";
  document.getElementById("saveBenefitBtn").textContent = "Add Benefit";
  // Clear form fields
  document.getElementById("benefitId").value = "";
  document.getElementById("benefitName").value = "";
  document.getElementById("benefitIcon").value = "";

  // Open the modal using Bootstrap 5 API
  const modalElement = document.getElementById("benefitModal");
  const benefitModal = new bootstrap.Modal(modalElement);
  benefitModal.show();
}

function openEditBenefitModal(benefitId) {
  // Fetch the benefit data for editing
  fetch(`http://localhost:8087/api/benefits/${encodeURIComponent(benefitId.benefitsId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch benefit details");
      }
      return response.json();
    })
    .then(benefit => {
      document.getElementById("benefitModalLabel").textContent = "Edit Benefit";
      document.getElementById("saveBenefitBtn").textContent = "Update Benefit";
      document.getElementById("benefitId").value = benefit.benefitsId;
      document.getElementById("benefitName").value = benefit.benefitsName;
      document.getElementById("benefitIcon").value = benefit.icon || "";

      const modalElement = document.getElementById("benefitModal");
      const benefitModal = new bootstrap.Modal(modalElement);
      benefitModal.show();
    })
    .catch(error => console.error("Error fetching benefit for edit:", error));
}


function closeBenefitModal() {
  const modalElement = document.getElementById("benefitModal");
  const benefitModal = bootstrap.Modal.getInstance(modalElement);
  if (benefitModal) {
    benefitModal.hide();
  }
}

document.getElementById("benefitsTable").addEventListener("click", function (event) {
  const editBtn = event.target.closest(".edit-benefit");
  if (editBtn) {
    const benefitId = editBtn.getAttribute("data-id");
    if (!benefitId) {
      console.error("Benefit ID is missing on the button.");
      return;
    }
    openEditBenefitModal(benefitId);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("benefitsTable").addEventListener("click", function (event) {
    const deleteBtn = event.target.closest(".delete-benefit");
    if (deleteBtn) {
      console.log("Delete button clicked");

      const benefitId = deleteBtn.getAttribute("data-id");
      console.log("Benefit ID extracted:", benefitId);

      if (!benefitId) {
        console.error("Benefit ID is null or undefined. Check the button's data-id attribute.");
        return;
      }

      fetch(`http://localhost:8087/api/benefits/${encodeURIComponent(benefitId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
        .then(response => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            throw new Error("Failed to delete benefit");
          }
          // If the response is empty, return an empty object.
          if (response.status === 204 || !response.headers.get("content-length")) {
            return {};
          }
          return response.json();
        })
        .then(data => {
          console.log("Benefit deleted successfully:", data);
          fetchBenefitsData(); // Refresh table data
        })
        .catch(error => console.error("Error deleting benefit:", error));
    }
  });

})