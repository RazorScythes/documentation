import React, { useState, useEffect } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from "../actions/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { encryptData, decryptData } from './Tools';
import heroBackgroundImage from '../assets/hero-bg-old.jpg';

const NewLogin = ({ }) => {
    const navigate  = useNavigate()
    const dispatch = useDispatch()

    const auth = useSelector((state) => state.auth)
    const user = JSON.parse(localStorage.getItem('profile'))

    const [submitted, setSubmitted] = useState(false)
    const [save, setSave] = useState(false);
    const [form, setForm] = useState({
        username: '',
        password: ''
    })

    useEffect(() => {
        document.title = "Login"

        const initialize = async () => {
            if(localStorage.getItem('credentials') && !user) {
                const decrypt = await decryptData(localStorage.getItem('credentials'));
                const parse = JSON.parse(decrypt);

                setForm({
                    username: parse?.username ?? '',
                    password: parse?.password ?? ''
                })
                setSave(parse?.save ?? false)
            }

            if(!user) return 
     
            if(save) {
                if(form.username && form.password) {
                    const encrypt = await encryptData(JSON.stringify({ username: form.username, password: form.password, save: save }))
                    localStorage.setItem('credentials', encrypt)
                }
            }
            else {
                localStorage.removeItem('credentials')
            }

            navigate(`/`)
        }

        initialize()
    }, [user, localStorage.getItem('credentials')])

    useEffect(() => {
        if(auth.error) {
            setSubmitted(false)
        }
    }, [auth])

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!submitted) {
            dispatch(login(form))
            console.log(save)
            setSubmitted(true)
        }
    };

    return (
        <div className="font-roboto flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            {
                !user &&
                <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
                    <div className="flex flex-col overflow-y-auto sm:flex-row">
                        <div className="h-48 sm:h-auto sm:w-1/2 relative">
                            <div className="absolute inset-0 bg-black opacity-30"></div>
                            <img
                                aria-hidden="true"
                                className="object-cover w-full h-full dark:hidden"
                                src={heroBackgroundImage}
                                alt="Image"
                            />
                        </div>
                        <div className="flex items-center justify-center p-6 sm:p-12 sm:w-1/2">
                            <div className="w-full">
                                <h1 className="mb-4 text-2xl font-semibold tracking-wide text-blue-700 dark:text-blue-200">
                                    Login
                                </h1>
                                {
                                    auth.error && <span className="text-red-500 font-semibold text-sm">Unknown username or password</span>
                                }
                                <form onSubmit={handleSubmit}>
                                    <label for="website-admin" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white mt-2">Username:</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-blue-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <FontAwesomeIcon icon={faUserCircle} className='text-blue-700'/>
                                        </span>
                                        <input 
                                            type="text" 
                                            id="username"
                                            name="username"
                                            autoComplete="username"
                                            value={form.username}
                                            onChange={(e) => setForm({...form, username: e.target.value})}
                                            required
                                            className="outline-none rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5" 
                                            placeholder="Enter Username"
                                        />
                                    </div>
                                    <label for="website-admin" className="block mt-4 mb-1 text-sm font-medium text-gray-900 dark:text-white">Password:</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-blue-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <FontAwesomeIcon icon={faKey} className='text-blue-700'/>
                                        </span>
                                        <input 
                                            id="password"
                                            name="password"
                                            type="password" 
                                            autoComplete="current-password"
                                            value={form.password}
                                            onChange={(e) => setForm({...form, password: e.target.value})}
                                            required
                                            className="outline-none transition-all rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5" 
                                            placeholder="Enter Password"
                                        />
                                    </div>
                                    <div class="flex items-center my-4">
                                        <input 
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox" 
                                            checked={save}
                                            onChange={(e) => setSave(e.target.checked)}
                                            className="outline-none w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                            />
                                        <label for="remember-me" class="ml-2 mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-300">Remember Me</label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="block w-full px-4 py-2 mt-4 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                                    >
                                        { 
                                            !submitted ? 'Login' : 
                                            <div className='flex flex-row justify-center items-center'>
                                                Loading
                                                <div role="status">
                                                    <svg aria-hidden="true" class="w-4 h-4 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                    </svg>
                                                    <span class="sr-only">Loading...</span>
                                                </div>
                                            </div>  
                                        }
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
                                    to="/forgot_password"
                                >
                                    Forgot your password?
                                </Link>
                                </p>
                                <p className="mt-1">
                                <Link
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    to="/register"
                                >
                                    Create account
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

export default NewLogin