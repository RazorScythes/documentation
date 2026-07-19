import React, { useMemo, useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldAlt,
    faExclamationTriangle,
    faExclamationCircle,
    faSync,
    faCheck,
    faClock,
    faKey,
    faPen,
    faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import { assessPasswordStrength } from './CryptoService'

const COMMON_PATTERNS = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome']
const MAX_STRENGTH_SCORE = 8
const FRESHNESS_DAYS = 90
const SCORE_RADIUS = 54
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS

function extractDomain(entry) {
    if (entry.metadata?.domain) return entry.metadata.domain
    const url = entry.decrypted?.url
    if (url) {
        try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
            return parsed.hostname.replace(/^www\./, '')
        } catch {
            return url
        }
    }
    return '—'
}

function getEntryName(entry) {
    return entry.metadata?.name || entry.decrypted?.name || 'Untitled'
}

function getUpdatedDate(entry) {
    const raw = entry.updatedAt || entry.createdAt
    return raw ? new Date(raw) : null
}

function daysSince(date) {
    if (!date) return Infinity
    const diff = Date.now() - date.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function hasCommonPattern(password) {
    if (!password) return false
    const lower = password.toLowerCase()
    return COMMON_PATTERNS.some((p) => lower.includes(p))
}

function isWeakEntry(entry) {
    const password = entry.decrypted?.password
    if (!password) return true
    if (password.length < 8) return true
    if (hasCommonPattern(password)) return true
    const { score } = assessPasswordStrength(password)
    return score <= 2
}

async function sha1Hex(text) {
    const enc = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-1', enc.encode(text))
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
}

async function checkPasswordBreach(password) {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
    if (!response.ok) throw new Error('HIBP request failed')
    const text = await response.text()
    for (const line of text.split('\n')) {
        const [hashSuffix, countStr] = line.split(':')
        if (hashSuffix.trim() === suffix) {
            return parseInt(countStr, 10) || 0
        }
    }
    return 0
}

function getScoreColor(score) {
    if (score >= 81) return { stroke: '#22c55e', text: 'text-green-500', label: 'Excellent' }
    if (score >= 61) return { stroke: '#eab308', text: 'text-yellow-500', label: 'Good' }
    if (score >= 41) return { stroke: '#f97316', text: 'text-orange-500', label: 'Fair' }
    return { stroke: '#ef4444', text: 'text-red-500', label: 'Poor' }
}

function SectionHeader({ icon, title, count, isLight, accentClass }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClass}`}>
                <FontAwesomeIcon icon={icon} className="text-sm" />
            </div>
            <h3 className={`text-base font-semibold flex-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                {title}
            </h3>
            <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1a1a1a] text-gray-400'
                }`}
            >
                {count}
            </span>
        </div>
    )
}

function SummaryCard({ label, value, icon, isLight, valueClass }) {
    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl p-4`
    return (
        <div className={cardClass}>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                    {label}
                </span>
                <FontAwesomeIcon icon={icon} className={`text-sm ${valueClass || (isLight ? 'text-slate-400' : 'text-gray-600')}`} />
            </div>
            <p className={`text-2xl font-bold ${valueClass || (isLight ? 'text-slate-800' : 'text-white')}`}>
                {value}
            </p>
        </div>
    )
}

