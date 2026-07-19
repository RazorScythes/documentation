import React, { useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileImport, faFileExport, faUpload, faDownload, faExclamationTriangle,
    faCheck, faSpinner, faLock, faUnlock, faFileCsv, faFileCode,
} from '@fortawesome/free-solid-svg-icons'
import { importEntries, exportEntries } from '../../actions/vault'
import { encrypt, decrypt } from './CryptoService'

const IMPORT_SOURCES = [
    { id: 'lastpass', label: 'LastPass', columns: 'url, username, password, totp, extra, name, grouping, fav' },
    { id: 'bitwarden', label: 'Bitwarden', columns: 'folder, favorite, type, name, notes, fields, reprompt, login_uri, login_username, login_password, login_totp' },
    { id: 'chrome', label: 'Chrome', columns: 'name, url, username, password' },
]

function extractDomain(url) {
    if (!url) return ''
    try {
        const normalized = url.includes('://') ? url : `https://${url}`
        return new URL(normalized).hostname.replace(/^www\./, '')
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    }
}

function parseCSV(text) {
    const rows = []
    let row = []
    let field = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const next = text[i + 1]

        if (inQuotes) {
            if (char === '"' && next === '"') {
                field += '"'
                i++
            } else if (char === '"') {
                inQuotes = false
            } else {
                field += char
            }
        } else if (char === '"') {
            inQuotes = true
        } else if (char === ',') {
            row.push(field)
            field = ''
        } else if (char === '\r' && next === '\n') {
            row.push(field)
            rows.push(row)
            row = []
            field = ''
            i++
        } else if (char === '\n' || char === '\r') {
            row.push(field)
            rows.push(row)
            row = []
            field = ''
        } else {
            field += char
        }
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field)
        rows.push(row)
    }

    return rows
}

function rowsToObjects(rows) {
    if (!rows.length) return []
    const headers = rows[0].map(h => h.trim().toLowerCase())
    return rows.slice(1)
        .filter(r => r.some(cell => cell.trim()))
        .map(cells => {
            const obj = {}
            headers.forEach((header, idx) => {
                obj[header] = (cells[idx] || '').trim()
            })
            return obj
        })
}

function resolveFolderId(folderName, folders) {
    if (!folderName?.trim()) return null
    const match = folders.find(f => f.name.toLowerCase() === folderName.trim().toLowerCase())
    return match?._id || null
}

function buildLastPassEntry(row, folders) {
    const name = row.name || row.url || 'Imported Entry'
    const url = row.url || ''
    return {
        type: 'password',
        folder: resolveFolderId(row.grouping, folders),
        metadata: { name, domain: extractDomain(url) },
        data: {
            username: row.username || '',
            email: '',
            password: row.password || '',
            url,
            notes: row.extra || '',
            totp: row.totp || '',
            customFields: [],
        },
    }
}

function buildBitwardenEntry(row, folders) {
    const entryType = (row.type || 'login').toLowerCase()
    if (entryType !== 'login') return null

    const name = row.name || row.login_uri || 'Imported Entry'
    const url = row.login_uri || ''
    return {
        type: 'password',
        folder: resolveFolderId(row.folder, folders),
        metadata: { name, domain: extractDomain(url) },
        data: {
            username: row.login_username || '',
            email: '',
            password: row.login_password || '',
            url,
            notes: row.notes || '',
            totp: row.login_totp || '',
            customFields: [],
        },
    }
}

function buildChromeEntry(row) {
    const name = row.name || row.url || 'Imported Entry'
    const url = row.url || ''
    return {
        type: 'password',
        folder: null,
        metadata: { name, domain: extractDomain(url) },
        data: {
            username: row.username || '',
            email: '',
            password: row.password || '',
            url,
            notes: '',
            totp: '',
            customFields: [],
        },
    }
}

function parseImportFile(text, source, folders) {
    const rows = parseCSV(text)
    const objects = rowsToObjects(rows)

    switch (source) {
        case 'lastpass':
            return objects.map(row => buildLastPassEntry(row, folders))
        case 'bitwarden':
            return objects.map(row => buildBitwardenEntry(row, folders)).filter(Boolean)
        case 'chrome':
            return objects.map(row => buildChromeEntry(row))
        default:
            return []
    }
}

