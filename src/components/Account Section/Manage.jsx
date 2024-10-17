import React from 'react'
import { Header } from './index'
const Manage = () => {
    return (
        <div className="relative bg-white">   
            <Header 
                heading='Manage'
                description="Select a website to manage, or create a new one from scratch."
                button_text="Explore Now!"
                button_link={`#`}
            />
        </div>
    )
}

export default Manage