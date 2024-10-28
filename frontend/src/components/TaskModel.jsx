import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, gql } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { IoClose } from "react-icons/io5";
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const validationSchema = Yup.object().shape({
  dueDate: Yup.string().required('Due date is required'),
  taskName: Yup.string().required('Task name is required'),
  userId: Yup.string().required('User is required'),
  priority: Yup.string().required('Priority is required'),
});

const CREATE_TASK_MUTATION = gql`
  mutation createTask(
    $project: Int!
    $dueDate: Date!
    $taskName: String!
    $user: Int!
    $priority: Int!
  ) {
    createTask(
      project: $project
      dueDate: $dueDate
      taskName: $taskName
      user: $user
      priority: $priority
    ) {
      success
      error
    }
  }
`;

const UPDATE_TASK_MUTATION = gql`
  mutation updateTask(
    $taskId: Int!
    $dueDate: Date!
    $taskName: String!
    $user: Int!
    $priority: Int!
  ) {
    updateTask(
      taskId: $taskId
      dueDate: $dueDate
      taskName: $taskName
      user: $user
      priority: $priority
    ) {
      success
      error
    }
  }
`;

const LIST_USERS = gql`
  query {
    users {
      id
      username
    }
  }
`;

const TaskModel = ({ setOpenTaskModel, openTaskModel, projectId, task }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(LIST_USERS);

  const [createTask, { loading: createLoading, error: createError }] = useMutation(CREATE_TASK_MUTATION);
  const [updateTask, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_TASK_MUTATION);

  useEffect(() => {
    if (task) {
      setValue('dueDate', task.dueDate.split('T')[0]);
      setValue('taskName', task.taskName);
      setValue('userId', task.user.id);
      setValue('priority', task.priority);
    }
  }, [task, setValue]);
console.log(task)
  if (usersLoading) return <p>Loading users...</p>;
  if (usersError) return <p>Error loading users: {usersError.message}</p>;

  const onSubmit = async (formData) => {
    const dueDate = new Date(formData.dueDate);
    const formattedDate = dueDate.toISOString().split('T')[0];

    try {
      if (task) {
        const response = await updateTask({
          variables: {
            taskId: task.id,
            dueDate: formattedDate,
            taskName: formData.taskName,
            user: parseInt(formData.userId),
            priority: parseInt(formData.priority),
          },
        });

        if (response.data.updateTask.success) {
          Swal.fire('Success!', 'Your task has been updated.', 'success');
        } else {
          throw new Error(response.data.updateTask.error);
        }
      } else {
        const response = await createTask({
          variables: {
            project: parseInt(projectId),
            dueDate: formattedDate,
            taskName: formData.taskName,
            user: parseInt(formData.userId),
            priority: parseInt(formData.priority),
          },
        });

        if (response.data.createTask.success) {
          Swal.fire('Success!', 'Your task has been created.', 'success');
        } else {
          throw new Error(response.data.createTask.error);
        }
      }

      setOpenTaskModel(false); // Close modal after successful operation
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
        <h1 className='font-bold text-center text-xl'>{task ? 'EDIT TASK' : 'ADD TASK'}</h1>
        <div onClick={() => setOpenTaskModel(false)} className='bg-orange-500 flex text-white text-3xl cursor-pointer items-center justify-center absolute top-3 right-3 rounded w-8 h-8'>
          <IoClose />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='mt-5 space-y-4'>
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

          <div className='w-full flex items-center justify-between'>
            <label className='w-1/4 text-right pr-4'>Task Name</label>
            <input
              type='text'
              {...register('taskName')}
              className='border w-2/3 p-2 rounded-md'
            />
          </div>
          {errors.taskName && (
            <p className='text-red-500'>{errors.taskName.message}</p>
          )}

          <div className='w-full flex items-center justify-between'>
            <label className='w-1/4 text-right pr-4'>Assign to</label>
            <select {...register('userId')} 
           
            className='border w-2/3 p-2 rounded-md'>
              
              {usersData?.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          {errors.userId && (
            <p className='text-red-500'>{errors.userId.message}</p>
          )}

          <div className='w-full flex items-center justify-between'>
            <label className='w-1/4 text-right pr-4'>Priority</label>
            <select {...register('priority')} className='border w-2/3 p-2 rounded-md'>
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
              <option value='4'>4</option>
              <option value='5'>5</option>
            </select>
          </div>
          {errors.priority && (
            <p className='text-red-500'>{errors.priority.message}</p>
          )}

          <button
            type='submit'
            className='bg-orange-500 hover:bg-orange-600 w-full text-white py-2 px-4 rounded-md'
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading ? (task ? 'Updating task...' : 'Creating task...') : (task ? 'Update Task' : 'Create Task')}
          </button>
        </form>

        {(createError || updateError) && <p className='text-red-500'>Failed to {task ? 'update' : 'create'} task: {createError?.message || updateError?.message}</p>}
      </motion.div>
    </div>
  );
};

export default TaskModel;
