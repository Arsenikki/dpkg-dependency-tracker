const dataProcessor = async (inputFile) => {
  // Start timer
  console.time('File processing');

  // Load the dpkg-status file to memory.
  const rawdata = await fileLoader(inputFile);

