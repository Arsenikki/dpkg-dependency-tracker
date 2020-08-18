const { promises: fs } = require('fs');

const fileLoader = async (filepath) => {
  try {
    console.log('Loading data to memory from:', filepath);
    return await fs.readFile(filepath, 'utf-8');
  } catch (error) {
    console.log('data failed to load with error:', error);
  }
  return undefined;
};

module.exports = {
  fileLoader,
};
