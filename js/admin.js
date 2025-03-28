document.getElementById("logoutBtn").addEventListener("click", async function () {
  const token = localStorage.getItem("adminToken");
  if (token) {
    // Send logout request to server (only if your backend supports token revocation)
    try {
      const response = await fetch("http://localhost:8087/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }), // Optional if refresh tokens exist
      });

      if (!response.ok) {
        console.warn("Logout request failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during logout request:", error);
    }
  }

  // Remove token from local storage and redirect
  localStorage.removeItem("adminToken");
  localStorage.removeItem("refreshToken"); // Remove refresh token if stored
  alert("Logged out successfully!");
  window.location.href = "adminlogin.html";
});

// Redirect if no token (Ensure this runs early in the script)
if (!localStorage.getItem("adminToken")) {
  window.location.href = "adminlogin.html";
}

function checkExpiredToken() {
  const token = localStorage.getItem("adminToken");
  if (!token) return;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp;

  if (exp < Date.now() / 1000) {
    localStorage.removeItem("adminToken");
    alert("Your session has expired, please login again!");
    window.location.href = "adminlogin.html";
  }
}
setInterval(checkExpiredToken, 1000);

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

function fetchPlansData() {
  fetch("http://localhost:8087/api/plans", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(plans => {
      populatePlansTables(plans);
    })
    .catch(error => console.error("Error fetching plans:", error));
}

function populatePlansTables(plans) {
  const activeTbody = document.querySelector("#activePlansTable tbody");
  const deactivatedTbody = document.querySelector("#deactivatedPlansTable tbody");
  activeTbody.innerHTML = "";
  deactivatedTbody.innerHTML = "";

  plans.forEach(plan => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${plan.planId}</td>
      <td>${plan.planName}</td>
      <td>${plan.category ? plan.category.categoryName : "N/A"}</td>
      <td>${plan.planPrice}</td>
      <td>${plan.data}</td>
      <td>${plan.sms}</td>
      <td>${plan.validity}</td>
      <td>${plan.description}</td>
      <td>${plan.createdAt}</td>
      <td>${plan.updatedAt}</td>
      <td>${(plan.benefits && plan.benefits.length) ? plan.benefits.map(b => b.benefitsName).join(', ') : 'None'}</td>
      <td>
        ${plan.status === "STATUS_ACTIVE"
        ? `
        <span class="d-inline-block" tabindex="0" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Disabled popover">
  <button class="btn btn-sm btn-success edit-plan-btn" type="button"
          onclick='openEditPlanModal("${plan.planId}")' 
          data-plan-id="${plan.planId}">
    <i class="fa-solid fa-pen-to-square"></i>
    </button>
</span>
              <button id="deactive" class="btn btn-sm btn-danger mx-2 my-2" 
                      data-plan-id="${plan.planId}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `
        : `
              <button id="active" class="btn btn-sm btn-success mx-2 my-2" 
                      data-plan-id="${plan.planId}">
                <i class="fa-solid fa-square-check"></i>
              </button>
              <button id="delete" class="btn btn-sm btn-danger mx-2 my-2" 
                      data-plan-id="${plan.planId}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `
      }
      </td>
    `;
    if (plan.status === "STATUS_ACTIVE") {
      activeTbody.appendChild(row);
    } else {
      deactivatedTbody.appendChild(row);
    }
  });
}

fetchPlansData();


function fetchCategoriesData() {
  fetch("http://localhost:8087/api/category", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
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
  if (!Array.isArray(categories)) {
    console.error("Error: Expected categories to be an array but got:", categories);
    return;  // Prevents further execution if categories is not an array
  }
  const activeTbody = document.querySelector("#activeCategoriesTable tbody");
  const deactivatedTbody = document.querySelector("#deactivatedCategoriesTable tbody");
  activeTbody.innerHTML = "";
  deactivatedTbody.innerHTML = "";

  categories.forEach(category => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category.categoryId}</td>
      <td>${category.categoryName}</td>
      <td>${category.status}</td>
      <td>${category.createdAt}</td>
      <td>${category.updatedAt}</td>
      <td>
        ${category.status === "STATUS_ACTIVE"
        ? `
              <button class="btn btn-sm btn-info edit-category" onclick='openEditCategoryModal("${category.categoryId}")' data-id="${category.categoryId}">
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
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    },
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

function openEditCategoryModal(categoryId) {
  fetch(`http://localhost:8087/api/category/${encodeURIComponent(categoryId)}`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch category details");
      }
      return response.json();
    })
    .then(category => {
      document.getElementById("categoryModalLabel").textContent = "Edit Category";
      document.getElementById("saveCategoryBtn").textContent = "Update Category";
      document.getElementById("categoryId").value = category.categoryId;
      document.getElementById("categoryName").value = category.categoryName;

      const modalElement = document.getElementById("categoryModal");
      const categoryModal = new bootstrap.Modal(modalElement);
      categoryModal.show();
    })
    .catch(error => console.error("Error fetching category for edit:", error));
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
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        'Content-Type': 'application/json'
      },
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
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plan)
    })
      .then(response => {
        if (response.status === 204 || !response.headers.get('content-length')) {
          return {};
        }
        return response.json();
      })
      .then(data => {
        console.log('Category activated successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchCategoriesData();
      })
      .catch(err => console.error('Error activating plan:', err));
  }
});

