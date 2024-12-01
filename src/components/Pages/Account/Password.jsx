import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';

import CustomForm from '../../Custom/CustomForm';

const Password = ({ user, theme }) => {

    const [initialValues, setInitialValues] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [updateForm, setUpdateForm] = useState(false)

    const fields = [
        { label: "Current Password", name: "current_password", type: "password", required: true },
        { label: "New Password", name: "new_password", type: "password", required: true,
            validate: (value) =>
                value?.length < 6 ? "Title must be at least 6 characters" : null,
        },
        { label: "Confirm Password", name: "confirm_password", type: "password", required: true,
            validate: (value) =>
                value?.length < 6 ? "Title must be at least 6 characters" : null,
        }
    ];
    
    const handleSubmit = (formData) => {
        console.log(formData)
    }

    return (
        <div>
            <div className='mb-8 mt-4 flex xs:flex-row flex-col justify-start items-start gap-2'>
                <h1 className="text-xl font-medium mb-1">Change Password</h1>
            </div>

            <CustomForm
                theme={theme}
                fields={fields}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                update={updateForm}
                setUpdate={setUpdateForm}
                disabled={submitted}
            />
        </div>
    )
}

export default Password