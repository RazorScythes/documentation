import React from 'react'
import { Header } from './index'
const AccountStore = () => {
  return (
    <div className="relative bg-white">   
        <Header 
            heading='Store'
            description="Select a website to manage, or create a new one from scratch."
            button_text="Explore Now!"
            button_link={`#`}
        />
    </div>
)
}

export default AccountStore