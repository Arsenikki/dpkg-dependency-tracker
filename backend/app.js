const { promises: fs } = require("fs");

let packages = [
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
    // filter duplicates
    return dependencies.filter((dep, index) => dependencies.indexOf(dep) === index ) 
}


const dataParser = async (rawdata) => {
    // split data into an array of separate packages.
    let separatePackages = rawdata.split("\n\n");
    let packageIndex = 0;

    separatePackages.forEach(package => {
        let allVariables = package.split("\n")

        let keysToParse = ["Package", "Depends", "Description", "DependencyFor"]
        let valueObject = {};
        
        keysToParse.forEach( key => {
            let entry = allVariables.filter( package => package.includes(key));
            entry = entry[0]

            // Store the value of each key in an object.
            if (typeof entry !== "undefined") {
                entry = parseOnlyValueFromString(entry, key)
                
                // Special treatment for the value to remove versions and extra dependencies (with pipe)
                if (key === "Depends") {
                    entry = splitAndRegexDependencies(entry, packageIndex)
                }
            }

            // Store value 
            valueObject[key] = entry || []
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
        overwriteUnnecessaryAlternatives(found.Package, i)
        break;
      }
      j++;
    }  
    i++;
  })
}

const addRelationsToDependencies = async () => {
  let index = 0
  let i = 0
  while(i < packages.length) {
    let j = 0
    while(j < packages[i].Depends?.length) {
      let k = 0
      while(k < packages.length) {
        let childPkg = packages[i].Package
        let parentPkg = packages[i].Depends[j]

        if (packages[k].Package === parentPkg) {
          packages[k].DependencyFor.push(childPkg)
        }
        k++;
      }
      j++;
    }
    i++;
  }
}

const fileProcessor = async () => {
    // Start timer
    console.time('File processing');

    // Load the dpkg-status file to memory.
    let filepath = "./data/dpkg-status.txt"
    let rawdata = await loadFile(filepath);

    // Parse and save the data.
    await dataParser(rawdata)

    // Compare stored alternative dependencies 
    await alternativeDependencyComparer()
    

    // Find relational dependencies
    await addRelationsToDependencies()

    // count amount of packages listed and stop timer
    console.log(`Proccessing of ${packages.length} packages finished.`)
    console.timeEnd('File processing');
}

module.exports = {
    fileProcessor,
    packages 
}