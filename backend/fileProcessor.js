const { fileLoader } = require('./utilities/fileLoader');

const alternativeDependencyList = [];

const parseOnlyValueFromString = (fullString, stringToRemove) => fullString.replace(`${stringToRemove}: `, '');

const splitAndRegexDependencies = (input, index) => {
  const dependencies = input.split(', ');
  const packageDependencies = dependencies.map((dependency) => {
    // regex magic to remove white spaces and version tags
    const depNoWhitespace = dependency.replace(/\s/g, '');
    const depNoVersiontag = depNoWhitespace.replace(/ *\([^)]*\) */g, '');

    // Save separately dependency alternatives marked by pipe character.
    if (depNoVersiontag.includes('|')) {
      const depForComparison = depNoVersiontag.split('|');
      alternativeDependencyList.push({
        index,
        Depends: depForComparison,
      });
    }
    return depNoVersiontag;
  });
  return packageDependencies;
};

const joinMultilineDescriptions = (separateLines) => {
  // Used to store the line where to start parsing
  let descriptionStartedIndex;

  // Combine multiline description in one variable
  let combinedDescriptionLine = separateLines.filter((line, index) => {
    if (line.includes('Description')) {
      descriptionStartedIndex = index;
      return true;
    }
    if (descriptionStartedIndex && line.startsWith(' ')) {
      return true;
    }
    return false;
  }).join('\n');

  // Replace unconsistent - and * usage for bullet points in description
  if (combinedDescriptionLine.includes(' - ')) {
    combinedDescriptionLine = combinedDescriptionLine.replace(' - ', '  \n* ');
  }
  if (combinedDescriptionLine.includes(' * ')) {
    combinedDescriptionLine = combinedDescriptionLine.replace(' * ', '  \n* ');
  }
  if (combinedDescriptionLine.includes('.\n')) {
    combinedDescriptionLine = combinedDescriptionLine.replace('.\n', '\n');
  }

  separateLines[descriptionStartedIndex] = combinedDescriptionLine;
  return separateLines;
};

const dataParser = (rawdata) => {
  const separatePackages = rawdata.split('\n\n');
  const packages = separatePackages.map((pkg, packageIndex) => {
    let linesOfPackage = pkg.split('\n');

    linesOfPackage = joinMultilineDescriptions(linesOfPackage);

    const keysToFind = ['Package', 'Depends', 'Description', 'DependencyFor'];

    const lineParseReducer = (objBuilder, line) => {
      const key = keysToFind.find(keyToFind => line.includes(`${keyToFind}: `));
      if (!key) return objBuilder;

      const entry = (key === 'Depends'
        ? splitAndRegexDependencies(parseOnlyValueFromString(line, key), packageIndex)
        : parseOnlyValueFromString(line, key));

      return { ...objBuilder, [key]: entry };
    };
    return linesOfPackage.reduce(lineParseReducer, {});
  });
  return packages;
};

// Find which one is found in package list and return it
const findTheRightAlternative = (alts, allPkgs) => alts.find((alt) => allPkgs.some((pkg) => pkg.Package === alt));

const alternativeDependencyComparer = (parsedPackages) => {
  const PkgsWithNoAlts = parsedPackages.map((pkg) => {
    const singlePkgNoAlt = pkg.Depends?.map((dep) => {
      if (dep.includes('|')) {
        const separatedAlts = dep.split('|');
        const correctAltDep = findTheRightAlternative(separatedAlts, parsedPackages);
        return correctAltDep;
      }
      return dep;
    });
    return { ...pkg, Depends: singlePkgNoAlt || [] };
  });
  return PkgsWithNoAlts;
};

const findReverseDependency = (pkgName, pkgs) => pkgs.reduce((array, pkg) => ((pkg.Depends.some((dep) => dep === pkgName))
  ? [...array, pkg.Package]
  : array), []);

const addReverseDependencies = (allPkgs) => {
  const pkgsWithRelationspkgs = allPkgs.map((pkgToFind) => {
    const relationsToAdd = findReverseDependency(pkgToFind.Package, allPkgs);
    return { ...pkgToFind, DependencyFor: relationsToAdd || [] };
  });
  return pkgsWithRelationspkgs;
};

const packageSorter = (pkgsToSort) => {
  const sortedPackages = [...new Set(pkgsToSort.sort((a, b) => a.Package.localeCompare(b.Package)))];
  return sortedPackages.map((pkg) => {
    const sortedDeps = [...new Set(pkg.Depends.sort((a, b) => a.localeCompare(b)))];
    return { ...pkg, Depends: sortedDeps };
  });
};

const fileProcessor = async (fileName) => {
  // Start timer
  console.time('File processing');

  // Load the dpkg-status file to memory.
  const rawdata = await fileLoader(fileName);

  // Parse and process the data.
  const parsedPackages = dataParser(rawdata);

  // Compare and sellect correct alternative i.e. gpgv | gpgv2 | gpgv1
  const dependencyCompared = alternativeDependencyComparer(parsedPackages);

  // Find reverse dependencies
  const reverseDependenciesAdded = addReverseDependencies(dependencyCompared);

  // Sort dependencies alphabetically and remove duplicates
  const finalPackages = packageSorter(reverseDependenciesAdded);

  // count amount of packages listed and stop timer
  console.log(`Finished processing ${finalPackages.length} packages.`);
  console.timeEnd('File processing');

  return finalPackages;
};

module.exports = {
  fileProcessor,
};
