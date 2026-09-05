const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const categoriesDir = {
    avatars: path.join(uploadDir, 'avatars'),
    medicalReports: path.join(uploadDir, 'medicalReports'),
    hospitalLogo: path.join(uploadDir, 'hospitalLogo'),
    hospitalImages: path.join(uploadDir, 'hospitalImages')
};

Object.values(categoriesDir).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed!'));
    }
};

// Dynamic storage configuration based on field name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = uploadDir;
        
        if (file.fieldname === 'avatar') {
            dest = categoriesDir.avatars;
        } else if (file.fieldname === 'medicalReport') {
            dest = categoriesDir.medicalReports;
        } else if (file.fieldname === 'logo') {
            dest = categoriesDir.hospitalLogo;
        } else if (file.fieldname === 'hospitalImage') {
            dest = categoriesDir.hospitalImages;
        }
        
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
