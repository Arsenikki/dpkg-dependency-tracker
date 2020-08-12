const express = require('express')
const app = express()
const config = require("./utils/config");
const { promises: fs } = require("fs");

app.use(express.json())

let packages = [
  {
    id: 1,
    name: "accountsservice",
    description: "query and manipulate user account information",
    dependsOn: [
        "dbus", "libaccountsservice", "libc6", "libglib2.0-0", "libpolkit-gobject-1-0"
    ],
    isDependencyFor: [
        "language-selector-common"
    ]
  },
  {
    id: 2,
    name: "adduser",
    description: "add and remove users and groups",
    dependsOn: [
        "passwd", "debconf | debconf-2.0", "libc6" // if pipe, store the one found from names. 
    ],
    isDependencyFor: [
        "language-selector-common"
    ]
  },
]

const loadData = async () => {
    try {
        const data = await fs.readFile("dpkg-status.txt", "utf-8");
        console.log("data", data)
    } catch (error) {
        console.log("data failed to load with error:", error)
    }
    
}

loadData();

app.get('/api/data', (req, res) => {
    if (data) {
      res.json(data)
    } else {
      console.log("no packages listed in the provided file!") 
      res.status(404).end()
    }
})

app.get('/api/packages', (req, res) => {
  if (packages.length >= 1) {
    res.json(packages)
  } else {
    console.log("no packages listed in the provided file!") 
    res.status(404).end()
  }
})

app.get('/api/packages', (req, res) => {
  if (packages.length >= 1) {
    res.json(packages)
  } else {
    console.log("no packages listed in the provided file!") 
    res.status(404).end()
  }
})

// maybe use name instead of id for search? 
app.get('/api/packages/:id', (req, res) => {
  const id = Number(req.params.id)
  const package = packages.find(package => package.id === id)
  if (package) {
    res.json(package)
  } else {
    console.log(`No package found with id: ${id}`)
    res.status(404).end()
  }
})

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})