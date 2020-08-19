require('dotenv').config();

const defaultPath = './storage/';
const port = process.env.PORT || 5000;

module.exports = {
  defaultPath,
  port,
};
