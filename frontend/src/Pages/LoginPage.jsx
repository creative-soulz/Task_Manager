import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';  
import bg from '../assets/bg.jpg';
import { Link } from 'react-router-dom';

const TOKEN_AUTH_MUTATION = gql`
  mutation tokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      success
      errors
      token
      user {
        id
        username
        role
      }
    }
  }
`;



const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(2, 'Username must be at least 2 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters'),
});

const LoginPage = () => {
  const navigate = useNavigate();  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

 
  const [tokenAuth, { loading, error }] = useMutation(TOKEN_AUTH_MUTATION, {
    onCompleted: (data) => {
      if (data.tokenAuth.token) {
        localStorage.setItem('authToken', data.tokenAuth.token);
        localStorage.setItem('role', data.tokenAuth.user.role);  
        // localStorage.setItem('userId',data.tokenAuth.user.id);
        navigate('/home');  
      }
    },
  });

  const onSubmit = (formData) => {
    tokenAuth({
      variables: { username: formData.username, password: formData.password },
    });
  };

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <img src={bg} className='h-full w-full object-cover absolute' alt="bg" />
      <div className='absolute bg-[#ffffff] rounded-md h-[80%] w-[95%] md:w-[60%] lg:w-[30%] shadow-2xl flex flex-col items-center justify-center p-6'>
        <h1 className='text-2xl font-bold mb-6'>Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className='w-full max-w-sm space-y-4'>
      
          <div className='flex flex-col'>
            <label className='mb-1'>Username</label>
            <input
              type='text'
              {...register('username')}
              className='border p-2 rounded-md focus:ring-2 outline-none ring-[#fe5e00]'
              placeholder='Enter your username'
            />
            {errors.username && (
              <p className='text-red-500 text-sm'>{errors.username.message}</p>
            )}
          </div>

          
          <div className='flex flex-col'>
            <label className='mb-1'>Password</label>
            <input
              type='password'
              {...register('password')}
              className='border p-2 rounded-md focus:ring-2 outline-none ring-[#fe5e00]'
              placeholder='Enter your password'
            />
            {errors.password && (
              <p className='text-red-500 text-sm'>{errors.password.message}</p>
            )}
          </div>

          
          {error && <p className="text-red-500 text-sm">Login failed. Please try again.</p>}

         
          <button
            type='submit'
            className='bg-[#fe5e00] hover:bg-[#fe5d00eb] text-white py-2 px-4 rounded-md w-full'
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}

          </button>
          <p>Don't have account{" "} <span className='text-orange-500'><Link to="/register">Register</Link></span></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
