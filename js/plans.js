/*******************************************************
 * 1) FETCH PLANS & CATEGORIES FROM JSON SERVER
 *******************************************************/
fetchPlans();

// Global variable to store grouped plans data by category
let plansData = [];

// Change header style on scroll
window.addEventListener('scroll', function () {
  const header = document.getElementById('header');
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// Fetch categories and plans from the JSON server and group plans by category
async function fetchPlans() {
  try {
    // Fetch categories
    const catResponse = await fetch('http://localhost:3000/categories');
    if (!catResponse.ok) {
      throw new Error(`Categories response not ok, status: ${catResponse.status}`);
    }
    const categories = await catResponse.json();

    // Fetch plans
    const plansResponse = await fetch('http://localhost:3000/plans');
    if (!plansResponse.ok) {
      throw new Error(`Plans response not ok, status: ${plansResponse.status}`);
    }
    const plans = await plansResponse.json();

    // Group plans by category id
    const categoriesWithPlans = categories.map(category => ({
      ...category,
      plans: plans.filter(plan => plan.categoryId == category.id)
    }));

    // Store and render
    plansData = categoriesWithPlans;
    renderPlans(plansData);
  } catch (error) {
    console.error('Error fetching plans:', error);
  }
}

/*******************************************************
 * 2) MODERN FILTER FUNCTIONALITY (Inline & Offcanvas)
 *******************************************************/
function applyFilters() {
  // Check if offcanvas filter panel is open
  let useOffcanvas = false;
  const offcanvasEl = document.getElementById('filterOffcanvas');
  if (offcanvasEl && offcanvasEl.classList.contains('show')) {
    useOffcanvas = true;
  }

  // Get values from offcanvas if open; otherwise use inline filters.
  const maxPrice = parseInt(
    useOffcanvas
      ? document.getElementById('offcanvasPriceFilter').value
      : document.getElementById('priceFilter').value
  );
  const selectedCategory = useOffcanvas
    ? document.getElementById('offcanvasCategoryFilter').value
    : document.getElementById('categoryFilter').value;
  const searchKeyword = (
    useOffcanvas
      ? document.getElementById('offcanvasSearchFilter').value
      : document.getElementById('searchFilter').value
  ).trim().toLowerCase();

  // OTT Platforms filter (use the relevant container)
  let selectedOTT = [];
  const ottSelector = useOffcanvas
    ? "#filterOffcanvas .ottPlatform:checked"
    : ".ottPlatform:checked";
  document.querySelectorAll(ottSelector).forEach(cb => {
    selectedOTT.push(cb.value);
  });

  const minValidity = parseInt(
    useOffcanvas
      ? document.getElementById('offcanvasMinValidity').value
      : document.getElementById('minValidity').value
  );
  const maxValidity = parseInt(
    useOffcanvas
      ? document.getElementById('offcanvasMaxValidity').value
      : document.getElementById('maxValidity').value
  );
  const minData = parseFloat(
    useOffcanvas
      ? document.getElementById('offcanvasMinData').value
      : document.getElementById('minData').value
  );
  const maxData = parseFloat(
    useOffcanvas
      ? document.getElementById('offcanvasMaxData').value
      : document.getElementById('maxData').value
  );
  const fiveGOnly = useOffcanvas
    ? document.getElementById('offcanvasFiveGFilter').checked
    : document.getElementById('fiveGFilter').checked;

  let filteredCategories = [];

  plansData.forEach(category => {
    if (selectedCategory === 'all' || category.id == selectedCategory) {
      const filteredPlans = category.plans.filter(plan => {
        // Price check
        if (plan.price > maxPrice) return false;

        // Validity range check (assuming plan.validity is numeric or parseable)
        const planValidity = parseInt(plan.validity);
        if (isNaN(planValidity) || planValidity < minValidity || planValidity > maxValidity) return false;

        // Data per day range check (assuming plan.dataValue is numeric; adjust if needed)
        if (typeof plan.dataValue === 'number') {
          if (plan.dataValue < minData || plan.dataValue > maxData) return false;
        }

        // OTT Platforms check: if any OTT filter is selected, plan must have at least one matching OTT platform
        if (selectedOTT.length > 0) {
          const planOttPlatforms = (plan.ottDetails || []).map(ott => ott.platform);
          const matchesOtt = selectedOTT.some(platform => planOttPlatforms.includes(platform));
          if (!matchesOtt) return false;
        }

        // 5G filter: if checked, plan must be a 5G plan
        if (fiveGOnly && !plan.is5G) return false;

        // Keyword search check (match in plan name or description)
        const nameMatch = plan.name?.toLowerCase().includes(searchKeyword);
        const descMatch = plan.description?.toLowerCase().includes(searchKeyword);
        if (searchKeyword && !(nameMatch || descMatch)) return false;

        return true;
      });

      if (filteredPlans.length > 0) {
        filteredCategories.push({ ...category, plans: filteredPlans });
      }
    }
  });

  renderPlans(filteredCategories);
}

/*******************************************************
 * 3) RENDER PLANS AS TAB PANES
 *******************************************************/
function renderPlans(categories) {
  const container = document.getElementById('plans-container');
  container.innerHTML = ''; // Clear previous content

  // Create nav-tabs container for category tabs
  const navTabs = document.createElement('ul');
  navTabs.className = "nav nav-tabs mb-3";
  navTabs.id = "categoryTabs";
  navTabs.role = "tablist";

  // Create tab-content container for tab panes
  const tabContent = document.createElement('div');
  tabContent.className = "tab-content";
  tabContent.id = "categoryTabContent";

  categories.forEach((category, index) => {
    // Create tab header
    const li = document.createElement('li');
    li.className = "nav-item";
    li.role = "presentation";

    const tabButton = document.createElement('button');
    tabButton.className = "nav-link w-100" + (index === 0 ? " active" : "");
    tabButton.id = `tab-${category.id}`;
    tabButton.setAttribute("data-bs-toggle", "tab");
    tabButton.setAttribute("data-bs-target", `#pane-${category.id}`);
    tabButton.type = "button";
    tabButton.role = "tab";
    tabButton.setAttribute("aria-controls", `pane-${category.id}`);
    tabButton.setAttribute("aria-selected", index === 0 ? "true" : "false");
    tabButton.innerText = category.name;

    li.appendChild(tabButton);
    navTabs.appendChild(li);

    // Create tab pane for the category
    const tabPane = document.createElement('div');
    tabPane.className = "tab-pane fade" + (index === 0 ? " show active" : "");
    tabPane.id = `pane-${category.id}`;
    tabPane.role = "tabpanel";
    tabPane.setAttribute("aria-labelledby", `tab-${category.id}`);

    // Create row for plan cards
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    category.plans.forEach(plan => {
      const planCard = document.createElement('div');
      planCard.classList.add('col-md-4', 'mb-4');
      planCard.innerHTML = `
        <div class="plan-card p-4 border rounded shadow-sm h-100 position-relative" 
     data-plan-id="${plan.id}" 
     data-title="${plan.name}" 
     data-data="${plan.data}" 
     data-validity="${plan.validity}" 
     data-price="${plan.price}" 
     data-description="${plan.description}"
     data-aos="fade-left" data-aos-duration="500"
     data-ott='${JSON.stringify(plan.ottDetails || [])}'>
  <!-- Favorite Button in Top Right Corner -->
  <button class="btn-fav btn btn-sm btn-outline-danger" style="position: absolute; top: 10px; right: 10px;" title="Add to Favorites">
    <i class="fa fa-heart"></i>
  </button>
  <h4 class="plan-title mb-3">${plan.name}</h4>
  <p class="plan-data"><strong>Data:</strong> ${plan.data}</p>
  <p class="plan-validity"><strong>Validity:</strong> ${plan.validity} Days</p>
  <p class="plan-price"><strong>Price:</strong> ₹${plan.price}</p>
  <p class="plan-description">${plan.description}</p>
  <div class="btn-group mt-3">
    <button class="btn-view btn btn-sm btn-outline-primary">View Details</button>
    <a class="btn-recharge btn btn-sm btn-success" href="payment.html?planId=${plan.id}&price=${plan.price}">Recharge Now</a>
  </div>
</div>

      `;
      rowDiv.appendChild(planCard);
    });

    tabPane.appendChild(rowDiv);
    tabContent.appendChild(tabPane);
  });

  container.appendChild(navTabs);
  container.appendChild(tabContent);
}

$(document).on("click", ".btn-fav", async function (e) {
  e.preventDefault();

  // Check if user is logged in by verifying sessionStorage values.
  if (!sessionStorage.getItem("loggedIn") || !sessionStorage.getItem("phone")) {
    alert("Please log in to add favorite plans.");
    window.location.href = "login.html";
    return;
  }

  // Retrieve plan details from the card's data attributes.
  const planCard = $(this).closest(".plan-card");
  const planId = planCard.data("plan-id").toString();
  const plan = {
    id: planId,
    name: planCard.data("title"),
    data: planCard.data("data"),
    validity: planCard.data("validity"),
    price: planCard.data("price"),
    description: planCard.data("description"),
    ottDetails: planCard.data("ott")
  };

  const userPhone = sessionStorage.getItem("phone");

  try {
    // Fetch the current dashboard data from the JSON server.
    const response = await fetch("http://localhost:3000/dashboard");
    if (!response.ok) {
      alert("Error fetching user data. Please try again.");
      return;
    }
    const dashboard = await response.json();
    const usersArray = dashboard.users.details;

    // Find the logged-in user using their phone number.
    const currentUser = usersArray.find(u => u.phone === userPhone);
    if (!currentUser) {
      alert("User not found. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    // Ensure favoritePlans array exists.
    if (!currentUser.favoritePlans) {
      currentUser.favoritePlans = [];
    }

    // Check if the plan is already in favorites.
    const alreadyFavorite = currentUser.favoritePlans.some(fav => fav.id === plan.id);
    if (alreadyFavorite) {
      alert("This plan is already in your favorites.");
      return;
    }

    // Add the plan to the user's favoritePlans array.
    currentUser.favoritePlans.push(plan);

    // Update the dashboard data on the JSON server.
    const updatedDashboard = { ...dashboard, users: { ...dashboard.users, details: usersArray } };

    const updateResponse = await fetch("http://localhost:3000/dashboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDashboard)
    });

    if (updateResponse.ok) {
      alert("Plan added to favorites successfully!");
      // Optionally, update UI elements if needed.
    } else {
      alert("Failed to update favorite plans. Please try again.");
    }
  } catch (error) {
    console.error("Error updating favorite plans:", error);
    alert("An error occurred. Please try again later.");
  }
});


/*******************************************************
 * 4) VIEW DETAILS (MODAL) EVENT DELEGATION
 *******************************************************/
document.getElementById('plans-container').addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('btn-view')) {
    const card = e.target.closest('.plan-card');
    const planId = card.getAttribute('data-plan-id');
    const title = card.getAttribute('data-title');
    const dataPlan = card.getAttribute('data-data');
    const validity = card.getAttribute('data-validity');
    const price = card.getAttribute('data-price');
    const description = card.getAttribute('data-description');
    const ottStr = card.getAttribute('data-ott');

    let ottHTML = '';
    if (ottStr) {
      try {
        const ottArr = JSON.parse(ottStr);
        if (Array.isArray(ottArr) && ottArr.length) {
          ottHTML = `<h6>OTT Offers:</h6><div class="ott-details">` +
            ottArr.map(ott => `<div class="ott-item"><i class="${ott.icon}"></i> ${ott.platform} (${ott.validity})</div>`).join('') +
            `</div>`;
        }
      } catch (err) {
        console.error("Error parsing OTT details", err);
      }
    }

    document.getElementById('planDetailModalLabel').innerText = title;
    document.getElementById('modalContent').innerHTML = `
      <p><strong>Data:</strong> ${dataPlan}</p>
      <p><strong>Validity:</strong> ${validity} Days</p>
      <p><strong>Price:</strong> ₹${price}</p>
      <p>${description}</p>
      ${ottHTML}
    `;
    document.getElementById('rechargeModalBtn').href = "payment.html?planId=" + planId + "&price=" + price;
    var myModal = new bootstrap.Modal(document.getElementById('planDetailModal'));
    myModal.show();
  }
});

