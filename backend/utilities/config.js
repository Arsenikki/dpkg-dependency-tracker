const fs = require('fs');

require('dotenv').config();

const userPath = './data/user-dpkg-data.txt';
const examplePath = './data/example-dpkg-data.txt';

const checkUserFileExistance = () => {
  if (fs.existsSync(userPath)) {
    console.log('Found the user provided dpkg file');
    return true;
  }
  console.log('No user dpkg file found, using the example file');
  return false;
};

// Use user file if it's provided, else use example file.
const FILEPATH = checkUserFileExistance() ? userPath : examplePath;

const PORT = process.env.PORT || 5000;

module.exports = {
  FILEPATH,
  PORT,
};