document.getElementById('deactivatedCategoriesTable').addEventListener('click', function (event) {
  if (event.target.closest('#deleteCategory')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();

    fetch(`http://localhost:8087/api/category/delete/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (response.status === 204 || !response.headers.get('content-length')) {
          return {};
        }
        if (!response.ok) {
          throw new Error("Failed to delete category");
        }
        return response.json();
      })
      .then(data => {
        console.log('Category deleted successfully:', data);
        row.style.transition = "opacity 0.5s";
        row.style.opacity = 0;
        setTimeout(() => row.remove(), 500);
        fetchCategoriesData();
      })
      .catch(err => console.error('Error deleting plan:', err));
  }
});

function populateModalOptions() {
  fetch("http://localhost:8087/api/category", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
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

  fetch("http://localhost:8087/api/benefits", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
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

document.getElementById('activePlansTable').addEventListener('click', function (event) {
  if (event.target.closest('#deactive')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();
    const plan = { status: "STATUS_INACTIVE" };

    fetch(`http://localhost:8087/api/plans/deactivate/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        'Content-Type': 'application/json'
      },
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
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        'Content-Type': 'application/json'
      },
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

document.getElementById('deactivatedPlansTable').addEventListener('click', function (event) {
  if (event.target.closest('#delete')) {
    const row = event.target.closest('tr');
    const planId = row.querySelector('td:first-child').textContent.trim();

    fetch(`http://localhost:8087/api/plans/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (response.status === 204 || !response.headers.get('content-length')) {
          return {};
        }
        if (!response.ok) {
          throw new Error("Failed to delete plan");
        }
        return response.json();
      })
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
    data: parseInt(document.getElementById('planData').value),
    sms: parseInt(document.getElementById('planSms').value),
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
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
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
  document.getElementById('planSms').value = "";
  document.getElementById('planData').value = "";
  document.getElementById('planValidity').value = "";
  document.getElementById('planDescription').value = "";
  // If you have benefits checkboxes or multi-select, clear them
  // Show the modal
  const planModal = new bootstrap.Modal(document.getElementById('planModal'));
  populateModalOptions();
  planModal.show();
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.edit-plan-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const planId = this.getAttribute('data-plan-id');
      openEditPlanModal(planId);
    });
  });
});
// Function to open the plan edit modal and populate it with current plan details
function openEditPlanModal(planId) {
  console.log("openEditPlanModal called with planId:", planId);
  // Update modal title and button text
  document.getElementById('planModalLabel').textContent = "Edit Plan";
  document.getElementById('addPlanBtn').textContent = "Update Plan";

  // Fetch plan details from the backend using the provided planId
  fetch(`http://localhost:8087/api/plans/${encodeURIComponent(planId)}`, {
    method: 'GET',
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch plan for editing, status: " + response.status);
      }
      return response.json();
    })
    .then(plan => {
      console.log("Fetched plan:", plan);
      // Populate modal fields with plan details
      document.getElementById('planId').value = plan.planId;
      document.getElementById('planName').value = plan.planName;
      // Set category dropdown using the category id (if category is an object) and also update a display field for category name.
      if (plan.category) {
        document.getElementById('planCategory').value = plan.category.categoryId || plan.category;
        // Assume there's an element to display the category name; adjust the ID as needed.
        const categoryNameElem = document.getElementById('planCategoryName');
        if (categoryNameElem) {
          categoryNameElem.textContent = plan.category.categoryName || plan.category;
        }
      } else {
        document.getElementById('planCategory').value = "";
      }
      document.getElementById('planPrice').value = plan.planPrice;
      document.getElementById('planValidity').value = plan.validity;
      document.getElementById('planSms').value = plan.sms;
      document.getElementById('planData').value = plan.data;
      document.getElementById('planDescription').value = plan.description;
      populateModalOptions();
      const ottDetailsField = document.getElementById('ottDetails');
      if (ottDetailsField && plan.benefits && plan.benefits.length) {
        Array.from(ottDetailsField.options).forEach(option => {
          option.selected = plan.benefits.some(b => b.benefitsId === option.value);
        });
      } else {
        // Optionally, if you have a display field for benefits, you can update it like this:
        const benefitsDisplay = document.getElementById('planBenefitsDisplay');
        if (benefitsDisplay) {
          benefitsDisplay.textContent = plan.benefits && plan.benefits.length
            ? plan.benefits.map(b => b.benefitsName).join(', ')
            : 'None';
        }
      }

      // Initialize and show the modal using Bootstrap
      const modalElement = document.getElementById('planModal');
      const planModal = new bootstrap.Modal(modalElement);
      planModal.show();
    })
    .catch(err => console.error("Error fetching plan for edit:", err));

}
function fetchBenefitsData() {
  fetch("http://localhost:8087/api/benefits", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
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
          <button class="btn btn-sm btn-info edit-benefit" onclick='openEditBenefitModal("${benefit.benefitsId}")' data-id="${benefit.benefitsId}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </td>
      `;
        tbody.appendChild(row);
      });
    })
    .catch(error => console.error("Error fetching benefits:", error));
}
document.addEventListener("DOMContentLoaded", fetchBenefitsData);
document.getElementById("benefitForm").addEventListener("submit", function (event) {
  event.preventDefault();
  // Retrieve form values
  const benefitId = document.getElementById("benefitId").value.trim();
  const benefitName = document.getElementById("benefitName").value.trim();
  const benefitIcon = document.getElementById("benefitIcon").value.trim();
  const benefitData = {
    benefitsName: benefitName,
    icon: benefitIcon
  };

  let url = "http://localhost:8087/api/benefits";
  let method = "POST";
  if (benefitId !== "") {
    url += `/${encodeURIComponent(benefitId)}`;
    method = "PUT";
  }

  fetch(url, {
    method: method,
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      'Content-Type': 'application/json'
    },
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
  fetch(`http://localhost:8087/api/benefits/${encodeURIComponent(benefitId)}`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
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
document.addEventListener('DOMContentLoaded', function () {
  fetchUserDetails();
});

// Function to fetch user details from the backend API
function fetchUserDetails() {
  // Replace with your actual API endpoint for users
  fetch('http://localhost:8087/api/users', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok, status: ' + response.status);
      }
      return response.json();
    })
    .then(data => populateUsersTable(data))
    .catch(err => console.error('Error fetching user details:', err));
}

// Populate the table with user details
function populateUsersTable(users) {
  const tableBody = document.querySelector('#usersDetailsTable tbody');
  tableBody.innerHTML = ''; // Clear any existing rows

  users.forEach(async user => {
    // Determine active plan name if available
    async function fetchAndDisplayActivePlan(userId) {
      try {
        // Fetch active plan associated with the user
        const response = await fetch(`http://localhost:8087/api/userplan/active/${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch active plan, status: ${response.status}`);
        }

        const activePlan = await response.json();

        // If no active plan found, return null
        if (!activePlan || !activePlan.planId) {
          console.warn("No active plan found for user:", userId);
          return null;
        }

        // Fetch the full plan details using the planId
        const planResponse = await fetch(`http://localhost:8087/api/plans/${activePlan.planId}`);

        if (!planResponse.ok) {
          throw new Error(`Failed to fetch plan details, status: ${planResponse.status}`);
        }

        const plan = await planResponse.json();
        // Return only the plan name
        return plan.planName;

      } catch (error) {
        console.error("Error fetching active plan or plan details:", error);
        return null; // Return null in case of an error
      }
    }

    const activePlan = await fetchAndDisplayActivePlan(user.userId);

    fetchAndDisplayActivePlan(user.userId);
    console.log("Active Plan:", activePlan);

    // Create a table row
    const tr = document.createElement('tr');
    // Save the entire user object as a data attribute for later use in the modal
    tr.setAttribute("data-user", JSON.stringify(user));

    tr.innerHTML = `
        <td>${user.userId}</td>
        <td>${user.userName}</td>
        <td>${user.phoneNumber}</td>
        <td>${user.email}</td>
        <td>${activePlan}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewUser(this,'${activePlan}')">View</button>
        </td>
      `;
    tableBody.appendChild(tr);
  });
}

function viewUser(button, activePlan) {
  // Get the table row element (button -> td -> tr)
  var row = button.parentNode.parentNode;
  // Retrieve the user data stored in the row's data attribute
  var userData = JSON.parse(row.getAttribute("data-user"));

  // Populate modal fields with basic user details
  document.getElementById("detailUsername").textContent = userData.userId || '';
  document.getElementById("detailName").textContent = userData.userName || '';
  document.getElementById("detailPhone").textContent = userData.phoneNumber || '';
  document.getElementById("detailEmail").textContent = userData.email || '';
  document.getElementById("detailActivePlan").textContent = activePlan || '';
  function fetchActivePlanDetails(userId) {
    fetch(`http://localhost:8087/api/userplan/active/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching active plan details, status: ' + response.status);
        }
        return response.json();
      })
      .then(async data => {
        console.log("Active Plan Response:", data); // Debugging Log

        // Ensure we have valid data
        if (!Array.isArray(data) || data.length === 0) {
          console.error("No active plan found");
          document.getElementById("detailActivePlan").textContent = 'None';
          return;
        }
        const activePlan = await fetchAndDisplayActivePlan(user.userId);

        if (!activePlan || !activePlan.planId) {
          console.error("Active plan missing planId:", activePlan);
          document.getElementById("detailActivePlan").textContent = 'Unknown Plan';
          return;
        }

        try {
          // Fetch plan details using planId
          const planResponse = await fetch(`http://localhost:8087/api/plans/${activePlan.planId}`);
          if (!planResponse.ok) throw new Error('Failed to fetch plan details');

          const planData = await planResponse.json();
          document.getElementById("detailActivePlan").textContent = planData.planName || 'Unknown Plan';
        } catch (error) {
          console.error("Error fetching plan details:", error);
          document.getElementById("detailActivePlan").textContent = 'Error loading plan';
        }
      });

  }

  // Example usage:
  fetchActivePlanDetails("user123"); // Replace "user123" with the actual user ID

  // Clear previous recharge history data
  document.querySelector("#detailRechargeHistoryTable tbody").innerHTML = '';

  // Fetch recharge history for this user using userId (adjust endpoint as needed)
  fetchRechargeHistory(userData.userId);

  // Show the modal using Bootstrap 5's Modal API
  var userModalEl = document.getElementById('userDetailsModal');
  var userModal = new bootstrap.Modal(userModalEl);
  userModal.show();
}

