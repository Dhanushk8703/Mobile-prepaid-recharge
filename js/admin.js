function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'adminlogin.html'; // Replace with your login page filename.
}

if (!sessionStorage.getItem('adminLoggedIn')) {
  window.location.href = 'adminlogin.html';
}

$(document).ready(function () {
  // Global variables
  let users = [];
  let planCategories = [];        // Active categories
  let plans = [];                 // Active plans
  let deactivatedPlans = [];      // Deactivated plans
  let deactivatedCategories = []; // Deactivated categories
  let newUserRequest = {};

  // Fetch data from JSON server endpoints
  $.when(
    $.getJSON("http://localhost:3000/dashboard"),
    $.getJSON("http://localhost:3000/categories"),
    $.getJSON("http://localhost:3000/plans"),
    $.getJSON("http://localhost:3000/newUserRequest"),
    $.getJSON("http://localhost:3000/deactivatedPlans"),
    $.getJSON("http://localhost:3000/deactivatedCategories")
  ).done(function (dashboardData, categoriesData, plansDataResponse, newUserRequestData, deactPlansData, deactCatsData) {
    users = dashboardData[0].users.details;
    planCategories = categoriesData[0];      // Active categories
    plans = plansDataResponse[0];              // Active plans
    newUserRequest = newUserRequestData[0];
    deactivatedPlans = deactPlansData[0];        // Deactivated plans
    deactivatedCategories = deactCatsData[0];      // Deactivated categories

    updateDashboardStats();
    renderActivePlansTable();
    renderDeactivatedPlansTable();
    renderActiveCategoriesTable();
    renderDeactivatedCategoriesTable();
    populateCategoryDropdowns();
    updateExpiringAndExpiredUsersList()
  }).fail(function (error) {
    console.error("Error fetching data:", error);
  });

  // Sidebar navigation (assumes sidebar links have a data-target attribute)
  $(".sidebar a.nav-link").click(function (e) {
    e.preventDefault();
    const target = $(this).data("target");
    $(".section").addClass("d-none");
    $("#" + target).removeClass("d-none");
  });

  document.querySelectorAll('.active-sts').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default navigation if needed
      document.querySelectorAll('.active-sts').forEach(item => item.classList.remove('active'));
      this.classList.add('active');
    });
  });  

  // Populate category dropdown in the plan modal (for active categories only)
  function populateCategoryDropdowns() {
    const $planCategory = $("#planCategory");
    $planCategory.empty().append('<option value="">Select Category</option>');
    planCategories.forEach(category => {
      $planCategory.append(`<option value="${category.id}">${category.name}</option>`);
    });
  }

  // Update Dashboard Stats
  function updateDashboardStats() {
    $("#dashboardStats").html(`
  <div class="row">
    <div class="col-md-4">
      <div class="card stat-card">
        <div class="card-body p-3">
          <h5>Total Users</h5>
          Total Users: ${users.length}<br>
          Active Users: ${users.length - 3}<br>
          </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card stat-card">
        <div class="card-body">
          <h5>Total Categories</h5>
          Active: ${planCategories.length}<br>
          Deactivated: ${deactivatedCategories.length}
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card stat-card">
        <div class="card-body">
        <h5>Total Plans</h5>
          Active: ${plans.length}<br>
          Deactivated: ${deactivatedPlans.length}
        </div>
      </div>
    </div>
  </div>
`);
  }

  function getExpiringUsers() {
    let today = new Date();
    return users.filter(u => {
        if (u.activePlan && u.activePlan.expiryDate) {
            let expiry = new Date(u.activePlan.expiryDate);
            let diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
            return diffDays <= 3 && diffDays >= 0;
        }
        return false;
    });
}

