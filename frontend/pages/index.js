import NavigationBar from '../components/navigation-bar';
import Alert from '../components/alert';
import { useState } from 'react';
import fetch from 'isomorphic-unfetch';
import Head from 'next/head';

export default function Index({defaultPackages}) {
    const [selectedPkg, setSelectedPkg] = useState(defaultPackages[0]);
    const [packages, setPackages] = useState(defaultPackages);
    const [currentAlert, setCurrentAlert] = useState("")

    const handleChangePackages = (userPackages) => {
      setSelectedPkg();
      setPackages(userPackages);
    }
    
    const uploadFile = async (file) => {
      let formData = new FormData();
      formData.append("dpkg-file", file);
      const res = await fetch('http://localhost:5000/api/upload', {
        method: "POST", 
        body: formData
        });
      const userPackages = await res.json();
      handleChangePackages(userPackages);
      console.log("userPackages", userPackages)
      return res.status === 200 ? true : false 
    };

    const handleSelectPkg = (pkg) => {
        setSelectedPkg(pkg);
        console.info('selected package:', pkg);
    };

    const handleDependencyClick = (e) => {
        const targetpkg = packages.find(
            (pkg) => pkg.Package === e.target.textContent
        );
        targetpkg ? setSelectedPkg(targetpkg) : console.log("should maybe use alert component here")
    };

    return (
      <div className="bg-gray-800">
        <Head>
          <title>dpkg package viewer</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <NavigationBar uploadFile={uploadFile}/>

        <div className="flex flex-row w-screen h-full absolute py-6 px-4 pt-20 text-md bg-gray-800">

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

          {selectedPkg ? (
            <div className="p-auto m-4 w-full">
              {currentAlert ? <Alert alertText={currentAlert}/> : null}
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
                    <button key={dep} onClick={(e) => handleDependencyClick(e)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded p-1 m-1">{dep}</button>
                  ))}
                </div>
                <p className="pt-2 font-bold">Used by:</p>
                <div className="flex flex-row flex-wrap">
                  {selectedPkg.DependencyFor.map((dep, index) => (
                    <button key={dep} onClick={(e) => handleDependencyClick(e)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1">{dep}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
        </div>
      </div>
    );
};

// Fetch example packages from API at build time.
export async function getStaticProps() {
    console.log('Getting packages..');
    const res = await fetch('http://localhost:5000/api/packages');
    const defaultPackages = await res.json();

    return {
        props: {
            defaultPackages,
        },
    };
}