/*******************************************************
 * 5) EVENT LISTENERS FOR FILTERS
 *******************************************************/
// Inline filters
document.getElementById('priceFilter').addEventListener('input', function () {
  document.getElementById('priceValue').innerText = `₹${this.value}`;
  applyFilters();
});
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('searchFilter').addEventListener('input', applyFilters);
document.querySelectorAll('.ottPlatform').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});
document.getElementById('minValidity').addEventListener('input', applyFilters);
document.getElementById('maxValidity').addEventListener('input', applyFilters);
document.getElementById('minData').addEventListener('input', applyFilters);
document.getElementById('maxData').addEventListener('input', applyFilters);
document.getElementById('fiveGFilter').addEventListener('change', applyFilters);
document.getElementById('clearFilters').addEventListener('click', function () {
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('priceFilter').value = 1000;
  document.getElementById('priceValue').innerText = '₹1000';
  document.getElementById('searchFilter').value = '';
  document.getElementById('minValidity').value = 28;
  document.getElementById('maxValidity').value = 100;
  document.getElementById('minData').value = 0;
  document.getElementById('maxData').value = 10;
  document.getElementById('fiveGFilter').checked = false;
  document.querySelectorAll('.ottPlatform').forEach(cb => (cb.checked = false));
  applyFilters();
});

