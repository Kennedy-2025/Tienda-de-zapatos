// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjbzxSrLjp3qgl8qaYDfQQgVX5E7DqxUs",
  authDomain: "zapateria-3d5da.firebaseapp.com",
  databaseURL: "https://zapateria-3d5da-default-rtdb.firebaseio.com",
  projectId: "zapateria-3d5da",
  storageBucket: "zapateria-3d5da.firebasestorage.app",
  messagingSenderId: "885381797478",
  appId: "1:885381797478:web:860afaaf0584275bd43fa7",
  measurementId: "G-4MP0B60M4W"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ===== VARIABLES =====
const adminPassword = "celenia2019";
let isAdmin = false;
let selectedProduct = null;
let selectedSize = null;
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ===== UTILIDADES =====
function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// ===== MODO ADMIN =====
document.getElementById("admin-btn").onclick = () => {
  const password = prompt("Contraseña admin:");
  if(password === adminPassword) {
    isAdmin = !isAdmin;
    document.getElementById("admin-section").classList.toggle("hidden");
    renderProducts();
    toast(isAdmin ? "Modo admin activado" : "Modo admin desactivado");
  } else toast("Contraseña incorrecta");
};

// ===== AGREGAR PRODUCTO =====
document.getElementById("add-form").onsubmit = async (e) => {
  e.preventDefault();
  if(!isAdmin) return toast("No autorizado");

  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const sizes = document.getElementById("sizes").value.split(",").map(s => Number(s.trim()));
  const imageFile = document.getElementById("image").files[0];
  
  if(!name || !imageFile || sizes.length === 0 || isNaN(price)) return toast("Datos inválidos");

  toast("Subiendo imagen...");

  try {
    const storageRef = ref(storage, `productos/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageURL = await getDownloadURL(storageRef);

    products.push({ name, price, sizes, image: imageURL, available: true });
    saveProducts();
    renderProducts();
    e.target.reset();
    toast("Producto agregado con éxito");
  } catch(err) {
    console.error(err);
    toast("Error subiendo la imagen");
  }
};

// ===== RENDER PRODUCTOS =====
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((p, i) => {
    const isDisabled = !p.available;
    const adminButtons = isAdmin ? `
      <button onclick="deleteProduct(${i})" style="background:#dc3545;margin-top:5px;">Eliminar</button>
      <button onclick="toggleAvailability(${i})" style="background:#ffc107;margin-top:5px;">
        ${p.available ? "Marcar como agotado" : "Volver disponible"}
      </button>
    ` : "";

    list.innerHTML += `
      <div class="product">
        <img src="${p.image}" onclick="${isDisabled ? 'toast(`Producto agotado`)' : `openSizes(${i})`}">
        <h3>${p.name} ${!p.available ? '<span style="color:red;">(Agotado)</span>' : ''}</h3>
        <p>C$${p.price.toFixed(2)}</p>
        <button ${isDisabled ? "disabled" : ""} onclick="openSizes(${i})">
          ${isDisabled ? "Agotado" : "Ver tallas"}
        </button>
        ${adminButtons}
      </div>
    `;
  });
}

// ===== FUNCIONES ADMIN =====
window.deleteProduct = (i) => {
  if(confirm("Eliminar producto?")) {
    products.splice(i, 1);
    saveProducts();
    renderProducts();
    toast("Producto eliminado");
  }
};

window.toggleAvailability = (i) => {
  products[i].available = !products[i].available;
  saveProducts();
  renderProducts();
};

// ===== MODAL TALLAS =====
function openSizes(i) {
  selectedProduct = products[i];
  if(!selectedProduct.available) return toast("Producto agotado");

  selectedSize = null;
  document.getElementById("modal-product-name").textContent = selectedProduct.name;

  const modalContent = document.querySelector("#size-modal .modal-content");
  const existingImg = modalContent.querySelector("img.large");
  if(existingImg) existingImg.remove();

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

  document.getElementById("buy-btn").disabled = true;
  document.getElementById("size-modal").classList.remove("hidden");
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll("#size-options button").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  document.getElementById("buy-btn").disabled = false;
}

// ===== CARRITO =====
document.getElementById("buy-btn").onclick = () => {
  if(!selectedSize) return;

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

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

window.openCart = () => {
  const items = document.getElementById("cart-items");
  items.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    items.innerHTML += `
      <div class="cart-item">
        <span>${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}</span>
        <button onclick="removeFromCart(${index})">Eliminar</button>
      </div>
    `;
  });

  document.getElementById("cart-total").textContent = total.toFixed(2);
  document.getElementById("cart-modal").classList.remove("hidden");
};

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  saveCart();
  updateCartCount();
  openCart();
};

window.checkout = () => {
  if(cart.length === 0) return;
  let msg = "Hola, quiero comprar:\n\n";
  cart.forEach(item => msg += `- ${item.name} (talla ${item.size}) - C$${item.price}\n`);
  const url = `https://wa.me/50583647398?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
};

// ===== CIERRE MODALES =====
document.getElementById("close-modal").onclick = () => document.getElementById("size-modal").classList.add("hidden");
document.getElementById("close-cart").onclick = () => document.getElementById("cart-modal").classList.add("hidden");

// ===== INIT =====
renderProducts();
updateCartCount();
