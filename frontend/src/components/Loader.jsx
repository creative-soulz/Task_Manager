import React from 'react'
import { BiLoaderAlt } from "react-icons/bi";
const Loader = () => {
  return (
    <div  className='bg-black opacity-50 absolute h-full w-full top-0 left-0 z-10'>

      <div className='text-white flex items-center justify-center h-full text-4xl '>
        <div className='animate-spin'><BiLoaderAlt/></div>
       
        
      </div>
    </div>
  )
}

export default Loader