// --- Expiring and Expired Users Section ---
function updateExpiringAndExpiredUsersList() {
    const today = new Date();
    // Filter users with active plan expiring in 3 days or less
    const expiringUsers = users.filter(u => {
        if (u.activePlan && u.activePlan.expiryDate) {
            const expiry = new Date(u.activePlan.expiryDate);
            const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
            return diffDays <= 3 && diffDays >= 0;
        }
        return false;
    });

    // Filter users with expired plans (expiry date in the past)
    const expiredUsers = users.filter(u => {
        if (u.activePlan && u.activePlan.expiryDate) {
            const expiry = new Date(u.activePlan.expiryDate);
            const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
            return diffDays < 0;
        }
        return false;
    });

    // Update the Expiring Plans stat card (if you use it)
    // Update Expiring Users Table
    $("#expiringCount").text(expiringUsers.length);
    const expiringList = $("#expiringUsersList");
    expiringList.empty();

    if (expiringUsers.length === 0) {
        expiringList.append(`
  <tr>
    <td colspan="4" class="text-center">No users with expiring plans within 3 days.</td>
  </tr>
`);
    } else {
        expiringUsers.forEach(user => {
            expiringList.append(`
      <tr data-uid="${user.username}">
        <td>${user.name}</td>
        <td>${user.activePlan.title}</td>
        <td>${user.activePlan.expiryDate}</td>
        <td>
          <button class="btn btn-warning btn-sm notify-btn" data-uid="${user.username}">
            <i class="fas fa-bell"></i> Notify
          </button>
        </td>
      </tr>
    `);
        });
    }

    // Update Expired Users Table
    const expiredList = $("#expiredUsersList");
    expiredList.empty();

    if (expiredUsers.length === 0) {
        expiredList.append(`
  <tr>
    <td colspan="4" class="text-center">No users with expired plans.</td>
  </tr>
`);
    } else {
        expiredUsers.forEach(user => {
            expiredList.append(`
      <tr data-uid="${user.username}">
        <td>${user.name}</td>
        <td>${user.activePlan.title}</td>
        <td>${user.activePlan.expiryDate}</td>
        <td>
          <button class="btn btn-warning btn-sm notify-btn" data-uid="${user.username}">
            <i class="fas fa-bell"></i> Notify
          </button>
        </td>
      </tr>
    `);
        });
    }

}

  /* ================================
     RENDERING ACTIVE / DEACTIVATED PLANS
     ================================ */

  function renderActivePlansTable() {
    const $tbody = $("#activePlansTable tbody");
    $tbody.empty();
    plans.forEach(plan => {
      const categoryName = planCategories.find(cat => cat.id == plan.categoryId)?.name || "N/A";
      $tbody.append(`
    <tr data-id="${plan.id}">
      <td>${plan.id}</td>
      <td>${plan.name}</td>
      <td>${categoryName}</td>
      <td>${plan.price}</td>
      <td>${plan.validity}</td>
      <td>
        <button type="button" class="btn btn-sm btn-info mx-2 edit-plan"><i class="fas fa-edit"></i></button>
        <button type="button" class="btn btn-sm btn-warning mx-2 deactivate-plan"><i class="fa-solid fa-trash-arrow-up"></i></button>
      </td>
    </tr>
  `);
    });
  }

  function renderDeactivatedPlansTable() {
    const $tbody = $("#deactivatedPlansTable tbody");
    $tbody.empty();
    deactivatedPlans.forEach(plan => {
      const categoryName = planCategories.find(cat => cat.id == plan.categoryId)?.name || "N/A";
      $tbody.append(`
    <tr data-id="${plan.id}">
      <td>${plan.id}</td>
      <td>${plan.name}</td>
      <td>${categoryName}</td>
      <td>${plan.price}</td>
      <td>${plan.validity}</td>
      <td>
        <button type="button" class="btn btn-sm btn-primary mx-2 reactivate-plan"><i class="fa-solid fa-check-double"></i></button>
        <button type="button" class="btn btn-sm btn-danger mx-2 delete-deactivated-plan"><i class="fas fa-trash-alt"></i></button>
      </td>
    </tr>
  `);
    });
  }

  /* ================================
     RENDERING ACTIVE / DEACTIVATED CATEGORIES
     ================================ */

  function renderActiveCategoriesTable() {
    const $tbody = $("#activeCategoriesTable tbody");
    $tbody.empty();
    planCategories.forEach(cat => {
      // Get associated active plans from the active plans array
      const associatedPlans = plans.filter(p => p.categoryId == cat.id);
      const planNames = associatedPlans.map(p => p.name).join(", ") || "None";
      $tbody.append(`
    <tr data-id="${cat.id}">
      <td>${cat.id}</td>
      <td>${cat.name}</td>
      <td>${planNames}</td>
      <td>
        <button type="button" class="btn btn-sm btn-info mx-2 edit-category"><i class="fas fa-edit"></i></button>
        <button type="button" class="btn btn-sm btn-warning mx-2 deactivate-category"><i class="fa-solid fa-trash-arrow-up"></i></button>
      </td>
    </tr>
  `);
    });
  }

  function renderDeactivatedCategoriesTable() {
    const $tbody = $("#deactivatedCategoriesTable tbody");
    $tbody.empty();
    deactivatedCategories.forEach(cat => {
      // Assuming deactivated category has a "plans" sub-array with associated plans
      const associatedPlans = cat.plans || [];
      const planNames = associatedPlans.map(p => p.name).join(", ") || "None";
      $tbody.append(`
    <tr data-id="${cat.id}">
      <td>${cat.id}</td>
      <td>${cat.name}</td>
      <td>${planNames}</td>
      <td>
        <button type="button" class="btn btn-sm btn-primary mx-2 reactivate-category"><i class="fa-solid fa-check-double"></i></button>
        <button type="button" class="btn btn-sm btn-danger mx-2 delete-deactivated-category"><i class="fas fa-trash-alt"></i></button>
      </td>
    </tr>
  `);
    });
  }

  /* ================================
     PLAN CRUD OPERATIONS (ACTIVE)
     ================================*/

  // Add Plan button click
  $("#addPlanBtn").click(function (e) {
    e.preventDefault();
    $("#planForm")[0].reset();
    $("#planId").val('');
    $("#planModalLabel").text("Add New Plan");
    new bootstrap.Modal(document.getElementById('planModal')).show();
  });

  // Plan form submit (Create or Update)
  $("#planForm").submit(function (e) {
    e.preventDefault();
    const generatedId = Date.now().toString();
    const planObj = {
      id: $("#planId").val() || generatedId,
      name: $("#planName").val(),
      categoryId: parseInt($("#planCategory").val()),
      price: parseFloat($("#planPrice").val()),
      validity: $("#planValidity").val(),
      active: true
    };

    const existingIndex = plans.findIndex(p => p.id == planObj.id);
    if (existingIndex > -1) {
      // Update plan
      plans[existingIndex] = planObj;
      $.ajax({
        url: `http://localhost:3000/plans/${encodeURIComponent(planObj.id)}`,
        type: 'PUT',
        data: JSON.stringify(planObj),
        contentType: "application/json",
        success: function () {
          renderActivePlansTable();
          bootstrap.Modal.getInstance(document.getElementById('planModal')).hide();
        },
        error: function (err) {
          console.error("Error updating plan:", err);
        }
      });
    } else {
      // Create new plan
      plans.push(planObj);
      $.ajax({
        url: "http://localhost:3000/plans",
        type: 'POST',
        data: JSON.stringify(planObj),
        contentType: "application/json",
        success: function () {
          renderActivePlansTable();
          bootstrap.Modal.getInstance(document.getElementById('planModal')).hide();
        },
        error: function (err) {
          console.error("Error creating plan:", err);
        }
      });
    }
  });

  // Edit Plan
  $(document).on("click", ".edit-plan", function (e) {
    e.preventDefault();
    const planId = $(this).closest("tr").data("id");
    const plan = plans.find(p => p.id == planId);
    if (plan) {
      $("#planId").val(plan.id);
      $("#planName").val(plan.name);
      $("#planCategory").val(plan.categoryId);
      $("#planPrice").val(plan.price);
      $("#planValidity").val(plan.validity);
      $("#planModalLabel").text("Edit Plan");
      new bootstrap.Modal(document.getElementById('planModal')).show();
    }
  });

  // Deactivate (Soft Delete) Plan
  $(document).on("click", ".deactivate-plan", async function (e) {
    e.preventDefault();
    if (!confirm("Are you sure you want to deactivate this plan?")) return;
    const planId = $(this).closest("tr").data("id").toString();
    let plan = plans.find(p => p.id == planId);
    if (!plan) {
      try {
        plan = await $.getJSON(`http://localhost:3000/plans/${encodeURIComponent(planId)}`);
      } catch (err) {
        console.error("Plan not found:", planId, err);
        return;
      }
    }
    // Remove from local active array
    plans = plans.filter(p => p.id !== planId);
    try {
      // POST the plan to deactivatedPlans endpoint
      await $.ajax({
        url: "http://localhost:3000/deactivatedPlans",
        type: "POST",
        data: JSON.stringify(plan),
        contentType: "application/json"
      });
      // DELETE the plan from active plans
      await $.ajax({
        url: `http://localhost:3000/plans/${encodeURIComponent(planId)}`,
        type: "DELETE"
      });
      renderActivePlansTable();
      // Add the plan to local deactivatedPlans array and re-render
      deactivatedPlans.push(plan);
      renderDeactivatedPlansTable();
    } catch (err) {
      console.error("Error during plan deactivation:", err);
    }
  });

  // Reactivate Plan (from deactivated tab)
  $(document).on("click", ".reactivate-plan", async function (e) {
    e.preventDefault();
    if (!confirm("Reactivate this plan?")) return;
    const planId = $(this).closest("tr").data("id").toString();
    let plan = deactivatedPlans.find(p => p.id == planId);
    if (!plan) return;
    deactivatedPlans = deactivatedPlans.filter(p => p.id !== planId);
    try {
      await $.ajax({
        url: "http://localhost:3000/plans",
        type: "POST",
        data: JSON.stringify(plan),
        contentType: "application/json"
      });
      await $.ajax({
        url: `http://localhost:3000/deactivatedPlans/${encodeURIComponent(planId)}`,
        type: "DELETE"
      });
      plans.push(plan);
      renderActivePlansTable();
      renderDeactivatedPlansTable();
    } catch (err) {
      console.error("Error reactivating plan:", err);
    }
  });

  // Permanently Delete Deactivated Plan
  $(document).on("click", ".delete-deactivated-plan", async function (e) {
    e.preventDefault();
    if (!confirm("Permanently delete this plan?")) return;
    const planId = $(this).closest("tr").data("id").toString();
    deactivatedPlans = deactivatedPlans.filter(p => p.id !== planId);
    try {
      await $.ajax({
        url: `http://localhost:3000/deactivatedPlans/${encodeURIComponent(planId)}`,
        type: "DELETE"
      });
      renderDeactivatedPlansTable();
    } catch (err) {
      console.error("Error deleting deactivated plan:", err);
    }
  });

  /* ================================
     CATEGORY CRUD OPERATIONS (ACTIVE)
     ================================*/

  // Add Category button click
  $("#addCategoryBtn").click(function (e) {
    e.preventDefault();
    $("#categoryForm")[0].reset();
    $("#categoryId").val('');
    $("#categoryModalLabel").text("Add New Category");
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
  });

  // Category form submit (Create or Update)
  $("#categoryForm").submit(function (e) {
    e.preventDefault();
    const generatedId = Date.now().toString();
    const categoryObj = {
      id: $("#categoryId").val() || generatedId,
      name: $("#categoryName").val(),
      plans: [] // For active category, plans will be handled via the active plans resource
    };
    const existingIndex = planCategories.findIndex(c => c.id == categoryObj.id);
    if (existingIndex > -1) {
      planCategories[existingIndex] = categoryObj;
      $.ajax({
        url: `http://localhost:3000/categories/${encodeURIComponent(categoryObj.id)}`,
        type: 'PUT',
        data: JSON.stringify(categoryObj),
        contentType: "application/json",
        success: function () {
          renderActiveCategoriesTable();
          populateCategoryDropdowns();
          bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        },
        error: function (err) {
          console.error("Error updating category:", err);
        }
      });
    } else {
      planCategories.push(categoryObj);
      $.ajax({
        url: "http://localhost:3000/categories",
        type: 'POST',
        data: JSON.stringify(categoryObj),
        contentType: "application/json",
        success: function () {
          renderActiveCategoriesTable();
          populateCategoryDropdowns();
          bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        },
        error: function (err) {
          console.error("Error creating category:", err);
        }
      });
    }
  });

  // Edit Category
  $(document).on("click", ".edit-category", function (e) {
    e.preventDefault();
    const categoryId = $(this).closest("tr").data("id");
    const category = planCategories.find(c => c.id == categoryId);
    if (category) {
      $("#categoryId").val(category.id);
      $("#categoryName").val(category.name);
      $("#categoryModalLabel").text("Edit Category");
      new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }
  });

  // Deactivate Category (Soft Delete) – deactivates the category and all associated plans
  $(document).on("click", ".deactivate-category", async function (e) {
    e.preventDefault();
    if (!confirm("Are you sure you want to deactivate this category? All associated plans will be deactivated.")) return;
    const categoryId = $(this).closest("tr").data("id").toString();
    const category = planCategories.find(c => c.id == categoryId);
    if (!category) return;

    planCategories = planCategories.filter(c => c.id !== categoryId);
    const associatedPlans = plans.filter(p => p.categoryId == categoryId);
    plans = plans.filter(p => p.categoryId != categoryId);

    const deactivatedCat = {
      ...category,
      plans: associatedPlans
    };

    try {
      await $.ajax({
        url: "http://localhost:3000/deactivatedCategories",
        type: "POST",
        data: JSON.stringify(deactivatedCat),
        contentType: "application/json"
      });
      await $.ajax({
        url: `http://localhost:3000/categories/${encodeURIComponent(categoryId)}`,
        type: "DELETE"
      });

      for (const plan of associatedPlans) {
        await $.ajax({
          url: "http://localhost:3000/deactivatedPlans",
          type: "POST",
          data: JSON.stringify(plan),
          contentType: "application/json"
        });
        await $.ajax({
          url: `http://localhost:3000/plans/${encodeURIComponent(plan.id)}`,
          type: "DELETE"
        });
        deactivatedPlans.push(plan);
      }

      renderActiveCategoriesTable();
      renderDeactivatedCategoriesTable();
      renderActivePlansTable();
      renderDeactivatedPlansTable();
      populateCategoryDropdowns();
    } catch (err) {
      console.error("Error deactivating category:", err);
    }
  });

  // Reactivate Category – reactivates the category and fetches all deactivated plans of that category to reactivate them
  $(document).on("click", ".reactivate-category", async function (e) {
    e.preventDefault();
    if (!confirm("Reactivate this category and its plans?")) return;
    const categoryId = $(this).closest("tr").data("id").toString();
    const cat = deactivatedCategories.find(c => c.id == categoryId);
    if (!cat) return;

    deactivatedCategories = deactivatedCategories.filter(c => c.id != categoryId);

    try {
      await $.ajax({
        url: "http://localhost:3000/categories",
        type: "POST",
        data: JSON.stringify({ id: cat.id, name: cat.name, plans: [] }),
        contentType: "application/json"
      });
      await $.ajax({
        url: `http://localhost:3000/deactivatedCategories/${encodeURIComponent(categoryId)}`,
        type: "DELETE"
      });

      const associatedPlans = await $.getJSON(`http://localhost:3000/deactivatedPlans?categoryId=${encodeURIComponent(categoryId)}`);

      for (const plan of associatedPlans) {
        await $.ajax({
          url: "http://localhost:3000/plans",
          type: "POST",
          data: JSON.stringify(plan),
          contentType: "application/json"
        });
        await $.ajax({
          url: `http://localhost:3000/deactivatedPlans/${encodeURIComponent(plan.id)}`,
          type: "DELETE"
        });
        plans.push(plan);
        deactivatedPlans = deactivatedPlans.filter(p => p.id !== plan.id);
      }

      planCategories.push({ id: cat.id, name: cat.name, plans: [] });

      renderActiveCategoriesTable();
      renderDeactivatedCategoriesTable();
      renderActivePlansTable();
      renderDeactivatedPlansTable();
      populateCategoryDropdowns();
    } catch (err) {
      console.error("Error reactivating category:", err);
    }
  });

  // Permanently Delete Deactivated Category
  $(document).on("click", ".delete-deactivated-category", async function (e) {
    e.preventDefault();
    if (!confirm("Permanently delete this category?")) return;
    const categoryId = $(this).closest("tr").data("id").toString();
    deactivatedCategories = deactivatedCategories.filter(c => c.id !== categoryId);
    try {
      await $.ajax({
        url: `http://localhost:3000/deactivatedCategories/${encodeURIComponent(categoryId)}`,
        type: "DELETE"
      });
      renderDeactivatedCategoriesTable();
    } catch (err) {
      console.error("Error deleting deactivated category:", err);
    }
  });

  // Permanently Delete Deactivated Plan
  $(document).on("click", ".delete-deactivated-plan", async function (e) {
    e.preventDefault();
    if (!confirm("Permanently delete this plan?")) return;
    const planId = $(this).closest("tr").data("id").toString();
    deactivatedPlans = deactivatedPlans.filter(p => p.id !== planId);
    try {
      await $.ajax({
        url: `http://localhost:3000/deactivatedPlans/${encodeURIComponent(planId)}`,
        type: "DELETE"
      });
      renderDeactivatedPlansTable();
    } catch (err) {
      console.error("Error deleting deactivated plan:", err);
    }
  });

  $(document).ready(function () {
    // Global array for users (from dashboard.users.details)
    let users = [];
  
    // Fetch dashboard data from the JSON server
    $.getJSON("http://localhost:3000/dashboard")
      .done(function (dashboardData) {
        // Expected dashboard structure:
        // {
        //   "users": {
        //      "total": 15,
        //      "active": 12,
        //      "deactivated": 3,
        //      "details": [ {username, name, phone, email, activePlan, rechargeHistory, query, ...}, ... ]
        //   }
        // }
        users = dashboardData.users.details;
        renderUsersDetailsTable();
        renderUserQueriesTable();
      })
      .fail(function (error) {
        console.error("Error fetching dashboard data:", error);
      });
  
    // Render the User Details Table (Table 1)
    function renderUsersDetailsTable() {
      const $tbody = $("#usersDetailsTable tbody");
      $tbody.empty();
      const searchTerm = $("#userSearch").val().toLowerCase();
      users.forEach(user => {
        if (user.username.toLowerCase().indexOf(searchTerm) !== -1) {
          // If activePlan exists, display its title; otherwise "None"
          const activePlan = user.activePlan ? user.activePlan.title : "None";
          const viewBtn = `<button class="btn btn-sm btn-success view-user-details mx-2 my-2">View Detail >> </button>`;
          $tbody.append(`
            <tr data-username="${user.username}">
              <td>${user.username}</td>
              <td>${user.name}</td>
              <td>${user.phone}</td>
              <td>${user.email}</td>
              <td>${activePlan}</td>
              <td>${viewBtn}</td>
            </tr>
          `);
        }
      });
    }
  
    // Render the User Queries Table (Table 2)
    function renderUserQueriesTable() {
      const $tbody = $("#userQueriesTable tbody");
      $tbody.empty();
      users.forEach(user => {
        if (user.query && user.query.trim() !== "") {
          $tbody.append(`
            <tr data-username="${user.username}">
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${user.phone}</td>
              <td>${user.query}</td>
              <td><button class="btn btn-sm btn-primary solve-query">Solve Query</button></td>
            </tr>
          `);
        }
      });
    }
  
    // Search functionality: re-render the user details table on keyup
    $("#userSearch").on("keyup", function () {
      renderUsersDetailsTable();
    });
  
    // When "View Details" is clicked, open a modal with full user details.
    $(document).on("click", ".view-user-details", function () {
      const username = $(this).closest("tr").data("username");
      const user = users.find(u => u.username === username);
      if (user) {
        // Populate modal with basic info
        $("#detailUsername").text(user.username);
        $("#detailName").text(user.name);
        $("#detailPhone").text(user.phone);
        $("#detailEmail").text(user.email);
        const activePlan = user.activePlan ? `${user.activePlan.title} (Exp: ${user.activePlan.expiryDate})` : "None";
        $("#detailActivePlan").text(activePlan);
  
        // Populate recharge history table
        const $rhTbody = $("#detailRechargeHistoryTable tbody");
        $rhTbody.empty();
        if (user.rechargeHistory && user.rechargeHistory.length) {
          user.rechargeHistory.forEach(record => {
            $rhTbody.append(`
              <tr>
                <td>${record.planId}</td>
                <td>${record.rechargeDate}</td>
                <td>${record.amount}</td>
                <td>${record.status}</td>
              </tr>
            `);
          });
        } else {
          $rhTbody.append(`<tr><td colspan="4" class="text-center">No recharge history</td></tr>`);
        }
        new bootstrap.Modal(document.getElementById("userDetailsModal")).show();
      }
    });
  
    // When "Solve Query" is clicked in the User Queries table
    $(document).on("click", ".solve-query", function () {
      const username = $(this).closest("tr").data("username");
      if (confirm(`Mark query as solved for ${username}?`)) {
        const user = users.find(u => u.username === username);
        if (user) {
          user.query = ""; // Clear the query (mark as solved)
          // Update the dashboard on the server by sending the updated users array.
          // (Depending on your API, you might update only that user instead.)
          $.ajax({
            url: "http://localhost:3000/dashboard",
            type: "PUT",
            data: JSON.stringify({ users: { details: users } }),
            contentType: "application/json",
            success: function () {
              renderUserQueriesTable();
              renderUsersDetailsTable();
            },
            error: function (err) {
              console.error("Error updating user query:", err);
            }
          });
        }
      }
    });
  });
  
});