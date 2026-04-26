import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'

const VoteButtons = ({ theme, score, userVote, onVote, vertical = false }) => {
    const isLight = theme === 'light'

    const upActive = userVote === 1
    const downActive = userVote === -1

    const upIconClass = upActive
        ? (isLight ? 'text-indigo-600' : 'text-indigo-400')
        : (isLight ? 'text-slate-400' : 'text-zinc-500')
    const downIconClass = downActive
        ? (isLight ? 'text-red-600' : 'text-red-400')
        : (isLight ? 'text-slate-400' : 'text-zinc-500')

    const scoreClass = upActive
        ? (isLight ? 'text-indigo-600' : 'text-indigo-400')
        : downActive
            ? (isLight ? 'text-red-600' : 'text-red-400')
            : (isLight ? 'text-slate-800' : 'text-zinc-200')

    const handleUp = (e) => { e.preventDefault(); e.stopPropagation(); onVote?.(userVote === 1 ? 0 : 1) }
    const handleDown = (e) => { e.preventDefault(); e.stopPropagation(); onVote?.(userVote === -1 ? 0 : -1) }

    const btnBase =
        'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ' +
        (isLight
            ? 'text-slate-500 hover:bg-slate-100'
            : 'text-zinc-500 hover:bg-[#2a2a2a]')

    const sizeBtn = `${btnBase} h-7 w-7`

    const shellClass = vertical
        ? 'flex flex-col items-center gap-0.5'
        : 'inline-flex items-center gap-0.5'

    return (
        <div className={shellClass}>
            <button type="button" onClick={handleUp} className={sizeBtn} aria-label="Upvote">
                <FontAwesomeIcon icon={faCaretUp} className={`text-lg ${upIconClass}`} />
            </button>
            <span
                className={`min-w-[1.5rem] select-none text-center text-xs font-semibold tabular-nums leading-none ${scoreClass}`}
            >
                {score}
            </span>
            <button type="button" onClick={handleDown} className={sizeBtn} aria-label="Downvote">
                <FontAwesomeIcon icon={faCaretDown} className={`text-lg ${downIconClass}`} />
            </button>
        </div>
    )
}

export default VoteButtons
