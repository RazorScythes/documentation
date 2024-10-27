import React, { useEffect, useState } from 'react'
import { Custom, Projects, Home, Games, Login, NewLogin, CreateAccount, ForgotPassword, NotFound, Portfolio, Blogs, BlogsSingle, Store, ProjectsSingle, Archive, ArchiveDirectory, GamesSingle, Videos, VideosSingle, Verify, VideoTag, GameTag } from './components/index'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AccountNavbar, Overview, AccountPortfolio, AccountStore, Uploads, Settings, Manage, Logs } from './components/Account Section/index'
import { AdminOverview, AdminPortfolio, AdminUploads, AdminSettings, AdminLogs, AdminManage, AdminProjects, AdminVideos } from './components/Admin/index';
import { useDispatch, useSelector } from 'react-redux'
import { ProjectSingle } from './components/Portfolio Section/index';
import { getProfile, userToken } from './actions/settings';
import { v4 as uuidv4 } from 'uuid';
import { main, dark, light } from "./style";

import Cookies from 'universal-cookie';

import Navbar from './components/Custom/Navbar';
import Footer from './components/Custom/Footer';

const URI_PATH_HOME = import.meta.env.VITE_URI_PATH_HOME

const App = () => {
  const cookies = new Cookies();

  const dispatch = useDispatch()

  const settings = useSelector((state) => state.settings.data)
  const userData = JSON.parse(localStorage.getItem('profile'))
  const [user, setUser] = useState(userData? userData : null)
  const [theme, setTheme] = useState(localStorage.getItem('theme'))
  
  useEffect(() => {
    if(!cookies.get("uid")) {
      const newDeviceId = uuidv4();
      cookies.set('uid', newDeviceId, { path: '/', maxAge: new Date(Date.now()+34560000) });
    }
  }, [])

  useEffect(() => {
      if(user) {
        dispatch(getProfile({id: user.result?._id}))
        dispatch(userToken({username: user.result?.username}))
      }

      if(window.location.pathname.includes('/account') && !user){
        window.location.href = "/"
      }
  }, [user])

  useEffect(() => {
      localStorage.setItem('avatar', settings.avatar ? JSON.stringify(settings.avatar) : '');
  }, [settings])

  return (
    <div className={`w-full ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} text-sm`}>
        <BrowserRouter>
            <Routes>
                <Route path="custom" element={<Custom user={user} path={URI_PATH_HOME}/>} />

                <Route path='/' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /> <Outlet/></>}>
                    <Route index element={<><Home user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path={`*`} element={<> <NotFound theme={theme}/> <Footer theme={theme} /></>} />
                </Route>

                <Route path="account_verify" element={<><Verify /></>} />

                <Route path={`/login`} element={<NewLogin/>}/>
                <Route path={`/register`} element={<CreateAccount path={URI_PATH_HOME} setUser={setUser} />} />
                <Route path={`/forgot_password`} element={<ForgotPassword path={URI_PATH_HOME} setUser={setUser} />} />
                <Route path={`*`} element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App