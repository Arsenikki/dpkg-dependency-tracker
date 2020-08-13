const packagesRouter = require("./controllers/packages");
const express = require("express");
const config = require("./utilities/config");
const { fileProcessor} = require('./app');

fileProcessor()
const server = express();

server.use("/api/packages", packagesRouter);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})