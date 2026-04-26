import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faFileAlt, faCalendar, faShieldHalved, faGavel, faPlus, faLock, faKey } from '@fortawesome/free-solid-svg-icons'

const formatCreated = (value) => {
    if (!value) return null
    try {
        return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
        return null
    }
}

const CommunitySidebar = ({ community, theme, user, onJoin, onLeave }) => {
    const isLight = theme === 'light'
    const [inviteInput, setInviteInput] = useState('')
    const [inviteError, setInviteError] = useState('')
    const [joining, setJoining] = useState(false)
    if (!community) return null
    const userId = user?.result?._id || user?._id
    const isMember = community.members?.some(m => (typeof m === 'string' ? m : m?._id) === userId)
    const isPrivate = Boolean(community.isPrivate)
    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const divider = isLight ? 'border-slate-200' : 'border-[#2a2a2a]'
    const createdLabel = formatCreated(community.createdAt)
    const bannerFallback = isLight ? 'bg-indigo-600' : 'bg-[#252530]'

    return (
        <div className="space-y-4 self-start lg:sticky lg:top-6">
            <div className={`${panelClass} overflow-hidden`}>
                <div className={`relative h-24 sm:h-28 border-b ${divider}`}>
                    {community.banner ? (
                        <img
                            src={community.banner}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className={`h-full w-full ${bannerFallback}`} aria-hidden />
                    )}
                </div>

                <div className="relative px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                    <div className="-mt-8 flex sm:-mt-9">
                        <div
                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 sm:h-16 sm:w-16
                                ${isLight ? 'border-white bg-white' : 'border-[#1a1a1a] bg-[#1a1a1a]'}`}
                        >
                            {community.icon ? (
                                <img src={community.icon} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span
                                    className={`flex h-full w-full items-center justify-center text-xl font-bold
                                        ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}
                                >
                                    {community.name?.[0]?.toUpperCase() ?? '?'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 min-w-0">
                        <h3 className={`text-lg font-semibold leading-tight sm:text-xl ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                            {community.name}
                        </h3>

                        {community.description && (
                            <p className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-500'}`}>
                                {community.description}
                            </p>
                        )}

                        {createdLabel && (
                            <p className={`mt-2 flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                <FontAwesomeIcon icon={faCalendar} className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Created {createdLabel}</span>
                            </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div
                                className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2
                                    ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#333] bg-[#222]'}`}
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'}`}>
                                    <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-base font-semibold tabular-nums leading-none ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                                        {community.memberCount || 0}
                                    </p>
                                    <p className={`mt-0.5 text-[10px] font-medium uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                        Members
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2
                                    ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#333] bg-[#222]'}`}
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'}`}>
                                    <FontAwesomeIcon icon={faFileAlt} className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-base font-semibold tabular-nums leading-none ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                                        {community.postCount || 0}
                                    </p>
                                    <p className={`mt-0.5 text-[10px] font-medium uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                        Posts
                                    </p>
                                </div>
                            </div>
                        </div>

                        {user && (
                            <div className="mt-3 flex flex-col gap-2">
                                {isPrivate && !isMember ? (
                                    <div className={`rounded-lg border p-3 ${isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-900/50 bg-amber-950/20'}`}>
                                        <div className={`flex items-center gap-2 text-xs font-semibold mb-2 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                                            <FontAwesomeIcon icon={faLock} className="h-3 w-3" />
                                            Private Community
                                        </div>
                                        <p className={`text-xs mb-2 ${isLight ? 'text-amber-700' : 'text-amber-400/80'}`}>
                                            Enter an invitation code to join.
                                        </p>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <FontAwesomeIcon icon={faKey} className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                                                <input
                                                    type="text"
                                                    value={inviteInput}
                                                    onChange={e => { setInviteInput(e.target.value); setInviteError('') }}
                                                    placeholder="Invite code"
                                                    className={`w-full pl-8 pr-2 py-2 rounded-md border text-sm ${isLight ? 'border-slate-200 bg-white text-slate-900 placeholder-slate-400' : 'border-[#333] bg-[#222] text-zinc-100 placeholder-zinc-600'}`}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                disabled={!inviteInput.trim() || joining}
                                                onClick={async () => {
                                                    setJoining(true)
                                                    setInviteError('')
                                                    try {
                                                        const result = await onJoin?.(community._id, inviteInput.trim())
                                                        if (result?.error) setInviteError(result.payload?.alert?.message || 'Invalid code')
                                                    } catch { setInviteError('Failed to join') }
                                                    setJoining(false)
                                                }}
                                                className={`min-h-[2.25rem] px-3 rounded-md text-sm font-medium whitespace-nowrap ${!inviteInput.trim() || joining ? 'opacity-50 cursor-not-allowed' : ''} ${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                                            >
                                                {joining ? 'Joining...' : 'Join'}
                                            </button>
                                        </div>
                                        {inviteError && <p className="mt-1.5 text-xs text-red-500 font-medium">{inviteError}</p>}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                                        <button
                                            type="button"
                                            onClick={() => (isMember ? onLeave?.(community._id) : onJoin?.(community._id))}
                                            className={
                                                isMember
                                                    ? (isLight
                                                        ? 'min-h-[2.5rem] flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                                                        : 'min-h-[2.5rem] flex-1 rounded-md border border-[#333] bg-[#222] px-3 text-sm font-medium text-zinc-300 hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400')
                                                    : (isLight
                                                        ? 'min-h-[2.5rem] flex-1 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700'
                                                        : 'min-h-[2.5rem] flex-1 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500')
                                            }
                                        >
                                            {isMember ? 'Leave' : 'Join community'}
                                        </button>
                                        {isMember && (
                                            <Link
                                                to={`/forum/c/${community.slug}/new-post`}
                                                className={`inline-flex min-h-[2.5rem] flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium sm:max-w-[10rem] sm:flex-none
                                                    ${isLight
                                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100'
                                                        : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:border-indigo-500/60 hover:bg-indigo-500/15'}`}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                                                New post
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {community.rules?.length > 0 && (
                <div className={panelClass}>
                    <div className={`border-b px-4 py-3 sm:px-5 ${divider}`}>
                        <h4 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'}`}>
                                <FontAwesomeIcon icon={faGavel} className="h-3 w-3" />
                            </span>
                            Community rules
                        </h4>
                    </div>
                    <ol className="list-none p-0">
                        {community.rules.map((rule, i) => (
                            <li
                                key={i}
                                className={`flex gap-3 border-b px-4 py-3 last:border-b-0 sm:px-5 ${divider} ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#222]'}`}
                            >
                                <span
                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums
                                        ${isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}
                                >
                                    {i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-medium leading-snug ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                                        {rule.title}
                                    </p>
                                    {rule.description && (
                                        <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                            {rule.description}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {community.moderators?.length > 0 && (
                <div className={panelClass}>
                    <div className={`border-b px-4 py-3 sm:px-5 ${divider}`}>
                        <h4 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'}`}>
                                <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                            </span>
                            Moderators
                        </h4>
                    </div>
                    <ul className="p-2 sm:p-3">
                        {community.moderators.map((mod, i) => (
                            <li key={mod._id || i}>
                                <Link
                                    to={`/user/${mod.username}`}
                                    className={`flex items-center gap-2.5 rounded-md px-2 py-2
                                        ${isLight ? 'hover:bg-slate-100' : 'hover:bg-[#222]'}`}
                                >
                                    {mod.avatar ? (
                                        <img
                                            src={mod.avatar}
                                            alt=""
                                            className={`h-8 w-8 rounded-full object-cover border
                                                ${isLight ? 'border-slate-200' : 'border-[#333]'}`}
                                        />
                                    ) : (
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold
                                                ${isLight
                                                    ? 'border-slate-200 bg-indigo-100 text-indigo-700'
                                                    : 'border-[#333] bg-indigo-500/20 text-indigo-300'}`}
                                        >
                                            {mod.username?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                    )}
                                    <span className={`min-w-0 flex-1 truncate text-sm font-medium ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>
                                        u/{mod.username}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default CommunitySidebar
