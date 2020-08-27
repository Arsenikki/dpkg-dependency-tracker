import NavigationBar from '../components/navigation-bar';
import PackageCard from '../components/package-card';
import { useState } from 'react';
import fetch from 'isomorphic-unfetch';
import Head from 'next/head';
import PackageList from '../components/package-list';

export default function Index({defaultPackages}) {
  const [selectedPkg, setSelectedPkg] = useState(defaultPackages[0]);
  const [packages, setPackages] = useState(defaultPackages);

  const handleChangePackages = (userPackages) => {
    setSelectedPkg();
    setPackages(userPackages);
  }
  
  const uploadFile = async (file) => {
    let formData = new FormData();
    formData.append("dpkg-file", file);
    const res = await fetch('/api/upload', {
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
    const targetpkg = packages.find((pkg) => pkg.Package === e.target.textContent);
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
        <PackageList packages={packages} handleSelectPkg={handleSelectPkg}/>
        {selectedPkg
          ? <PackageCard selectedPkg={selectedPkg} handleDependencyClick={handleDependencyClick}/>
          : null}
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
