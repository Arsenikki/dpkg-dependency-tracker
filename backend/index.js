const cors = require('cors')
const packagesRouter = require("./controllers/packages");
const express = require("express");
const config = require("./utilities/config");
const { fileProcessor} = require('./app');

// Initialize the file processing
fileProcessor()

const server = express();

server.use(cors())
server.use("/api/packages", packagesRouter);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})