function fetchRechargeHistory(userId) {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    console.error('No admin token found, please login again.');
    return;
  }

  fetch(`http://localhost:8087/api/recharge-history/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching recharge history, status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.length === 0) {
        displayNoHistoryMessage();
      } else {
        populateRechargeHistoryTable(data);
      }
    })
    .catch(error => console.error('Error fetching recharge history:', error));
}

// Function to display the recharge history in the table
function populateRechargeHistoryTable(records) {
  const tbody = document.querySelector("#detailRechargeHistoryTable tbody");
  tbody.innerHTML = ''; // Clear existing rows

  records.forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${record.planId}</td>
        <td>${new Date(record.rechargeDate).toLocaleString()}</td>
        <td>₹${record.amountPaid.toFixed(2)}</td>
        <td>${record.status || 'Completed'}</td>
      `;
    tbody.appendChild(tr);
  });
}

// Show a message when no history is found
function displayNoHistoryMessage() {
  const tbody = document.querySelector("#detailRechargeHistoryTable tbody");
  tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">No recharge history found.</td>
      </tr>
    `;
}

// Example usage: Replace 'user123' with actual userId
fetchRechargeHistory('user123');

// Fetch all active user plan details.
// Function to fetch all active user plan details
async function fetchAllActiveUserPlans() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.error("No admin token found. Redirecting to login.");
    window.location.href = "adminlogin.html";
    return [];
  }

  try {
    const response = await fetch("http://localhost:8087/api/userplan/active/all", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error while fetching active plans, status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching active user plans:", error);
    return [];
  }
}

// Function to filter expiring and expired user plans
async function getExpiringAndExpiredUserPlans() {
  const plans = await fetchAllActiveUserPlans();
  const now = new Date();
  const expiringPlans = [];
  const expiredPlans = [];

  plans.forEach(plan => {
    // Ensure expiryDate exists and is a valid date
    if (!plan.expiryDate || typeof plan.expiryDate !== "string") {
      console.warn(`Skipping invalid expiry date for plan:`, plan);
      return;
    }

    // Convert expiryDate to a valid JavaScript Date object
    let expiryDate = new Date(plan.expiryDate);

    // If expiryDate is still invalid, log an error and skip this plan
    if (isNaN(expiryDate.getTime())) {
      console.warn(`Invalid expiry date for plan:`, plan);
      return;
    }

    if (expiryDate < now) {
      expiredPlans.push(plan);
    } else {
      const diffInDays = (expiryDate - now) / (1000 * 60 * 60 * 24);
      if (diffInDays <= 3) {
        expiringPlans.push(plan);
      }
    }
  });
  return { expiringPlans, expiredPlans };
}
// Function to populate the Expiring Users table
function populateExpiringUsersTable(expiringPlans) {
  const tbody = document.getElementById("expiringUsersList");
  tbody.innerHTML = ""; // Clear previous rows

  if (expiringPlans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">No users with plans expiring in three days.</td></tr>`;
    return;
  }

  expiringPlans.forEach(plan => {
    const userName = plan.userId || "Unknown User"; // Adjust based on API response
    const planName = plan.planId || "N/A";
    // Ensure expiryDate is a valid date
    let expiredOn = "Invalid Date";
    if (plan.expiryDate) {
      let parsedDate = new Date(plan.expiryDate);
      if (!isNaN(parsedDate.getTime())) {
        expiredOn = parsedDate.toLocaleString(); // Format date properly
      }
    }
    const expiryDate = expiredOn;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${userName}</td>
      <td>${planName}</td>
      <td>${expiryDate}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="sendReminder('${plan.userId}')">
          Send Reminder
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Function to populate the Expired Users table
function populateExpiredUsersTable(expiredPlans) {
  const tbody = document.getElementById("expiredUsersList");
  tbody.innerHTML = ""; // Clear previous rows

  if (expiredPlans.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="text-center">No users with expired plans.</td>`;
    tbody.appendChild(row);
    return;
  }

  expiredPlans.forEach(plan => {
    const userName = plan.userId || "Unknown User";
    const planName = plan.planId ? plan.planId : "N/A";


    // Ensure expiryDate is a valid date
    let expiredOn = "Invalid Date";
    if (plan.expiryDate) {
      let parsedDate = new Date(plan.expiryDate);
      if (!isNaN(parsedDate.getTime())) {
        expiredOn = parsedDate.toLocaleString(); // Format date properly
      }
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${userName}</td>
      <td>${planName}</td>
      <td>${expiredOn}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="sendReminder('${plan.userId}')">
          Send remainder
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function fetchUserEmail(userId) {
  return fetch(`http://localhost:8087/api/users/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error fetching user details, status: " + response.status);
      }
      return response.json();
    })
    .then(data => {
      return data.email;
    })
    .catch(error => {
      console.error("Error fetching user email:", error);
      return null;
    });
}

