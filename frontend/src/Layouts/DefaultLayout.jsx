import React, { Suspense, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";
import Loader from '../components/Loader';

const DefaultLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle the sidebar state
  };

  return (
    <div className="flex px-2 flex-col min-h-screen">
      {/* Fixed Header */}
      <div className="fixed  p-1   w-full z-10 top-0 left-0 h-16  ">
        <div className="w-full  shadow-sm bg-gradient-to-r from-[#fe5e00] to-[#ff8c10] rounded-lg h-full items-center  justify-start text-white flex ">
          <button className=" font-extrabold px-4" onClick={toggleSidebar}>
            <RxHamburgerMenu />
          </button>
          <Header />
        </div>
      </div>

      <div className="flex flex-1 pt-16">
        {" "}
        {/* Add padding to prevent overlap with Header */}
        {/* Sidebar */}
        <div
          className={`fixed  shadow-2xl shadow-[#5d5d5c] z-10 h-[89%]  md:h-full rounded-lg  left-0 transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-1" : "-translate-x-full"
          } bg-gradient-to-br from-[#fe5e00] to-[#ff8c10]  text-white w-64 h-[calc(100vh-4rem)] p-4`}
        >
          <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
        </div>
        {/* Main Content */}
        <div
         
          className={` max-h-screen  transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-64 w-full lg:w-[calc(100vw-18rem)]" : "lg:ml-0 w-full lg:w-full"
          }`}
        >
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      {/* Fixed Footer */}
      {/* <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white">
        <Footer />
      </div> */}
    </div>
  );
};

export default DefaultLayout;
