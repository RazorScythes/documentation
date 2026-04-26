import React from 'react'

const ForumTagPill = ({ tag, theme, active, onClick, count }) => {
    const isLight = theme === 'light'
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                active
                    ? (isLight
                        ? 'inline-flex items-center gap-1 rounded-full border border-indigo-500 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700'
                        : 'inline-flex items-center gap-1 rounded-full border border-indigo-500/50 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300')
                    : (isLight
                        ? 'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                        : 'inline-flex items-center gap-1 rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:border-indigo-500/40 hover:text-indigo-300')
            }
        >
            {tag}
            {count !== undefined && (
                <span className={`text-[10px] tabular-nums ${active ? (isLight ? 'text-indigo-500' : 'text-indigo-400/80') : (isLight ? 'text-slate-400' : 'text-zinc-500')}`}>
                    {count}
                </span>
            )}
        </button>
    )
}

export default ForumTagPill
