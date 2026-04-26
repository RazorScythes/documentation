import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { joinCommunityByCode } from '../../../actions/community'

const ForumInvite = ({ user, theme }) => {
    const { code } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isLight = theme === 'light'

    const [status, setStatus] = useState('loading')
    const [error, setError] = useState('')
    const [communitySlug, setCommunitySlug] = useState('')

    const userId = user?.result?._id || user?._id

    useEffect(() => {
        if (!code || !userId) {
            setStatus('error')
            setError(userId ? 'Invalid invite link' : 'You need to sign in first')
            return
        }

        let mounted = true
        const join = async () => {
            const result = await dispatch(joinCommunityByCode(code))
            if (!mounted) return
            if (joinCommunityByCode.rejected.match(result)) {
                setStatus('error')
                setError(result.payload?.alert?.message || 'Invalid or expired invite code')
            } else {
                const slug = result.payload?.data?.result?.slug
                if (slug) {
                    setCommunitySlug(slug)
                    setStatus('success')
                    setTimeout(() => navigate(`/forum/c/${slug}`, { replace: true }), 1500)
                } else {
                    setStatus('error')
                    setError('Could not resolve community')
                }
            }
        }
        join()
        return () => { mounted = false }
    }, [code, userId, dispatch, navigate])

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`

    return (
        <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-20">
            <div className={`${panelClass} text-center py-12 px-6`}>
                {status === 'loading' && (
                    <>
                        <FontAwesomeIcon icon={faSpinner} className={`h-8 w-8 animate-spin mb-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                        <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>Joining community...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <FontAwesomeIcon icon={faCheckCircle} className="h-10 w-10 text-emerald-500 mb-4" />
                        <p className={`text-sm font-medium mb-2 ${isLight ? 'text-slate-800' : 'text-zinc-100'}`}>Joined successfully!</p>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Redirecting to the community...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <FontAwesomeIcon icon={faExclamationTriangle} className={`h-8 w-8 mb-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                        <p className={`text-sm font-medium mb-2 ${isLight ? 'text-slate-800' : 'text-zinc-100'}`}>{error}</p>
                        {!userId ? (
                            <Link to="/login" className={`inline-block mt-2 text-sm font-medium ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}>
                                Sign in
                            </Link>
                        ) : (
                            <Link to="/forum" className={`inline-block mt-2 text-sm font-medium ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}>
                                Go to Forum
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ForumInvite
