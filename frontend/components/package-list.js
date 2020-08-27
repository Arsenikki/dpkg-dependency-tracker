export default function PackageList({packages, handleSelectPkg}) {
  return (
    <div className="p-auto m-4 w-4/12 min-w-xs max-w-sm overflow-y-auto">
      { packages ? packages.map((pkg, index) => (
        <div key={index} className="mb-4 bg-gray-100 rounded shadow-md text-center text-lg">
          <button
            className="rounded font-bold truncate w-full whitespace-no-wrap hover:bg-gray-300 focus:bg-gray-400 focus:outline-none border border-gray-400"
            onClick={() => handleSelectPkg(pkg)}
          >
            {pkg.Package}
          </button>
        </div>
      )) : null
      }
    </div>
  );
}