import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file') {
      // Verifica se é imagem ou PDF
      const isImage = file.mimetype.startsWith('image/');
      const isPDF = file.mimetype === 'application/pdf';
      if (isImage || isPDF) {
        cb(null, true);
      } else {
        cb(new Error('Apenas imagens ou PDF são permitidos'));
      }
    } else {
      cb(new Error('Campo de upload inválido'));
    }
  },
});

// Upload de avatar (imagem)
router.post('/upload/avatar', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, path: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Erro no upload do avatar' });
  }
});

// Upload de PDF médico
router.post('/upload/medical', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, path: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Erro no upload do PDF' });
  }
});

export default router;
