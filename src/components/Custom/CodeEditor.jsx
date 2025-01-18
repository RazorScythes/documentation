import React, { useEffect, useRef, useState } from 'react';
import { dark, light } from '../../style';

const CodeEditor = ({ theme, onChange, inputValue, readOnly }) => {
    const textareaRef = useRef(null);
    const [code, setCode] = useState('');
    const [history, setHistory] = useState(['']); // Initialize history
    const [historyIndex, setHistoryIndex] = useState(0);

    useEffect(() => {
        setCode(inputValue || "")
    }, [inputValue])

    const saveToHistory = (newCode) => {
        const updatedHistory = [...history.slice(0, historyIndex + 1), newCode];
        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart, selectionEnd } = textareaRef.current;
            const indent = '    '; // 4 spaces
            const before = code.slice(0, selectionStart);
            const after = code.slice(selectionEnd);
            const newCode = before + indent + after;

            setCode(newCode);
            saveToHistory(newCode);

            setTimeout(() => {
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
                    selectionStart + indent.length;
            });
        } else if (e.key === 'Backspace') {
            const { selectionStart, selectionEnd } = textareaRef.current;
            if (
                selectionStart === selectionEnd &&
                code.slice(selectionStart - 4, selectionStart) === '    '
            ) {
                e.preventDefault();
                const before = code.slice(0, selectionStart - 4);
                const after = code.slice(selectionEnd);
                const newCode = before + after;

                setCode(newCode);
                saveToHistory(newCode);

                setTimeout(() => {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
                        selectionStart - 4;
                });
            }
        } else if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setCode(history[newIndex]);
                setHistoryIndex(newIndex);
            }
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setCode(history[newIndex]);
                setHistoryIndex(newIndex);
            }
        }
    };

    const handleChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        saveToHistory(newCode);
        onChange(newCode);
    };

    const lineNumbers = () => {
        const lines = code.split('\n').length;
        return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    };

    return (
        <div
            className={`relative flex ${
                theme === 'light' ? light.semibackground : dark.semibackground
            }`}
        >
            <div
                className={`p-4 text-sm font-mono text-opacity-50 select-none text-white`}
                style={{
                    minWidth: '40px',
                    textAlign: 'right',
                    lineHeight: '1.5rem', 
                }}
            >
                <pre>{lineNumbers()}</pre>
            </div>

            <textarea
                ref={textareaRef}
                className={`w-full p-4 text-sm font-mono resize-none border-l outline-none custom-scroll ${
                    theme === 'light' ? light.semibackground : dark.semibackground
                } ${theme === 'light' ? light.color : dark.color} border border-solid ${
                    theme === 'light' ? light.border : dark.border
                } rounded-sm`}
                rows={code.split('\n').length}
                value={code}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                    lineHeight: '1.5rem', 
                }}
                resize={false}
                readOnly={readOnly}
            />
        </div>
    );
};

export default CodeEditor;