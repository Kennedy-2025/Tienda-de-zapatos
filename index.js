// ===== Configuración =====
const adminPhone = "50583647398";
const adminPassword = "1234";
let isAdmin = false;
let selectedProduct = null;
let selectedSize = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [
  { name: "Zapato Deportivo", price: 49.99, image: "https://images.unsplash.com/photo-1596464716121-2a0c1aa02e04?auto=format&fit=crop&w=400&q=80", sizes: [38,39,40,41,42], available: true },
  { name: "Zapato Elegante", price: 89.99, image: "https://images.unsplash.com/photo-1606811847181-cbde7b78c74c?auto=format&fit=crop&w=400&q=80", sizes: [39,40,41,42,44], available: true }
];

// ===== Guardar datos =====
function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

// ===== Toast =====
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  setTimeout(() => { t.classList.remove("show"); t.classList.add("hidden"); }, 2500);
  t.onclick = () => { t.classList.remove("show"); t.classList.add("hidden"); };
}

// ===== Render productos =====
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const isDisabled = !p.available;
    list.innerHTML += `
      <div class="product">
        <img src="${p.image}" onclick="${isDisabled ? 'toast(\'Producto agotado\')' : 'openSizes('+i+')'}">
        <h3>${p.name} ${!p.available ? '<span style="color:red;">(Agotado)</span>' : ''}</h3>
        <p>C$${p.price.toFixed(2)}</p>
        <button ${isDisabled ? 'disabled' : ''} onclick="openSizes(${i})">${isDisabled ? 'Agotado' : 'Ver tallas'}</button>
        ${isAdmin ? `<button onclick="deleteProduct(${i})">Eliminar</button>
                     <button onclick="toggleAvailability(${i})">${p.available ? 'Marcar Agotado' : 'Marcar Disponible'}</button>` : ''}
      </div>`;
  });
  updateCartCount();
}

// ===== Carrito =====
function updateCartCount() { document.getElementById("cart-count").textContent = cart.length; }

function openCart() {
  const cartModal = document.getElementById("cart-modal");
  const items = document.getElementById("cart-items");
  items.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<span>${item.name} (talla ${item.size}) - C$${item.price.toFixed(2)}</span>`;
    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.onclick = () => { cart.splice(index, 1); saveCart(); renderProducts(); openCart(); };
    div.appendChild(btn);
    items.appendChild(div);
  });
  document.getElementById("cart-total").textContent = `C$${total.toFixed(2)}`;
  cartModal.classList.remove("hidden");
}

// ===== Checkout WhatsApp =====
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

// ===== Modales tallas =====
function openSizes(index) {
  selectedProduct = products[index];
  if(!selectedProduct.available) return toast("Producto agotado");
  selectedSize = null;
  const modal = document.getElementById("size-modal");
  modal.classList.remove("hidden");

  const sizeBox = document.getElementById("size-options");
  sizeBox.innerHTML = "";
  selectedProduct.sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.textContent = size;
    btn.onclick = () => {
      selectedSize = size;
      Array.from(sizeBox.children).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("buy-btn").disabled = false;
      toast(`Talla ${size} seleccionada`);
    };
    sizeBox.appendChild(btn);
  });

  document.getElementById("buy-btn").onclick = () => {
    if(!selectedSize) return toast("Selecciona una talla primero");
    cart.push({ name: selectedProduct.name, price: selectedProduct.price, size: selectedSize });
    saveCart();
    updateCartCount();
    toast(`Talla ${selectedSize} de ${selectedProduct.name} agregada al carrito`);
    modal.classList.add("hidden");
  };
}

// ===== Eliminar / Agotado =====
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

// ===== Admin =====
document.getElementById("admin-btn").onclick = () => {
  const password = prompt("Introduce la contraseña de administrador:");
  if(password === adminPassword){
    isAdmin = !isAdmin;
    document.getElementById("admin-section").classList.toggle("hidden");
    renderProducts();
    toast(isAdmin ? "Modo administrador activado" : "Modo administrador desactivado");
  } else toast("Contraseña incorrecta");
};

// ===== Subida de imagen y agregar producto =====
async function uploadImage(file){
  const formData = new FormData();
  formData.append("imagen", file);
  const res = await fetch("/upload", { method:"POST", body: formData });
  const data = await res.json();
  return data.url;
}

document.getElementById("add-form").onsubmit = async e => {
  e.preventDefault();
  if(!isAdmin) return toast("Acción no permitida");

  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const file = document.getElementById("image-file").files[0];
  const sizes = document.getElementById("sizes").value.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
  if(!name || !file || sizes.length === 0 || isNaN(price)) return toast("Datos inválidos");

  const imageUrl = await uploadImage(file);
  products.push({ name, price, image: imageUrl, sizes, available:true });
  saveProducts();
  renderProducts();
  toast("Producto agregado");
  e.target.reset();
};

// ===== Cerrar modales =====
document.getElementById("close-modal").onclick = () => document.getElementById("size-modal").classList.add("hidden");
document.getElementById("close-cart").onclick = () => document.getElementById("cart-modal").classList.add("hidden");
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){
    document.getElementById("size-modal").classList.add("hidden");
    document.getElementById("cart-modal").classList.add("hidden");
  }
});

// ===== Inicial =====
renderProducts();
updateCartCount();
