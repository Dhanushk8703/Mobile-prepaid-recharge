// 1) Retrieve plan details from URL parameters
const params = new URLSearchParams(window.location.search);
const planId = params.get('planId') || 'N/A';
const price = params.get('price') || '0';
const planTitle = params.get('planTitle') || 'Plan Details';

// 2) Populate the plan summary
const planSummary = document.getElementById('planSummary');
planSummary.innerHTML = `
  <h4>${planTitle}</h4>
  <p><strong>Plan ID:</strong> ${planId}</p>
  <p><strong>Price:</strong> ₹${price}</p>
`;

// 3) Check if mobile number exists in localStorage
const storedMobile = localStorage.getItem('mobileNumber');
const mobileSection = document.getElementById('mobileSection');

if (storedMobile) {
  // Show existing mobile number
  mobileSection.innerHTML = `
    <p style="font-weight: 500; color: #333;">
      <i class="fa-solid fa-phone me-1"></i>
      Mobile Number: ${storedMobile}
    </p>
    <p id="editMobile" style="cursor: pointer; color: #007bff; text-decoration: underline;">
      Edit Mobile Number
    </p>
  `;
} else {
  // Show input field for new mobile number
  mobileSection.innerHTML = `
    <label for="mobileNumber" class="form-label">Mobile Number</label>
    <input type="tel" class="form-control border-bottom border-dark" id="mobileNumber" placeholder="Enter your mobile number" required>
  `;
}

// 4) Allow editing mobile number
mobileSection.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'editMobile') {
    localStorage.removeItem('mobileNumber');
    mobileSection.innerHTML = `
      <label for="mobileNumber" class="form-label">Mobile Number</label>
      <input type="tel" class="form-control text-black" id="mobileNumber" placeholder="Enter your mobile number" required>
    `;
  }
});

// 5) Toggle Payment Method Fields
const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
paymentMethodRadios.forEach(radio => {
  radio.addEventListener('change', function () {
    document.getElementById('upiFields').style.display =
      this.value === 'UPI' ? 'block' : 'none';
    document.getElementById('cardFields').style.display =
      this.value === 'Card' ? 'block' : 'none';
    document.getElementById('walletFields').style.display =
      this.value === 'Wallet' ? 'block' : 'none';
    document.getElementById('netbankingFields').style.display =
      this.value === 'NetBanking' ? 'block' : 'none';
  });
});

// 6) Handle Payment Form Submission
document.getElementById('paymentForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // a) Retrieve or store mobile number
  let mobileNumber = localStorage.getItem('mobileNumber');
  if (!mobileNumber) {
    const mobileInput = document.getElementById('mobileNumber');
    if (!mobileInput || mobileInput.value.trim().length < 10) {
      alert("Please enter a valid mobile number (10 digits).");
      return;
    }
    mobileNumber = mobileInput.value.trim();
    localStorage.setItem('mobileNumber', mobileNumber);
  }

  // b) Find which payment method is selected
  const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
  if (!paymentMethodRadio) {
    alert("Please select a payment method.");
    return;
  }
  const paymentMethod = paymentMethodRadio.value;

  // c) Show processing message
  document.getElementById('paymentContent').innerHTML = `
    <div class="text-center">
      <h2>Processing Payment...</h2>
      <p class= "my-3 text-center text-danger">Please wait while payment is processing...<br><strong>Don't refresh the page</strong></P>
      <div class="loader"></div>
    </div>
  `;

  // d) Simulate payment processing delay
  setTimeout(() => {
    let transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
    document.getElementById('paymentContent').innerHTML = `
      <div class="success-message">
      <i class="bi bi-check-circle-fill text-warning" style="font-size: 4rem;"></i>
        <h2>Payment Successful!</h2>
        <div class="transaction-details">
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
          <p><strong>Plan:</strong> ${planId}</p>
          <p><strong>Price:</strong> ₹${price}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p>Your transaction was successful! Thank you for recharging.</p>
          <p class="text-danger">Confirmation will be sent to your registered Email address.</p>
        </div>
        <button class="btn btn-pay" onclick="window.location.href='index.html'">
          Return to Home
        </button>
      </div>
    `;
  }, 2500);
});