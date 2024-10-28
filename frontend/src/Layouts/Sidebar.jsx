import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdHome, MdGroup, MdAssignment } from "react-icons/md"; // Importing icons

const Sidebar = ({ setIsSidebarOpen }) => {
  const role = localStorage.getItem("role");
  const location = useLocation();

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div className="text-2xl font-bold py-4 border-b-2 w-full text-center">
          SIDEBAR
        </div>

        <Link className="w-full" to="home">
          <div
            className={`w-full text-center py-3 rounded-lg font-semibold hover:bg-[#ff8c10] transition-all ${
              location.pathname === "/home"
                ? "bg-[white] text-black hover:bg-white hover:text-black"
                : ""
            }`}
          >
            <MdHome className="inline-block mr-2" /> {/* Home icon */}
            Home
          </div>
        </Link>

        {role === "ADMIN" && (
          <Link className="w-full" to="user">
            <div
              className={`w-full text-center py-3 rounded-lg font-semibold hover:bg-[#ff8c10] transition-all ${
                location.pathname === "/user"
                  ? "bg-[white] text-black hover:bg-white hover:text-black"
                  : ""
              }`}
            >
              <MdGroup className="inline-block mr-2" /> {/* Users icon */}
              Users
            </div>
          </Link>
        )}

        <Link className="w-full" to="/task">
          <div
            className={`w-full text-center py-3 rounded-lg font-semibold hover:bg-[#ff8c10] transition-all ${
              location.pathname === "/task"
                ? "bg-[white] text-black hover:bg-white hover:text-black"
                : ""
            }`}
          >
            <MdAssignment className="inline-block mr-2" /> {/* Tasks icon */}
            Tasks
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
