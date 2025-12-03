const adminPhone = "50583647398";
const adminPassword = "1234";
const backendUrl = "https://tu-app.cleverapps.io/upload"; // Cambia por tu backend

let selectedProduct = null;
let selectedSize = null;
let isAdmin = false;
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const isDisabled = !p.available;
    list.innerHTML += `
      <div class="product">
        <img src="${p.image}" onclick="${isDisabled ? 'toast('+"'Producto agotado'"+')' : `openSizes(${i})`}">
        <h3>${p.name} ${!p.available ? '<span style="color:red">(Agotado)</span>' : ''}</h3>
        <p>C$${p.price.toFixed(2)}</p>
        <button ${isDisabled ? "disabled" : ""} onclick="openSizes(${i})">
          ${isDisabled ? "Agotado" : "Ver tallas"}
        </button>
        ${isAdmin ? `
          <button onclick="deleteProduct(${i})" style="background:#dc3545;margin-top:5px">Eliminar</button>
          <button onclick="toggleAvailability(${i})" style="background:#ffc107;margin-top:5px">
            ${p.available ? "Marcar como agotado" : "Volver disponible"}
          </button>
        ` : ""}
      </div>
    `;
  });
}
renderProducts();
updateCartCount();

document.getElementById("admin-btn").onclick = () => {
  const password = prompt("Contraseña de administrador:");
  if (password !== adminPassword) return toast("Contraseña incorrecta");
  isAdmin = !isAdmin;
  toast(isAdmin ? "Modo administrador activado" : "Modo administrador desactivado");
  document.getElementById("admin-section").classList.toggle("hidden");
  renderProducts();
};

document.getElementById("add-form").onsubmit = async (e) => {
  e.preventDefault();
  if (!isAdmin) return toast("Acción no permitida");

  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const file = document.getElementById("image").files[0];
  const sizes = document.getElementById("sizes").value.split(",").map(s => Number(s.trim()));

  if (!name || !file || sizes.length === 0 || isNaN(price)) return toast("Datos inválidos");

  toast("Subiendo imagen...");
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(backendUrl, { method: "POST", body: formData });
    const data = await res.json();

    products.push({ name, price, sizes, image: data.url, available: true });
    saveProducts();
    renderProducts();
    e.target.reset();
    toast("Producto agregado con éxito");
  } catch (err) {
    console.error(err);
    toast("Error subiendo imagen");
  }
};

// Funciones de carrito, modales y toast (usa tu JS existente)
function updateCartCount() { document.getElementById("cart-count").textContent = cart.length; }
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
window.removeFromCart = (i) => { cart.splice(i, 1); saveCart(); openCart(); updateCartCount(); };
window.checkout = () => {
  if (cart.length === 0) return toast("El carrito está vacío");
  let msg = "Hola, quiero comprar:\n\n";
  cart.forEach(item => { msg += `- ${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}\nImagen: ${item.image}\n\n`; });
  window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, "_blank");
};
window.closeModal = (id) => document.getElementById(id).classList.add("hidden");
document.getElementById("close-modal").onclick = () => window.closeModal("size-modal");
document.getElementById("close-cart").onclick = () => window.closeModal("cart-modal");

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  setTimeout(() => { t.classList.remove("show"); t.classList.add("hidden"); }, 2500);
}

// Funciones para modales de tallas
window.openSizes = (index) => {
  selectedProduct = products[index];
  selectedSize = null;
  document.getElementById("modal-product-name").textContent = selectedProduct.name;
  const modalContent = document.querySelector("#size-modal .modal-content");
  const oldImg = modalContent.querySelector("img.large");
  if (oldImg) oldImg.remove();
  const img = document.createElement("img");
  img.src = selectedProduct.image;
  img.classList.add("large");
  modalContent.prepend(img);

  const box = document.getElementById("size-options");
  box.innerHTML = "";
  selectedProduct.sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.textContent = size;
    btn.onclick = () => selectSize(size, btn);
    box.appendChild(btn);
  });
  document.getElementById("buy-btn").disabled = true;
  document.getElementById("size-modal").classList.remove("hidden");
};
function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll("#size-options button").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  document.getElementById("buy-btn").disabled = false;
  toast(`Talla ${size} seleccionada`);
}
document.getElementById("buy-btn").onclick = () => {
  if (!selectedSize) return;
  cart.push({ name: selectedProduct.name, price: selectedProduct.price, size: selectedSize, image: selectedProduct.image });
  saveCart();
  updateCartCount();
  toast("Agregado al carrito");
  document.getElementById("size-modal").classList.add("hidden");
};

// Eliminar y toggle
window.deleteProduct = (i) => { if (!isAdmin) return toast("Acción no permitida"); if (!confirm("¿Eliminar producto?")) return; products.splice(i, 1); saveProducts(); renderProducts(); toast("Producto eliminado"); };
window.toggleAvailability = (i) => { products[i].available = !products[i].available; saveProducts(); renderProducts(); toast(products[i].available ? "Disponible" : "Agotado"); };
