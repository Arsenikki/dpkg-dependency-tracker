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
    console.log("asd", e)
  }

  return (
    <>
      <Head>
        <title>dpkg package viewer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NavigationBar/>

      <div class="flex flex-row py-6 px-6 pt-20 text-lg bg-gray-800">
        <div class="p-6 w-4/12 min-w-sm max-w-md">
          {packages.map((pkg) => (
            <div key={pkg.Package} class="mb-4 bg-gray-100 rounded shadow-md text-center">
                <button onClick={() => handleSelectPkg(pkg)}
                    class="rounded font-bold truncate w-full whitespace-no-wrap hover:bg-gray-300 focus:bg-gray-400 focus:outline-none border border-gray-400">
                    {pkg.Package}
                </button>
            </div>
          ))}
        </div>

        {selectedPkg ? (
            <div class="p-6 w-full">
                <div class="w-full p-8 sticky top-6 bg-gray-100 rounded shadow-md border border-gray-400 z-0">
                    <p class="text-center text-3xl m-2 font-bold ">
                        {selectedPkg.Package}
                    </p>
                    <p class="pt-8 font-bold">Description:</p>
                    <p class="py-3 whitespace-pre-line">
                    {selectedPkg.Description}
                    </p>
                    <p class="pt-8 font-bold">Dependencies:</p>
                    {selectedPkg.Depends.map((dep) => (
                        <li key={dep.Packages}
                            onClick = {(e) => handleDependencyClick(e)} 
                            class="ml-4">
                            {dep}
                        </li>
                    ))}  
                    <p class="pt-8 font-bold">Used by:</p>
                    {selectedPkg.DependencyFor.map((dep) => (
                        <li key={dep.Packages} 
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