const { promises: fs } = require('fs');
const { defaultPath } = require('./config');

// delete file after processing, unless it's example file.
const removeFile = (path) => (path.includes('example-dpkg-data') ? null : fs.unlink(path));

const fileLoader = async (inputFile) => {
  const fileName = inputFile || 'example-dpkg-data.txt';
  const path = `${defaultPath}${fileName}`;
  try {
    console.log('Loading data to memory from:', path);
    const data = await fs.readFile(path, 'utf-8');
    removeFile(path);
    return data;
  } catch (error) {
    console.log('data failed to load with error:', error);
  }
  return undefined;
};

module.exports = {
  fileLoader,
};
