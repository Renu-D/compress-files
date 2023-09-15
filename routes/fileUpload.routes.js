const controller = require('./../controllers/fileUpload.controller');
const multer = require('multer'); // To handle file uploads

module.exports = (app) => {
    // Configure Multer for file uploads
    const storage = multer.memoryStorage();
    const upload = multer({storage})

    app.post('/upload', upload.single('file'), controller.uploadFile);

    app.get('/list', controller.listFiles);
    app.get('/download/:filename', controller.downloadFile);
};