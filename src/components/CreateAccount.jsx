import React, { useState, useEffect } from 'react'

import { Link, useNavigate  } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import heroBackgroundImage from '../assets/hero-bg.jpg';

const CreateAccount = ({ path, setUser }) => {

    const navigate  = useNavigate()
    const dispatch = useDispatch()

    const auth = useSelector((state) => state.auth)
    const user = JSON.parse(localStorage.getItem('profile'))

    const [form, setForm] = useState({
        username: '',
        password: ''
    })

    useEffect(() => {
        document.title = "Login"
        if(!user) return

        setUser(user)
        navigate(`${path}/`)
    }, [user])

    const handleSubmit = () => {
        return true
    }

    return (
        <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            {
                !user &&
                <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
                    <div className="flex flex-col overflow-y-auto sm:flex-row">
                        <div className="h-48 sm:h-auto sm:w-1/2">
                            <img
                            aria-hidden="true"
                            className="object-cover w-full h-full dark:hidden"
                            src={heroBackgroundImage}
                            alt="Image"
                            />
                            <img
                            aria-hidden="true"
                            className="hidden object-cover w-full h-full dark:block"
                            src={heroBackgroundImage}
                            alt="Image"
                            />
                        </div>
                        <div className="flex items-center justify-center p-6 sm:p-12 sm:w-1/2">
                            <div className="w-full">
                                <h1 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
                                    Create Account
                                </h1>
                                {
                                    auth.error && <span className="text-red-600 font-semibold text-sm">Invalid Credentials</span>
                                }
                                <form onSubmit={handleSubmit}>
                                    <label for="website-admin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-2">Username</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                            </svg>
                                        </span>
                                        <input 
                                            type="text" 
                                            id="username"
                                            name="username"
                                            autoComplete="username"
                                            className="focus:outline-none rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                            placeholder="Enter Username"
                                        />
                                    </div>
                                    <label for="website-admin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-2">Email</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                                            </svg>
                                        </span>
                                        <input 
                                            type="email" 
                                            id="email"
                                            name="email"
                                            autoComplete="email"
                                            className="focus:outline-none rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                            placeholder="Enter Email"
                                        />
                                    </div>
                                    <label for="website-admin" className="block my-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-key" viewBox="0 0 16 16">
                                                <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z"/>
                                                <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                            </svg>
                                        </span>
                                        <input 
                                            id="password"
                                            name="password"
                                            type="password" 
                                            autoComplete="current-password"
                                            className="focus:outline-none rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                            placeholder="Enter Password"
                                        />
                                    </div>
                                    <label for="website-admin" className="block my-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                            </svg>
                                        </span>
                                        <input 
                                            id="confirm_password"
                                            name="confirm_password"
                                            type="password" 
                                            autoComplete="current-password"
                                            className="focus:outline-none rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="block w-full px-4 py-2 mt-4 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                                    >
                                        Create Account
                                    </button>
                                </form>
                                <hr className="my-8" />

                                <button
                                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-blue-700 transition-colors duration-150 border border-blue-300 rounded-lg dark:text-blue-400 active:bg-transparent hover:border-blue-500 focus:border-blue-500 active:text-blue-500 focus:outline-none focus:shadow-outline-blue"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google mr-2" viewBox="0 0 16 16">
                                        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                                    </svg>
                                    Google
                                </button>

                                <p className="mt-4">
                                <Link
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    to="/login"
                                >
                                    Already have an account? Login
                                </Link>
                                </p>
                            </div>
                        </div>
                    </div>  
                </div>
            }
        </div>
    )
}

export default CreateAccount