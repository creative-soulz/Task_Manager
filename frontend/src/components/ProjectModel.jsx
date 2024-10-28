import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, gql } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { IoClose } from "react-icons/io5";
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

// Define the validation schema using Yup
const validationSchema = Yup.object().shape({
  projectName: Yup.string().required('Project name is required'),
  dueDate: Yup.string().required('Due date is required'),
});

// Define the GraphQL mutation for creating a project
const CREATE_PROJECT_MUTATION = gql`
  mutation createProject($projectName: String!, $dueDate: Date!) {
    createProject(projectName: $projectName, dueDate: $dueDate) {
      success
      error
    }
  }
`;

// Define the GraphQL mutation for updating a project
const UPDATE_PROJECT_MUTATION = gql`
  mutation updateProject($id: Int!, $projectName: String!, $dueDate: Date!) {
    updateProject(projectId: $id, projectName: $projectName, dueDate: $dueDate) {
      success
      error
    }
  }
`;

const ProjectModel = ({ setOpenProjectModel, project }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // Use mutation hooks for both creating and updating
  const [createProject, { loading: createLoading, error: createError }] = useMutation(CREATE_PROJECT_MUTATION);
  const [updateProject, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_PROJECT_MUTATION);

  // Pre-fill the form if a project is passed for updating
  useEffect(() => {
    if (project) {
      setValue('projectName', project.projectName);
      setValue('dueDate', project.dueDate);
    }
  }, [project, setValue]);

  const onSubmit = async (formData) => {
    const dueDate = new Date(formData.dueDate);
    const formattedDate = dueDate.toISOString().split('T')[0]; // Format the date

    try {
      let response;
      if (project) {
        // If project exists, update the project
        response = await updateProject({
          variables: {
            id: project.id,
            projectName: formData.projectName,
            dueDate: formattedDate,
          },
        });
      } else {
        // Otherwise, create a new project
        response = await createProject({
          variables: {
            projectName: formData.projectName,
            dueDate: formattedDate,
          },
        });
      }

      if (response.data.createProject?.success || response.data.updateProject?.success) {
        Swal.fire('Success!', project ? 'Project updated successfully' : 'Project created successfully', 'success');
        setOpenProjectModel(false); // Close modal after successful operation
      } else {
        throw new Error(response.data.createProject?.error || response.data.updateProject?.error);
      }
    } catch (error) {
      Swal.fire('Error!', `There was an issue: ${error.message}`, 'error');
    }
  };

  return (
    <div className={`fixed h-screen w-screen bg-black bg-opacity-50 top-0 flex items-center justify-center left-0 z-10 transition-all`}>
      <motion.div
        initial={{ opacity: 0, y: -200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: .1, delay: .3 },
          y: { duration: .1, delay: -.3 }
        }}
        className={`bg-white p-5 rounded h-[90%] relative lg:h-[70%] md:w-[60%] md:h-[60%] w-[97%] lg:w-[30%] shadow-lg transition-all duration-1000 delay-300 ease-out`}
      >
        <h1 className='font-bold text-center text-xl'>{project ? 'UPDATE PROJECT' : 'ADD PROJECT'}</h1>
        <div onClick={() => setOpenProjectModel(false)} className='bg-orange-500 flex text-white text-3xl cursor-pointer items-center justify-center absolute top-3 right-3 rounded w-8 h-8'>
          <IoClose />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='mt-5 space-y-4'>
          <div className='w-full flex items-center justify-between'>
            <label className='w-1/4 text-right pr-4'>Project Name</label>
            <input
              type='text'
              {...register('projectName')}
              className='border w-2/3 p-2 rounded-md'
            />
          </div>
          {errors.projectName && (
            <p className='text-red-500'>{errors.projectName.message}</p>
          )}

          <div className='w-full flex items-center justify-between'>
            <label className='w-1/4 text-right pr-4'>Due Date</label>
            <input
              type='date'
              {...register('dueDate')}
              className='border w-2/3 p-2 rounded-md'
            />
          </div>
          {errors.dueDate && (
            <p className='text-red-500'>{errors.dueDate.message}</p>
          )}

          <button
            type='submit'
            className='bg-orange-500 hover:bg-orange-600 w-full text-white py-2 px-4 rounded-md'
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading
              ? (project ? 'Updating project...' : 'Creating project...')
              : (project ? 'Update Project' : 'Create Project')}
          </button>
        </form>

        {(createError || updateError) && <p className='text-red-500'>Failed to {project ? 'update' : 'create'} project: {(createError?.message || updateError?.message)}</p>}
      </motion.div>
    </div>
  );
};

export default ProjectModel;
