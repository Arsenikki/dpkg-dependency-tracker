import DependencyButton from './dependency-button';

export default function PackageCard({selectedPkg, handleDependencyClick}) {
  return (
      <div className="p-auto m-4 w-full">
      <div className="w-full h-auto max-h-full top-6 p-8 bg-gray-100 rounded shadow-md border border-gray-400 z-0 overflow-y-auto">
        <p className="text-center text-3xl font-bold ">
          {selectedPkg.Package}
        </p>
        <p className="pt-8 font-bold">Description:</p>
        <p className="py-2 whitespace-pre-line">
          {selectedPkg.Description}
        </p>
        <p className="pt-2 font-bold">Dependencies:</p>
        <div className="flex flex-row flex-wrap">
          {selectedPkg.Depends.map((dep, index) => (
            <DependencyButton key={index} dep={dep} handleDependencyClick={handleDependencyClick}/>
          ))}
        </div>
        <p className="pt-2 font-bold">Used by:</p>
        <div className="flex flex-row flex-wrap">
          {selectedPkg.DependencyFor.map((dep, index) => (
            <DependencyButton key={index} dep={dep} handleDependencyClick={handleDependencyClick}/>
          ))}
        </div>
      </div>
    </div>
  );
}