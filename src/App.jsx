import React, { useEffect, useState } from 'react'
import { Custom, Projects, Home, Games, Login, NewLogin, CreateAccount, ForgotPassword, NotFound, Portfolio, Blogs, BlogsSingle, Store, ProjectsSingle, Archive, ArchiveDirectory, GamesSingle, VideosSingle, Verify, VideoTag, GameTag } from './components/index'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AccountNavbar, Overview, AccountPortfolio, AccountStore, Uploads, Settings, Manage, Logs } from './components/Account Section/index'
import { AdminOverview, AdminPortfolio, AdminUploads, AdminSettings, AdminLogs, AdminManage, AdminProjects, AdminVideos } from './components/Admin/index';
import { useDispatch, useSelector } from 'react-redux'
import { ProjectSingle } from './components/Portfolio Section/index';
import { getProfile, userToken } from './actions/settings';
import { v4 as uuidv4 } from 'uuid';
import { main, dark, light } from "./style";

import Cookies from 'universal-cookie';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Anime from './components/Pages/Anime';
import Hanime from './components/Pages/Hanime';
import Watch from './components/Pages/Watch';
import AnimeWatch from './components/Pages/AnimeWatch';

import Navbar from './components/Custom/Navbar';
import Footer from './components/Custom/Footer';

import Account from './components/Pages/Account';
import Profile from './components/Pages/Profile';

import Documentation from './components/Pages/Documentation';
import SiteDocs from './components/Pages/SiteDocs';
import Budget from './components/Pages/Budget';
import PortfolioBuilder from './components/Pages/PortfolioBuilder';
import PortfolioView from './components/Pages/PortfolioView';
import ProjectView from './components/Pages/ProjectView';
import ChatWidget from './components/Custom/ChatWidget'
import GameManager from './components/Pages/GameManager';
import GamesPage from './components/Pages/GamesPage';
import ProjectManager from './components/Pages/ProjectManager';
import PagesList from './components/Pages/PageBuilder/PagesList';
import PageBuilder from './components/Pages/PageBuilder/PageBuilder';
import PageRenderer from './components/Pages/PageBuilder/PageRenderer';

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
        // dispatch(getProfile({id: user.result?._id}))
        // dispatch(userToken({username: user.result?.username}))
      }

      if(window.location.pathname.includes('/account') && !user){
        window.location.href = "/"
      }
  }, [user])

  // useEffect(() => {
  //     localStorage.setItem('avatar', settings.avatar ? JSON.stringify(settings.avatar) : '');
  // }, [settings])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'disabled'}>
    <div data-theme={theme === 'light' ? 'light' : 'dark'} className={`w-full ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} text-sm`}>
        <BrowserRouter>
            <Routes>
                <Route path="custom" element={<Custom user={user} path={URI_PATH_HOME}/>} />

                <Route path='/' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /> <Outlet/> {user && <ChatWidget theme={theme} />}</>}>
                    <Route index element={<><Home user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/anime' element={<><Anime user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/hanime' element={<><Hanime user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/anime/watch/:id' element={<><AnimeWatch user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/watch/:id' element={<><Watch user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path={`*`} element={<> <NotFound theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/sites' element={<><SiteDocs user={user} theme={theme}/></>} />
                    <Route path='/budget' element={<><Budget user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/portfolio' element={<><PortfolioBuilder user={user} theme={theme}/></>} />
                    <Route path='/games' element={<><GamesPage user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/games/search/:key' element={<><GamesPage user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/games/developer/:developer' element={<><GamesPage user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/games/:id' element={<><GamesSingle user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/games/manage' element={<><GameManager user={user} theme={theme}/></>} />
                    <Route path='/projects' element={<><Projects user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/projects/search/:key' element={<><Projects user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/projects/category/:cat' element={<><Projects user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/projects/:id' element={<><ProjectsSingle user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/projects/manage' element={<><ProjectManager user={user} theme={theme}/></>} />
                    <Route path='/pages' element={<><PagesList user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/page/:slug' element={<><PageRenderer theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/documentation/:category' element={<><Documentation user={user} theme={theme}/></>} />
                    <Route path='/documentation/:category/:page' element={<><Documentation user={user} theme={theme}/></>} />
                    <Route path='/documentation/:category/:page/:subpage' element={<><Documentation user={user} theme={theme}/></>} />
                </Route>

                    <Route path='/user/:username' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /><Profile theme={theme} /><Footer theme={theme} />{user && <ChatWidget theme={theme} />}</>} />
                    <Route path='/user/:username/:tab' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /><Profile theme={theme} /><Footer theme={theme} />{user && <ChatWidget theme={theme} />}</>} />

                    <Route path='/:username/portfolio' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /><PortfolioView theme={theme} /><Footer theme={theme} />{user && <ChatWidget theme={theme} />}</>} />
                    <Route path='/:username/project/:project_name' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /><ProjectView theme={theme} /><Footer theme={theme} />{user && <ChatWidget theme={theme} />}</>} />

                    <Route path='/account' element={<><Navbar path={URI_PATH_HOME} theme={theme} setTheme={setTheme} /> <Outlet/> {user && <ChatWidget theme={theme} />}</>}>
                    <Route index element={<><Account user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/account/:page' element={<><Account user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/account/profile/:subpage' element={<><Account user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/account/videos/:subpage' element={<><Account user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path='/account/globallist/:subpage' element={<><Account user={user} theme={theme}/> <Footer theme={theme} /></>} />
                    <Route path={`*`} element={<> <NotFound theme={theme}/> <Footer theme={theme} /></>} />
                </Route>

                <Route path='/pages/builder' element={<PageBuilder user={user} theme={theme}/>} />

                <Route path="account_verify" element={<><Verify /></>} />

                <Route path={`/login`} element={<NewLogin/>}/>
                <Route path={`/register`} element={<CreateAccount path={URI_PATH_HOME} setUser={setUser} />} />
                <Route path={`/forgot_password`} element={<ForgotPassword path={URI_PATH_HOME} setUser={setUser} />} />
                <Route path={`*`} element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
    </div>
    </GoogleOAuthProvider>
  )
}

export default App