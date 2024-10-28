import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import TaskModel from '../components/TaskModel';
import { motion } from 'framer-motion';
import ProjectModel from '../components/ProjectModel';
import { MdModeEdit, MdDelete } from 'react-icons/md';
import Swal from 'sweetalert2';

const ProjectPage = () => {
  const role = localStorage.getItem('role');
  
  const GET_PROJECTS = gql`
    query getProjects {
      projects {
        projectName
        dueDate
        id
        
      }
    }
  `;

  const DELETE_PROJECT_MUTATION = gql`
    mutation deleteProject($projectId: Int!) {
      deleteProject(projectId: $projectId) {
        success
        error
      }
    }
  `;

  const [openProjectModel, setOpenProjectModel] = useState(false);
  const [openTaskModel, setOpenTaskModel] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Get refetch from useQuery to manually refetch the data after mutation
  const { loading, error, data, refetch } = useQuery(GET_PROJECTS);

  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION, {
    onCompleted: () => refetch(), // Refetch projects after successful deletion
  });

  if (loading) return <p>Loading Projects...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the project.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteProject({ variables: { projectId: parseInt(id) } }); // Ensure ID is an integer
        refetch(); // Refetch the projects after deletion
        Swal.fire('Deleted!', 'Your project has been deleted.', 'success');
      }
    }).catch((error) => {
      Swal.fire('Error!', `There was an error deleting your project: ${error.message}`, 'error');
    });
  };

  const handleUpdate = (project) => {
    setSelectedProject(project);
    setOpenProjectModel(true);
  };

  return (
    <div className="bg-[rgb(255,212,181)] rounded p-5 flex-col flex my-3 items-center justify-center w-full ">
      <div className="w-full flex lg:flex-row flex-col gap-3 justify-between px-4 py-6 border rounded-lg shadow bg-white items-center">
        <h1
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold"
        >
          PROJECTS
        </h1>
        {role === "ADMIN" && (
          <button
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setOpenProjectModel(true)}
            className="bg-[#fe5e00] my-2 md:w-32 lg:w-32 font-bold rounded w-full text-white py-2"
          >
            Add Projects
          </button>
        )}
      </div>
      <div className="h-full w-full my-2 flex flex-wrap items-center justify-start gap-3">
        {data.projects.map((project) => (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full mt-4 md:w-[20rem]"
            key={project.id}
          >
            <div className="text-white shadow-lg lg:w-[18rem] bg-[#ff8c10] rounded flex items-center justify-center h-[9rem] flex-col w-full">
              <p className="font-bold text-xl">{project.projectName}</p>
              <p>
                <span className="font-bold">Due Date:</span> {project.dueDate}
              </p>
              <div className=" flex items-center justify-center gap-2 w-full">
                <button
                  className="bg-white my-2 text-black font-bold rounded w-[40%] py-2"
                  onClick={() => {
                    setProjectId(project.id);
                    setOpenTaskModel(true);
                  }}
                >
                  Create Task
                </button>
                {role === "ADMIN" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(project)}>
                      <MdModeEdit
                        className="text-white cursor-pointer"
                        size={20}
                      />
                    </button>
                    <button onClick={() => handleDelete(project.id)}>
                      <MdDelete
                        className="text-white cursor-pointer"
                        size={20}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {openTaskModel && (
          <TaskModel
            projectId={projectId}
            openTaskModel={openTaskModel}
            setOpenTaskModel={setOpenTaskModel}
          />
        )}
        {openProjectModel && (
          <ProjectModel
            setOpenProjectModel={(value) => {
              setOpenProjectModel(value);
              if (!value) setSelectedProject(null);
            }}
            project={selectedProject}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
