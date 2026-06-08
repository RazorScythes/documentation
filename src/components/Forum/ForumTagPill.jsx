import React from 'react'

const ForumTagPill = ({ tag, theme, active, onClick, count }) => {
    const isLight = theme === 'light'
    const isInteractive = typeof onClick === 'function'

    const baseClass = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium'
    const activeClass = isLight
        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
        : 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
    const inactiveClass = isLight
        ? `border-slate-200 bg-white text-slate-600${isInteractive ? ' hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer' : ''}`
        : `border-[#333] bg-[#1a1a1a] text-zinc-400${isInteractive ? ' hover:border-indigo-500/40 hover:text-indigo-300 cursor-pointer' : ''}`

    const cls = `${baseClass} ${active ? activeClass : inactiveClass}`

    const content = (
        <>
            {tag}
            {count !== undefined && (
                <span className={`text-[10px] tabular-nums ${active ? (isLight ? 'text-indigo-500' : 'text-indigo-400/80') : (isLight ? 'text-slate-400' : 'text-zinc-500')}`}>
                    {count}
                </span>
            )}
        </>
    )

    if (!isInteractive) return <span className={cls}>{content}</span>

    return <button type="button" onClick={onClick} className={cls}>{content}</button>
}

export default ForumTagPill
