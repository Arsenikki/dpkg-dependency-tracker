import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import Head from 'next/head'
import NavigationBar from '../components/navigation-bar';

const Home = ({packages}) => {
  const [selectedPkg, setSelectedPkg] = useState();

  const handleSelectPkg = (pkg) => {
    setSelectedPkg(pkg)
    console.info("selected package:", pkg)
  }

  const handleDependencyClick = (e) => {
      let targetpkg = packages.find(pkg => pkg.Package === e.target.textContent)
      setSelectedPkg(targetpkg)
  }

  return (
    <>
      <Head>
        <title>dpkg package viewer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NavigationBar/>

      <div class="flex flex-row py-6 px-6 pt-20 text-md bg-gray-800">
        <div class="p-6 w-4/12 min-w-sm max-w-md">
          {packages.map((pkg, index) => (
            <div key={index} class="mb-4 bg-gray-100 rounded shadow-md text-center text-lg">
                <button onClick={() => handleSelectPkg(pkg)}
                    class="rounded font-bold truncate w-full whitespace-no-wrap hover:bg-gray-300 focus:bg-gray-400 focus:outline-none border border-gray-400">
                    {pkg.Package}
                </button>
            </div>
          ))}
        </div>

        {selectedPkg ? (
            <div class="p-6 w-full">
                <div class="w-full top-6 p-8 sticky bg-gray-100 rounded shadow-md border border-gray-400 z-0">
                    <p class="text-center text-3xl font-bold ">
                        {selectedPkg.Package}
                    </p>
                    <p class="pt-8 font-bold">Description:</p>
                    <p class="py-2 whitespace-pre-line">
                    {selectedPkg.Description}
                    </p>
                    <p class="pt-2 font-bold">Dependencies:</p>
                    {selectedPkg.Depends.map((dep, index) => (
                        <li key={index}
                            onClick = {(e) => handleDependencyClick(e)} 
                            class="ml-4">
                            {dep}
                        </li>
                    ))}  
                    <p class="pt-2 font-bold">Used by:</p>
                    {selectedPkg.DependencyFor.map((dep, index) => (
                        <li key={index} 
                            onClick = {(e) => handleDependencyClick(e)}
                            class="ml-4">
                            {dep}
                        </li>
                    ))}
                </div>
            </div>
        ) : null}
        
      </div>
    </>
  )
}

// On every page load, fetch data from backend API
export async function getServerSideProps() {
  console.log("Getting packages after reload..")
  const res = await fetch(`http://localhost:5000/api/packages`)
  const packages = await res.json()

  return {
    props: {
      packages
    }
  }
}

export default Home;