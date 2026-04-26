import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faFileAlt, faLock } from '@fortawesome/free-solid-svg-icons'

const CommunityCard = ({ community, theme, user, onJoin, onLeave }) => {
    const isLight = theme === 'light'
    const userId = user?.result?._id || user?._id
    const isMember = community.members?.some(m => (typeof m === 'string' ? m : m?._id) === userId)
    const initial = community.name?.[0]?.toUpperCase() || '?'
    const hasBanner = Boolean(community.banner)

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const fallbackBanner = isLight ? 'bg-indigo-600' : 'bg-[#252530]'

    return (
        <div
            className={`${panelClass} overflow-hidden transition-shadow hover:shadow-md`}
        >
            <div className={`relative h-20 w-full overflow-hidden border-b ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                {hasBanner ? (
                    <img src={community.banner} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div
                        className={`flex h-full w-full items-center justify-center ${fallbackBanner}`}
                        aria-hidden
                    >
                        <span className="select-none text-4xl font-bold text-white/20">
                            {initial}
                        </span>
                    </div>
                )}
            </div>

            <div className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
                <div className="-mt-6 mb-2 flex">
                    <div
                        className={`z-[1] flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2
                            ${isLight ? 'border-white bg-white' : 'border-[#1a1a1a] bg-[#1a1a1a]'}`}
                    >
                        {community.icon ? (
                            <img src={community.icon} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className={`text-lg font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                {initial}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link to={`/forum/c/${community.slug}`} className="block outline-none min-w-0 flex-1">
                        <h3
                            className={`line-clamp-1 text-[15px] font-semibold tracking-tight
                                ${isLight ? 'text-slate-900 hover:text-indigo-600' : 'text-zinc-100 hover:text-indigo-400'}`}
                        >
                            {community.name}
                        </h3>
                    </Link>
                    {community.isPrivate && (
                        <span className={`inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isLight ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'}`}>
                            <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5" />
                            Private
                        </span>
                    )}
                </div>

                {community.description && (
                    <p className={`mt-1 line-clamp-2 text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        {community.description}
                    </p>
                )}

                <div className="mt-3 flex gap-2 text-xs">
                    <div
                        className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2 py-1.5
                            ${isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-[#333] bg-[#222] text-zinc-400'}`}
                    >
                        <FontAwesomeIcon icon={faUsers} className="h-3 w-3 shrink-0 text-indigo-500" />
                        <div className="min-w-0">
                            <div className={`text-[10px] font-medium uppercase tracking-wide ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                Members
                            </div>
                            <div className="truncate font-semibold tabular-nums">
                                {community.memberCount ?? 0}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2 py-1.5
                            ${isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-[#333] bg-[#222] text-zinc-400'}`}
                    >
                        <FontAwesomeIcon icon={faFileAlt} className="h-3 w-3 shrink-0 text-indigo-500" />
                        <div className="min-w-0">
                            <div className={`text-[10px] font-medium uppercase tracking-wide ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                Posts
                            </div>
                            <div className="truncate font-semibold tabular-nums">
                                {community.postCount ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {user && (
                    <button
                        type="button"
                        onClick={() => (isMember ? onLeave?.(community._id) : onJoin?.(community._id))}
                        className={
                            isMember
                                ? (isLight
                                    ? 'mt-3 w-full rounded-md border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                                    : 'mt-3 w-full rounded-md border border-[#333] bg-[#222] py-2 text-sm font-medium text-zinc-300 hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400')
                                : (isLight
                                    ? 'mt-3 w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700'
                                    : 'mt-3 w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500')
                        }
                    >
                        {isMember ? 'Leave' : 'Join'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default CommunityCard
