import { useState } from "react";

const splitSentence = (str) => {
    const words = str.trim().split(" ");
    const firstWord = words.shift();
    const restOfSentence = words.join(" ");
    return [firstWord, restOfSentence];
}

const Info = ({ text, show, setShow }) => {
    const [firstWord, restOfSentence] = splitSentence(text);

    return (
        <div style={{display: show ? "flex" : "none"}} className="w-full flex-row justify-start align-middle bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative my-4" role="alert">
            <span className="block sm:inline pr-4"><strong className="font-bold">{firstWord}</strong>{' '}{restOfSentence}</span>
            <span onClick={() => setShow(!show)} className="absolute top-[5%] translate-y-1/4 bottom-0 right-0 px-4 cursor-pointer my-auto">
                <svg className="fill-current h-6 w-6 text-blue-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
        </div>
    )
}

const Success = ({ text, show, setShow }) => {
    const [firstWord, restOfSentence] = splitSentence(text);

    return (
        <div style={{display: show ? "flex" : "none"}} className="w-full flex-row justify-start align-middle bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative my-4" role="alert">
            <span className="block sm:inline pr-4"><strong className="font-bold">{firstWord}</strong>{' '}{restOfSentence}</span>
            <span onClick={() => setShow(!show)} className="absolute top-[5%] translate-y-1/4 bottom-0 right-0 px-4 cursor-pointer my-auto">
                <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
        </div>
    )
}

const Warning = ({ text, show, setShow }) => {
    const [firstWord, restOfSentence] = splitSentence(text);

    return (
        <div style={{display: show ? "flex" : "none"}} className="w-full flex-row justify-start align-middle bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-4" role="alert">
            <span className="block sm:inline pr-4"><strong className="font-bold">{firstWord}</strong>{' '}{restOfSentence}</span>
            <span onClick={() => setShow(!show)} className="absolute top-[5%] translate-y-1/4 bottom-0 right-0 px-4 cursor-pointer my-auto">
                <svg className="fill-current h-6 w-6 text-yellow-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
        </div>
    )
}

const Danger = ({ text, show, setShow }) => {
    const [firstWord, restOfSentence] = splitSentence(text);

    return (
        <div style={{display: show ? "flex" : "none"}} className="w-full flex-row justify-start align-middle bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
            <span className="block sm:inline pr-4"><strong className="font-bold">{firstWord}</strong>{' '}{restOfSentence}</span>
            <span onClick={() => setShow(!show)} className="absolute top-[5%] translate-y-1/4 bottom-0 right-0 px-4 cursor-pointer my-auto">
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
        </div>
    )
}


const Alert = ({ variants, text, show, setShow }) => {
    return (
        <div>
            {
                variants === 'danger' ?
                    <Danger text={ text || "This is a alert" } show={show} setShow={setShow} />
                :
                variants === 'warning' ?
                    <Warning text={ text || "This is a alert" } show={show} setShow={setShow} />
                :
                variants === 'success' ?
                    <Success text={ text || "This is a alert" } show={show} setShow={setShow} />
                :
                    <Info text={ text || "This is a alert" } show={show} setShow={setShow} />
            }
        </div>
    )
}

export default Alert