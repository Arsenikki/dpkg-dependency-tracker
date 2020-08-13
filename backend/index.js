const express = require('express')
const app = express()
const config = require("./utils/config");
const { promises: fs } = require("fs");

app.use(express.json())

let packages = [
  // {
  //   Package: "accountsservice",
  //   Depends: [
  //       "dbus", "libaccountsservice", "libc6", "libglib2.0-0", "libpolkit-gobject-1-0"
  //   ],
  //   Description: "query and manipulate user account information",
  //   // isDependencyFor: [
  //   //    "language-selector-common"
  //   // ]
  // },
  // {
  //   Package: "adduser",
  //   Depends: [
  //       "passwd", "debconf | debconf-2.0", "libc6" // if pipe, store the one found from names. 
  //   ],
  //   Description: "add and remove users and groups",
  // },
];

let alternativeDependencyList = [];

const loadFile = async (filepath) => {
    try {
        console.log("Loading data to memory from:", filepath)
        var rawdata = fs.readFile(filepath, "utf-8")
    } catch (error) {
        console.log("data failed to load with error:", error)
    }
    return rawdata;
}

const parseOnlyValueFromString = (fullString, stringToRemove) => {
    return fullString.replace(stringToRemove + ": ", "")
}



const splitAndRegexDependencies = (input, index) => {
    input = input.split(", ")
    let dependencies = input.map(dependency => {
        // regex magic to remove the version tag.
        dependency = dependency.replace(/ *\([^)]*\) */g, "");

        // Save separately dependency alternatives marked by pipe character.
        if (dependency.includes("|")) {
          depForComparison = dependency.split("|").map(dep => dep.trim());
          alternativeDependencyList.push({
            "index": index,
            "Depends" : depForComparison
          })
        }
        return dependency;
    }) 
    return dependencies
}


const dataParser = async (rawdata) => {
    // split data into an array of separate packages.
    let separatePackages = rawdata.split("\n\n");
    let packageIndex = 0;

    separatePackages.forEach(package => {
        let allVariables = package.split("\n")
        let keysToParse = ["Package", "Depends", "Description"]
        let valueObject = {};

        console.log("currently processing: ", allVariables[0])
        
        keysToParse.forEach( wantedKey => {
            let entry = allVariables.filter( package => package.includes(wantedKey));
            entry = entry[0]

            // Store the value of each key in an object.
            if (typeof entry !== "undefined") {
                entry = parseOnlyValueFromString(entry, wantedKey)
                
                // Special treatment for the value to remove versions and extra dependencies (with pipe)
                if (wantedKey === "Depends") {
                    entry = splitAndRegexDependencies(entry, packageIndex)
                }
            }

            // Store value 
            valueObject[wantedKey] = entry
        })

        // Add the object to the packages array.
        packages.push(valueObject) || null;
        packageIndex++;
    });
    
}

overwriteUnnecessaryAlternatives = async (packageName, packageIndex) => {
  let depIndex = packages[packageIndex]?.Depends?.findIndex(dep => dep?.includes(packageName))
  if (depIndex !== -1 && typeof depIndex !== "undefined") {
    packages[packageIndex].Depends[depIndex] = packageName
  }
};

const alternativeDependencyComparer = async () => {
  let i = 0
  // Compare similar alternatives together i.e. gpgv | gpgv2 | gpgv1
  alternativeDependencyList.forEach( alternatives => {
    let j = 0
    // Select the alternative, which is already listed as a package.
    // Use while loop to be able to exit early
    while(alternatives.Depends[j]) {
      let found = packages.find(package => package.Package === alternatives.Depends[j])
      if(typeof found !== "undefined") {
        console.log("selected package:", found.Package, "from multiple alternatives")
        overwriteUnnecessaryAlternatives(found.Package, i)
        break;
      }
      j++;
    }  
    i++;
  })
}

const fileProcessor = async () => {
    // Load the dpkg-status file to memory.
    let filepath = "./backend/data/dpkg-status.txt"
    let rawdata = await loadFile(filepath);

    // Parse and save the data.
    await dataParser(rawdata)

    // Compare stored alternative dependencies 
    await alternativeDependencyComparer()
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