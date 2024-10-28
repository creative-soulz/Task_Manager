import React, { useEffect, useState } from 'react';
import ProjectPage from './ProjectPage';
import { gql, useQuery, useMutation } from '@apollo/client';
import { MdModeEdit, MdDelete } from "react-icons/md";
import TaskModel from '../components/TaskModel'; // Import your task modal for editing
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaComment } from "react-icons/fa";

const LIST_TASKS = gql`
  query getTasks($created: Boolean!) {
    tasks(created:$created) {
      id
      taskName
      dueDate
      user {
        id
        username
      }
      createdBy {
        id
        username
      }
      project {
        projectName
      }
      status
      priority
    }
  }
`;

const DELETE_TASK_MUTATION = gql`
  mutation deleteTask($taskId: Int!) {
    deleteTask(taskId: $taskId) {
      success
      error
    }
  }
`;

const UPDATE_TASK_MUTATION = gql`
  mutation updateTask($taskId: Int!, $status: String!) {
    updateTask(taskId: $taskId, status: $status) {
      success
      error
    }
  }
`;

const GET_COMMENTS = gql`
  query getComments($taskId: Int!) {
    comments(taskId: $taskId) {
      id
      comment
      fromUser {
        username
      }
      toUser {
        username
      }
    }
  }
`;

const TaskPage1 = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openComments, setOpenComments] = useState({}); 
  const [created, setCreated] = useState(false);


  const { data: tasksData, loading: tasksLoading, error: tasksError, refetch: taskrefetch } = useQuery(LIST_TASKS,{
    variables:{ created }
  });
useEffect(() => {
  taskrefetch();
}, [created]);


  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    onCompleted: () => taskrefetch(),
  });
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    onCompleted: () => {
      taskrefetch();
      setIsEditMode(false);
      setEditingTask(null);
    },
  });

  if (tasksLoading) return <p>Loading tasks...</p>;
  if (tasksError) return <p>Error loading tasks: {tasksError.message}</p>;


  const handleDelete = (taskId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTask({ variables: { taskId } })
          .then(() => {
            Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error!', `There was an error deleting your task: ${error.message}`, 'error');
          });
      }
    });
  };

  const handleEdit = (task) => {
    setIsEditMode(true);
    setEditingTask(task);
  };

  const handleUpdate = (taskId, newStatus) => {
    updateTask({ variables: { taskId, status: newStatus } }).catch((error) => {
      Swal.fire('Error!', `There was an error updating your task: ${error.message}`, 'error');
    });
  };

  const handleStatusChange = (taskId, newStatus) => {
    handleUpdate(taskId, newStatus);
  };

  const toggleComments = (taskId) => {
    setOpenComments((prev) => ({
      ...prev,
      [taskId]: !prev[taskId], 
    }));
  };
 
  const CommentsList = ({ taskId }) => {
    const { loading, error, data } = useQuery(GET_COMMENTS, {
      variables: { taskId },
    });

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p>Error loading comments: {error.message}</p>;

    return (
      <div className="comments-list ">
        {data && data.comments.length > 0 ? (
          data.comments.map((comment) => (
            <div key={comment.id} className="comment ">
              <div className='flex w-full py-5 gap-2 border-b items-center justify-center'>   <p>add comment</p>
              <input type="text" className='lg:w-[90%] py-3 border rounded' /></div>
              <p>from: <strong>{comment.fromUser.username}</strong> to <strong>{comment.toUser?.username || 'N/A'}</strong>: {comment.comment}</p>
            </div>
          ))
        ) : (
          <div>
            <div  className="comment ">
              <div className='flex w-full py-5 gap-2 border-b items-center justify-center'>   <p>add comment</p>
              <input type="text" className='lg:w-[90%] py-3 border rounded' /></div>
             
            </div>
            <p>No comments yet for this task.</p>
            </div>
        )}
      </div>
    );
  };


// drag