// Offcanvas filters
document.getElementById('offcanvasPriceFilter').addEventListener('input', function () {
  document.getElementById('offcanvasPriceValue').innerText = `₹${this.value}`;
  applyFilters();
});
document.getElementById('offcanvasCategoryFilter').addEventListener('change', applyFilters);
document.getElementById('offcanvasSearchFilter').addEventListener('input', applyFilters);
document.querySelectorAll('#filterOffcanvas .ottPlatform').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});
document.getElementById('offcanvasMinValidity').addEventListener('input', applyFilters);
document.getElementById('offcanvasMaxValidity').addEventListener('input', applyFilters);
document.getElementById('offcanvasMinData').addEventListener('input', applyFilters);
document.getElementById('offcanvasMaxData').addEventListener('input', applyFilters);
document.getElementById('offcanvasFiveGFilter').addEventListener('change', applyFilters);
document.getElementById('offcanvasClearFilters').addEventListener('click', function () {
  document.getElementById('offcanvasCategoryFilter').value = 'all';
  document.getElementById('offcanvasPriceFilter').value = 1000;
  document.getElementById('offcanvasPriceValue').innerText = '₹1000';
  document.getElementById('offcanvasSearchFilter').value = '';
  document.getElementById('offcanvasMinValidity').value = 28;
  document.getElementById('offcanvasMaxValidity').value = 100;
  document.getElementById('offcanvasMinData').value = 0;
  document.getElementById('offcanvasMaxData').value = 10;
  document.getElementById('offcanvasFiveGFilter').checked = false;
  document.querySelectorAll('#filterOffcanvas .ottPlatform').forEach(cb => (cb.checked = false));
  applyFilters();
  // Hide the offcanvas panel after clearing filters
  const offcanvasEl = document.getElementById('filterOffcanvas');
  const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
  offcanvasInstance.hide();
});

// Close the offcanvas panel when clicking outside of it
document.getElementById('filterOffcanvas').addEventListener('click', function (e) {
  if (e.target === this) {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(this);
    offcanvasInstance.hide();
  }
})