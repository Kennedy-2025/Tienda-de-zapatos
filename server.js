const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS =====
app.use(cors({
  origin: "https://tu-dominio-vercel.vercel.app" // Cambia por tu dominio
}));

// ===== Carpeta de uploads =====
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// ===== Multer =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// ===== Rutas =====
// Subir imagen
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Servir imágenes
app.use("/uploads", express.static(uploadFolder));

// Test simple
app.get("/", (req, res) => res.send("Servidor backend funcionando"));

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
