import React, { useState } from "react";
import { FaTasks } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TopTask = ({ topImportantTasks }) => {
  const navigate = useNavigate();
  const [visibleRange, setVisibleRange] = useState([0, 3]);
  const [hoveredTask, setHoveredTask] = useState(null); 

  const handleLoadMore = () => {
    setVisibleRange([visibleRange[0] + 3, visibleRange[1] + 3]);
  };

  const handleGoBack = () => {
    setVisibleRange([
      Math.max(0, visibleRange[0] - 3),
      Math.max(3, visibleRange[1] - 3),
    ]);
  };

  const visibleTasks = topImportantTasks.slice(
    visibleRange[0],
    visibleRange[1]
  );

  return (
    <div className="">
      <div className="flex justify-end gap-2 p-2">
        {visibleRange[0] > 0 && (
          <button
            onClick={handleGoBack}
            className="rounded text-white bg-blue-500 px-2"
          >
            Go Back
          </button>
        )}
        {visibleRange[1] < topImportantTasks.length && (
          <button
            onClick={handleLoadMore}
            className="rounded text-white bg-blue-500 px-2"
          >
            Load More
          </button>
        )}
      </div>
      <ol className="mx-5 relative border-s border-gray-200 dark:border-gray-500">
        {visibleTasks.map((task) => (
          <li key={task.id} className="mb-3 ms-6">
            {task.status === "done" && (
              <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-4 ring-white dark:ring-green-500">
                <MdDone className="rounded-full shadow-lg" />
              </span>
            )}
            {task.status === "todo" && (
              <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-4 ring-white dark:ring-red-500">
                <ImCross className="rounded-full shadow-lg" />
              </span>
            )}
            {task.status === "doing" && (
              <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-4 ring-white dark:ring-yellow-500">
                <FaTasks className="rounded-full shadow-lg" />
              </span>
            )}

            <p className="mb-1 text-xs flex font-normal text-slate-500 sm:order-last sm:mb-0">
              {task.dueDate}
            </p>
            <div
              className="items-center justify-between md:flex-row flex-col-reverse flex w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-orange-200 dark:border-orange-600"
              onMouseEnter={() => setHoveredTask(task.status)} 
              onMouseLeave={() => setHoveredTask(null)} 
            >
              <p className="mb-1 text-xs flex font-normal text-black sm:order-last sm:mb-0">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={index < task.priority ? "#f59e0b" : "#ffffff"}
                    className="w-4 h-4 mx-0.5"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </p>
              <div className="text-sm md:w-1/2 w-full flex items-center justify-start gap-1 text-black font-semibold">
                {task.taskName} for
                <p
                  onClick={() => navigate("/task")}
                  className="font-semibold text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {task?.project?.projectName}
                </p>
                {/* Tooltip for showing task status */}
                {hoveredTask === task.status && (
                  <motion.span intital={{ x: -100 }} animamte={{ x: 0 }} transition={{ duration: 0.5 }} className="absolute bg-gray-700 text-white text-xs rounded px-2 py-1 -mt-16">
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </motion.span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default TopTask;
