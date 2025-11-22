import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));
app.use("/imagenes", express.static(path.join(__dirname, "imagenes")));

// Configuración de subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "imagenes/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Endpoint para subir imágenes
app.post("/upload", upload.single("imagen"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió imagen" });
  const url = "/imagenes/" + req.file.filename;
  res.json({ url });
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
