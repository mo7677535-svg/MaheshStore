const cartContainer = document.getElementById("cartContainer");
const totalPrice = document.getElementById("totalPrice");
const buyBtn = document.getElementById("buyBtn");
const purchaseForm = document.getElementById("purchaseForm");
const formName = document.getElementById("formName");
const formEmail = document.getElementById("formEmail");
const formMessage = document.getElementById("formMessage");

function loadCart() {
  if (!checkAuth()) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a href="index.html" class="btn-primary">Continue Shopping</a>
      </div>
    `;
    totalPrice.textContent = "0.00";
    buyBtn.style.display = "none";
    updateCartCount();
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="item-info">
        <h4>${item.name}</h4>
        <p class="item-price">$${item.price.toFixed(2)}</p>
        <div class="item-qty">
          <button onclick="updateQty(${item.id}, ${item.qty - 1})">-</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartContainer.appendChild(itemElement);
  });

  totalPrice.textContent = total.toFixed(2);
  buyBtn.style.display = "block";
  updateCartCount();
}

function updateQty(id, newQty) {
  if (!checkAuth()) return;
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find(item => item.id === id);
  
  if (item) {
    if (newQty <= 0) {
      removeItem(id);
    } else {
      item.qty = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    }
  }
}

function removeItem(id) {
  if (!checkAuth()) return;
  
  if (confirm("Are you sure you want to remove this item from your cart?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    showToast("Item removed from cart");
  }
}

function generatePurchaseMessage(cart) {
  let message = "Order Details:\n\n";
  cart.forEach(item => {
    message += `- ${item.name} (Qty: ${item.qty}) - $${(item.price * item.qty).toFixed(2)}\n`;
  });
  message += `\nTotal: $${totalPrice.textContent}`;
  return message;
}

buyBtn.addEventListener("click", async () => {
  if (!checkAuth()) return;
  
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return;
  
  const total = parseFloat(totalPrice.textContent);
  const user = getCurrentUser();
  
  if (confirm(`Proceed with your $${total.toFixed(2)} purchase?`)) {
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('access_key', '29bcb086-cead-4d81-855a-1aea55898b52');
      formData.append('name', user.name || user.email.split('@')[0]);
      formData.append('email', user.email);
      formData.append('message', generatePurchaseMessage(cart));
      
      // Send the data using Fetch API
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem("cart");
        cartContainer.innerHTML = `
          <div class="order-confirmation">
            <div class="confirmation-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Thank you for your order!</h2>
            <p>Your order total was $${total.toFixed(2)}.</p>
            <a href="index.html" class="btn-primary">Continue Shopping</a>
          </div>
        `;
        document.querySelector(".cart-summary").style.display = "none";
        updateCartCount();
        showToast("Order placed successfully!");
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("Order placed but email confirmation failed. Please contact support.");
      
      localStorage.removeItem("cart");
      cartContainer.innerHTML = `
        <div class="order-confirmation">
          <div class="confirmation-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Thank you for your order!</h2>
          <p>Your order total was $${total.toFixed(2)}.</p>
          <p class="error-note">(Email confirmation failed but your order was processed)</p>
          <a href="index.html" class="btn-primary">Continue Shopping</a>
        </div>
      `;
      document.querySelector(".cart-summary").style.display = "none";
      updateCartCount();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) {
    cartContainer.innerHTML = `
      <div class="auth-required">
        <div class="auth-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h2>Authentication Required</h2>
        <p>Please login to view your cart</p>
        <a href="login.html?redirect=cart.html" class="btn-primary">Login Now</a>
      </div>
    `;
    document.querySelector(".cart-summary").style.display = "none";
  } else {
    loadCart();
  }
});