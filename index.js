// =============== CONFIGURACIÓN ===============
const adminPhone = "50583647398";
const adminPassword = "1234";

let selectedProduct = null;
let selectedSize = null;
let isAdmin = false;

// Cargar datos
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [
  { 
    name: "Zapato Deportivo", 
    price: 49.99, 
    image: "https://images.unsplash.com/photo-1596464716121-2a0c1aa02e04?auto=format&fit=crop&w=400&q=80", 
    sizes: [38,39,40,41,42], 
    available: true 
  },
  { 
    name: "Zapato Elegante", 
    price: 89.99, 
    image: "https://images.unsplash.com/photo-1606811847181-cbde7b78c74c?auto=format&fit=crop&w=400&q=80", 
    sizes: [39,40,41,42,44], 
    available: true 
  }
];

// Guardado
function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }


// =============== RENDERIZAR PRODUCTOS ===============
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((p, i) => {
    const isDisabled = !p.available;

    list.innerHTML += `
      <div class="product">
        <img src="${p.image}" onclick="${isDisabled ? 'toast(`Producto agotado`)' : `openSizes(${i})`}">
        <h3>${p.name} ${!p.available ? '<span style="color:red;">(Agotado)</span>' : ''}</h3>
        <p>C$${p.price.toFixed(2)}</p>

        <button ${isDisabled ? "disabled" : ""} onclick="openSizes(${i})">
          ${isDisabled ? "Agotado" : "Ver tallas"}
        </button>

        ${isAdmin ? `
          <button onclick="deleteProduct(${i})" style="background:#dc3545;margin-top:5px;">Eliminar</button>
          <button onclick="toggleAvailability(${i})" style="background:#ffc107;margin-top:5px;">
            ${p.available ? "Marcar como agotado" : "Volver disponible"}
          </button>
        ` : ""}
      </div>
    `;
  });
}

renderProducts();
updateCartCount();


// =============== ADMINISTRACIÓN ===============
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


// =============== AGREGAR PRODUCTO (con IMAGEN BASE64) ===============
document.getElementById("add-form").onsubmit = e => {
  e.preventDefault();
  if(!isAdmin) return toast("Acción no permitida");

  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const sizes = document.getElementById("sizes").value.split(",").map(s => Number(s.trim()));
  const imageFile = document.getElementById("image").files[0];

  if(!name || !imageFile || sizes.length === 0 || isNaN(price)) {
    return toast("Datos inválidos");
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    const base64Image = event.target.result;

    products.push({
      name,
      price,
      sizes,
      image: base64Image,
      available: true
    });

    saveProducts();
    renderProducts();
    document.getElementById("add-form").reset();
    toast("Producto agregado!");
  };

  reader.readAsDataURL(imageFile);
};


// =============== ELIMINAR / DISPONIBILIDAD ===============
function deleteProduct(index) {
  if(!isAdmin) return toast("Acción no permitida");

  if(confirm(`¿Eliminar "${products[index].name}"?`)) {
    products.splice(index, 1);
    saveProducts();
    renderProducts();
    toast("Producto eliminado");
  }
}

function toggleAvailability(index) {
  if(!isAdmin) return toast("Acción no permitida");

  products[index].available = !products[index].available;
  saveProducts();
  renderProducts();
  toast(products[index].available ? "Producto disponible" : "Producto agotado");
}


// =============== MODAL DE TALLAS ===============
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

document.getElementById("buy-btn").onclick = () => {
  if(!selectedSize) return toast("Selecciona una talla");

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


// =============== CARRITO ===============
function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

function openCart() {
  const cartModal = document.getElementById("cart-modal");
  const items = document.getElementById("cart-items");
  items.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <span>${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}</span>
      <button onclick="removeFromCart(${index})">Eliminar</button>
    `;

    items.appendChild(div);
  });

  document.getElementById("cart-total").textContent = `C$${total.toFixed(2)}`;
  cartModal.classList.remove("hidden");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  openCart();
}


// =============== WHATSAPP ===============
function checkout() {
  if(cart.length === 0) return toast("El carrito está vacío");

  let msg = "Hola, quiero comprar:\n\n";

  cart.forEach(item => {
    msg += `- ${item.name} (talla ${item.size}) - C$${item.price}\n`;
  });

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}


// =============== MODALES ===============
document.getElementById("close-modal").onclick = () =>
  document.getElementById("size-modal").classList.add("hidden");

document.getElementById("close-cart").onclick = () =>
  document.getElementById("cart-modal").classList.add("hidden");

document.addEventListener("keydown", e => {
  if(e.key === "Escape") {
    document.getElementById("size-modal").classList.add("hidden");
    document.getElementById("cart-modal").classList.add("hidden");
  }
});


// =============== TOAST ===============
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  setTimeout(() => { t.classList.remove("show"); t.classList.add("hidden"); }, 2500);
}
