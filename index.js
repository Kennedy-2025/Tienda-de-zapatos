const adminPhone = "505834867398"; 
const adminPassword = "celenia2019";

let selectedProduct = null;
let selectedSize = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];

let isAdmin = false;

function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

// Renderizar productos
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const isDisabled = !p.available;
    list.innerHTML += `
      <div class="product">
        <img src="${p.image}" onclick="${isDisabled ? 'toast('+"'Producto agotado'"+')' : 'openSizes('+i+')'}">
        <h3>${p.name} ${!p.available ? '<span style="color:red;">(Agotado)</span>' : ''}</h3>
        <p>C$${p.price.toFixed(2)}</p>
        <button ${isDisabled ? 'disabled' : ''} onclick="openSizes(${i})">${isDisabled ? 'Agotado' : 'Ver tallas'}</button>
        ${isAdmin ? `
          <button onclick="deleteProduct(${i})" style="background:#dc3545;margin-top:5px;">Eliminar</button>
          <button onclick="toggleAvailability(${i})" style="background:#ffc107;margin-top:5px;">${p.available ? 'Marcar como agotado' : 'Volver disponible'}</button>
        ` : ""}
      </div>
    `;
  });
}

renderProducts();
updateCartCount();

// Administrador: eliminar producto
function deleteProduct(index) {
  if(!isAdmin) return toast("Acción no permitida");
  if(confirm(`¿Eliminar "${products[index].name}"?`)) {
    products.splice(index, 1);
    saveProducts();
    renderProducts();
    toast("Producto eliminado");
  }
}

// Alternar disponibilidad
function toggleAvailability(index) {
  if(!isAdmin) return toast("Acción no permitida");
  products[index].available = !products[index].available;
  saveProducts();
  renderProducts();
  toast(products[index].available ? "Producto disponible" : "Producto agotado");
}

// Modal tallas
function openSizes(index) {
  selectedProduct = products[index];
  if(!selectedProduct.available) return toast("Producto agotado");
  selectedSize = null;
  document.getElementById("modal-product-name").textContent = selectedProduct.name;
  document.getElementById("buy-btn").disabled = true;

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

  document.getElementById("size-modal").classList.remove("hidden");
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll("#size-options button").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  document.getElementById("buy-btn").disabled = false;
  toast(`Talla ${size} seleccionada`);
}

// Comprar/agregar al carrito
document.getElementById("buy-btn").onclick = () => {
  if(!selectedSize) return toast("Selecciona una talla primero");
  cart.push({ name: selectedProduct.name, price: selectedProduct.price, size: selectedSize });
  saveCart();
  toast(`Talla ${selectedSize} de ${selectedProduct.name} agregada al carrito`);
  updateCartCount();
  document.getElementById("size-modal").classList.add("hidden");
};

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

// Modal carrito
function openCart() {
  const cartModal = document.getElementById("cart-modal");
  const items = document.getElementById("cart-items");
  items.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");
    div.classList.add("cart-item");

    const span = document.createElement("span");
    span.textContent = `${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}`;

    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart();
      div.remove();
      updateCartCount();
      let newTotal = cart.reduce((sum, i) => sum + i.price, 0);
      document.getElementById("cart-total").textContent = `C$${newTotal.toFixed(2)}`;
    });

    div.appendChild(span);
    div.appendChild(btn);
    items.appendChild(div);
  });

  document.getElementById("cart-total").textContent = `C$${total.toFixed(2)}`;
  cartModal.classList.remove("hidden");
}

// Checkout WhatsApp
function checkout() {
  if(cart.length === 0) return toast("El carrito está vacío");

  let msg = "Hola, quiero comprar:\n\n";
  cart.forEach(item => {
    const product = products.find(p => p.name === item.name);
    const imageUrl = product ? product.image : "";
    msg += `- ${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}\n  Ver imagen: ${imageUrl}\n\n`;
  });

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// Modales
document.getElementById("close-modal").onclick = () => document.getElementById("size-modal").classList.add("hidden");
document.getElementById("close-cart").onclick = () => document.getElementById("cart-modal").classList.add("hidden");
document.addEventListener("keydown", e => {
  if(e.key === "Escape") {
    document.getElementById("size-modal").classList.add("hidden");
    document.getElementById("cart-modal").classList.add("hidden");
  }
});

// Toast
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  setTimeout(() => { t.classList.remove("show"); t.classList.add("hidden"); }, 2500);
  t.onclick = () => { t.classList.remove("show"); t.classList.add("hidden"); };
}

// Modo administrador
document.getElementById("admin-btn").onclick = () => {
  const password = prompt("Introduce la contraseña de administrador:");
  if(password === adminPassword) {
    isAdmin = !isAdmin;
    document.getElementById("admin-section").classList.toggle("hidden");
    renderProducts();
    toast(isAdmin ? "Modo administrador activado" : "Modo administrador desactivado");
  } else {
    toast("Contraseña incorrecta");
  }
};

// Agregar producto (subida al backend)
document.getElementById("add-form").onsubmit = async (e) => {
  e.preventDefault();
  if(!isAdmin) return toast("Acción no permitida");

  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const sizes = document.getElementById("sizes").value.split(",").map(s => Number(s.trim()));

  const archivo = document.getElementById("image").files[0];

  if (!archivo || !name || sizes.length === 0 || isNaN(price)) {
    return toast("Datos inválidos");
  }

  // Subir imagen al backend
  const formData = new FormData();
  formData.append("imagen", archivo);

  const resp = await fetch("/upload", {
    method: "POST",
    body: formData
  });

  const data = await resp.json();
  if (!data.url) return toast("Error al subir imagen");

  // Guardar producto
  products.push({
    name,
    price,
    image: data.url,
    sizes,
    available: true
  });

  saveProducts();
  renderProducts();
  toast("Producto agregado!");
  e.target.reset();
};
