document.addEventListener('DOMContentLoaded', () => {
  // 1. Retrieve plan details from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('planId') || 'N/A';
  const planPrice = urlParams.get('price') || '0';
  const planTitle = urlParams.get('planTitle') ? decodeURIComponent(urlParams.get('planTitle')) : 'Plan Details';

  // Display plan details on the page
  const planSummary = document.getElementById('planSummary');
  if (planSummary) {
    planSummary.innerHTML = `
      <h4>${planTitle}</h4>
      <p><strong>Plan ID:</strong> ${planId}</p>
      <p><strong>Price:</strong> ₹${planPrice}</p>
    `;
  }

  // 2. Check for stored mobile number in localStorage
  const storedMobile = localStorage.getItem('mobileNumber');
  const mobileSection = document.getElementById('mobileSection');
  if (storedMobile) {
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
    // Redirect to getnumber.html with plan details if mobile number isn't stored
    window.location.href = `getnumber.html?planId=${encodeURIComponent(planId)}&price=${encodeURIComponent(planPrice)}&planTitle=${encodeURIComponent(planTitle)}`;
    return; // Stop further script execution
  }

  // Allow editing mobile number by redirecting to getnumber.html when clicked
  mobileSection.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'editMobile') {
      localStorage.removeItem('mobileNumber');
      window.location.href = `getnumber.html?planId=${encodeURIComponent(planId)}&price=${encodeURIComponent(planPrice)}&planTitle=${encodeURIComponent(planTitle)}`;
    }
  });

  // 3. Toggle Payment Method Fields
  const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      document.getElementById('upiFields').style.display = this.value === 'UPI' ? 'block' : 'none';
      document.getElementById('cardFields').style.display = this.value === 'Card' ? 'block' : 'none';
      document.getElementById('walletFields').style.display = this.value === 'Wallet' ? 'block' : 'none';
      document.getElementById('netbankingFields').style.display = this.value === 'NetBanking' ? 'block' : 'none';
    });
  });

  // 4. Handle Payment Form Submission
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Retrieve mobile number from localStorage
      const mobileNumber = localStorage.getItem('mobileNumber');

      // Validate mobile number
      if (!mobileNumber || mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      // Retrieve the selected payment method
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

      // Show processing message
      document.getElementById('paymentContent').innerHTML = `
        <div class="text-center">
          <h2>Processing Payment...</h2>
          <p class="my-3 text-center text-danger">Please wait while payment is processing...<br><strong>Don't refresh the page</strong></p>
          <div class="loader"></div>
        </div>
      `;

      // Simulate payment processing delay
      setTimeout(() => {
        // Generate a transaction ID
        let transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Prepare request body for backend call
        const requestBody = new URLSearchParams({
          planId: planId,
          amountPaid: planPrice,
          paymentMethod: paymentMethod,
          mobileNumber: mobileNumber
        });

        // Call the backend API to record the recharge
        fetch('http://localhost:8087/api/recharge-history/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: requestBody
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })  
        .then(data => {
          // Display success message and transaction details
          document.getElementById('paymentContent').innerHTML = `
            <div class="success-message">
              <i class="bi bi-check-circle-fill text-warning" style="font-size: 4rem;"></i>
              <h2>Payment Successful!</h2>
              <div class="transaction-details">
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
                <p><strong>Plan:</strong> ${planId}</p>
                <p><strong>Price:</strong> ₹${planPrice}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p>Your transaction was successful! Thank you for recharging.</p>
                <p class="text-danger">Confirmation will be sent to your registered Email address.</p>
              </div>
              <button class="btn btn-pay" onclick="window.location.href='index.html'">
                Return to Home
              </button>
            </div>
          `;
        })
        .catch(error => {
          console.error('Error:', error);
          alert("Payment failed, please try again.");
        });
      }, 2500);
    });
  }
});
