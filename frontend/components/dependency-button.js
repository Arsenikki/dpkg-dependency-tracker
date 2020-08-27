export default function DependencyButton({dep, handleDependencyClick}) {
  return (
    <>
      {dep.existence
        ? <button onClick={(e) => handleDependencyClick(e)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1">{dep.name}</button>
        : <falsebutton onClick={(e) => handleDependencyClick(e)} className="bg-gray-400 cursor-not-allowed text-white font-bold py-2 px-4 rounded m-1">{dep.name}</falsebutton>
      }
   </>  
  )
}