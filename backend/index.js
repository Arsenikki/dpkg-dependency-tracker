const express = require('express')
const app = express()
const config = require("./utils/config");
const { promises: fs } = require("fs");

app.use(express.json())

let packages = [
  {
    Package: "accountsservice",
    Depends: [
        "dbus", "libaccountsservice", "libc6", "libglib2.0-0", "libpolkit-gobject-1-0"
    ],
    Description: "query and manipulate user account information",
    // isDependencyFor: [
    //    "language-selector-common"
    // ]
  },
  {
    name: "adduser",
    description: "add and remove users and groups",
    dependsOn: [
        "passwd", "debconf | debconf-2.0", "libc6" // if pipe, store the one found from names. 
    ],
  },
];

const loadFile = async (filepath) => {
    try {
        console.log("Loading data to memory from:", filepath)
        var rawdata = await fs.readFile(filepath, "utf-8")
    } catch (error) {
        console.log("data failed to load with error:", error)
    }
    return rawdata;
}

const dataParser = async (rawdata) => {
    // split data into an array of separate packages.
    let separatePackages = rawdata.split("\n\n");

    separatePackages.forEach(package => {
        let allVariables = package.split("\n")
        let valuesToParse = ["Package", "Depends", "Description"]
        let valueObject = {};

        
        valuesToParse.forEach( wv => {
            let entry = allVariables.filter( element => element.includes(wv)).flat();
            entry = entry[0]

            // Store the value of each key in an object.
            if (typeof entry !== "undefined") {
                valueObject[wv] = entry.replace(wv + ": ", "")
            }
        })

        // Add the object to the packages array.
        packages.push(valueObject);
    });
    
}

const fileProcessor = async () => {
    // Load the dpkg-status file to memory.
    let filepath = "./backend/data/dpkg-status.txt"
    let rawdata = await loadFile(filepath);

    // Parse and save the data.
    let parsedData = await dataParser(rawdata)
}
fileProcessor();

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