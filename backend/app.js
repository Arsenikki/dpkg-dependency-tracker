const { promises: fs } = require("fs");
const config = require("./utilities/config");

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

const joinMultilineDescriptions = (properties) => {
  // Find the row where to start parsing
  let startRow = properties.findIndex(prop => prop.includes("Description:"))

  for (let i = startRow + 1 ; i < properties.length; i++) {
    if (properties[i].includes("-")) {
      properties[i] = properties[i].replace(" - ", "  \n\u2022 ");
    }

    if (properties[i].includes("*")) {
      properties[i] = properties[i].replace(" * ", "  \n\u2022 ");
    }

    if (properties[i].startsWith(" .")) {
      properties[startRow] = properties[startRow] + "\n"
    } 
    else if (properties[i].startsWith(" ")) {
      properties[startRow] = properties[startRow] + properties[i]
    } else {
      break;
    }
  }
  return properties
}


const dataParser = async (rawdata) => {
    // split data into an array of separate packages.
    let separatePackages = rawdata.split("\n\n");
    let packageIndex = 0;

    separatePackages.forEach(package => {
        let properties = package.split("\n")

        properties = joinMultilineDescriptions(properties);

        let keysToFind = ["Package", "Depends", "Description", "DependencyFor"]
        let valueObject = {};
        
        keysToFind.forEach( key => {
            let entry = properties.filter( package => package.includes(key));
            entry = entry[0]

            // Store the value of each key in an object.
            if (typeof entry !== "undefined") {
                entry = parseOnlyValueFromString(entry, key)
                
                // Special treatment for the dependencies to remove versions and
                // to find the correct alternative
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

const packageSorter = () => {
  packages = packages.sort((a,b) => a.Package.localeCompare(b.Package));
}


const fileProcessor = async () => {
    // Start timer
    console.time('File processing');

    // Load the dpkg-status file to memory.
    let filepath = config.FILEPATH
    let rawdata = await loadFile(filepath);

    // Parse and process the data.
    await dataParser(rawdata)

    // Compare stored alternative dependencies 
    await alternativeDependencyComparer()

    // Find relational dependencies
    await addRelationsToDependencies()

    // Sort dependencies alphabetically 
    await packageSorter();

    // count amount of packages listed and stop timer
    console.log(`Finished processing ${packages.length} packages.`)
    console.timeEnd('File processing');
}

module.exports = {
    fileProcessor,
    packages 
}