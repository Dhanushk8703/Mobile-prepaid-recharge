window.addEventListener('scroll', function () {
  const header = document.getElementById('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Global variable to store grouped plans data by category
let plansData = [];

/*******************************************************
 * 1) FETCH PUBLIC DATA FROM THE BACKEND SERVER
 *    (No authentication is required for GET endpoints)
 *******************************************************/
async function fetchPublicData() {
  try {
    // Define the base URL for public endpoints
    const BASE_URL = 'http://localhost:8087/api';

    // Fetch categories
    const categoriesResponse = await fetch(`${BASE_URL}/category`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!categoriesResponse.ok) {
      throw new Error(`Categories response not ok, status: ${categoriesResponse.status}`);
    }
    const categories = await categoriesResponse.json();

    // Fetch plans
    const plansResponse = await fetch(`${BASE_URL}/plans`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!plansResponse.ok) {
      throw new Error(`Plans response not ok, status: ${plansResponse.status}`);
    }
    const plans = await plansResponse.json();

    // Fetch benefits (if needed later)
    const benefitsResponse = await fetch(`${BASE_URL}/benefits`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!benefitsResponse.ok) {
      throw new Error(`Benefits response not ok, status: ${benefitsResponse.status}`);
    }
    const benefits = await benefitsResponse.json();

    // Group plans by category using plan.category.categoryId
    const structuredCategories = categories.map(category => {
      return {
        ...category,
        plans: plans.filter(plan => plan.category && plan.category.categoryId === category.categoryId)
      };
    });

    const structuredData = {
      categories: structuredCategories,
      benefits
    };

    console.log("Fetched Public Data:", structuredData);
    return structuredData;
  } catch (error) {
    console.error("Error fetching public data:", error);
  }
}

// Call the function to load public data and render plans
fetchPublicData().then(data => {
  if (data && data.categories) {
    plansData = data.categories.filter(category => category.status === 'STATUS_ACTIVE'); // Save globally for filtering
    renderPlans(plansData);
    populateCategoryFilter(plansData);
  }
});

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

  // Get filter values from the appropriate elements
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

  // OTT Platforms filter (if applicable)
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
    if (selectedCategory === 'all' || category.categoryId == selectedCategory) {
      const filteredPlans = category.plans.filter(plan => {
        // Price check using planPrice
        if (plan.planPrice > maxPrice) return false;

        // Validity check (assuming validity is numeric)
        const planValidity = parseInt(plan.validity);
        if (isNaN(planValidity) || planValidity < minValidity || planValidity > maxValidity) return false;

        // Data check if applicable (if plan.dataValue exists)
        if (typeof plan.dataValue === 'number') {
          if (plan.dataValue < minData || plan.dataValue > maxData) return false;
        }

        // OTT Platforms check: using benefits as a proxy (if any benefit's name matches one of the selected OTT platforms)
        if (selectedOTT.length > 0) {
          const planOtt = plan.benefits ? Array.from(plan.benefits).map(b => b.benefitsName) : [];
          const matchesOtt = selectedOTT.some(platform => planOtt.includes(platform));
          if (!matchesOtt) return false;
        }

        // 5G filter check (if plan has an is5G boolean)
        if (fiveGOnly && !plan.is5G) return false;

        // Keyword search in planName or description
        const nameMatch = plan.planName?.toLowerCase().includes(searchKeyword);
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

// Function to populate category filter dropdown
function populateCategoryFilter(categories) {
  const categoryFilter = document.getElementById("categoryFilter");
  const offcanvasCategoryFilter = document.getElementById("offcanvasCategoryFilter");

  // Clear existing options
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  offcanvasCategoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(category => {
      let option = document.createElement("option");
      option.value = category.categoryId;
      option.textContent = category.categoryName;
      categoryFilter.appendChild(option);

      let offcanvasOption = option.cloneNode(true);
      offcanvasCategoryFilter.appendChild(offcanvasOption);
  });
}


/*******************************************************
 * 3) RENDER PLANS AS TAB PANES
 *******************************************************/
function renderPlans(categoriesResponse) {
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

  categoriesResponse.forEach((category, index) => {
    // Create tab header using category attributes
    
    const li = document.createElement('li');
    li.className = "nav-item";
    li.role = "presentation";

    const tabButton = document.createElement('button');
    tabButton.className = "nav-link w-100" + (index === 0 ? " active" : "");
    tabButton.id = `tab-${category.categoryId}`;
    tabButton.setAttribute("data-bs-toggle", "tab");
    tabButton.setAttribute("data-bs-target", `#pane-${category.categoryId}`);
    tabButton.type = "button";
    tabButton.role = "tab";
    tabButton.setAttribute("aria-controls", `pane-${category.categoryId}`);
    tabButton.setAttribute("aria-selected", index === 0 ? "true" : "false");
    tabButton.innerText = category.categoryName;

    li.appendChild(tabButton);
    navTabs.appendChild(li);

    // Create tab pane for this category
    const tabPane = document.createElement('div');
    tabPane.className = "tab-pane fade" + (index === 0 ? " show active" : "");
    tabPane.id = `pane-${category.categoryId}`;
    tabPane.role = "tabpanel";
    tabPane.setAttribute("aria-labelledby", `tab-${category.categoryId}`);

    // Create row for plan cards
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    category.plans.forEach(plan => {
      const planCard = document.createElement('div');
      planCard.classList.add('col-md-4', 'mb-4');
      planCard.innerHTML = `
        <div class="plan-card p-4 border rounded shadow-sm h-100 position-relative" 
            data-plan-id="${plan.planId}" 
            data-title="${plan.planName}" 
            data-data="${plan.data}"
            data-sms="${plan.sms}"
            data-description="${plan.description}"
            data-validity="${plan.validity}" 
            data-price="${plan.planPrice}" 
            data-benefits='${JSON.stringify(plan.benefits ? Array.from(plan.benefits) : [])}'>
          
          <h4 class="plan-title mb-3">${plan.planName}</h4>
          <p class="plan-validity"><strong>Validity:</strong> ${plan.validity} Days</p>
          <p class="plan-price"><strong>Price:</strong> ₹${plan.planPrice}</p>
          <p class="plan-data"><strong>Data:</strong> ${plan.data} GB per day</p>
          <p class="plan-sms"><strong>SMS:</strong> ${plan.sms}</p>
          <p class="plan-description">${plan.description}</p>
          
          <div class="btn-group mt-3">
            <button class="btn-view btn btn-sm btn-outline-primary">View Details</button>
             <a class="btn-recharge btn btn-sm btn-success" 
   href="payment.html?planId=${plan.planId}&price=${plan.planPrice}&planTitle=${plan.planName}">
  Recharge Now
</a>
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


/*******************************************************
 * 4) VIEW DETAILS (MODAL) EVENT DELEGATION
 *******************************************************/
document.getElementById('plans-container').addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('btn-view')) {
    const card = e.target.closest('.plan-card');
    const planId = card.getAttribute('data-plan-id');
    const title = card.getAttribute('data-title');
    const description = card.getAttribute('data-description');
    const validity = card.getAttribute('data-validity');
    const price = card.getAttribute('data-price');
    const benefitsStr = card.getAttribute('data-benefits');

    let benefitsHTML = '';
    if (benefitsStr) {
      try {
        const benefitsArr = JSON.parse(benefitsStr);
        if (Array.isArray(benefitsArr) && benefitsArr.length) {
          benefitsHTML = `<h6>Benefits:</h6><div class="benefits-details">` +
            benefitsArr.map(benefit => `<div class="benefit-item">${benefit.icon}  ${benefit.benefitsName}</div>`).join('') +
            `</div>`;
        }
      } catch (err) {
        console.error("Error parsing benefits details", err);
      }
    }

    // Update modal fields (using Bootstrap modal IDs from your prepaid.html)
    document.getElementById('planDetailModalLabel').innerText = title;
    document.getElementById('modalContent').innerHTML = `
      <p><strong>Validity:</strong> ${validity} Days</p>
      <p><strong>Plan ID:</strong> ${planId}</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Price:</strong> ₹${price}</p>
      <p>${description}</p>
      ${benefitsHTML}
    `;
    document.getElementById('rechargeModalBtn').href = "payment.html?planId=" + planId + "&price=" + price;
    
    // Show the modal using Bootstrap's Modal API
    var myModal = new bootstrap.Modal(document.getElementById('planDetailModal'));
    myModal.show();
  }
});


/*******************************************************
 * 5) EVENT LISTENERS FOR FILTERS
 *******************************************************/
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
});