function HealthScoreRing({ score, isLight }) {
    const colors = getScoreColor(score)
    const offset = SCORE_CIRCUMFERENCE - (score / 100) * SCORE_CIRCUMFERENCE

    return (
        <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                    cx="60"
                    cy="60"
                    r={SCORE_RADIUS}
                    fill="none"
                    stroke={isLight ? '#e2e8f0' : '#1e1e1e'}
                    strokeWidth="10"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={SCORE_RADIUS}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={SCORE_CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
                <span className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                    {colors.label}
                </span>
            </div>
        </div>
    )
}

function SecurityCenter({ theme, decryptedEntries = [], onEditEntry }) {
    const isLight = theme === 'light'
    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl p-5`
    const mutedText = isLight ? 'text-slate-500' : 'text-gray-500'
    const bodyText = isLight ? 'text-slate-700' : 'text-gray-300'

    const [scanStatus, setScanStatus] = useState('idle')
    const [breachResults, setBreachResults] = useState([])
    const [usedMockResults, setUsedMockResults] = useState(false)

    const passwordEntries = useMemo(() => {
        return decryptedEntries.filter(
            (e) => e.type === 'password' && e.decrypted && !e.decryptError && e.decrypted.password
        )
    }, [decryptedEntries])

    const analysis = useMemo(() => {
        const total = passwordEntries.length
        if (total === 0) {
            return {
                total: 0,
                healthScore: 0,
                weakEntries: [],
                reusedGroups: [],
                oldEntries: [],
                strengthPct: 0,
                uniquePct: 0,
                freshPct: 0,
            }
        }

        const weakEntries = passwordEntries.filter(isWeakEntry)

        const passwordMap = new Map()
        passwordEntries.forEach((entry) => {
            const pw = entry.decrypted.password
            if (!passwordMap.has(pw)) passwordMap.set(pw, [])
            passwordMap.get(pw).push(entry)
        })
        const reusedGroups = Array.from(passwordMap.values()).filter((group) => group.length > 1)

        const oldEntries = passwordEntries
            .map((entry) => ({ entry, days: daysSince(getUpdatedDate(entry)) }))
            .filter(({ days }) => days > FRESHNESS_DAYS)
            .sort((a, b) => b.days - a.days)

        const strengthScores = passwordEntries.map((e) => assessPasswordStrength(e.decrypted.password).score)
        const avgStrength = strengthScores.reduce((a, b) => a + b, 0) / total
        const strengthPct = (avgStrength / MAX_STRENGTH_SCORE) * 100

        const uniqueCount = passwordMap.size
        const uniquePct = (uniqueCount / total) * 100

        const freshCount = passwordEntries.filter((e) => daysSince(getUpdatedDate(e)) <= FRESHNESS_DAYS).length
        const freshPct = (freshCount / total) * 100

        const twoFaPct = 0
        const healthScore = Math.round(
            strengthPct * 0.4 + uniquePct * 0.3 + freshPct * 0.2 + twoFaPct * 0.1
        )

        return {
            total,
            healthScore,
            weakEntries,
            reusedGroups,
            oldEntries,
            strengthPct: Math.round(strengthPct),
            uniquePct: Math.round(uniquePct),
            freshPct: Math.round(freshPct),
        }
    }, [passwordEntries])

    const breachedCount = breachResults.length

    const runBreachScan = useCallback(async () => {
        setScanStatus('scanning')
        setBreachResults([])
        setUsedMockResults(false)

        const results = []
        let fetchFailed = false

        for (const entry of passwordEntries) {
            try {
                const count = await checkPasswordBreach(entry.decrypted.password)
                if (count > 0) {
                    results.push({ entry, count })
                }
            } catch {
                fetchFailed = true
                break
            }
        }

        if (fetchFailed) {
            const mockResults = passwordEntries
                .slice(0, Math.min(2, passwordEntries.length))
                .map((entry, i) => ({
                    entry,
                    count: [847291, 31204][i] || 5000,
                }))
            setBreachResults(mockResults)
            setUsedMockResults(true)
        } else {
            setBreachResults(results)
        }

        setScanStatus('complete')
    }, [passwordEntries])

    const handleFix = useCallback(
        (entryId) => {
            if (onEditEntry) onEditEntry(entryId)
        },
        [onEditEntry]
    )

    if (passwordEntries.length === 0) {
        return (
            <div className={`${cardClass} text-center py-16`}>
                <FontAwesomeIcon icon={faShieldAlt} className={`text-4xl mb-4 ${mutedText} opacity-40`} />
                <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    No Passwords to Analyze
                </h3>
                <p className={`text-sm ${mutedText}`}>
                    Add password entries to your vault to run a security analysis.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <SummaryCard label="Total Analyzed" value={analysis.total} icon={faKey} isLight={isLight} />
                <SummaryCard
                    label="Weak"
                    value={analysis.weakEntries.length}
                    icon={faExclamationTriangle}
                    isLight={isLight}
                    valueClass="text-red-500"
                />
                <SummaryCard
                    label="Reused"
                    value={analysis.reusedGroups.reduce((sum, g) => sum + g.length, 0)}
                    icon={faExclamationCircle}
                    isLight={isLight}
                    valueClass="text-orange-500"
                />
                <SummaryCard
                    label="Old"
                    value={analysis.oldEntries.length}
                    icon={faClock}
                    isLight={isLight}
                    valueClass="text-yellow-500"
                />
                <SummaryCard
                    label="Breached"
                    value={scanStatus === 'complete' ? breachedCount : '—'}
                    icon={faShieldAlt}
                    isLight={isLight}
                    valueClass={breachedCount > 0 ? 'text-red-500' : undefined}
                />
            </div>

            <div className={cardClass}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <HealthScoreRing score={analysis.healthScore} isLight={isLight} />
                    <div className="flex-1 w-full space-y-3">
                        <h2 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            Vault Health Score
                        </h2>
                        <p className={`text-sm ${mutedText}`}>
                            Client-side analysis of your decrypted passwords. Plaintext never leaves your device.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {[
                                { label: 'Password Strength', pct: analysis.strengthPct, weight: '40%' },
                                { label: 'Uniqueness', pct: analysis.uniquePct, weight: '30%' },
                                { label: 'Freshness', pct: analysis.freshPct, weight: '20%' },
                                { label: '2FA Coverage', pct: 0, weight: '10%' },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs ${bodyText}`}>{item.label}</span>
                                        <span className={`text-xs font-medium ${mutedText}`}>
                                            {item.pct}% · {item.weight}
                                        </span>
                                    </div>
                                    <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                        <div
                                            className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                                            style={{ width: `${item.pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {analysis.weakEntries.length > 0 && (
                <div className={cardClass}>
                    <SectionHeader
                        icon={faExclamationTriangle}
                        title="Weak Passwords"
                        count={analysis.weakEntries.length}
                        isLight={isLight}
                        accentClass={isLight ? 'bg-red-100 text-red-500' : 'bg-red-900/30 text-red-400'}
                    />
                    <div className="space-y-2">
                        {analysis.weakEntries.map((entry) => {
                            const strength = assessPasswordStrength(entry.decrypted.password)
                            return (
                                <div
                                    key={entry._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border border-solid ${
                                        isLight
                                            ? 'bg-red-50/50 border-red-200'
                                            : 'bg-red-900/10 border-red-900/30'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faKey} className="text-red-500 text-sm shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                            {getEntryName(entry)}
                                        </p>
                                        <div className={`flex items-center gap-3 text-xs ${mutedText}`}>
                                            <span className="truncate">{entry.decrypted.username || entry.decrypted.email || '—'}</span>
                                            <span className="flex items-center gap-1 shrink-0">
                                                <FontAwesomeIcon icon={faGlobe} className="text-[9px]" />
                                                {extractDomain(entry)}
                                            </span>
                                            <span className="text-red-500 font-medium shrink-0">{strength.label}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleFix(entry._id)}
                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            isLight
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                        Fix
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {analysis.reusedGroups.length > 0 && (
                <div className={cardClass}>
                    <SectionHeader
                        icon={faExclamationCircle}
                        title="Reused Passwords"
                        count={analysis.reusedGroups.length}
                        isLight={isLight}
                        accentClass={isLight ? 'bg-orange-100 text-orange-500' : 'bg-orange-900/30 text-orange-400'}
                    />
                    <div className="space-y-4">
                        {analysis.reusedGroups.map((group) => (
                            <div
                                key={group.map((e) => e._id).join('-')}
                                className={`rounded-lg border border-solid p-3 ${
                                    isLight
                                        ? 'bg-orange-50/50 border-orange-200'
                                        : 'bg-orange-900/10 border-orange-900/30'
                                }`}
                            >
                                <p className={`text-xs font-semibold mb-2 ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
                                    Used by {group.length} entries
                                </p>
                                <div className="space-y-1.5">
                                    {group.map((entry) => (
                                        <div key={entry._id} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FontAwesomeIcon icon={faKey} className="text-orange-500 text-xs shrink-0" />
                                                <span className={`text-sm truncate ${bodyText}`}>{getEntryName(entry)}</span>
                                                <span className={`text-xs ${mutedText} shrink-0`}>
                                                    {extractDomain(entry)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleFix(entry._id)}
                                                className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                                    isLight
                                                        ? 'text-orange-600 hover:bg-orange-100'
                                                        : 'text-orange-400 hover:bg-orange-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                                Fix
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {analysis.oldEntries.length > 0 && (
                <div className={cardClass}>
                    <SectionHeader
                        icon={faClock}
                        title="Old Passwords"
                        count={analysis.oldEntries.length}
                        isLight={isLight}
                        accentClass={isLight ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-900/30 text-yellow-400'}
                    />
                    <div className="space-y-2">
                        {analysis.oldEntries.map(({ entry, days }) => (
                            <div
                                key={entry._id}
                                className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-solid ${
                                    isLight
                                        ? 'bg-yellow-50/50 border-yellow-200'
                                        : 'bg-yellow-900/10 border-yellow-900/30'
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-sm shrink-0" />
                                    <span className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                        {getEntryName(entry)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-xs font-medium ${isLight ? 'text-yellow-700' : 'text-yellow-400'}`}>
                                        {days === Infinity ? 'Never updated' : `${days} days ago`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleFix(entry._id)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                            isLight
                                                ? 'text-yellow-700 hover:bg-yellow-100'
                                                : 'text-yellow-400 hover:bg-yellow-900/30'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                        Update
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={cardClass}>
                <SectionHeader
                    icon={faShieldAlt}
                    title="Breached Passwords"
                    count={scanStatus === 'complete' ? breachedCount : '—'}
                    isLight={isLight}
                    accentClass={isLight ? 'bg-indigo-100 text-indigo-500' : 'bg-indigo-900/30 text-indigo-400'}
                />
                <p className={`text-sm mb-4 ${mutedText}`}>
                    Checks passwords against the Have I Been Pwned database using k-anonymity.
                    Only the first 5 characters of the SHA-1 hash are sent — your password never leaves your device.
                </p>

                <button
                    type="button"
                    onClick={runBreachScan}
                    disabled={scanStatus === 'scanning'}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                        isLight
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                >
                    <FontAwesomeIcon
                        icon={scanStatus === 'scanning' ? faSync : faShieldAlt}
                        className={scanStatus === 'scanning' ? 'animate-spin' : ''}
                    />
                    {scanStatus === 'idle' && 'Run Scan'}
                    {scanStatus === 'scanning' && 'Scan in Progress…'}
                    {scanStatus === 'complete' && 'Scan Again'}
                </button>

                {scanStatus === 'complete' && (
                    <div className="mt-4">
                        {usedMockResults && (
                            <div
                                className={`flex items-center gap-2 p-3 rounded-lg mb-3 text-xs ${
                                    isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-900/20 text-amber-400 border border-amber-900/30'
                                }`}
                            >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                Network unavailable — showing mock results for demonstration.
                            </div>
                        )}

                        {breachResults.length === 0 ? (
                            <div
                                className={`flex items-center gap-2 p-4 rounded-lg ${
                                    isLight ? 'bg-green-50 text-green-700' : 'bg-green-900/20 text-green-400'
                                }`}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span className="text-sm font-medium">No breached passwords found.</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {breachResults.map(({ entry, count }) => (
                                    <div
                                        key={entry._id}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-solid ${
                                            isLight
                                                ? 'bg-red-50/50 border-red-200'
                                                : 'bg-red-900/10 border-red-900/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-sm shrink-0" />
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                                    {getEntryName(entry)}
                                                </p>
                                                <p className={`text-xs ${mutedText}`}>{extractDomain(entry)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs font-semibold text-red-500">
                                                {count.toLocaleString()} breaches
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleFix(entry._id)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                                    isLight
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                                Fix
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SecurityCenter