async function sendReminder(userId) {
  const userEmail = await fetchUserEmail(userId);
  const response = await fetch("http://localhost:8087/email/send", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: userEmail,
      subject: "Plan Expiry Reminder",
      body: `Dear User, your plan is expiring soon. Please renew it as soon as possible.`
    })
  });

  if (response.ok) {
    alert("Email reminder sent successfully!");
  } else {
    alert("Failed to send email reminder.");
  }
}


function renewPlan(userId) {
  alert("Initiate plan renewal for user: " + userId);
}

// Fetch and display data when the dashboard loads
document.addEventListener("DOMContentLoaded", async function () {
  const { expiringPlans, expiredPlans } = await getExpiringAndExpiredUserPlans();
  populateExpiringUsersTable(expiringPlans);
  populateExpiredUsersTable(expiredPlans);
});

document.addEventListener("DOMContentLoaded", function () {
  // Fetch queries and populate the table
  fetchQueries();

  function fetchQueries() {
    fetch("http://localhost:8087/api/query") // Update with your backend URL
      .then(response => response.json())
      .then(queries => {
        const tableBody = document.querySelector("#userQueriesTable tbody");
        tableBody.innerHTML = ""; // Clear existing rows

        queries.forEach(query => {
          const row = document.createElement("tr");

          row.innerHTML = `
                      <td style="display: none;">${query.id}</td>
                      <td">${query.username}</td>
                      <td>${query.email}</td>
                      <td>${query.phoneNumber}</td>
                      <td>${query.queryType}</td>
                      <td>${query.message}</td>
                      <td>
                          <button class="btn btn-success resolve-btn" data-email="${query.email} " data-id="${query.id}">
                              Resolved
                          </button>
                      </td>
                  `;

          tableBody.appendChild(row);
        });

        // Attach event listeners to all buttons
        document.querySelectorAll(".resolve-btn").forEach(button => {
          button.addEventListener("click", function () {
            const email = this.getAttribute("data-email");
            const id = this.getAttribute("data-id");
            sendResolvedEmail(email, id);
          });
        });
      })
      .catch(error => console.error("Error fetching queries:", error));
  }

  function sendResolvedEmail(email, queryId) {
    if (!email) {
      alert("Invalid email address.");
      return;
    }

    const emailData = {
      to: email,
      subject: "Query Resolved - MobiComm",
      body: "Dear User,\n\nYour query has been resolved successfully. If you need further assistance, feel free to contact us again.\n\nBest Regards,\nMobiComm Support Team"
    };

    fetch("http://localhost:8087/email/send", { // Update with your email API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    })
      .then(response => {
        if (response.ok) {
          alert(`Email sent successfully to ${email}`);
          deleteQuery(queryId);
        } else {
          alert("Error sending email.");
        }
      })
      .catch(error => console.error("Error sending email:", error));
  }

  function deleteQuery(queryId) {
    console.log("Deleting query with ID:", queryId);

    fetch(`http://localhost:8087/api/query/${queryId}`, { // Update with your actual DELETE API endpoint
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then(result => {
            console.log("Query deleted successfully:", result);

            // Remove the row from the UI
            const row = document.querySelector(`tr[data-query-id="${queryId}"]`);
            if (row) row.remove();

            fetchQueries();
        })
        .catch(error => {
            console.error("Error deleting query:", error);
            alert("Failed to delete query.");
        });
}
});

// Function to fetch new user requests and populate the table
async function fetchNewUserRequests() {
  try {
      const response = await fetch("http://localhost:8087/api/newUser");
      if (!response.ok) {
          throw new Error("Failed to fetch new user requests");
      }

      const newUserRequests = await response.json();
      const tableBody = document.querySelector("#newUserRequestsTable tbody");
      tableBody.innerHTML = ""; // Clear existing rows

      if (newUserRequests.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No Requests Found</td></tr>";
          return;
      }

      newUserRequests.forEach(request => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${request.id}</td>
              <td>${request.name}</td>
              <td>${request.email}</td>
              <td>${request.phoneNumber}</td>
              <td>${request.requestType}</td>
          `;
          tableBody.appendChild(row);
      });

  } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch user requests.");
  }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", fetchNewUserRequests);

