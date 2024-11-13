import React from 'react'

import Table from '../../Custom/Table'
const Videos = ({ user, theme }) => {
    return (
        <div>
            <div className='mb-8 mt-4'>
                <h1 className="text-xl font-medium mb-1">Your Videos</h1>
            </div>

            <Table theme={theme}/>
        </div>
    )
}

export default Videos