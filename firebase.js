// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
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
