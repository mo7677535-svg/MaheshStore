// DOM Elements
const productContainer = document.getElementById("productContainer");
const cartCount = document.getElementById("cartCount");
const searchBar = document.getElementById("searchBar");

// Global Variables
let allProducts = [];

// Product Loading
async function loadProducts() {
  if (!productContainer) return;
  
  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("Network response was not ok");
    allProducts = await response.json();
    displayProducts(allProducts);
    updateCartCount();
  } catch (error) {
    console.error("Error loading products:", error);
    productContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load products. Please try again later.</p>
      </div>
    `;
  }
}

// Product Display
function displayProducts(products) {
  if (!productContainer) return;
  
  productContainer.innerHTML = "";
  
  if (products.length === 0) {
    productContainer.innerHTML = `
      <div class="empty-state">
        <p>No products found matching your search.</p>
        <button onclick="displayProducts(allProducts)">Show All Products</button>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="card-content">
        <h3>${product.name}</h3>
        <p class="price">$${product.price.toFixed(2)}</p>
        <a href="product.html?id=${product.id}" class="details-btn">View Details</a>
        <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')">
          Add to Cart
        </button>
      </div>
    `;
    productContainer.appendChild(card);
  });
}

// Authentication Functions
function checkAuth(redirect = true) {
  const user = getCurrentUser();
  if (!user && redirect) {
    if (confirm("You need to login to continue. Redirect to login page?")) {
      window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
    }
    return false;
  }
  return !!user;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

// Cart Management
function addToCart(id, name, price, image) {
  if (!checkAuth()) return false;
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast(`${name} added to cart`);
  return true;
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCountElements = document.querySelectorAll("#cartCount");
  cartCountElements.forEach(el => {
    el.textContent = totalItems;
  });
}

// Search Functionality
if (searchBar) {
  let searchTimeout;
  searchBar.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const keyword = e.target.value.trim().toLowerCase();
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.desc && product.desc.toLowerCase().includes(keyword))
      );
      displayProducts(filtered);
    }, 300);
  });
}

// Auth UI Management
function updateAuthUI() {
  const user = getCurrentUser();
  const loginLink = document.getElementById('loginLink');
  const userProfile = document.getElementById('userProfile');
  
  if (user) {
    if (loginLink) loginLink.style.display = 'none';
    if (userProfile) {
      userProfile.style.display = 'flex';
      const userNameElement = document.getElementById('userName');
      if (userNameElement) userNameElement.textContent = user.username;
    }
  } else {
    if (loginLink) loginLink.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
  }
}

// Logout Function
function logout() {
  localStorage.removeItem("loggedInUser");
  updateAuthUI();
  window.location.href = "index.html";
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadProducts();
  
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});

// Toast Notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
      <span>${message}</span>
    </div>
    <i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Login/Register Functions
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const validUser = users.find(user => user.email === email && user.password === password);

  if (validUser) {
    localStorage.setItem("loggedInUser", JSON.stringify(validUser));
    updateAuthUI();
    showToast("Login successful!");
    
    // Redirect to previous page or home
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    window.location.href = redirect || "index.html";
  } else {
    showToast("Invalid credentials!", "error");
  }
}

function register() {
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!username || !email || !password) {
    showToast("All fields required!", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.find(user => user.email === email)) {
    showToast("Email already registered!", "error");
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  showToast("Registration successful!");
  
  localStorage.setItem("loggedInUser", JSON.stringify({ username, email }));
  updateAuthUI();
  window.location.href = "index.html";
}