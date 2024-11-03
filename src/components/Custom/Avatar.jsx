import React from 'react'
import { main, dark, light } from '../../style';

const Avatar = ({ onClick, theme, image, size = 8, rounded = true, pointers }) => {
    return (
        <img onClick={onClick} className={`h-${size} w-${size} ${rounded ? 'rounded-full' : 'rounded-md'} ${pointers && 'cursor-pointer'} object-cover border border-solid ${theme === 'light' ? light.border : dark.semiborder}`} src={image}/>
    )
}

export default Avatar