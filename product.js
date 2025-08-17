const productDetail = document.getElementById("productDetail");
const cartCount = document.getElementById("cartCount");

const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get("id"));

async function loadProduct() {
  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("Network response was not ok");
    const products = await response.json();
    const product = products.find(p => p.id === productId);
    
    if (product) {
productDetail.innerHTML = `
  <div class="product-image">
    <img src="${product.image}" alt="${product.name}" loading="lazy">
  </div>
  <div class="product-info">
    <h2>${product.name}</h2>
    <div class="product-meta">
      <span class="product-id">SKU: PROD${product.id.toString().padStart(3, '0')}</span>
      <span class="product-price">$${product.price.toFixed(2)}</span>
    </div>
    
    <div class="product-description">
      <h3>Product Overview</h3>
      <p>${product.desc}</p>
    </div>
    
    ${product.features ? `
    <div class="product-features">
      <h3>Key Features</h3>
      <ul>
        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <div class="product-actions">
      <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')">
        Add to Cart
      </button>
      <span class="stock-status">In Stock | Free Shipping</span>
    </div>
  </div>
`;
    } else {
      productDetail.innerHTML = `
        <div class="error-message">
          <h2>Product Not Found</h2>
          <p>The requested product could not be found.</p>
          <a href="index.html">Back to Shop</a>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error loading product:", error);
    productDetail.innerHTML = `
      <div class="error-message">
        <h2>Error Loading Product</h2>
        <p>Please try again later.</p>
        <a href="index.html">Back to Shop</a>
      </div>
    `;
  }
}
function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  const button = document.querySelector('.product-info button');
  button.textContent = 'Added to Cart!';
  button.style.backgroundColor = 'var(--success)';
  setTimeout(() => {
    button.textContent = 'Add to Cart';
    button.style.backgroundColor = 'var(--primary)';
  }, 2000);
}
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;
}
document.addEventListener("DOMContentLoaded", () => {
  if (!productId) {
    productDetail.innerHTML = `
      <div class="error-message">
        <h2>Invalid Product</h2>
        <p>No product ID specified.</p>
        <a href="index.html">Back to Shop</a>
      </div>
    `;
  } else {
    loadProduct();
    updateCartCount();
  }
});