const handleDragEnd = (result) => {
  const { destination, source, draggableId } = result;
  if (!destination) return;
  if (destination.droppableId !== source.droppableId) {
    const newStatus = destination.droppableId; 
    handleUpdate(parseInt(draggableId), newStatus); 
  }
};

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <ProjectPage />
      </div>
      {/* my task */}
      {!created && <div className='bg-[rgb(255,212,181)]  rounded py-5 overflow-x-auto flex-col flex my-3 items-center justify-start w-full'>
        <div className='flex bg-white rounded-lg border  shadow px-4 lg:relative absolute w-[90%] lg:w-[95%]  z-auto  py-6 md:py-9  items-center justify-center lg:justify-between gap-3 flex-col lg:flex-row'> 
           <h1 className='text-xl lg:text-start text-center  font-bold'>MY TASKS</h1>
           <button className='bg-[#fe5e00] lg:w-56 font-bold text-white py-2 px-4 rounded' onClick={() => setCreated(true)}>Assigned Tasks</button>
           </div>

      
<div className='flex lg:justify-between lg:px-10  md:py-5 lg:mt-0 md:mt-30 mt-36 items-start gap-6 w-full '>
        {/* todo */}
        {['todo', 'doing', 'done'].map((status) => (
          <Droppable  key={status} droppableId={status} >
            {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className='h-full w-full md:px-5 md:shadow-lg md:bg-[#ffffff] md:py-6 rounded-lg  flex flex-col items-center justify-start '>
          <h1 className='text-xl text-black text-center w-full font-bold'>{status}</h1>
          {tasksData && tasksData.tasks.length > 0 ? (
            tasksData.tasks.map((task,index) => (
              task.status === status && (
                <Draggable draggableId={String(task.id)} index={index} key={task.id}>         
              
                {(provided) => (
                <motion.div 
                
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                ref={provided.innerRef} 
                className='bg-white shadow-lg border mt-5 p-5 min-w-[16rem] md:w-[30rem] lg:w-[25rem] rounded-lg' 
                {...provided.draggableProps} 
                {...provided.dragHandleProps}
              >
                
                <div className='w-full pb-2 flex items-center justify-between border-b'>
                      <p className='text-center uppercase text-slate-500 text-xs'>
                        Created by {task.createdBy.username}
                      </p>
                <div className='flex items-center'>
                 
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={index < task.priority ? "#f59e0b" : "#d1d5db"} 
                      className="w-4 h-4 mx-0.5"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
                <div className='lg:flex lg:flex-row  flex-col flex items-center justify-center lg:justify-between'>
                 
                  <p className='text-center uppercase text-md text-[#fe5e00]  font-bold'>{task.taskName}</p>
                  <div className='flex justify-evenly   items-center w-full'>
                    
                            <p className=''><span className='text-sm font-semibold'>{task.dueDate}{" "}</span> </p>
                          <p className=''>for: <span className='text-sm font-semibold'>{task.project.projectName}</span></p>
                      
                  </div>
                     
                 
                  <div className='flex justify-center items-center'>

                   { task.createdBy.id === task.user.id && <MdModeEdit
                      className='text-xl cursor-pointer  text-yellow-500'
                      onClick={() => handleEdit(task)}
                    />}
                    <MdDelete
                      className='text-xl text-red-500 mr-3 cursor-pointer'
                      onClick={() => handleDelete(task.id)}
                    />
                    <FaComment
                      className='text-xl text-blue-500 cursor-pointer'
                      onClick={() => toggleComments(task.id)}
                    />
                  </div>
                </div>

                {openComments[task.id] && (
                  <div className='mt-3  border-t'>
                    <p className='text-center uppercase mt-3 text-slate-500 text-xs'>Comments</p>
                    <CommentsList taskId={task.id} />
                  </div>
                )}
              </motion.div>
                )}
           </Draggable>
              )
            ))
          ) : (
            <p>No tasks available</p>
          )}
           {provided.placeholder}
        </div>
        
            )}
        </Droppable>
      ))}
          </div>


      </div>}


      {/* assigned task */}
      {created && <div className='bg-[rgb(255,212,181)]  rounded py-5 overflow-x-auto flex-col flex my-3 items-center justify-start w-full'>
        <div className='flex bg-white rounded-lg border  shadow px-4 lg:relative absolute w-[90%] lg:w-[95%]  z-auto  py-6 md:py-9  items-center justify-center lg:justify-between gap-3 flex-col lg:flex-row'> 
           <h1 className='text-xl lg:text-start text-center  font-bold'>ASSIGNED TASKS</h1>
           <button className='bg-[#fe5e00] lg:w-56 font-bold text-white py-2 px-4 rounded' onClick={() => setCreated(false)}>My Tasks</button>
           </div>

      
<div className='flex lg:justify-between lg:px-10  md:py-5 lg:mt-0 md:mt-30 mt-36 items-start gap-6 w-full '>
        {/* todo */}
        {['todo', 'doing', 'done'].map((status) => (
          <Droppable  key={status} droppableId={status} >
            {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className='h-full w-full md:px-5 md:shadow-lg md:bg-[#ffffff] md:py-6 rounded-lg  flex flex-col items-center justify-start '>
          <h1 className='text-xl text-black text-center w-full font-bold'>{status}</h1>
          {tasksData && tasksData.tasks.length > 0 ? (
            tasksData.tasks.map((task,index) => (
              task.status === status && (
                <Draggable draggableId={String(task.id)} index={index} key={task.id}>         
              
                {(provided) => (
                <motion.div 
                
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                ref={provided.innerRef} 
                className='bg-white shadow-lg border mt-5 p-5 min-w-[16rem] md:w-[30rem] lg:w-[25rem] rounded-lg' 
                {...provided.draggableProps} 
                {...provided.dragHandleProps}
              >
                
                <div className='w-full pb-2 flex items-center justify-between border-b'>
                      <p className='text-center uppercase text-slate-500 text-xs'>
                        Created by {task.createdBy.username}
                      </p>
                <div className='flex items-center'>
                 
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={index < task.priority ? "#f59e0b" : "#d1d5db"} 
                      className="w-4 h-4 mx-0.5"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
                <div className='lg:flex lg:flex-row  flex-col flex items-center justify-center lg:justify-between'>
                 
                  <p className='text-center uppercase text-md text-[#fe5e00]  font-bold'>{task.taskName}</p>
                  <div className='flex justify-evenly   items-center w-full'>
                    
                            <p className=''><span className='text-sm font-semibold'>{task.dueDate}{" "}</span> </p>
                          <p className=''>for: <span className='text-sm font-semibold'>{task.project.projectName}</span></p>
                      
                  </div>
                     
                 
                  <div className='flex justify-center items-center'>

                   { <MdModeEdit
                      className='text-xl cursor-pointer  text-yellow-500'
                      onClick={() => handleEdit(task)}
                    />}
                    <MdDelete
                      className='text-xl text-red-500 mr-3 cursor-pointer'
                      onClick={() => handleDelete(task.id)}
                    />
                    <FaComment
                      className='text-xl text-blue-500 cursor-pointer'
                      onClick={() => toggleComments(task.id)}
                    />
                  </div>
                </div>

                {openComments[task.id] && (
                  <div className='mt-3  border-t'>
                    <p className='text-center uppercase mt-3 text-slate-500 text-xs'>Comments</p>
                    <CommentsList taskId={task.id} />
                  </div>
                )}
              </motion.div>
                )}
           </Draggable>
              )
            ))
          ) : (
            <p>No tasks available</p>
          )}
           {provided.placeholder}
        </div>
        
            )}
        </Droppable>
      ))}
          </div>


      </div>}

      {isEditMode && editingTask && (
        <TaskModel
          openTaskModel={isEditMode}
          setOpenTaskModel={setIsEditMode}
          task={editingTask}
          onUpdate={handleUpdate}
        />
      )}
    </DragDropContext>
  );
};

export default TaskPage1;