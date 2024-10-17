import React from 'react'

const Text = ({onClick, element = 'p', text = "Default text", color = "text-blue-800", thickness = 2, font = 'font-roboto', uppercase, icon}) => {
    return (
        <>
            {
                element === 'h1' ?
                    <h1 onClick={onClick} className={`text-5xl ${color} ${thickness === 2 ? 'font-bold' : thickness === 1 ? 'font-semibold' : 'font-normal'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</h1>
                : element === 'h2' ?
                    <h2 onClick={onClick} className={`text-4xl ${color} ${thickness === 2 ? 'font-bold' : thickness === 1 ? 'font-semibold' : 'font-normal'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</h2>
                : element === 'h3' ?
                    <h3 onClick={onClick} className={`text-3xl ${color} ${thickness === 2 ? 'font-bold' : thickness === 1 ? 'font-semibold' : 'font-normal'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</h3>
                : element === 'h4' ?
                    <h4 onClick={onClick} className={`text-2xl ${color} ${thickness === 2 ? 'font-bold' : thickness === 1 ? 'font-semibold' : 'font-normal'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</h4>
                : element === 'h5' ?
                    <h5 onClick={onClick} className={`text-xl ${color} ${thickness === 2 ? 'font-bold' : thickness === 1 ? 'font-semibold' : 'font-normal'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</h5>
                : element === 'h6' ?
                    <h6 onClick={onClick} className={`text-lg ${color} ${thickness === 2 ? 'font-bold' : thickness === 1 ? 'font-semibold' : 'font-normal'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</h6>
                : element === 'p' &&
                    <p onClick={onClick} className={`text-sm ${color === 'text-blue-800' ? 'text-gray-800' : 'text-blue-800'} ${thickness === 2 ? 'font-normal' : thickness === 1 ? 'font-semibold' : 'font-bold'} ${font} ${uppercase && 'uppercase'}`}>{icon} {text}</p>
            }
        </>
    )
}

export default Text