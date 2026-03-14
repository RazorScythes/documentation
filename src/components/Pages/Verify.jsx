import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../../actions/settings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faClock, faSpinner } from '@fortawesome/free-solid-svg-icons'

const Verify = () => {
    const dispatch = useDispatch()
    const status = useSelector((state) => state.settings.verification_status)
    const [searchParams] = useSearchParams()

    useEffect(() => {
        dispatch(verifyEmail({ token: searchParams.get('token') }))
    }, [])

    const config = {
        activated: {
            icon: faCircleCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            title: 'Email Verified!',
            message: 'Your account has been successfully verified.',
            linkText: 'Go to Login',
            linkHref: '/login'
        },
        verified: {
            icon: faCircleCheck,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            title: 'Already Verified',
            message: 'This account is already verified.',
            linkText: 'Go to Home',
            linkHref: '/'
        },
        expired: {
            icon: faClock,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            title: 'Token Expired',
            message: 'This verification link has expired. Please request a new one from your settings.',
            linkText: 'Go to Home',
            linkHref: '/'
        },
        notFound: {
            icon: faCircleXmark,
            color: 'text-red-500',
            bg: 'bg-red-50',
            title: 'Invalid Token',
            message: 'This verification link is invalid or has already been used.',
            linkText: 'Go to Home',
            linkHref: '/'
        }
    }

    const current = config[status]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
                {!status ? (
                    <>
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon icon={faSpinner} className="text-blue-500 text-xl animate-spin" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Verifying...</h2>
                        <p className="text-sm text-slate-500">Please wait while we verify your email.</p>
                    </>
                ) : current ? (
                    <>
                        <div className={`w-14 h-14 rounded-full ${current.bg} flex items-center justify-center mx-auto mb-4`}>
                            <FontAwesomeIcon icon={current.icon} className={`${current.color} text-2xl`} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">{current.title}</h2>
                        <p className="text-sm text-slate-500 mb-5">{current.message}</p>
                        <a
                            href={current.linkHref}
                            className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {current.linkText}
                        </a>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-2xl" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Something went wrong</h2>
                        <p className="text-sm text-slate-500 mb-5">An unexpected error occurred.</p>
                        <a href="/" className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            Go to Home
                        </a>
                    </>
                )}
            </div>
        </div>
    )
}

export default Verify
