import React from 'react'
import {Routes,Route,BrowserRouter, Outlet} from 'react-router-dom'
import {routes} from '../src/Route'
import LoginPage from './Pages/LoginPage'
import DefaultLayout from './Layouts/DefaultLayout'
import RegistrationPage from './Pages/RegistrationPage'

const App = () => {
  const PrivateRoute=({children})=>{
   let token = localStorage.getItem('authToken')
   return (token?<Outlet></Outlet>:<LoginPage></LoginPage>)
  }

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage/>}></Route>
          <Route path='/register' element={<RegistrationPage/>}></Route>
          <Route element={<PrivateRoute></PrivateRoute>}>
              <Route path='*' element={<DefaultLayout></DefaultLayout>}>

           {
            routes.map((item,index)=>(
              <Route key={index} path={item.path} element={<item.component/>}/>
            ))
           }
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App