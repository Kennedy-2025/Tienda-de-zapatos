const express = require("express");
const cors = require("cors");
const multer = require("multer"); // para subir archivos
const upload = multer({ dest: "uploads/" });

const app = express();

// Permitir CORS desde tu frontend
app.use(cors({
  origin: "https://tienda-de-zapatos-git-main-kes-projects-fbd3dadd.vercel.app"
}));

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió archivo" });

  // Aquí normalmente subirías a un storage real o devolverías la URL
  const fileUrl = `https://tu-backend.cleverapps.io/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor listo");
});
