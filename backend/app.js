const { fileLoader } = require('./utilities/fileLoader');
const { filePath } = require('./utilities/config');

const alternativeDependencyList = [];

const parseOnlyValueFromString = (fullString, stringToRemove) => fullString.replace(`${stringToRemove}: `, '');

const splitAndRegexDependencies = (input, index) => {
  // Split dependencies by ","
  const dependencies = input.split(', ');
  let packageDependencies = dependencies.map((dependency) => {
    // regex magic to remove white spaces
    const depNoWhitespace = dependency.replace(/\s/g, '');

    // some more to remove version tags
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
  // filter duplicate package dependencies
  const filteredPackages = (packageDependencies = packageDependencies.filter(
    (dep, idx) => packageDependencies.indexOf(dep) === idx,
  ));
  return filteredPackages;
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
  // split data into an array of separate packages.
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
  console.log({ packages });
  return packages;
};

const findTheRightAlternative = (alts, allPkgs) => alts.find((alt) => allPkgs.some((pkg) => pkg.Package === alt));

const alternativeDependencyComparer = (parsedPackages) => {
  // Compare similar alternatives together i.e. gpgv | gpgv2 | gpgv1
  const PkgsWithNoAlts = parsedPackages.map((pkg) => {
    const singlePkgNoAlt = pkg.Depends?.map((dep) => {
      if (dep.includes('|')) {
        const separatedAlts = dep.split('|');
        // Find which one is found in package list and return it
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

const packageSorter = () => {
  packages = [...new Set(packages.sort((a, b) => a.Package.localeCompare(b.Package)))];
  packages.Depends = [...new Set(packages?.Depends.sort((a, b) => a.localeCompare(b)) || [])];
  packages.DependencyFor = [...new Set(packages?.DependencyFor.sort((a, b) => a.localeCompare(b)) || [])];
};

const fileProcessor = async () => {
  // Start timer
  console.time('File processing');

  // Load the dpkg-status file to memory.
  const rawdata = await fileLoader(filePath);

  // Parse and process the data.
  const parsedPackages = dataParser(rawdata);

  // Compare stored alternative dependencies
  const dependencyCompared = alternativeDependencyComparer(parsedPackages);

  // Find reverse dependencies
  const reverseDependencies = addRelationsToDependencies();

  // Sort dependencies alphabetically and remove duplicates
  const finalPackages = packageSorter(reverseDependencies);

  // count amount of packages listed and stop timer
  console.log(`Finished processing ${finalPackages.length} packages.`);
  console.timeEnd('File processing');

  return finalPackages;
};

module.exports = {
  fileProcessor,
};
