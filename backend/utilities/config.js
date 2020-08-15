require("dotenv").config();
const fs = require('fs')

let userPath = "./data/user-dpkg-data.txt"
let examplePath = "./data/example-dpkg-data.txt"

const checkUserFileExistance = () => {
  if (fs.existsSync(userPath)) {
    console.log("Found the user provided dpkg file")
    return true
  } else {
    console.log("No user dpkg file found, using the example file")
    return false;
  }
}

// Use user file if it's provided, else use example file. 
let FILEPATH = checkUserFileExistance() ? userPath : examplePath

let PORT = process.env.PORT || 5000;

module.exports = {
  FILEPATH,
  PORT
}