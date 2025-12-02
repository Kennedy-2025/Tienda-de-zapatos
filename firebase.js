// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Config Firebase
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// Función para subir imagen y obtener URL
export async function uploadImage(file) {
  const storageRef = ref(storage, `productos/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
