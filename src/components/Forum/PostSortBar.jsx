import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faFire, faArrowUp, faComment } from '@fortawesome/free-solid-svg-icons'

const sorts = [
    { key: 'new', label: 'New', icon: faClock },
    { key: 'top', label: 'Top', icon: faArrowUp },
    { key: 'trending', label: 'Trending', icon: faFire },
    { key: 'most_commented', label: 'Discussed', icon: faComment },
]

const PostSortBar = ({ active, onChange, theme }) => {
    const isLight = theme === 'light'
    return (
        <div
            className={`inline-flex rounded-lg border p-0.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#333] bg-[#222]'}`}
            role="tablist"
            aria-label="Sort posts"
        >
            {sorts.map(s => {
                const isActive = active === s.key
                return (
                    <button
                        key={s.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(s.key)}
                        className={
                            isActive
                                ? (isLight
                                    ? 'inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 shadow-sm border border-slate-200/80'
                                    : 'inline-flex items-center gap-1.5 rounded-md border border-indigo-500/30 bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-indigo-400')
                                : (isLight
                                    ? 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800'
                                    : 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-200')
                        }
                    >
                        <FontAwesomeIcon icon={s.icon} className="h-3 w-3" />
                        {s.label}
                    </button>
                )
            })}
        </div>
    )
}

export default PostSortBar
