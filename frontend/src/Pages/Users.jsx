import React, { useState } from "react";
import { useQuery, gql,useMutation } from "@apollo/client";
import Swal from "sweetalert2";
import { MdModeEdit, MdDelete } from "react-icons/md";
import Loader from "../components/Loader";
import UserModel from "../components/UserModel";
import {motion} from 'framer-motion'


const GET_USERS = gql`
query GetUsers {
  users {
    id
    username
      email
      role
      }
  }
  `;

const DELETE_USER = gql`
  mutation deleteUser($userId: Int!) {
    deleteUser(userId: $userId) {
      success
      error
    }
  }
`;

const Users = () => {
  const { loading, error, data,refetch } = useQuery(GET_USERS);
  const [openUserModel, setOpenUserModel] = useState(false);
  const [selectedUser,setSelectedUser] = useState('')

   const [deleteUser] = useMutation(DELETE_USER, {
     onCompleted: () => refetch(),
   });


  // Handle edit button click
  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenUserModel(true)
  };

  // Handle delete button click
  const handleDelete = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the user permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#F97316", // Custom orange color for confirmation button
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser({variables:{userId}}).then(()=>{
        Swal.fire("Deleted!", "User has been deleted.", "success");
        }).catch((error) => {
            Swal.fire(
              "Error!",
              `There was an error deleting user: ${error.message}`,
              "error"
            );
          });
      }
    });
  };

  if (loading) return <p className="text-orange-500"><Loader/></p>;
  if (error)
    return <p className="text-red-500">Error loading users: {error.message}</p>;

  return (
    <div className="p-6 bg-[rgb(255,212,181)] my-2 rounded">
      <div className="flex bg-white rounded-lg border  shadow px-4    py-6 md:py-9  items-center justify-center lg:justify-between gap-3 flex-col md:flex-row md:items-start md:justify-start lg:flex-row">
        <h2
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold  text-orange-500 mb-4"
        >
          Users
        </h2>
        <button
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setOpenUserModel(!openUserModel)}
          className="bg-[#fe5e00] lg:w-56 font-bold text-white py-2 px-4 rounded"
        >
          Create User
        </button>
        {openUserModel && (
          <UserModel
            refetch={refetch}
            setOpenUserModel={(value) => {
              setOpenUserModel(value);
              if (!value) setSelectedUser(null);
            }}
            user={selectedUser}
            openUserModel={openUserModel}
            // setOpenUserModel={setOpenUserModel}
          />
        )}
      </div>
      <div className="min-w-screen overflow-x-auto">
      <motion.table
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full  rounded-t mt-3 text-left"
      >
        <thead>
          <tr className="bg-orange-500  text-white">
            <th className="p-4 rounded-tl-lg border-orange-500">Name</th>
            <th className="p-4 border-orange-500">Email</th>
            <th className="p-4  border-orange-500">Role</th>
            <th className="p-4  rounded-tr-lg border-orange-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user.id} className="bg-white">
              <td className="p-4 border border-orange-500">{user.username}</td>
              <td className="p-4 border border-orange-500">{user.email}</td>
              <td className="p-4 border border-orange-500">{user.role}</td>
              <td className="p-4 border border-orange-500">
                <button
                  className="text-orange-500 hover:text-orange-700 mr-2"
                  onClick={() => handleEdit(user)}
                >
                  <MdModeEdit size={20} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(user.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table></div>
    </div>
  );
};

export default Users;
