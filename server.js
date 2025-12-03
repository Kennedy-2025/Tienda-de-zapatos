const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Carpeta para guardar imágenes
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configurar CORS para permitir tu frontend
app.use(cors({
  origin: "https://tienda-de-zapatos-git-main-kes-projects-fbd3dadd.vercel.app", // cambia a tu dominio
  methods: ["GET","POST"],
}));

// Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Ruta para subir imágenes
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Servir imágenes
app.use("/uploads", express.static(UPLOAD_DIR));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
