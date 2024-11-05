import React from 'react'
import { dark, light } from '../../style';
import default_avatar from '../../assets/avatar.webp'

const Avatar = ({ onClick, theme, image, size = 8, rounded = true, pointers }) => {
    return (
        <img onClick={onClick} className={`h-${size} w-${size} ${rounded ? 'rounded-full' : 'rounded-md'} ${pointers && 'cursor-pointer'} object-cover border border-solid ${theme === 'light' ? light.border : dark.semiborder}`} src={image ? image : default_avatar}/>
    )
}

export default Avatar