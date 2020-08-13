
app.use(express.json())

app.get('/api/packages', (req, res) => {
    if (packages.length >= 1) {
      res.json(packages)
    } else {
      console.log("no packages listed in the provided file!") 
      res.status(404).end()
    }
})
  
// maybe use name instead of id for search? 
app.get('/api/packages/:name', (req, res) => {
    const id = Number(req.params.id)
    const package = packages.find(package => package.id === id)
    if (package) {
        res.json(package)
    } else {
        console.log(`No package found with id: ${id}`)
        res.status(404).end()
    }
})