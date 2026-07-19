const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 256
const AUTH_ITERATIONS = 1

function bufToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuf(hex) {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    return bytes.buffer
}

function bufToBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuf(b64) {
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes.buffer
}

function generateSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(32))
    return bufToHex(salt.buffer)
}

function generateIV() {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    return bufToBase64(iv.buffer)
}

async function deriveKey(masterPassword, saltHex) {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(masterPassword), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
    const salt = new Uint8Array(hexToBuf(saltHex))

    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    )
}

async function deriveAuthHash(masterPassword, saltHex) {
    const encKey = await deriveKey(masterPassword, saltHex)
    const rawKey = await crypto.subtle.exportKey('raw', encKey)
    const enc = new TextEncoder()

    const authKeyMaterial = await crypto.subtle.importKey('raw', rawKey, 'PBKDF2', false, ['deriveBits'])
    const authBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(masterPassword), iterations: AUTH_ITERATIONS, hash: 'SHA-256' },
        authKeyMaterial,
        256
    )
    return bufToHex(authBits)
}

async function encrypt(plaintext, encryptionKey) {
    const enc = new TextEncoder()
    const ivBase64 = generateIV()
    const iv = new Uint8Array(base64ToBuf(ivBase64))

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        enc.encode(plaintext)
    )

    return { encryptedData: bufToBase64(ciphertext), iv: ivBase64 }
}

async function decrypt(encryptedData, ivBase64, encryptionKey) {
    const ciphertext = base64ToBuf(encryptedData)
    const iv = new Uint8Array(base64ToBuf(ivBase64))

    const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        ciphertext
    )

    return new TextDecoder().decode(plainBuf)
}

function assessPasswordStrength(password) {
    if (!password) return { score: 0, label: 'None', color: 'gray' }

    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    if (password.length >= 20) score += 1

    const commonPatterns = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome']
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) score = Math.min(score, 2)

    if (score <= 2) return { score, label: 'Weak', color: 'red' }
    if (score <= 4) return { score, label: 'Fair', color: 'orange' }
    if (score <= 6) return { score, label: 'Good', color: 'yellow' }
    return { score, label: 'Strong', color: 'green' }
}

function generatePassword(options = {}) {
    const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true, avoidAmbiguous = false, pronounceable = false } = options

    if (pronounceable) {
        const consonants = 'bcdfghjklmnpqrstvwxyz'
        const vowels = 'aeiou'
        let result = ''
        for (let i = 0; i < length; i++) {
            const set = i % 2 === 0 ? consonants : vowels
            result += set[Math.floor(Math.random() * set.length)]
        }
        if (uppercase) {
            const idx = Math.floor(Math.random() * result.length)
            result = result.slice(0, idx) + result[idx].toUpperCase() + result.slice(idx + 1)
        }
        if (numbers) result = result.slice(0, -1) + Math.floor(Math.random() * 10)
        return result
    }

    let chars = ''
    if (lowercase) chars += avoidAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
    if (uppercase) chars += avoidAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (numbers) chars += avoidAmbiguous ? '23456789' : '0123456789'
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, x => chars[x % chars.length]).join('')
}

export {
    generateSalt,
    generateIV,
    deriveKey,
    deriveAuthHash,
    encrypt,
    decrypt,
    bufToHex,
    hexToBuf,
    bufToBase64,
    base64ToBuf,
    assessPasswordStrength,
    generatePassword,
}