function escapeCSV(value) {
    const str = String(value ?? '')
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

function ImportExport({ theme, encryptionKey, folders = [], onImportComplete }) {
    const dispatch = useDispatch()
    const { isLoading } = useSelector((state) => state.vault)
    const isLight = theme === 'light'
    const fileInputRef = useRef(null)

    const [activeTab, setActiveTab] = useState('import')
    const [importSource, setImportSource] = useState('lastpass')
    const [selectedFile, setSelectedFile] = useState(null)
    const [parsedEntries, setParsedEntries] = useState([])
    const [parseError, setParseError] = useState('')
    const [importProgress, setImportProgress] = useState(0)
    const [importTotal, setImportTotal] = useState(0)
    const [importing, setImporting] = useState(false)
    const [importSuccess, setImportSuccess] = useState(false)
    const [importError, setImportError] = useState('')
    const [isDragging, setIsDragging] = useState(false)

    const [exportLoading, setExportLoading] = useState(false)
    const [exportError, setExportError] = useState('')
    const [csvConfirmed, setCsvConfirmed] = useState(false)

    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl p-5`
    const mutedText = isLight ? 'text-slate-500' : 'text-gray-500'
    const headingText = isLight ? 'text-slate-800' : 'text-white'
    const bodyText = isLight ? 'text-slate-600' : 'text-gray-300'

    const tabClass = (tab) => `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        activeTab === tab
            ? isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-900/30 text-indigo-300'
            : isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#141414]'
    }`

    const processFile = useCallback((file) => {
        if (!file) return
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setParseError('Please select a .csv file')
            setSelectedFile(null)
            setParsedEntries([])
            return
        }

        setParseError('')
        setImportSuccess(false)
        setImportError('')
        setSelectedFile(file)

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const text = e.target.result
                const entries = parseImportFile(text, importSource, folders)
                if (entries.length === 0) {
                    setParseError('No valid entries found in the CSV file')
                    setParsedEntries([])
                } else {
                    setParsedEntries(entries)
                }
            } catch {
                setParseError('Failed to parse CSV file. Check the format and try again.')
                setParsedEntries([])
            }
        }
        reader.onerror = () => {
            setParseError('Failed to read file')
            setParsedEntries([])
        }
        reader.readAsText(file)
    }, [importSource, folders])

    const handleFileChange = (e) => {
        processFile(e.target.files?.[0])
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        processFile(e.dataTransfer.files?.[0])
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleSourceChange = (source) => {
        setImportSource(source)
        setSelectedFile(null)
        setParsedEntries([])
        setParseError('')
        setImportSuccess(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleImport = async () => {
        if (!encryptionKey) {
            setImportError('Vault is locked. Please unlock before importing.')
            return
        }
        if (parsedEntries.length === 0) {
            setImportError('No entries to import')
            return
        }

        setImporting(true)
        setImportError('')
        setImportSuccess(false)
        setImportProgress(0)
        setImportTotal(parsedEntries.length)

        try {
            const encryptedEntries = []

            for (let i = 0; i < parsedEntries.length; i++) {
                const entry = parsedEntries[i]
                const plaintext = JSON.stringify(entry.data)
                const { encryptedData, iv } = await encrypt(plaintext, encryptionKey)

                encryptedEntries.push({
                    type: entry.type,
                    encryptedData,
                    iv,
                    folder: entry.folder,
                    tags: [],
                    metadata: entry.metadata,
                })

                setImportProgress(i + 1)
            }

            await dispatch(importEntries({ entries: encryptedEntries })).unwrap()

            setImportSuccess(true)
            setSelectedFile(null)
            setParsedEntries([])
            if (fileInputRef.current) fileInputRef.current.value = ''
            if (onImportComplete) onImportComplete()
        } catch (err) {
            setImportError(err?.message || 'Import failed')
        } finally {
            setImporting(false)
        }
    }

    const handleExportEncrypted = async () => {
        setExportLoading(true)
        setExportError('')
        try {
            const result = await dispatch(exportEntries()).unwrap()
            const exportData = {
                version: 1,
                exportedAt: new Date().toISOString(),
                entries: result.result?.entries || [],
                folders: result.result?.folders || folders,
            }
            const json = JSON.stringify(exportData, null, 2)
            const date = new Date().toISOString().slice(0, 10)
            downloadFile(json, `vault-export-${date}.json`, 'application/json')
        } catch (err) {
            setExportError(err?.message || 'Export failed')
        } finally {
            setExportLoading(false)
        }
    }

    const handleExportCSV = async () => {
        if (!csvConfirmed) return
        if (!encryptionKey) {
            setExportError('Vault is locked. Please unlock before exporting.')
            return
        }

        setExportLoading(true)
        setExportError('')
        try {
            const result = await dispatch(exportEntries()).unwrap()
            const entries = result.result?.entries || []
            const exportFolders = result.result?.folders || folders
            const folderMap = Object.fromEntries(exportFolders.map(f => [f._id, f.name]))

            const headers = ['name', 'url', 'username', 'password', 'notes', 'totp', 'type', 'folder']
            const csvRows = [headers.join(',')]

            for (const entry of entries) {
                try {
                    const plaintext = await decrypt(entry.encryptedData, entry.iv, encryptionKey)
                    const data = JSON.parse(plaintext)
                    const name = entry.metadata?.name || ''
                    const folderName = entry.folder ? (folderMap[entry.folder] || '') : ''

                    csvRows.push([
                        escapeCSV(name),
                        escapeCSV(data.url || ''),
                        escapeCSV(data.username || data.email || ''),
                        escapeCSV(data.password || ''),
                        escapeCSV(data.notes || data.content || ''),
                        escapeCSV(data.totp || ''),
                        escapeCSV(entry.type || 'password'),
                        escapeCSV(folderName),
                    ].join(','))
                } catch {
                    csvRows.push([
                        escapeCSV(entry.metadata?.name || 'Decryption failed'),
                        '', '', '', '', '', escapeCSV(entry.type || ''), '',
                    ].join(','))
                }
            }

            const date = new Date().toISOString().slice(0, 10)
            downloadFile(csvRows.join('\n'), `vault-export-${date}.csv`, 'text/csv')
        } catch (err) {
            setExportError(err?.message || 'CSV export failed')
        } finally {
            setExportLoading(false)
        }
    }

    const previewItems = parsedEntries.slice(0, 5)

    return (
        <div className="space-y-4">
            <div className={`flex gap-1 p-1 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-[#111]'}`}>
                <button type="button" onClick={() => setActiveTab('import')} className={tabClass('import')}>
                    <FontAwesomeIcon icon={faFileImport} className="text-xs" />
                    Import
                </button>
                <button type="button" onClick={() => setActiveTab('export')} className={tabClass('export')}>
                    <FontAwesomeIcon icon={faFileExport} className="text-xs" />
                    Export
                </button>
            </div>

            {activeTab === 'import' && (
                <div className={`${cardClass} space-y-5`}>
                    <div>
                        <h3 className={`text-sm font-semibold mb-1 ${headingText}`}>Import Passwords</h3>
                        <p className={`text-xs ${mutedText}`}>
                            Import entries from LastPass, Bitwarden, or Chrome CSV exports. All data is encrypted before upload.
                        </p>
                    </div>

                    <div>
                        <label className={`block text-xs font-medium mb-2 ${mutedText}`}>Import Source</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {IMPORT_SOURCES.map((source) => (
                                <button
                                    key={source.id}
                                    type="button"
                                    onClick={() => handleSourceChange(source.id)}
                                    className={`text-left px-4 py-3 rounded-lg border transition-all ${
                                        importSource === source.id
                                            ? isLight ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-indigo-700 bg-indigo-900/20 text-indigo-300'
                                            : isLight ? 'border-slate-200 hover:border-slate-300 text-slate-600' : 'border-[#2B2B2B] hover:border-[#3B3B3B] text-gray-400'
                                    }`}
                                >
                                    <div className="text-sm font-medium">{source.label}</div>
                                    <div className={`text-[10px] mt-0.5 truncate ${mutedText}`}>{source.columns}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={`block text-xs font-medium mb-2 ${mutedText}`}>CSV File</label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                                isDragging
                                    ? isLight ? 'border-indigo-400 bg-indigo-50/50' : 'border-indigo-500 bg-indigo-900/10'
                                    : isLight ? 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50' : 'border-[#333] hover:border-indigo-700 hover:bg-[#111]'
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faUpload}
                                className={`text-2xl ${isDragging ? 'text-indigo-500' : mutedText}`}
                            />
                            <div className="text-center">
                                <p className={`text-sm font-medium ${headingText}`}>
                                    {selectedFile ? selectedFile.name : 'Drop CSV file here or click to browse'}
                                </p>
                                <p className={`text-xs mt-1 ${mutedText}`}>Accepts .csv files only</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {parseError && (
                        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {parseError}
                        </div>
                    )}

                    {parsedEntries.length > 0 && (
                        <div className={`rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2B2B2B] bg-[#111]'}`}>
                            <div className={`px-4 py-3 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}>
                                <span className={`text-sm font-medium ${headingText}`}>
                                    Preview — {parsedEntries.length} {parsedEntries.length === 1 ? 'entry' : 'entries'} found
                                </span>
                                <span className={`text-xs ${mutedText}`}>Showing first {Math.min(5, parsedEntries.length)}</span>
                            </div>
                            <div className="divide-y divide-transparent">
                                {previewItems.map((entry, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 px-4 py-2.5 ${isLight ? 'hover:bg-white/60' : 'hover:bg-[#0e0e0e]'}`}>
                                        <FontAwesomeIcon icon={faLock} className={`text-xs ${isLight ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${headingText}`}>
                                                {entry.metadata?.name || 'Untitled'}
                                            </div>
                                            <div className={`text-xs truncate ${mutedText}`}>
                                                {entry.data?.username || entry.data?.url || '—'}
                                            </div>
                                        </div>
                                        {entry.folder && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-[#222] text-gray-400'}`}>
                                                Folder matched
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {importing && importTotal > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className={mutedText}>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-1.5" />
                                    Encrypting and importing...
                                </span>
                                <span className={bodyText}>{importProgress} / {importTotal}</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#222]'}`}>
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.round((importProgress / importTotal) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {importSuccess && (
                        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-green-50 text-green-600' : 'bg-green-900/20 text-green-400'}`}>
                            <FontAwesomeIcon icon={faCheck} />
                            Import completed successfully
                        </div>
                    )}

                    {importError && (
                        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {importError}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={importing || isLoading || parsedEntries.length === 0 || !encryptionKey}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {importing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Importing...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faFileImport} />
                                Import {parsedEntries.length > 0 ? `${parsedEntries.length} Entries` : 'Entries'}
                            </>
                        )}
                    </button>

                    {!encryptionKey && (
                        <p className={`text-xs text-center ${mutedText}`}>
                            <FontAwesomeIcon icon={faLock} className="mr-1" />
                            Unlock your vault to import entries
                        </p>
                    )}
                </div>
            )}

            {activeTab === 'export' && (
                <div className="space-y-4">
                    <div className={cardClass}>
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/40'}`}>
                                <FontAwesomeIcon icon={faFileCode} className="text-indigo-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-semibold ${headingText}`}>Encrypted JSON Export</h3>
                                <p className={`text-xs mt-0.5 ${mutedText}`}>
                                    Export all vault entries in their encrypted form along with folder mappings. Safe to store as a backup.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleExportEncrypted}
                            disabled={exportLoading || isLoading}
                            className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                                isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
                            }`}
                        >
                            {exportLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                <FontAwesomeIcon icon={faDownload} />
                            )}
                            Download Encrypted JSON
                        </button>
                    </div>

                    <div className={cardClass}>
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-red-100' : 'bg-red-900/30'}`}>
                                <FontAwesomeIcon icon={faUnlock} className="text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-semibold ${headingText}`}>CSV Export (Unencrypted)</h3>
                                <p className={`text-xs mt-0.5 ${mutedText}`}>
                                    Export entries as plaintext CSV. Passwords and sensitive data will be readable by anyone with the file.
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
                            isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-800'
                        }`}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className={`text-sm font-medium ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                                    Security Warning
                                </p>
                                <p className={`text-xs mt-1 ${isLight ? 'text-amber-700' : 'text-amber-500/80'}`}>
                                    This export contains unencrypted passwords and sensitive information. Only use this format for migration to another service, and delete the file immediately after use.
                                </p>
                                <label className={`flex items-center gap-2 mt-3 cursor-pointer text-xs ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                                    <input
                                        type="checkbox"
                                        checked={csvConfirmed}
                                        onChange={(e) => setCsvConfirmed(e.target.checked)}
                                        className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                    />
                                    I understand the risks and want to export plaintext data
                                </label>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleExportCSV}
                            disabled={exportLoading || isLoading || !csvConfirmed || !encryptionKey}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {exportLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                <FontAwesomeIcon icon={faFileCsv} />
                            )}
                            Download Plaintext CSV
                        </button>

                        {!encryptionKey && (
                            <p className={`text-xs text-center mt-3 ${mutedText}`}>
                                <FontAwesomeIcon icon={faLock} className="mr-1" />
                                Unlock your vault to decrypt entries for export
                            </p>
                        )}
                    </div>

                    {exportError && (
                        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {exportError}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImportExport
