import React, { useEffect, useState } from "react";
import ProjectPage from "./ProjectPage";
import { gql, useQuery, useMutation } from "@apollo/client";
import { MdModeEdit, MdDelete } from "react-icons/md";
import TaskModel from "../components/TaskModel"; // Import your task modal for editing
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaComment, FaRocket } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import Loader from "../components/Loader";
const LIST_TASKS = gql`
  query getTasks($created: Boolean!) {
    tasks(created: $created) {
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

const CREATE_COMMENT_MUTATION = gql`
  mutation createComment(
    $task: Int!
    $fromUser: Int!
    $toUser: Int!
    $comment: String!
  ) {
    createComment(
      task: $task
      fromUser: $fromUser
      toUser: $toUser
      comment: $comment
    ) {
      success
      error
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteComment($commentId: Int!) {
    deleteComment(commentId: $commentId) {
      success
      error
    }
  }
`;

const TaskPage1 = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [created, setCreated] = useState(false);
  const [newComment, setNewComment] = useState(null);
  const [taskId, setTaskID] = useState("");

  const [
    createComment,
    { success: createCommentSuccess, error: createCommentError },
  ] = useMutation(CREATE_COMMENT_MUTATION, {
    onCompleted: () => {
      setNewComment("");
      // commentrefetch();
    },
  });

  const {
    loading: commentLoading,
    error: commentError,
    data: commentData,
    refetch: commentrefetch,
  } = useQuery(GET_COMMENTS, {
    variables: { taskId },
    skip: taskId === "",
  });

  const [deleteComment, { success: deleteSuccess, error: deleteError }] =
    useMutation(DELETE_COMMENT);
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
  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: taskrefetch,
  } = useQuery(LIST_TASKS, {
    variables: { created },
  });

  if (tasksLoading) return <Loader></Loader>;
  if (tasksError) return <p>Error loading tasks: {tasksError.message}</p>;

  const handleDelete = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTask({ variables: { taskId } })
          .then(() => {
            Swal.fire("Deleted!", "Your task has been deleted.", "success");
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              `There was an error deleting your task: ${error.message}`,
              "error"
            );
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
      Swal.fire(
        "Error!",
        `There was an error updating your task: ${error.message}`,
        "error"
      );
    });
  };

  const toggleComments = (taskId) => {
    setOpenComments(!openComments);
    setTaskID(taskId);
  };

  function handleComment(taskId, fromUser, toUser, comment) {
    createComment({ variables: { task: taskId, fromUser, toUser, comment } })
      .then(() => {
        commentrefetch();
      })
      .catch((error) => {
        Swal.fire(
          "Error!",
          `There was an error creating your comment: ${error.message}`,
          "error"
        );
      });
  }

  if (createCommentError)
    return <p>Error creating comment: {createCommentError.message}</p>;

  // if (commentLoading) return <p>Loading comments...</p>;
  // if (commentError) return <p>Error loading comments: {error.message}</p>;

  const deletCommentHandler = (commentId) => {
    deleteComment({ variables: { commentId } })
      .then(() => {
        commentrefetch();
      })
      .catch((error) => {
        Swal.fire(
          "Error!",
          `There was an error deleting your comment: ${error.message}`,
          "error"
        );
      });
  };

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
        <ProjectPage taskrefetch={taskrefetch} />
      </div>
      {/* opton to create task */}
      <div className="flex bg-white rounded-lg border   shadow px-4 h-20 items-center justify-start gap-7">
        <div
          onClick={() => setCreated(false)}
          className={`${
            !created && "text-[#fe5e00] border-b-4 border-orange-500"
          } cursor-pointer  flex items-center   h-full`}
        >
          <h1 className="text-xl lg:text-start text-center ">MY TASKS</h1>
        </div>

        <div
          onClick={() => setCreated(true)}
          className={`${
            created && "text-[#fe5e00] border-b-4 border-orange-500"
          }  cursor-pointer flex items-center  h-full`}
        >
          <h1 className="text-xl lg:text-start text-center ">ASSIGNED TASK</h1>
        </div>
      </div>
      {!created && (
        <div className="bg-[rgb(255,212,181)]  rounded py-5 overflow-x-auto flex-col flex my-3 items-center justify-start w-full">
          <div className="flex lg:justify-between lg:px-10  md:py-5 lg:mt-0  items-start gap-6 w-full ">
            {/* todo */}
            {["todo", "doing", "done"].map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-full w-full md:px-5 md:shadow-lg md:bg-[#ffffff] md:py-6 rounded-lg lg:w-[23rem]  flex flex-col items-center justify-start "
                  >
                    <h1 className="text-xl text-black text-center w-full font-bold">
                      {status}
                    </h1>
                    {tasksData && tasksData.tasks.length > 0 ? (
                      tasksData.tasks.map(
                        (task, index) =>
                          task.status === status && (
                            <Draggable
                              draggableId={String(task.id)}
                              index={index}
                              key={task.id}
                            >
                              {(provided) => (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  ref={provided.innerRef}
                                  className="bg-white shadow-lg border mt-5 p-5 lg:w-[20rem] min-w-[16rem] md:w-[17rem] rounded-lg"
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="w-full pb-2 flex items-center justify-between border-b">
                                    <p className="text-center uppercase text-slate-500 text-xs">
                                      Created by {task.createdBy.username}
                                    </p>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, index) => (
                                        <svg
                                          key={index}
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill={
                                            index < task.priority
                                              ? "#f59e0b"
                                              : "#d1d5db"
                                          }
                                          className="w-4 h-4 mx-0.5"
                                        >
                                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="lg:flex lg:flex-row  flex-col flex items-center justify-center lg:justify-between">
                                    <p className="text-center uppercase text-md text-[#fe5e00]  font-bold">
                                      {task.taskName}
                                    </p>
                                    <div className="flex justify-evenly   items-center w-full">
                                      <p className="">
                                        <span className="text-sm font-semibold">
                                          {task.dueDate}{" "}
                                        </span>{" "}
                                      </p>
                                    </div>

                                    <div className="flex justify-center items-center">
                                      {task.createdBy.id === task.user.id && (
                                        <MdModeEdit
                                          className="text-xl cursor-pointer  text-yellow-500"
                                          onClick={() => handleEdit(task)}
                                        />
                                      )}
                                      <MdDelete
                                        className="text-xl text-red-500 mr-3 cursor-pointer"
                                        onClick={() => handleDelete(task.id)}
                                      />
                                      <FaComment
                                        className="text-xl text-blue-500 cursor-pointer"
                                        onClick={() => toggleComments(task.id)}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-full mt-2 border-t flex justify-between uppercase text-slate-500  text-xs">
                                    <p>Assigned to {task.user.username}</p>
                                    <p className="">
                                      for:{" "}
                                      <span className="text-sm font-semibold">
                                        {task.project.projectName}
                                      </span>
                                    </p>
                                  </div>
                                  {taskId === task.id && openComments && (
                                    <div className="mt-3  border-t">
                                      <p className="text-center uppercase mt-3 text-slate-500 text-xs">
                                        Comments
                                      </p>
                                      <div className="flex w-full py-5 gap-2 border-b items-center justify-center">
                                        <button
                                          onClick={() =>
                                            handleComment(
                                              task.id,
                                              task.createdBy.id,
                                              task.user.id,
                                              newComment
                                            )
                                          }
                                          className="text-md text-white py-3 rounded px-3 bg-orange-500 "
                                        >
                                          <IoSend />
                                        </button>
                                        <input
                                          onChange={(e) =>
                                            setNewComment(e.target.value)
                                          }
                                          value={newComment}
                                          type="text"
                                          className="lg:w-[90%] py-2 border rounded"
                                        />
                                      </div>

                                      <div className="comments-list ">
                                        {commentData &&
                                        commentData.comments.length > 0 ? (
                                          commentData.comments.map(
                                            (comment) => (
                                              <div
                                                key={comment.id}
                                                className="comment flex w-full justify-between "
                                              >
                                                <p>
                                                  from:{" "}
                                                  <strong>
                                                    {comment.fromUser.username}
                                                  </strong>{" "}
                                                  to{" "}
                                                  <strong>
                                                    {comment.toUser?.username ||
                                                      "N/A"}
                                                  </strong>
                                                  : {comment.comment}
                                                </p>
                                                <p
                                                  onClick={() =>
                                                    deletCommentHandler(
                                                      comment.id
                                                    )
                                                  }
                                                  className="text-red-500 cursor-pointer"
                                                >
                                                  <MdDelete></MdDelete>
                                                </p>
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div>
                                            <div className="comment "></div>
                                            <p>
                                              No comments yet for this task.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </Draggable>
                          )
                      )
                    ) : (
                      <p>No tasks available</p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      )}

      {/* assigned task */}

      {created && (
        <div className="bg-[rgb(255,212,181)]  rounded py-5 overflow-x-auto flex-col flex my-3 items-center justify-start w-full">
          <div className="flex lg:justify-between lg:px-10  md:py-5 lg:mt-0  items-start gap-6 w-full  ">
            {/* todo */}
            {["todo", "doing", "done"].map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-full w-full md:w-4/3 l  md:px-5 md:shadow-lg lg:w-[23rem] md:bg-[#ffffff] md:py-6 rounded-lg  flex flex-col items-center justify-start "
                  >
                    <h1 className="text-xl text-black text-center w-full font-bold">
                      {status}
                    </h1>
                    {tasksData && tasksData.tasks.length > 0 ? (
                      tasksData.tasks.map(
                        (task, index) =>
                          task.status === status && (
                            <Draggable
                              draggableId={String(task.id)}
                              index={index}
                              key={task.id}
                            >
                              {(provided) => (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  ref={provided.innerRef}
                                  className="bg-white shadow-lg border mt-5 p-5 min-w-[16rem] md:w-[15rem] lg:w-[20rem] rounded-lg"
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="w-full pb-2 flex items-center justify-between border-b">
                                    <p className="text-center uppercase text-slate-500 text-xs">
                                      Created by {task.createdBy.username}
                                    </p>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, index) => (
                                        <svg
                                          key={index}
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill={
                                            index < task.priority
                                              ? "#f59e0b"
                                              : "#d1d5db"
                                          }
                                          className="w-4 h-4 mx-0.5"
                                        >
                                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="lg:flex lg:flex-row  flex-col flex items-center justify-center lg:justify-between">
                                    <p className="text-center uppercase text-md text-[#fe5e00]  font-bold">
                                      {task.taskName}
                                    </p>
                                    <div className="flex justify-evenly   items-center w-full">
                                      <p className="">
                                        <span className="text-sm font-semibold">
                                          {task.dueDate}{" "}
                                        </span>{" "}
                                      </p>
                                    </div>

                                    <div className="flex justify-center items-center">
                                      {
                                        <MdModeEdit
                                          className="text-xl cursor-pointer  text-yellow-500"
                                          onClick={() => handleEdit(task)}
                                        />
                                      }
                                      <MdDelete
                                        className="text-xl text-red-500 mr-3 cursor-pointer"
                                        onClick={() => handleDelete(task.id)}
                                      />
                                      <FaComment
                                        className="text-xl text-blue-500 cursor-pointer"
                                        onClick={() => toggleComments(task.id)}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-full mt-2 border-t flex justify-between uppercase text-slate-500  text-xs">
                                    <p>Assigned to {task.user.username}</p>
                                    <p className="">
                                      for:{" "}
                                      <span className="text-sm font-semibold">
                                        {task.project.projectName}
                                      </span>
                                    </p>
                                  </div>
                                  {taskId === task.id && openComments && (
                                    <div className="mt-3  border-t">
                                      <p className="text-center uppercase mt-3 text-slate-500 text-xs">
                                        Comments
                                      </p>
                                      <div className="flex w-full py-5 gap-2 border-b items-center justify-center">
                                        <button
                                          onClick={() =>
                                            handleComment(
                                              task.id,
                                              task.createdBy.id,
                                              task.user.id,
                                              newComment
                                            )
                                          }
                                          className="text-md text-white py-3 rounded px-3 bg-orange-500 "
                                        >
                                          <IoSend />
                                        </button>
                                        <input
                                          onChange={(e) =>
                                            setNewComment(e.target.value)
                                          }
                                          value={newComment}
                                          type="text"
                                          className="lg:w-[90%] py-2 border rounded"
                                        />
                                      </div>

                                      <div className="comments-list ">
                                        {commentData &&
                                        commentData.comments.length > 0 ? (
                                          commentData.comments.map(
                                            (comment) => (
                                              <div
                                                key={comment.id}
                                                className="comment flex w-full justify-between "
                                              >
                                                <p>
                                                  from:{" "}
                                                  <strong>
                                                    {comment.fromUser.username}
                                                  </strong>{" "}
                                                  to{" "}
                                                  <strong>
                                                    {comment.toUser?.username ||
                                                      "N/A"}
                                                  </strong>
                                                  : {comment.comment}
                                                </p>
                                                <p
                                                  onClick={() =>
                                                    deletCommentHandler(
                                                      comment.id
                                                    )
                                                  }
                                                  className="text-red-500 cursor-pointer"
                                                >
                                                  <MdDelete></MdDelete>
                                                </p>
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div>
                                            <div className="comment "></div>
                                            <p>
                                              No comments yet for this task.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </Draggable>
                          )
                      )
                    ) : (
                      <p>No tasks available</p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      )}

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
