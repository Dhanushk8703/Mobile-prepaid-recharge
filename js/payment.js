/***********************************************************
  1) On page load, parse URL params & show plan details
***********************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('planId') || 'N/A';
  const planPrice = urlParams.get('price') || '0';
  const planTitle = urlParams.get('planTitle')
    ? decodeURIComponent(urlParams.get('planTitle'))
    : 'Plan Details';

  const planSummary = document.getElementById('planSummary');
  if (planSummary) {
    sessionStorage.setItem('planName', planTitle); 
    planSummary.innerHTML = `
      <h4>${planTitle}</h4>
      <p><strong>Plan ID:</strong> ${planId}</p>
      <p><strong>Price:</strong> ₹${planPrice}</p>
    `;
  }

  // Check or retrieve mobile number
  const storedMobile = localStorage.getItem('mobileNumber');
  const mobileSection = document.getElementById('mobileSection');

  if (storedMobile) {
    // Show the mobile number
    if (mobileSection) {
      mobileSection.innerHTML = `
        <p style="font-weight: 500; color: #333;">
          <i class="fa-solid fa-phone me-1"></i>
          Mobile Number: ${storedMobile}
        </p>
        <p id="editMobile" style="cursor: pointer; color: #007bff; text-decoration: underline;">
          Edit Mobile Number
        </p>
      `;
      // Allow user to edit the mobile number
      mobileSection.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'editMobile') {
          localStorage.removeItem('mobileNumber');
          window.location.href = `getnumber.html?planId=${encodeURIComponent(planId)}&price=${encodeURIComponent(planPrice)}&planTitle=${encodeURIComponent(planTitle)}`;
        }
      });
    }
  } else {
    // If no mobile stored, redirect to getnumber.html
    window.location.href = `getnumber.html?planId=${encodeURIComponent(planId)}&price=${encodeURIComponent(planPrice)}&planTitle=${encodeURIComponent(planTitle)}`;
    return; // Stop script
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Get all radio buttons and payment field divs
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const upiFields = document.getElementById("upiFields");
    const cardFields = document.getElementById("cardFields");
    const walletFields = document.getElementById("walletFields");
    const netbankingFields = document.getElementById("netbankingFields");

    // Function to show only the selected payment field
    function showPaymentFields(selectedMethod) {
        upiFields.style.display = selectedMethod === "UPI" ? "block" : "none";
        cardFields.style.display = selectedMethod === "Card" ? "block" : "none";
        walletFields.style.display = selectedMethod === "Wallet" ? "block" : "none";
        netbankingFields.style.display = selectedMethod === "NetBanking" ? "block" : "none";
    }

    // Attach event listeners to radio buttons
    paymentMethods.forEach((radio) => {
        radio.addEventListener("change", function () {
            showPaymentFields(this.value);
        });
    });

    // Set the default view based on the pre-checked radio button
    const defaultMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    showPaymentFields(defaultMethod);
});


  /***********************************************************
    2) Payment form submission logic
  ***********************************************************/
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate mobile number from localStorage
      const mobileNumber = localStorage.getItem('mobileNumber');
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

      // Simulate payment delay
      setTimeout(() => {
        // 2A) Generate a transaction ID
        const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // 2B) Call backend to record the recharge
        const requestBody = new URLSearchParams({
          planId: planId,
          amountPaid: planPrice,
          paymentMethod: paymentMethod,
          mobileNumber: mobileNumber
        });

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
          // 2C) Show success UI
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
              <button class="btn btn-pay" onclick="window.location.href='../index.html'">
                Return to Home
              </button>
            </div>
          `;

          // 2D) Now send the email (we do it after successful payment)
          fetchUserIdAndSendEmail(mobileNumber, transactionId, planId, planPrice, paymentMethod);
        })
        .catch(error => {
          console.error('Error:', error);
          alert("Payment failed, please try again.");
        });
      }, 2500);
    });
  }
});

/***********************************************************
  3) fetchUserIdAndSendEmail -> calls user phone endpoint,
     then user details endpoint, then sends email
***********************************************************/
async function fetchUserIdAndSendEmail(mobileNumber, transactionId, planId, planPrice, paymentMethod) {
  try {
    const userIdResponse = await fetch(`http://localhost:8087/api/users/phone/${mobileNumber}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        "Content-Type": "application/json"
      }
    });

    if (!userIdResponse.ok) {
      if (userIdResponse.status === 404) {
        alert("No user found for this mobile number!");
      }
      throw new Error("Error fetching user ID, status: " + userIdResponse.status);
    }

    const userData = await userIdResponse.json();
    const userId = userData.userId; // or userData.userId if your backend returns that
    if (!userId) {
      console.error("User ID not found in response:", userData);
      return;
    }

    // 3A) Fetch user email
    const email = await fetchUserEmail(userId);
    if (!email) {
      alert("Could not retrieve user email.");
      return;
    }

    // 3B) Send the email
    await sendEmailReminder(email, transactionId, mobileNumber, planId, planPrice, paymentMethod);
  } catch (error) {
    console.error("Error in fetchUserIdAndSendEmail:", error);
  }
}

/***********************************************************
  4) fetchUserEmail -> gets email from /api/users/{userId}
***********************************************************/
async function fetchUserEmail(userId) {
  try {
    const response = await fetch(`http://localhost:8087/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Error fetching user details, status: " + response.status);
    }
    const data = await response.json();
    return data.email; // must match the field returned by your backend
  } catch (error) {
    console.error("Error fetching user email:", error);
    return null;
  }
}

/***********************************************************
  5) sendEmailReminder -> calls /admin/email/send
***********************************************************/
async function sendEmailReminder(email, transactionId, mobileNumber, planId, planPrice, paymentMethod) {
  try {
    const response = await fetch("http://localhost:8087/email/send", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("adminToken"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: email,
        subject: "Payment Successful",
        body: `
          Dear User,

          Thank you for using our service. We are pleased to inform you that your payment has been processed successfully. 
          
          Below are the details of your recent transaction:

            • Transaction ID: ${transactionId}
            • Mobile Number: ${mobileNumber}
            • Plan: ${sessionStorage.getItem("planName")}
            • Price: ₹${planPrice}
            • Payment Method: ${paymentMethod}

          If you have any questions or need further assistance, please feel free to reach out to our customer support team at mobicomm.request@gmail.com. 
          We value your business and look forward to serving you again in the future.
            Sincerely,
            MobiComm Team
        `
      })
    });

    if (response.ok) {
      alert("Email confirmation sent successfully!");
    } else {
      alert("Failed to send email confirmation.");
    }
  } catch (error) {
    console.error("Error sending email reminder:", error);
    alert("Error sending email reminder.");
  }
}
