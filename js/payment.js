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
    sessionStorage.setItem('planId', planId);
    sessionStorage.setItem('planPrice', planPrice);
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

  document.getElementById("payBtn").addEventListener("click", function () {
    // Retrieve plan price from sessionStorage
    let planPrice = sessionStorage.getItem("planPrice");
    if (!planPrice) {
      alert("Plan price not set. Please select a plan.");
      return;
    }

    // Convert price to paise
    let amountInPaise = parseInt(planPrice) * 100;

    // Call the backend to create an order
    fetch(`http://localhost:8087/api/payment/create-order?amount=${amountInPaise}`,
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("adminToken"),
          "Content-Type": "application/json"
        }
      }
    )
      .then(response => response.json())
      .then(order => {
        if (!order.id) {
          alert("Order ID not received from backend.");
          return;
        }

        var options = {
          "key": "rzp_test_7jbN2F87afR6Hf", // Razorpay Test Key
          "amount": amountInPaise,
          "currency": "INR",
          "name": "Mobicomm",
          "description": "Test Transaction",
          "order_id": order.id,
          "handler": function (response) {
            fetch(`http://localhost:8087/api/payment/payment-details/${response.razorpay_payment_id}`,
              {
                method: "GET",
                headers: {
                  "Authorization": "Bearer " + localStorage.getItem("adminToken"),
                  "Content-Type": "application/json"
                }
              }
            )
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                console.log("Payment Details:", data);
                if (data.method) {
                  console.log("Payment Method:", data.method.toUpperCase());
                  const paymentMethod = data.method.toUpperCase();
                  const mobileNumber = localStorage.getItem("mobileNumber");
                  const transactionId = response.razorpay_payment_id;
                  const planId = sessionStorage.getItem("planId");

                  fetchUserIdAndSendEmail(mobileNumber, transactionId, planId, planPrice, paymentMethod)
                } else {
                  console.warn("Payment method not found in response.");
                }
              })
              .catch(error => console.error("Error fetching payment method:", error));

          }
          ,
          "prefill": {
            "name": sessionStorage.getItem("username") || "Test User",
            "email": sessionStorage.getItem("email") || "test@example.com",
            "contact": localStorage.getItem("mobileNumber") || "9999999999"
          },
          "theme": {
            "color": "#2fa31e"
          }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Failed to create Razorpay order. Check backend logs.");
      });
  });

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: email,
        subject: "Payment Successful",
        body: `
        Thank you for using our service. We are pleased to inform you that your payment has been successfully processed.

        Payment Details:
            • Transaction ID: ${transactionId}.
            • Mobile Number: ${mobileNumber}.
            • Plan: ${sessionStorage.getItem("planName")}
            • Price: ₹${planPrice}
            • Payment Method: ${paymentMethod}
        `
      })
    });

    if (response.ok) {
      alert("Email confirmation sent successfully!");
      const requestBody = new URLSearchParams();
      requestBody.append('planId', planId);
      requestBody.append('amountPaid', planPrice);
      requestBody.append('paymentMethod', paymentMethod);
      requestBody.append('mobileNumber', mobileNumber);
      console.log("Request Body:", requestBody);

      fetch('http://localhost:8087/api/recharge-history/add', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Recharge history added:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
        alert("EMAIL CONFIRMED MAIL SENT SUCCESSFULLY!");
        window.location.href = "../index.html";
    } else {
      alert("Failed to send email confirmation.");
    }
  } catch (error) {
    console.error("Error sending email reminder:", error);
    alert("Error sending email reminder.");
  }
}
