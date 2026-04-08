import multer from 'multer';
import path from 'path';

// Configuramos donde se guardan los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/comprobantes/'); // Asegúrate de que esta carpeta exista
  },
  filename: (req, file, cb) => {
    // Le ponemos un nombre único: comprobante-IDPEDIDO-FECHA.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comprobante-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para que solo aceptemos imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

export const uploadComprobante = multer({ storage, fileFilter });
