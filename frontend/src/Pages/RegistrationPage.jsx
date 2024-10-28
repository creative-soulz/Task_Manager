import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpg";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const CREATE_USER_MUTATION = gql`
  mutation createUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      
        username
       success
       error
     
    }
  }
`;

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters"),
  email: Yup.string().required("Email is required").email("Email is invalid"),
  password: Yup.string()
    .required("Password is required")
    .min(5, "Password must be at least 5 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const RegistrationPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [createUser, { loading, error }] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: (data) => {
      if (data.createUser.success) {
        Swal.fire("Success!", "User created successfully!", "success");
        navigate("/login");
      }else{
        Swal.fire("Error!", data.createUser.error, "error");
      }
      
    },
  });

  const onSubmit = (formData) => {
    createUser({
      variables: {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      },
    });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <img src={bg} className="h-full w-full object-cover absolute" alt="bg" />
      <div className="absolute bg-[#ffffff] rounded-md h-[80%] w-[95%] md:w-[60%] lg:w-[30%] shadow-2xl flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4"
        >
          {/* Username */}
          <div className="flex flex-col">
            <label className="mb-1">Username</label>
            <input
              type="text"
              {...register("username")}
              className="border p-2 rounded-md focus:ring-2 outline-none ring-[#fe5e00]"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className="border p-2 rounded-md focus:ring-2 outline-none ring-[#fe5e00]"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              className="border p-2 rounded-md focus:ring-2 outline-none ring-[#fe5e00]"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="mb-1">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="border p-2 rounded-md focus:ring-2 outline-none ring-[#fe5e00]"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">
              Registration failed. Please try again.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-[#fe5e00] hover:bg-[#fe5d00eb] text-white py-2 px-4 rounded-md w-full"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <p>
            Already have account{" "}
            <span className="text-orange-500">
              <Link to="/">Login</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
