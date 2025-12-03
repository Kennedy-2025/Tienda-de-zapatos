import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear la carpeta uploads si no existe
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir solicitudes desde tu frontend (Vercel)
app.use(cors({
  origin: 'https://tienda-de-zapatos-git-main-kes-projects-fbd3dadd.vercel.app'
}));

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Endpoint para subir imagen
app.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
