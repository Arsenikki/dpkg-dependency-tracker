
import { useState } from 'react';

export default function Alert({alertText}) {
  return (
    <div className='justify-center w-full'>
      <div className="bg-red-500 border border-red-800 px-4 py-3 rounded absolute z-10" role="alert">
        <strong className="font-bold">Holy smokes!</strong>
  <span className="block sm:inline">{alertText}</span>
      </div>
    </div>
  );
}