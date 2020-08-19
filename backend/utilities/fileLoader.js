const { promises: fs } = require('fs');
const { defaultPath } = require('./config');

const removeFile = (path) => (path.includes('example-dpkg-data') ? null : fs.unlink(path));

const fileLoader = async (fileName) => {
  const path = `${defaultPath}${fileName}.txt`;
  try {
    console.log('Loading data to memory from:', fileName);
    const data = await fs.readFile(path, 'utf-8');
    // delete file after processing, unless it's example file.
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
