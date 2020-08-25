const { fileLoader } = require('./utilities/fileLoader');

const parseOnlyValueFromString = (fullString, stringToRemove) => fullString.replace(`${stringToRemove}: `, '');

const splitAndRegexDependencies = (input) => {
  // Split dependency string by comma and pipe character
  const dependencies = input.split(/[|,]+/);
  const packageDependencies = dependencies.map((dependency) => {
    // Remove white spaces and version tags
    const depNoWhitespace = dependency.replace(/\s/g, '');
    return depNoWhitespace.replace(/ *\([^)]*\) */g, '');
  });
  return packageDependencies || [];
};

const joinMultilineDescriptions = (separateLines) => {
  // Used to store the line where to start parsing
  let descriptionStartedIndex;

  // Find all description lines
  const multilineDescription = separateLines.filter((line, index) => {
    if (line.includes('Description')) {
      descriptionStartedIndex = index;
      return `${line}.`;
    }
    if (descriptionStartedIndex && line.startsWith(' ')) {
      return line;
    }
    return null;
  }).join(' ');

  // Remove extra periods & whitespaces, and add newline to list items (* / -)
  const regexDescriptions = multilineDescription.replace(/ +\./g, '\n')
    .replace(/\.\.+/g, '')
    .replace(/ +\./g, '')
    .replace(/\s\s-\s/g, '\n- ')
    .replace(/\s\*\s/g, '\n- ')
    .replace(/  +/g, ' ')
    .replace(/\n \n/g, '\n');

  // Put multiline description back to original index
  separateLines[descriptionStartedIndex] = regexDescriptions;
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

const findReverseDependency = (pkgName, pkgs) => pkgs.reduce((array, pkg) => ((pkg.Depends?.some((dep) => dep === pkgName))
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
    const sortedDeps = [...new Set(pkg.Depends?.sort((a, b) => a.localeCompare(b)))];
    const sortedReverseDeps = [...new Set(pkg.DependencyFor.sort((a, b) => a.localeCompare(b)))];
    return { ...pkg, Depends: sortedDeps, DependencyFor: sortedReverseDeps };
  });
};

const dataProcessor = async (inputFile) => {
  // Start timer
  console.time('File processing');

  // Load the dpkg-status file to memory.
  const rawdata = await fileLoader(inputFile);

  // Parse and process the data.
  const parsedPackages = dataParser(rawdata);

  // Find reverse dependencies
  const reverseDependenciesAdded = addReverseDependencies(parsedPackages);

  // Sort dependencies alphabetically and remove duplicates
  const finalPackages = packageSorter(reverseDependenciesAdded);

  // count amount of packages listed and stop timer
  console.log(`Finished processing ${finalPackages.length} packages.`);
  console.timeEnd('File processing');

  return finalPackages;
};

module.exports = {
  dataProcessor,
};
