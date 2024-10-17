import React from 'react'

const Avatar = ({ onClick, image, size = 8, rounded = true, pointers }) => {
    return (
        <img onClick={onClick} className={`h-${size} w-${size} ${rounded ? 'rounded-full' : 'rounded-md'} ${pointers && 'cursor-pointer'} object-cover border border-blue-700`} src={image}/>
    )
}

export default Avatar