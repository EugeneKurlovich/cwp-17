const express = require('express');
const multer  = require('multer');
const uuidv4 = require('uuid/v4');
const sharp = require('sharp');


const app = express();
app.use(express.static('public'));


const pdfStorage = multer.diskStorage({
  destination: './uploads/pdf/',
  filename: function (req, file, cb) {
      cb(null, uuidv4() + ".pdf");
  }
});

const imageStorage = multer.diskStorage({
  destination: './uploads/images/',
  filename: function (req, file, cb) {
      cb(null, uuidv4() + "-master" + file.originalname.slice(-4));
  }
});

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({storage: storage});
const pdfUpload = multer({
    storage: pdfStorage,
    fileFilter: function fileFilter(req, file, cb) {
        file.originalname.toUpperCase().endsWith(".PDF") ? cb(null, true) : cb(null, false);
    }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: function fileFilter(req, file, cb) {
      file.originalname.toUpperCase().endsWith(".JPG") || file.originalname.toUpperCase().endsWith(".PNG")
          ? cb(null, true) : cb(null, false);
  }
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  res.json({ succeed: true });
});

app.post('/images', imageUpload.single('image'), async (req, res, next) => {
  let regexp = /-master\.[^\.]+$/;
  let filenames = [
      req.file.filename.replace(regexp, "-preview" + req.file.filename.slice(-4)),
      req.file.filename.replace(regexp, "-thumbnail" + req.file.filename.slice(-4)),
      req.file.filename
  ];
  await sharp('./uploads/images/' + req.file.filename).resize(800, 600).toFile('./uploads/images/' + filenames[0]);
  await sharp('./uploads/images/' + req.file.filename).resize(300, 180).toFile('./uploads/images/' + filenames[1]);
  res.json(filenames);
});

app.post('/pdf', pdfUpload.array('files', 3), (req, res, next) => {
  let files = req.files;
  res.json({files: files.map((file) => file = file.filename)});
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));