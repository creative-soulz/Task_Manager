import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const CREATE_USER_MUTATION = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $role: String!
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
      role: $role
    ) {
      success
      error
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser(
    $id: Int!
    $username: String!
    $email: String!
    $role: String!
  ) {
    updateUser(userId: $id, username: $username, email: $email, role: $role) {
      success
      error
    }
  }
`;

const UserModel = ({ openUserModel, setOpenUserModel, refetch, user }) => {
  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    // password: Yup.string()
    // .required("Password is required")
    // .min(5, "Password must be at least 5 characters")

    // ,
    // role: Yup.string()
    //   .oneOf(["normal", "admin"], "Role is required")
      // .required(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [createUser, { loading: createLoading, error: createError }] =
    useMutation(CREATE_USER_MUTATION);
  const [updateUser, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_USER_MUTATION);

  useEffect(() => {
    if (user) {
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("role", user.role.toLowerCase());
    }
  }, [user, setValue]);
  
  const onSubmit = async (formData) => {
    
    try {
      let response;
      if (user) {
        response = await updateUser({
          variables: {
            id: user.id,
            username: formData.username,
            email: formData.email,
            role: formData.role,
          },
        });
      } else {
        response = await createUser({
          variables: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          },
        });
      }

      if (
        response.data.createUser?.success ||
        response.data.updateUser?.success
      ) {
        Swal.fire(
          "Success!",
          user ? "User updated successfully" : "User created successfully",
          "success"
        );
        setOpenUserModel(false);
        refetch();
      } else {
        throw new Error(
          response.data.createUser?.error || response.data.updateUser?.error
        );
      }
    } catch (error) {
      Swal.fire("Error!", `There was an issue: ${error.message}`, "error");
    }
  };

  return (
    <div className="fixed h-screen w-screen text-black bg-black bg-opacity-50 top-0 flex items-center justify-center left-0 z-10 transition-all">
      <motion.div
        initial={{ opacity: 0, y: -200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.1, delay: 0.3 },
          y: { duration: 0.1, delay: -0.3 },
        }}
        className="bg-white p-5 rounded h-[90%] lg:h-[70%] md:w-[60%] md:h-[60%] w-[97%] lg:w-[30%] shadow-lg"
      >
        <h1 className="font-bold text-center text-xl">
          {user ? "UPDATE USER" : "ADD USER"}
        </h1>
        <div
          onClick={() => setOpenUserModel(false)}
          className="bg-orange-500 flex text-white text-3xl cursor-pointer items-center justify-center absolute top-3 right-3 rounded w-8 h-8"
        >
          <IoClose />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="w-1/4 text-black text-right pr-4">Username</label>
            <input
              type="text"
              {...register("username")}
              className="border w-2/3 p-2 rounded-md"
            />
          </div>
          {errors.username && (
            <p className="text-red-500">{errors.username.message}</p>
          )}

          <div className="flex items-center justify-between">
            <label className="w-1/4 text-right pr-4">Email</label>
            <input
              type="email"
              {...register("email")}
              className="border w-2/3 p-2 rounded-md"
            />
          </div>
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          {!user && (
            <>
              <div className="flex items-center justify-between">
                <label className="w-1/4 text-right pr-4">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  className="border w-2/3 p-2 rounded-md"
                />
              </div>
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </>
          )}

          <div className="flex items-center justify-between">
            <label className="w-1/4 text-right pr-4">Role</label>
            <select
              {...register("role")}
              className="border w-2/3 p-2 rounded-md"
              defaultValue={user?.role || "normal"}
            >
              <option value="normal">Normal</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {errors.role && <p className="text-red-500">{errors.role.message}</p>}

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 w-full text-white py-2 px-4 rounded-md"
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading
              ? user
                ? "Updating user..."
                : "Creating user..."
              : user
              ? "Update User"
              : "Create User"}
          </button>
        </form>

        {(createError || updateError) && (
          <p className="text-red-500">
            Failed to {user ? "update" : "create"} user:{" "}
            {createError?.message || updateError?.message}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default UserModel;
