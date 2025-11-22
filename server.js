import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static("public"));
app.use("/imagenes", express.static("imagenes"));
app.use(express.json());

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imagenes/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Endpoint para subir imágenes
app.post("/upload", upload.single("imagen"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se envió ninguna imagen" });

  const ruta = "/imagenes/" + req.file.filename;
  res.json({ url: ruta });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log("Servidor funcionando en puerto " + PORT);
});
