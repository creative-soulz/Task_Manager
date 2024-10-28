import React from "react";
import { useQuery, gql } from "@apollo/client";
import { motion } from "framer-motion";
import ApexCharts from "react-apexcharts";
import taskboy from "../assets/taskboy.png";
import TopTask from "../components/TopTask";



const GET_TASK_STATS = gql`
  query GetTaskStats {
    stats {
      completed
      incompleted
      topImportantTasks {
        project {
          id
          projectName
        }
        id
        taskName
        priority
        dueDate
        status
      }
    }
  }
`;

const HomePage = () => {
 
const { loading, error, data } = useQuery(GET_TASK_STATS);
  // console.log(data);
  // console.log(data.stats)
const { completed, incompleted, topImportantTasks } = data?.stats || {completed:0,incompleted:0,topImportantTasks:[]};




  const chartOptions = {
    series: [completed, incompleted],
    options: {
      chart: {
        type: "pie",
      },
      labels: ["Completed Tasks", "Incomplete Tasks"],
      colors: ["#4CAF50", "#FF5252"],
    },
  };

  return (
    <div className="h-full w-full">
      <div className="h-full w-full">
        {/* Hero section */}
        <div className="bg-[rgb(255,212,181)]  lg:h-[15rem] lg:justify-between  md:h-[13rem] h-[20rem] rounded-lg items-center justify-end flex-col-reverse md:flex-row md:items-center md:justify-evenly flex w-full">
          <motion.h1
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 lg:ml-7 text-xl md:font-2xl font-bold font-sans text-center md:text-start"
          >
            Stay Organized <br />
            <span className="text-[#fe5e00] text-xl md:text-4xl">
              Stay Productive By
            </span>
            <br />
            <span className="font-extrabold text-transparent md:text-5xl bg-clip-text bg-gradient-to-br from-[#fe5e00] to-[#ff8c10]">
              TASK MANAGER
            </span>
          </motion.h1>
          <motion.img
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="h-1/2 lg:h-[110%] md:h-full rounded mb-5"
            src={taskboy}
            alt="task"
          />
        </div>

        {/* Chart and Top Important Tasks List */}
        {topImportantTasks.length > 0 && (
          <div className="mt-2 md:w-full lg:h-[25rem] lg:w-full  h-[30rem] flex flex-col lg:flex-row gap-2 items-center justify-center">
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-5 lg:w-1/2 lg:h-full w-full h-full md:h-[20rem] flex items-center justify-center mt-[8rem]  md:mt-[8rem] lg:mt-0 md:w-full sm:w-1/2 bg-blue-500 rounded-lg shadow-lg  "
            >
              <ApexCharts
                options={chartOptions.options}
                series={chartOptions.series}
                type="pie"
                // width="70%"
                className="h-1/2  w-full lg:w-3/4  md:w-1/2"
              />
            </motion.div>

            <motion.div
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-5 md:w-full lg:w-1/2 w-full md:h-[25rem]  bg-white-500 border-2 shadow-lg border-gray-200 rounded-lg h-[30rem]"
            >
              <h2 className="text-xl text-center text-black uppercase font-bold ">
                Important Tasks
              </h2>
              <TopTask topImportantTasks={topImportantTasks} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
