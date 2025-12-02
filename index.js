// index.js
import { storage, uploadImage } from "./firebase.js";

// Admin
const adminPassword = "1234";
let isAdmin = false;

// Productos y carrito
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

let selectedProduct = null;
let selectedSize = null;

// Render inicial
renderProducts();
updateCartCount();

// ======= ADMIN LOGIN =======
document.getElementById("admin-btn").onclick = () => {
  const password = prompt("Contraseña admin:");
  if (password === adminPassword) {
    isAdmin = !isAdmin;
    document.getElementById("admin-section").classList.toggle("hidden");
    renderProducts();
    toast(isAdmin ? "Modo admin activado" : "Modo admin desactivado");
  } else toast("Contraseña incorrecta");
};

// ======= AGREGAR PRODUCTO =======
document.getElementById("add-form").onsubmit = async (e) => {
  e.preventDefault();
  if (!isAdmin) return toast("No autorizado");

  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const sizes = document.getElementById("sizes").value.split(",").map(s => Number(s.trim()));
  const imageFile = document.getElementById("image").files[0];

  if (!name || !imageFile || sizes.length === 0 || isNaN(price)) {
    return toast("Datos inválidos");
  }

  toast("Subiendo imagen...");

  try {
    const imageURL = await uploadImage(imageFile);

    products.push({
      name,
      price,
      sizes,
      image: imageURL,
      available: true
    });

    saveProducts();
    renderProducts();
    document.getElementById("add-form").reset();
    toast("Producto agregado con éxito");

  } catch (err) {
    console.error(err);
    toast("Error subiendo la imagen");
  }
};

// ======= RENDER PRODUCTOS =======
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = `product ${!p.available ? 'out-of-stock' : ''}`;

    const img = document.createElement("img");
    img.src = p.image;
    img.style.cursor = "pointer";
    img.addEventListener("click", () => !p.available ? toast("Producto agotado") : openSizes(i));

    const h3 = document.createElement("h3");
    h3.innerHTML = `${p.name} ${!p.available ? '<span style="color:red;">(Agotado)</span>' : ''}`;

    const btn = document.createElement("button");
    btn.textContent = !p.available ? "Agotado" : "Ver tallas";
    btn.disabled = !p.available;
    if (p.available) btn.addEventListener("click", () => openSizes(i));

    div.appendChild(img);
    div.appendChild(h3);
    div.appendChild(btn);

    // Admin buttons
    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Eliminar";
      delBtn.style.background = "#dc3545";
      delBtn.addEventListener("click", () => deleteProduct(i));

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = p.available ? "Marcar como agotado" : "Volver disponible";
      toggleBtn.style.background = "#ffc107";
      toggleBtn.addEventListener("click", () => toggleAvailability(i));

      div.appendChild(delBtn);
      div.appendChild(toggleBtn);
    }

    list.appendChild(div);
  });
}

// ======= MODAL TALLAS =======
function openSizes(index) {
  selectedProduct = products[index];
  if (!selectedProduct.available) return toast("Producto agotado");

  selectedSize = null;
  document.getElementById("modal-product-name").textContent = selectedProduct.name;
  document.getElementById("buy-btn").disabled = true;

  const modalContent = document.querySelector("#size-modal .modal-content");
  const existingImg = modalContent.querySelector("img.large");
  if (existingImg) existingImg.remove();

  const img = document.createElement("img");
  img.src = selectedProduct.image;
  img.classList.add("large");
  modalContent.prepend(img);

  const sizeBox = document.getElementById("size-options");
  sizeBox.innerHTML = "";

  selectedProduct.sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.textContent = size;
    btn.onclick = () => selectSize(size, btn);
    sizeBox.appendChild(btn);
  });

  document.getElementById("size-modal").classList.remove("hidden");
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll("#size-options button").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  document.getElementById("buy-btn").disabled = false;
}

document.getElementById("buy-btn").onclick = () => {
  if (!selectedSize) return;

  cart.push({
    name: selectedProduct.name,
    price: selectedProduct.price,
    size: selectedSize,
    image: selectedProduct.image
  });

  saveCart();
  updateCartCount();
  toast("Agregado al carrito");
  document.getElementById("size-modal").classList.add("hidden");
};

// ======= CARRITO =======
function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

document.getElementById("cart").onclick = openCart;

function openCart() {
  const items = document.getElementById("cart-items");
  items.innerHTML = "";

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}</span>
    `;
    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.onclick = () => removeFromCart(index);
    div.appendChild(btn);
    items.appendChild(div);
  });

  document.getElementById("cart-total").textContent = total.toFixed(2);
  document.getElementById("cart-modal").classList.remove("hidden");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  openCart();
}

function checkout() {
  if (cart.length === 0) return;
  let msg = "Hola, quiero comprar:\n\n";
  cart.forEach(item => {
    msg += `- ${item.name} (talla ${item.size}) - C$${item.price}\n`;
  });
  const url = `https://wa.me/5053993383?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ======= MODALES =======
document.getElementById("close-modal").onclick = () =>
  document.getElementById("size-modal").classList.add("hidden");

document.getElementById("close-cart").onclick = () =>
  document.getElementById("cart-modal").classList.add("hidden");

// ======= ADMIN FUNCIONES =======
function deleteProduct(i) {
  products.splice(i, 1);
  saveProducts();
  renderProducts();
  toast("Producto eliminado");
}

function toggleAvailability(i) {
  products[i].available = !products[i].available;
  saveProducts();
  renderProducts();
}

// ======= TOAST =======
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
