import express from "express";
import multer from "multer";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Carpeta para guardar imágenes
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static("public"));

// Endpoint para subir imágenes
app.post("/upload", upload.single("imagen"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Servir imágenes subidas
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
