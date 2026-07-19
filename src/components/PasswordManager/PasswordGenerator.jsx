import React, { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCopy, faRandom, faCheck, faHistory, faTimes, faShieldAlt,
} from '@fortawesome/free-solid-svg-icons'
import { generatePassword, assessPasswordStrength } from './CryptoService'

const STRENGTH_BAR_WIDTH = {
    red: '25%',
    orange: '50%',
    yellow: '75%',
    green: '100%',
    gray: '0%',
}

const STRENGTH_TEXT_CLASS = {
    red: 'text-red-500',
    orange: 'text-orange-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    gray: 'text-gray-400',
}

const STRENGTH_BG_CLASS = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    gray: 'bg-gray-400',
}

function ToggleSwitch({ label, description, checked, onChange, isLight, disabled = false }) {
    return (
        <div className={`flex items-center justify-between gap-3 py-2 ${disabled ? 'opacity-50' : ''}`}>
            <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{label}</p>
                {description && (
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{description}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    checked
                        ? 'bg-indigo-500'
                        : isLight ? 'bg-slate-200' : 'bg-[#333]'
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    )
}

function PasswordGenerator({ theme, onSelect }) {
    const isLight = theme === 'light'

    const [password, setPassword] = useState('')
    const [length, setLength] = useState(16)
    const [uppercase, setUppercase] = useState(true)
    const [lowercase, setLowercase] = useState(true)
    const [digits, setDigits] = useState(true)
    const [symbols, setSymbols] = useState(true)
    const [avoidAmbiguous, setAvoidAmbiguous] = useState(false)
    const [pronounceable, setPronounceable] = useState(false)
    const [history, setHistory] = useState([])
    const [showHistory, setShowHistory] = useState(false)
    const [copied, setCopied] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState(null)

    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl p-5`
    const sectionHeaderClass = `text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`

    const generateOptions = useCallback(() => ({
        length,
        uppercase,
        lowercase,
        numbers: digits,
        symbols,
        avoidAmbiguous,
        pronounceable,
    }), [length, uppercase, lowercase, digits, symbols, avoidAmbiguous, pronounceable])

    const handleGenerate = useCallback((addToHistory = true) => {
        const newPassword = generatePassword(generateOptions())
        setPassword(newPassword)
        if (addToHistory && newPassword) {
            setHistory((prev) => {
                const filtered = prev.filter((p) => p !== newPassword)
                return [newPassword, ...filtered].slice(0, 10)
            })
        }
        setCopied(false)
    }, [generateOptions])

    useEffect(() => {
        handleGenerate(false)
    }, [handleGenerate])

    const strength = assessPasswordStrength(password)

    const handleCopy = async (text, index = null) => {
        if (!text) return
        try {
            await navigator.clipboard.writeText(text)
            if (index !== null) {
                setCopiedIndex(index)
                setTimeout(() => setCopiedIndex(null), 2000)
            } else {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch {
            /* clipboard unavailable */
        }
    }

    const handleUsePassword = () => {
        if (password && onSelect) {
            onSelect(password)
        }
    }

    const clearHistory = () => {
        setHistory([])
        setShowHistory(false)
    }

    const passwordDisplayClass = `${isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-[#111] border-[#2B2B2B] text-gray-100'} border border-solid rounded-lg px-4 py-3 text-lg font-mono break-all`

    const iconButtonClass = `shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
        isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
    }`

    return (
        <div className={`${cardClass} max-w-xl mx-auto space-y-6`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/40'}`}>
                    <FontAwesomeIcon icon={faShieldAlt} className="text-indigo-500" />
                </div>
                <div>
                    <h2 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        Password Generator
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Create strong, unique passwords
                    </p>
                </div>
            </div>

            {/* Generated password display */}
            <div>
                <p className={`${sectionHeaderClass} mb-2`}>Generated Password</p>
                <div className="flex items-stretch gap-2">
                    <div className={`${passwordDisplayClass} flex-1 min-h-[3rem] flex items-center`}>
                        {password || '—'}
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCopy(password)}
                        className={iconButtonClass}
                        title="Copy password"
                    >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-green-500' : ''} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenerate()}
                        className={iconButtonClass}
                        title="Regenerate password"
                    >
                        <FontAwesomeIcon icon={faRandom} />
                    </button>
                </div>
            </div>

            {/* Strength meter */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className={sectionHeaderClass}>Strength</p>
                    <span className={`text-xs font-semibold ${STRENGTH_TEXT_CLASS[strength.color] || STRENGTH_TEXT_CLASS.gray}`}>
                        {strength.label}
                    </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#222]'}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${STRENGTH_BG_CLASS[strength.color] || STRENGTH_BG_CLASS.gray}`}
                        style={{ width: STRENGTH_BAR_WIDTH[strength.color] || STRENGTH_BAR_WIDTH.gray }}
                    />
                </div>
            </div>

            {/* Length slider */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className={sectionHeaderClass}>Length</p>
                    <span className={`text-sm font-mono font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                        {length}
                    </span>
                </div>
                <input
                    type="range"
                    min={8}
                    max={128}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
                <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                    <span>8</span>
                    <span>128</span>
                </div>
            </div>

            {/* Character set toggles */}
            <div>
                <p className={`${sectionHeaderClass} mb-1`}>Character Sets</p>
                <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1a1a1a]'}`}>
                    <ToggleSwitch
                        label="Uppercase (A-Z)"
                        checked={uppercase}
                        onChange={setUppercase}
                        isLight={isLight}
                        disabled={pronounceable}
                    />
                    <ToggleSwitch
                        label="Lowercase (a-z)"
                        checked={lowercase}
                        onChange={setLowercase}
                        isLight={isLight}
                        disabled={pronounceable}
                    />
                    <ToggleSwitch
                        label="Digits (0-9)"
                        checked={digits}
                        onChange={setDigits}
                        isLight={isLight}
                    />
                    <ToggleSwitch
                        label="Symbols (!@#$...)"
                        checked={symbols}
                        onChange={setSymbols}
                        isLight={isLight}
                        disabled={pronounceable}
                    />
                </div>
            </div>

            {/* Options */}
            <div>
                <p className={`${sectionHeaderClass} mb-1`}>Options</p>
                <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1a1a1a]'}`}>
                    <ToggleSwitch
                        label="Avoid Ambiguous Characters"
                        description="Exclude 0, O, 1, l, I and similar"
                        checked={avoidAmbiguous}
                        onChange={setAvoidAmbiguous}
                        isLight={isLight}
                        disabled={pronounceable}
                    />
                    <ToggleSwitch
                        label="Pronounceable Mode"
                        description="Alternating consonant-vowel syllables"
                        checked={pronounceable}
                        onChange={setPronounceable}
                        isLight={isLight}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                {onSelect && (
                    <button
                        type="button"
                        onClick={handleUsePassword}
                        disabled={!password}
                        className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            password
                                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                : isLight
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#222] text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        Use Password
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isLight
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'
                    }`}
                >
                    <FontAwesomeIcon icon={faHistory} className="text-xs" />
                    History ({history.length})
                </button>
            </div>

            {/* Password history */}
            {showHistory && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className={sectionHeaderClass}>Recent Passwords</p>
                        {history.length > 0 && (
                            <button
                                type="button"
                                onClick={clearHistory}
                                className={`text-xs flex items-center gap-1 ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                Clear
                            </button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            No passwords generated yet
                        </p>
                    ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {history.map((entry, index) => (
                                <li
                                    key={`${entry}-${index}`}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                        isLight ? 'bg-slate-50 border border-slate-100' : 'bg-[#111] border border-[#222]'
                                    }`}
                                >
                                    <span className={`flex-1 text-sm font-mono truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                        {entry}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(entry, index)}
                                        className={`shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors ${
                                            isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                        title="Copy"
                                    >
                                        <FontAwesomeIcon
                                            icon={copiedIndex === index ? faCheck : faCopy}
                                            className={`text-xs ${copiedIndex === index ? 'text-green-500' : ''}`}
                                        />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}

export default PasswordGenerator
