const packagesRouter = require('express').Router();
const { packages } = require('../app');

packagesRouter.get('/', (req, res) => {
  if (packages.length >= 1) {
    console.log('here you go, take some packages');
    res.json(packages);
  } else {
    console.log('no packages listed in the provided file!');
    res.status(404).end();
  }
});

// maybe use name instead of id for search?
packagesRouter.get('/:name', (req, res) => {
  const id = Number(req.params.id);
  const pkgs = packages.find((pkg) => pkg.id === id);
  if (pkgs) {
    res.json(pkgs);
  } else {
    console.log(`No package found with id: ${id}`);
    res.status(404).end();
  }
});

module.exports = packagesRouter;
