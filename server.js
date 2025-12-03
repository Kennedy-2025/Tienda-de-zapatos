// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- CORS ----
app.use(cors({
  origin: "https://tienda-de-zapatos-git-main-kes-projects-fbd3dadd.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());

// ---- Carpeta de uploads ----
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ---- Configuración multer ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ---- Servir imágenes ----
app.use("/uploads", express.static(UPLOADS_DIR));

// ---- Endpoint de subida ----
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

// ---- Rutas de prueba ----
app.get("/", (req, res) => res.send("Servidor activo 🚀"));

// ---- Iniciar servidor ----
app.listen(PORT, () => console.log(`Servidor corriendo en https://localhost:${PORT}`));
