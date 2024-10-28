import React from 'react'
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import task from '../assets/task.svg'


const Header = () => {
  const [openMenu, setOpenMenu] = React.useState(false)
  const navigate = useNavigate()
  const logoutHandler=()=>{
    localStorage.removeItem('authToken')
    localStorage.removeItem('role')
    navigate('/')
  }
  return (
    <div className='flex justify-between items-center p-3 w-full '>

    <h1 className='font-bold flex items-center justify-center text-2xl'>
      <img src={task} alt="task" className='w-8 h-10 mr-2' />
      Task Manager
    </h1>
    <div  onClick={() => setOpenMenu(!openMenu)} >
    <FaUserCircle className='text-4xl  mr-5 lg:mr-8 cursor-pointer '/>
    <div className={  `bg-[#ffffff] shadow-md text-black  flex flex-col items-center justify-center p-2 w-32 right-3 mt-1 rounded h-24 absolute  text-center font-bold  ${openMenu ? 'block' : 'hidden'}` }>
      <div onClick={() => navigate('/profile')} className='h-1/2 flex items-center justify-center w-full rounded-t hover:text-white hover:bg-[#ffa710] transition-all'>Profile</div>
      <div onClick={logoutHandler} className='h-1/2 flex items-center justify-center w-full rounded-b hover:text-white hover:bg-[#ffa810] transition-all'>Logout</div>
    </div>
    </div>

    </div>

  )
}

export default Header