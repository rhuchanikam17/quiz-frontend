const multer = require('multer');

// We'll store the file in memory as a buffer, so we can parse it
// without saving it to disk first.
const storage = multer.memoryStorage();

// File filter to only accept .docx files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.originalname.endsWith('.docx')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .docx files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
}).single('questionsFile'); // 'questionsFile' must match the FormData key from the frontend

module.exports = upload;
