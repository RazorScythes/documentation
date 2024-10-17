import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from "react-router-dom";
import { verifyEmail } from '../../actions/settings';

const Verify = () => {
    const dispatch = useDispatch()

    const production = import.meta.env.VITE_DEVELOPMENT == "false"
    const status = useSelector((state) => state.settings.verification_status)
    console.log(status)
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        dispatch(verifyEmail({token: searchParams.get('token')}))
    }, [])
    
    return (
        <div className='w-screen bg-white pt-12'>
            {
                status &&
                    status === 'activated' ? 
                        <div className='flex items-center flex-col justify-center sm:w-3/6 w-full h-32 text-center mx-auto border-2 border-dashed border-gray-400'>
                            <h3 className='font-semibold text-2xl mb-4'>Your Account is now Verified!</h3>
                            <p><a className="text-[#CD3242] hover:underline font-semibold" href={`${!production ? 'http://localhost:5173/' : 'https://main-website-sage.vercel.app/' }login`}>Click Here</a> to login</p>
                        </div>
                        :
                    status === 'expired' ?
                        <div className='flex items-center flex-col justify-center sm:w-3/6 w-full h-32 text-center mx-auto border-2 border-dashed border-gray-400'>
                            <h3 className='font-semibold text-2xl mb-4'>This token has expired</h3>
                            <p><a className="text-[#CD3242] hover:underline font-semibold" href={`${!production ? 'http://localhost:5173/' : 'https://main-website-sage.vercel.app/' }`}>Click Here</a> to go home</p>
                        </div>
                        :
                    status === 'notFound' ?
                        <div className='flex items-center flex-col justify-center sm:w-3/6 w-full h-32 text-center mx-auto border-2 border-dashed border-gray-400'>
                            <h3 className='font-semibold text-2xl mb-4'>Invalid token</h3>
                            <p><a className="text-[#CD3242] hover:underline font-semibold" href={`${!production ? 'http://localhost:5173/' : 'https://main-website-sage.vercel.app/' }`}>Click Here</a> to go home</p>
                        </div>
                        :
                    status === 'verified' ?
                        <div className='flex items-center flex-col justify-center sm:w-3/6 w-full h-32 text-center mx-auto border-2 border-dashed border-gray-400'>
                            <h3 className='font-semibold text-2xl mb-4'>This account is already verified</h3>
                            <p><a className="text-[#CD3242] hover:underline font-semibold" href={`${!production ? 'http://localhost:5173/' : 'https://main-website-sage.vercel.app/' }`}>Click Here</a> to go home</p>
                        </div>
                        :
                        <div className='flex items-center flex-col justify-center sm:w-3/6 w-full h-32 text-center mx-auto border-2 border-dashed border-gray-400'>
                            <h3 className='font-semibold text-2xl mb-4'>Getting Token Information</h3>
                            <p>Please wait...</p>
                        </div>
            }
        </div>
  )
}

export default Verify