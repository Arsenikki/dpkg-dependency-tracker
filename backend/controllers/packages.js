const packagesRouter = require('express').Router();
const multer = require('multer');
const { dataProcessor } = require('../dataProcessor');

const storageSettings = multer.diskStorage({
  destination: './storage/',
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

// Save to /storage and limit filesize to 2 Mb
const upload = multer({ dest: 'storage/', limits: { fileSize: 2000000 }, storage: storageSettings });

// Upload file to the server
packagesRouter.post('/upload', upload.single('dpkg-file'), async (req, res) => {
  const userPackages = await dataProcessor(req.file.filename);
  if (userPackages.length >= 1) {
    res.json(userPackages);
  } else {
    res.status(500).send('Failed to process uploaded file:', req.file.filename);
  }
});

// Get package data from the server
packagesRouter.get('/packages', async (req, res) => {
  const defaultPackages = await dataProcessor();
  if (defaultPackages.length >= 1) {
    res.json(defaultPackages);
  } else {
    res.status(404).send('No default packages found for unknown reason');
  }
});

packagesRouter.get('/ping', (req, res) => {
  res.send('Still alive');
});

module.exports = packagesRouter;
