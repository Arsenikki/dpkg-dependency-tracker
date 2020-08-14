import fetch from 'isomorphic-unfetch'
import Head from 'next/head'
import { useState } from 'react'

const Home = ({packages}) => {
  const [selectedPkg, setSelectedPkg] = useState();

  const handleSelectPkg = (e, pkg) => {
    setSelectedPkg(pkg)
    console.info("selected package:", pkg)
  }

  return (
    <>
      <Head>
        <title>dpkg package viewer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div class="flex flex-row p-4 text-lg">
        <div class="p-2 w-4/12 min-w-sm max-w-md">
          {packages.map((pkg) => (
            <div class="mb-4 bg-gray-100 rounded shadow-md text-center">
              <button onClick={e => handleSelectPkg(e, pkg)} class="w-full rounded hover:bg-gray-300 focus:outline-none focus:bg-gray-400 focus:outline-none border border-gray-400">
                {pkg.Package}
              </button>
            </div>
          ))}
        </div>

        {selectedPkg ? (
          <div class="p-2">
            <div class="w-3/6 p-4 mx-4 fixed bg-gray-100 rounded shadow-md border border-gray-400">
              <p class="text-center text-3xl mx-4 p-4 font-bold ">
                {selectedPkg.Package}
              </p>
              <p class="pt-8 font-bold">Description:</p>
              <p class="py-3">
              {selectedPkg.Description}
              </p>
              <p class="pt-8 font-bold">Dependencies:</p>
              {selectedPkg.Depends.map((dep) => (
                <li class="ml-4">{dep}</li>
              ))}  
              <p class="pt-8 font-bold">Used by:</p>
              {selectedPkg.DependencyFor.map((dep) => (
                <li class="ml-4">{dep}</li>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
// This function gets called at build time
export async function getStaticProps() {
  // Call backend API to get packages
  const res = await fetch(`http://localhost:5000/api/packages`)
  const packages = await res.json()

  return {
    props: {
        packages
    }
      
  }
}

export default Home;