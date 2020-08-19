const packagesRouter = require('express').Router();
const multer = require('multer');
const { fileProcessor } = require('../fileProcessor');

const storageSettings = multer.diskStorage({
  destination: './storage/',
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

// Save to /storage and limit filesize to 2 Mb
const upload = multer({ dest: 'storage/', limits: { fileSize: 2000000 }, storage: storageSettings });

// upload file
packagesRouter.post('/upload', upload.single('dpkg-file'), async (req, res) => {
  res.send('File upload successful');
});

// get file content
packagesRouter.get('/load/:fileName', async (req, res) => {
  const fileName = String(req.params.fileName);
  const packages = await fileProcessor(fileName);
  if (packages.length >= 1) {
    res.json(packages);
  } else {
    res.send('No packages ');
  }
});

packagesRouter.get('/ping', (req, res) => {
  res.send('Still alive');
});

module.exports = packagesRouter;
