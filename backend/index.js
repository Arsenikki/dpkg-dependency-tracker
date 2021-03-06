const cors = require('cors');
const express = require('express');
const packagesRouter = require('./controllers/packages');
const { port } = require('./utilities/config');

const server = express();

server.use(cors({
  origin: 'http://localhost:3000',
}));
server.use('/api', packagesRouter);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
