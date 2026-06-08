import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearAlert } from '../../actions/forum'
import { clearAlert as clearCommunityAlert } from '../../actions/community'

const ForumToast = ({ theme }) => {
    const dispatch = useDispatch()
    const isLight = theme === 'light'
    const forumAlert = useSelector(s => s.forum.alert)
    const communityAlert = useSelector(s => s.community.alert)

    const alert = forumAlert?.message ? forumAlert : communityAlert?.message ? communityAlert : null
    const source = forumAlert?.message ? 'forum' : 'community'

    useEffect(() => {
        if (!alert) return
        const timer = setTimeout(() => {
            if (source === 'forum') dispatch(clearAlert())
            else dispatch(clearCommunityAlert())
        }, 4000)
        return () => clearTimeout(timer)
    }, [alert, source, dispatch])

    if (!alert) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 max-w-sm">
            <div className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
                alert.variant === 'success'
                    ? (isLight ? 'bg-white border-emerald-200 text-emerald-700 shadow-emerald-100' : 'bg-[#1a1a1a] border-emerald-800/40 text-emerald-400')
                    : alert.variant === 'danger'
                        ? (isLight ? 'bg-white border-red-200 text-red-700 shadow-red-100' : 'bg-[#1a1a1a] border-red-800/40 text-red-400')
                        : (isLight ? 'bg-white border-slate-200 text-slate-700 shadow-slate-100' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300')
            }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.variant === 'success' ? 'bg-emerald-500' : alert.variant === 'danger' ? 'bg-red-500' : 'bg-slate-400'
                }`} />
                {alert.message}
            </div>
        </div>
    )
}

export default ForumToast
