import express from "express";
import multer from "multer";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Permitir CORS para tu frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Carpeta uploads accesible públicamente
app.use("/uploads", express.static("uploads"));

// Endpoint para subir imagen
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
