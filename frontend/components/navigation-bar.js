
import { useState } from 'react';

export default function NavigationBar({uploadFile}) {
  const [uploadButtonColor, setUploadButtonColor] = useState("bg-orange-400")

  const hiddenFileInput = React.useRef(null);

  const handleClick = (e) => {
    hiddenFileInput.current.click();
  };

  const buttonResultColorizer = (status) => {
    status ? setUploadButtonColor("bg-green-200") : setUploadButtonColor("bg-red-600")
    setTimeout(() => {
      setUploadButtonColor("bg-orange-400")
    }, 5000) 
  }

  const handleChange = async e => {
    const fileToUpload = e.target.files[0];
    const uploadResult = await uploadFile(fileToUpload);
    console.log("Upload finished:", uploadResult)
    buttonResultColorizer(uploadResult)
  };

  return (
    <nav className='flex fixed justify-center w-full bg-gray-100 px-8 py-2 shadow-md z-10'>
      <button onClick={handleClick} className={`rounded text-white p-4 font-bold inline-block hover:bg-orange-300 ${uploadButtonColor} py-3`}>
        Upload a file
      </button>
      <input
        type="file"
        ref={hiddenFileInput}
        accept=".txt"
        onChange={handleChange}
        style={{display: 'none'}}
      />
    </nav>
  );
}
