import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  MdModeEdit,
  MdEmail,
  MdOutlineSave,
  MdLock,
  MdPerson,
} from "react-icons/md";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
    }
  }
`;

const GET_USER = gql`
  query GetUser($id: Int!) {
    users(id: $id) {
      id
      username
      email
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $email: String!, $password: String) {
    updateUser(userId: $id, email: $email, password: $password) {
      success
      error
    }
  }
`;

const ProfilePage = () => {
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
  const [updateUser] = useMutation(UPDATE_USER);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
const navigate = useNavigate();
  // Fetch user data based on the ID from the me query
  const { loading, error, data, refetch } = useQuery(GET_USER, {
    skip: meLoading || !meData?.me?.id, // Ensure the query only runs if meData is available
    variables: { id: meData?.me?.id }, // Pass the ID from the me query
  });

  useEffect(() => {
    if (data?.users && data.users.length > 0) {
      const user = data.users[0];
      setFormData({
        email: user.email,
        password: "",
      });
    }
  }, [data]);

  if (meLoading || loading) return <Loader />;
  if (error)
    return (
      <p className="text-red-500">Error loading profile: {error.message}</p>
    );

  const handleEdit = () => setEditMode(true);

  const handleSave = () => {
    updateUser({
      variables: {
        id: data.users[0].id, // Access the first user's ID
        email: formData.email,
        password: formData.password || null,
      },
    })
      .then(() => {
        setEditMode(false);
        refetch(); // Refetch user data after saving
        Swal.fire("Success!", "Profile updated successfully!", "success");
        navigate("/");
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
      })
      .catch((error) => Swal.fire("Error!", error.message, "error"));
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-md">
      <motion.h2
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-orange-500 mb-4"
      >
        Profile
      </motion.h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex items-center gap-2">
          <MdPerson size={20} className="text-orange-500" />
          <p className="text-black">{data.users[0].username}</p>
        </div>

        <div className="flex items-center gap-2">
          <MdEmail size={20} className="text-orange-500" />
          {editMode ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-gray-300 rounded p-2 w-full"
            />
          ) : (
            <p>{data.users[0].email}</p>
          )}
        </div>

        {editMode && (
          <div className="flex items-center gap-2">
            <MdLock size={20} className="text-orange-500" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="New Password"
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
        )}

        <div className="flex gap-4 mt-4">
          {editMode ? (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded"
              >
                <MdOutlineSave /> Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded"
            >
              <MdModeEdit /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
